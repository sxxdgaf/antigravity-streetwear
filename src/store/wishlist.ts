import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface WishlistItem {
  id: string;
  productId: string;
  name: string;
  slug: string;
  image: string | null;
  price: number;
  compareAtPrice: number | null;
  addedAt: number;
}

interface WishlistState {
  items: WishlistItem[];
  
  // Actions
  addItem: (item: Omit<WishlistItem, 'id' | 'addedAt'>) => void;
  removeItem: (productId: string) => void;
  clearWishlist: () => void;
  isInWishlist: (productId: string) => boolean;
  toggleItem: (item: Omit<WishlistItem, 'id' | 'addedAt'>) => void;
  
  // Computed
  getItemCount: () => number;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        const { items } = get();
        const exists = items.some((i) => i.productId === item.productId);
        
        if (!exists) {
          const newItem: WishlistItem = {
            ...item,
            id: `wishlist-${item.productId}-${Date.now()}`,
            addedAt: Date.now(),
          };
          set({ items: [...items, newItem] });
        }
      },

      removeItem: (productId) => {
        set({ items: get().items.filter((item) => item.productId !== productId) });
      },

      clearWishlist: () => {
        set({ items: [] });
      },

      isInWishlist: (productId) => {
        return get().items.some((item) => item.productId === productId);
      },

      toggleItem: (item) => {
        const { isInWishlist, addItem, removeItem } = get();
        if (isInWishlist(item.productId)) {
          removeItem(item.productId);
        } else {
          addItem(item);
        }
      },

      getItemCount: () => {
        return get().items.length;
      },
    }),
    {
      name: 'antigravity-wishlist',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

// Selectors
export const selectWishlistItems = (state: WishlistState) => state.items;
export const selectWishlistCount = (state: WishlistState) => state.getItemCount();
