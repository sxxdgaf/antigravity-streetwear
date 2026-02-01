import { NextRequest, NextResponse } from 'next/server';
import { stripe, formatAmountForStripe } from '@/lib/stripe';
import { createClient } from '@/lib/supabase/server';
import { CartItem } from '@/store/cart';

interface CheckoutRequestBody {
  items: CartItem[];
  shippingAddress: {
    name: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  shippingMethod: 'standard' | 'express';
  promoCode?: string;
}

const SHIPPING_RATES = {
  standard: { price: 300, freeThreshold: 10000 },
  express: { price: 500, freeThreshold: null },
};

const PROMO_CODES: Record<string, { type: 'percentage' | 'fixed'; value: number }> = {
  ANTIGRAVITY10: { type: 'percentage', value: 10 },
  WELCOME500: { type: 'fixed', value: 500 },
};

export async function POST(request: NextRequest) {
  try {
    const body: CheckoutRequestBody = await request.json();
    const { items, shippingAddress, shippingMethod, promoCode } = body;

    // Validate items
    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: 'Cart is empty' },
        { status: 400 }
      );
    }

    // Calculate subtotal
    const subtotal = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    // Calculate shipping
    const shippingRate = SHIPPING_RATES[shippingMethod];
    let shippingCost = shippingRate.price;
    if (shippingRate.freeThreshold && subtotal >= shippingRate.freeThreshold) {
      shippingCost = 0;
    }

    // Apply promo code
    let discount = 0;
    if (promoCode && PROMO_CODES[promoCode.toUpperCase()]) {
      const promo = PROMO_CODES[promoCode.toUpperCase()];
      if (promo.type === 'percentage') {
        discount = Math.round((subtotal * promo.value) / 100);
      } else {
        discount = promo.value;
      }
    }

    // Calculate total
    const total = subtotal + shippingCost - discount;

    // Get current user (optional for guest checkout)
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Create order in database
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: user?.id || null,
        status: 'pending',
        subtotal,
        shipping_cost: shippingCost,
        discount,
        total,
        shipping_address: shippingAddress,
        shipping_method: shippingMethod,
        promo_code: promoCode || null,
        payment_method: 'stripe',
        payment_status: 'pending',
      })
      .select()
      .single();

    if (orderError) {
      console.error('Error creating order:', orderError);
      return NextResponse.json(
        { error: 'Failed to create order' },
        { status: 500 }
      );
    }

    // Create order items
    const orderItems = items.map((item) => ({
      order_id: order.id,
      product_id: item.productId,
      variant_id: item.variantId,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      size: item.size,
      color: item.color,
      image: item.image,
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) {
      console.error('Error creating order items:', itemsError);
      // Clean up order
      await supabase.from('orders').delete().eq('id', order.id);
      return NextResponse.json(
        { error: 'Failed to create order items' },
        { status: 500 }
      );
    }

    // Create Stripe checkout session
    const lineItems = items.map((item) => ({
      price_data: {
        currency: 'pkr',
        product_data: {
          name: item.name,
          description: [item.size, item.color].filter(Boolean).join(' / ') || undefined,
          images: item.image ? [item.image] : undefined,
        },
        unit_amount: formatAmountForStripe(item.price),
      },
      quantity: item.quantity,
    }));

    // Add shipping as line item
    if (shippingCost > 0) {
      lineItems.push({
        price_data: {
          currency: 'pkr',
          product_data: {
            name: shippingMethod === 'express' ? 'Express Shipping' : 'Standard Shipping',
            description: shippingMethod === 'express' ? '1-2 business days' : '3-5 business days',
            images: undefined,
          },
          unit_amount: formatAmountForStripe(shippingCost),
        },
        quantity: 1,
      });
    }

    // Create Stripe session
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: lineItems,
      discounts: discount > 0 ? undefined : undefined, // Could use Stripe coupons for discounts
      customer_email: user?.email || undefined,
      metadata: {
        orderId: order.id,
        userId: user?.id || 'guest',
      },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success?order_id=${order.id}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout?cancelled=true`,
      shipping_address_collection: undefined, // We collect this ourselves
    });

    // Update order with Stripe session ID
    await supabase
      .from('orders')
      .update({ stripe_session_id: session.id })
      .eq('id', order.id);

    return NextResponse.json({
      sessionId: session.id,
      sessionUrl: session.url,
      orderId: order.id,
    });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
