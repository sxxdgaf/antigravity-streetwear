'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';
import { useCartStore } from '@/store/cart';
import { useIsMounted } from '@/hooks/useStore';
import { formatPrice } from '@/lib/formatting';
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight, Tag, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const PROMO_CODES: Record<string, { type: 'percentage' | 'fixed'; value: number; label: string }> = {
  ANTIGRAVITY10: { type: 'percentage', value: 10, label: '10% off' },
  WELCOME500: { type: 'fixed', value: 500, label: 'PKR 500 off' },
};

export default function CartPage() {
  const isMounted = useIsMounted();
  const items = useCartStore((state) => state.items);
  const removeItem = useCartStore((state) => state.removeItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const clearCart = useCartStore((state) => state.clearCart);

  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);
  const [promoError, setPromoError] = useState('');

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  
  // Calculate discount
  let discount = 0;
  if (appliedPromo && PROMO_CODES[appliedPromo]) {
    const promo = PROMO_CODES[appliedPromo];
    if (promo.type === 'percentage') {
      discount = Math.round((subtotal * promo.value) / 100);
    } else {
      discount = promo.value;
    }
  }

  const shipping = subtotal >= 10000 ? 0 : subtotal > 0 ? 300 : 0;
  const total = subtotal - discount + shipping;

  const applyPromoCode = () => {
    setPromoError('');
    const code = promoCode.toUpperCase().trim();
    
    if (PROMO_CODES[code]) {
      setAppliedPromo(code);
      setPromoCode('');
    } else {
      setPromoError('Invalid promo code');
    }
  };

  const removePromo = () => {
    setAppliedPromo(null);
  };

  // Show loading state during hydration
  if (!isMounted) {
    return (
      <Container className="py-12">
        <div className="animate-pulse">
          <div className="h-8 bg-brand-grey-200 rounded w-48 mb-8" />
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="h-32 bg-brand-grey-100 rounded-xl" />
              ))}
            </div>
            <div className="h-64 bg-brand-grey-100 rounded-xl" />
          </div>
        </div>
      </Container>
    );
  }

  if (items.length === 0) {
    return (
      <Container className="py-20">
        <div className="text-center max-w-md mx-auto">
          <ShoppingBag className="w-16 h-16 mx-auto text-brand-grey-300 mb-6" />
          <h1 className="text-2xl font-display font-bold text-brand-black mb-4">
            Your cart is empty
          </h1>
          <p className="text-brand-grey-500 mb-8">
            Looks like you haven't added anything to your cart yet.
          </p>
          <Link href="/shop">
            <Button size="lg">
              Continue Shopping
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-display font-bold text-brand-black">
          Shopping Bag
        </h1>
        <button
          onClick={clearCart}
          className="text-sm text-brand-grey-500 hover:text-red-500 transition-colors"
        >
          Clear all
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {items.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  className="flex gap-4 p-4 bg-white border border-brand-grey-200 rounded-xl"
                >
                  {/* Image */}
                  <Link href={`/products/${item.slug}`} className="shrink-0">
                    <div className="relative w-24 h-32 sm:w-32 sm:h-40 bg-brand-grey-100 rounded-lg overflow-hidden">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ShoppingBag className="w-8 h-8 text-brand-grey-300" />
                        </div>
                      )}
                    </div>
                  </Link>

                  {/* Details */}
                  <div className="flex-1 min-w-0 flex flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <Link
                          href={`/products/${item.slug}`}
                          className="font-semibold text-brand-black hover:underline line-clamp-1"
                        >
                          {item.name}
                        </Link>
                        <div className="text-sm text-brand-grey-500 mt-1">
                          {item.size && <span>Size: {item.size}</span>}
                          {item.size && item.color && <span> • </span>}
                          {item.color && <span>Color: {item.color}</span>}
                        </div>
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="p-1 text-brand-grey-400 hover:text-red-500 transition-colors shrink-0"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="mt-auto pt-4 flex items-end justify-between">
                      {/* Quantity Controls */}
                      <div className="flex items-center border border-brand-grey-200 rounded-lg">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-2 hover:bg-brand-grey-50 transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-10 text-center font-medium">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          disabled={item.quantity >= item.maxQuantity}
                          className="p-2 hover:bg-brand-grey-50 transition-colors disabled:opacity-50"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Price */}
                      <div className="text-right">
                        <div className="font-semibold text-brand-black">
                          {formatPrice(item.price * item.quantity)}
                        </div>
                        {item.quantity > 1 && (
                          <div className="text-sm text-brand-grey-500">
                            {formatPrice(item.price)} each
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Continue Shopping */}
          <div className="mt-6">
            <Link
              href="/shop"
              className="inline-flex items-center text-brand-grey-500 hover:text-brand-black transition-colors"
            >
              <ArrowRight className="w-4 h-4 mr-2 rotate-180" />
              Continue Shopping
            </Link>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 bg-brand-grey-50 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-brand-black mb-6">
              Order Summary
            </h2>

            {/* Promo Code */}
            <div className="mb-6">
              {appliedPromo ? (
                <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-green-600" />
                    <span className="font-medium text-green-700">
                      {appliedPromo}
                    </span>
                    <span className="text-sm text-green-600">
                      ({PROMO_CODES[appliedPromo].label})
                    </span>
                  </div>
                  <button
                    onClick={removePromo}
                    className="p-1 text-green-600 hover:text-green-700"
                    aria-label="Remove promo"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Promo code"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && applyPromoCode()}
                    className="flex-1 px-4 py-2 border border-brand-grey-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-black text-sm"
                  />
                  <Button
                    onClick={applyPromoCode}
                    variant="secondary"
                    size="sm"
                  >
                    Apply
                  </Button>
                </div>
              )}
              {promoError && (
                <p className="text-sm text-red-500 mt-2">{promoError}</p>
              )}
            </div>

            {/* Totals */}
            <div className="space-y-3 border-t border-brand-grey-200 pt-4">
              <div className="flex justify-between text-sm">
                <span className="text-brand-grey-500">Subtotal</span>
                <span className="text-brand-black">{formatPrice(subtotal)}</span>
              </div>

              {discount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Discount</span>
                  <span>-{formatPrice(discount)}</span>
                </div>
              )}

              <div className="flex justify-between text-sm">
                <span className="text-brand-grey-500">Shipping</span>
                <span className="text-brand-black">
                  {shipping === 0 ? (
                    <span className="text-green-600">FREE</span>
                  ) : (
                    formatPrice(shipping)
                  )}
                </span>
              </div>

              {shipping > 0 && (
                <p className="text-xs text-brand-grey-500">
                  Add {formatPrice(10000 - subtotal)} more for free shipping
                </p>
              )}

              <div className="flex justify-between font-semibold text-lg pt-3 border-t border-brand-grey-200">
                <span className="text-brand-black">Total</span>
                <span className="text-brand-black">{formatPrice(total)}</span>
              </div>
            </div>

            {/* Checkout Button */}
            <Link href="/checkout" className="block mt-6">
              <Button className="w-full" size="lg">
                Proceed to Checkout
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>

            {/* Trust Badges */}
            <div className="mt-6 pt-6 border-t border-brand-grey-200">
              <div className="flex items-center justify-center gap-4 text-xs text-brand-grey-500">
                <span>🔒 Secure Checkout</span>
                <span>•</span>
                <span>📦 Free Returns</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
}
