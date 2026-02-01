import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { stripe } from '@/lib/stripe';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

// Use admin client for webhook (no user context)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutComplete(session);
        break;
      }

      case 'checkout.session.expired': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutExpired(session);
        break;
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log('Payment succeeded:', paymentIntent.id);
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentFailed(paymentIntent);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

async function handleCheckoutComplete(session: Stripe.Checkout.Session) {
  const orderId = session.metadata?.orderId;

  if (!orderId) {
    console.error('No orderId in session metadata');
    return;
  }

  // Update order status
  const { error } = await supabaseAdmin
    .from('orders')
    .update({
      status: 'confirmed',
      payment_status: 'paid',
      stripe_payment_intent_id: session.payment_intent as string,
      paid_at: new Date().toISOString(),
    })
    .eq('id', orderId);

  if (error) {
    console.error('Error updating order:', error);
    throw error;
  }

  // Get order items for inventory update
  const { data: orderItems } = await supabaseAdmin
    .from('order_items')
    .select('*')
    .eq('order_id', orderId);

  // Update inventory
  if (orderItems) {
    for (const item of orderItems) {
      if (item.variant_id) {
        await supabaseAdmin.rpc('decrement_variant_inventory', {
          p_variant_id: item.variant_id,
          p_quantity: item.quantity,
        });
      } else {
        await supabaseAdmin.rpc('decrement_product_inventory', {
          p_product_id: item.product_id,
          p_quantity: item.quantity,
        });
      }
    }
  }

  // Generate order number
  const orderNumber = `AG-${new Date().getFullYear()}-${orderId.slice(0, 8).toUpperCase()}`;
  
  await supabaseAdmin
    .from('orders')
    .update({ order_number: orderNumber })
    .eq('id', orderId);

  console.log(`Order ${orderNumber} completed successfully`);

  // TODO: Send order confirmation email
}

async function handleCheckoutExpired(session: Stripe.Checkout.Session) {
  const orderId = session.metadata?.orderId;

  if (!orderId) {
    return;
  }

  // Mark order as cancelled
  await supabaseAdmin
    .from('orders')
    .update({
      status: 'cancelled',
      payment_status: 'failed',
      cancelled_at: new Date().toISOString(),
    })
    .eq('id', orderId);

  console.log(`Order ${orderId} cancelled due to expired checkout`);
}

async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  // Find order by payment intent if available
  const { data: order } = await supabaseAdmin
    .from('orders')
    .select('id')
    .eq('stripe_payment_intent_id', paymentIntent.id)
    .single();

  if (order) {
    await supabaseAdmin
      .from('orders')
      .update({
        payment_status: 'failed',
      })
      .eq('id', order.id);
  }

  console.log(`Payment failed for intent: ${paymentIntent.id}`);
}
