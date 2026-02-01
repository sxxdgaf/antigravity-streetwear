'use client';

import { useCartStore } from '@/store/cart';
import { useIsMounted } from '@/hooks/useStore';
import { ShoppingBag } from 'lucide-react';

export function CartIcon() {
  const isMounted = useIsMounted();
  const openCart = useCartStore((state) => state.openCart);
  const getItemCount = useCartStore((state) => state.getItemCount);
  
  const itemCount = isMounted ? getItemCount() : 0;

  return (
    <button
      onClick={openCart}
      className="relative p-2 hover:bg-brand-grey-100 rounded-lg transition-colors"
      aria-label={`Shopping bag with ${itemCount} items`}
    >
      <ShoppingBag className="w-5 h-5" />
      {itemCount > 0 && (
        <span className="absolute -top-1 -right-1 w-5 h-5 bg-brand-black text-white text-xs font-medium rounded-full flex items-center justify-center">
          {itemCount > 99 ? '99+' : itemCount}
        </span>
      )}
    </button>
  );
}
