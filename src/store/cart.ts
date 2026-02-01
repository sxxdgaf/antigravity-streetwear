import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface CartItem {
  id: string;
  productId: string;
  variantId: string | null;
  name: string;
  slug: string;
  image: string | null;
  price: number;
  compareAtPrice: number | null;
  quantity: number;
  size: string | null;
  color: string | null;
  maxQuantity: number;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  
  // Actions
  addItem: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  
  // Computed (as functions for Zustand)
  getItemCount: () => number;
  getSubtotal: () => number;
  getItem: (id: string) => CartItem | undefined;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (item) => {
        const { items } = get();
        const existingIndex = items.findIndex(
          (i) =>
            i.productId === item.productId &&
            i.variantId === item.variantId &&
            i.size === item.size &&
            i.color === item.color
        );

        if (existingIndex > -1) {
          // Update quantity if item exists
          const newItems = [...items];
          const newQuantity = Math.min(
            newItems[existingIndex].quantity + (item.quantity || 1),
            newItems[existingIndex].maxQuantity
          );
          newItems[existingIndex] = {
            ...newItems[existingIndex],
            quantity: newQuantity,
          };
          set({ items: newItems });
        } else {
          // Add new item
          const newItem: CartItem = {
            ...item,
            id: `${item.productId}-${item.variantId || 'default'}-${item.size || ''}-${item.color || ''}-${Date.now()}`,
            quantity: item.quantity || 1,
          };
          set({ items: [...items, newItem] });
        }
      },

      removeItem: (id) => {
        set({ items: get().items.filter((item) => item.id !== id) });
      },

      updateQuantity: (id, quantity) => {
        if (quantity < 1) {
          get().removeItem(id);
          return;
        }

        const { items } = get();
        const newItems = items.map((item) =>
          item.id === id
            ? { ...item, quantity: Math.min(quantity, item.maxQuantity) }
            : item
        );
        set({ items: newItems });
      },

      clearCart: () => {
        set({ items: [] });
      },

      openCart: () => {
        set({ isOpen: true });
      },

      closeCart: () => {
        set({ isOpen: false });
      },

      toggleCart: () => {
        set({ isOpen: !get().isOpen });
      },

      getItemCount: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },

      getSubtotal: () => {
        return get().items.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        );
      },

      getItem: (id) => {
        return get().items.find((item) => item.id === id);
      },
    }),
    {
      name: 'antigravity-cart',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }), // Only persist items
    }
  )
);

// Selectors for optimized re-renders
export const selectCartItems = (state: CartState) => state.items;
export const selectIsCartOpen = (state: CartState) => state.isOpen;
export const selectCartItemCount = (state: CartState) => state.getItemCount();
export const selectCartSubtotal = (state: CartState) => state.getSubtotal();
