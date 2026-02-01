'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCartStore, CartItem } from '@/store/cart';
import { useIsMounted } from '@/hooks/useStore';
import { formatPrice } from '@/lib/formatting';
import { Button } from '@/components/ui/Button';
import { X, Plus, Minus, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

export function CartDrawer() {
  const isMounted = useIsMounted();
  const isOpen = useCartStore((state) => state.isOpen);
  const closeCart = useCartStore((state) => state.closeCart);
  const items = useCartStore((state) => state.items);
  const removeItem = useCartStore((state) => state.removeItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const getSubtotal = useCartStore((state) => state.getSubtotal);

  const subtotal = isMounted ? getSubtotal() : 0;
  const itemCount = isMounted ? items.length : 0;

  const FREE_SHIPPING_THRESHOLD = 10000;
  const remainingForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);

  if (!isMounted) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 bg-black/50 z-50"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white z-50 flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-brand-grey-200">
              <h2 className="text-lg font-semibold text-brand-black">
                Shopping Bag ({itemCount})
              </h2>
              <button
                onClick={closeCart}
                className="p-2 hover:bg-brand-grey-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Free Shipping Progress */}
            {subtotal > 0 && remainingForFreeShipping > 0 && (
              <div className="px-6 py-3 bg-brand-grey-50 border-b border-brand-grey-200">
                <div className="text-sm text-brand-grey-600 mb-2">
                  Add <span className="font-semibold text-brand-black">{formatPrice(remainingForFreeShipping)}</span> more for free shipping!
                </div>
                <div className="h-2 bg-brand-grey-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-brand-accent rounded-full transition-all duration-300"
                    style={{ width: `${Math.min((subtotal / FREE_SHIPPING_THRESHOLD) * 100, 100)}%` }}
                  />
                </div>
              </div>
            )}

            {subtotal >= FREE_SHIPPING_THRESHOLD && (
              <div className="px-6 py-3 bg-green-50 border-b border-green-200 text-sm text-green-700 font-medium">
                🎉 You've unlocked free shipping!
              </div>
            )}

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center px-6">
                  <ShoppingBag className="w-16 h-16 text-brand-grey-300 mb-4" />
                  <h3 className="text-lg font-semibold text-brand-black mb-2">
                    Your bag is empty
                  </h3>
                  <p className="text-brand-grey-500 mb-6">
                    Looks like you haven't added anything yet.
                  </p>
                  <Button onClick={closeCart}>
                    Start Shopping
                  </Button>
                </div>
              ) : (
                <ul className="divide-y divide-brand-grey-200">
                  <AnimatePresence mode="popLayout">
                    {items.map((item) => (
                      <CartItemRow
                        key={item.id}
                        item={item}
                        onRemove={() => removeItem(item.id)}
                        onUpdateQuantity={(qty) => updateQuantity(item.id, qty)}
                      />
                    ))}
                  </AnimatePresence>
                </ul>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-brand-grey-200 p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-brand-grey-500">Subtotal</span>
                  <span className="text-lg font-semibold text-brand-black">
                    {formatPrice(subtotal)}
                  </span>
                </div>
                <p className="text-sm text-brand-grey-500">
                  Shipping and taxes calculated at checkout
                </p>
                <div className="space-y-2">
                  <Link href="/checkout" onClick={closeCart}>
                    <Button className="w-full" size="lg">
                      Checkout
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </Link>
                  <Link href="/cart" onClick={closeCart}>
                    <Button variant="secondary" className="w-full">
                      View Bag
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function CartItemRow({
  item,
  onRemove,
  onUpdateQuantity,
}: {
  item: CartItem;
  onRemove: () => void;
  onUpdateQuantity: (quantity: number) => void;
}) {
  return (
    <motion.li
      layout
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="p-4 flex gap-4"
    >
      {/* Image */}
      <Link href={`/products/${item.slug}`} className="shrink-0">
        <div className="relative w-20 h-24 bg-brand-grey-100 rounded-lg overflow-hidden">
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
      <div className="flex-1 min-w-0">
        <Link
          href={`/products/${item.slug}`}
          className="font-medium text-brand-black hover:underline line-clamp-1"
        >
          {item.name}
        </Link>
        <div className="text-sm text-brand-grey-500 mt-1">
          {item.size && <span>{item.size}</span>}
          {item.size && item.color && <span> / </span>}
          {item.color && <span>{item.color}</span>}
        </div>
        <div className="flex items-center justify-between mt-2">
          {/* Quantity Controls */}
          <div className="flex items-center border border-brand-grey-200 rounded-lg">
            <button
              onClick={() => onUpdateQuantity(item.quantity - 1)}
              className="p-2 hover:bg-brand-grey-50 transition-colors"
              aria-label="Decrease quantity"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-8 text-center text-sm font-medium">
              {item.quantity}
            </span>
            <button
              onClick={() => onUpdateQuantity(item.quantity + 1)}
              disabled={item.quantity >= item.maxQuantity}
              className="p-2 hover:bg-brand-grey-50 transition-colors disabled:opacity-50"
              aria-label="Increase quantity"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          {/* Price */}
          <span className="font-semibold text-brand-black">
            {formatPrice(item.price * item.quantity)}
          </span>
        </div>
      </div>

      {/* Remove Button */}
      <button
        onClick={onRemove}
        className="self-start p-1 text-brand-grey-400 hover:text-red-500 transition-colors"
        aria-label="Remove item"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </motion.li>
  );
}
