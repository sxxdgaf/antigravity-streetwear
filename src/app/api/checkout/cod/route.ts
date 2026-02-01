import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createClient } from '@/lib/supabase/server';
import { CartItem } from '@/store/cart';

interface CODCheckoutRequestBody {
  items: CartItem[];
  shippingAddress: {
    name: string;
    email: string;
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
    const body: CODCheckoutRequestBody = await request.json();
    const { items, shippingAddress, shippingMethod, promoCode } = body;

    // Validate items
    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: 'Cart is empty' },
        { status: 400 }
      );
    }

    // Validate shipping address
    if (!shippingAddress.name || !shippingAddress.phone || !shippingAddress.address || !shippingAddress.city) {
      return NextResponse.json(
        { error: 'Invalid shipping address' },
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
        payment_method: 'cod',
        payment_status: 'pending', // Will be marked paid on delivery
        guest_email: !user ? shippingAddress.email : null,
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

    // Update inventory (reduce stock)
    for (const item of items) {
      if (item.variantId) {
        // Update variant inventory
        await supabase.rpc('decrement_variant_inventory', {
          p_variant_id: item.variantId,
          p_quantity: item.quantity,
        });
      } else {
        // Update product inventory
        await supabase.rpc('decrement_product_inventory', {
          p_product_id: item.productId,
          p_quantity: item.quantity,
        });
      }
    }

    // Generate order number
    const orderNumber = `AG-${new Date().getFullYear()}-${order.id.slice(0, 8).toUpperCase()}`;
    
    // Update order with order number
    await supabase
      .from('orders')
      .update({ order_number: orderNumber })
      .eq('id', order.id);

    // TODO: Send order confirmation email

    return NextResponse.json({
      success: true,
      orderId: order.id,
      orderNumber,
      total,
    });
  } catch (error) {
    console.error('COD Checkout error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
