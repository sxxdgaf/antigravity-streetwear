import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface RecentProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  image: string;
  viewedAt: number;
}

interface RecentlyViewedState {
  products: RecentProduct[];
  addProduct: (product: Omit<RecentProduct, 'viewedAt'>) => void;
  clearHistory: () => void;
  getRecentProducts: (limit?: number) => RecentProduct[];
}

const MAX_RECENT_PRODUCTS = 20;

export const useRecentlyViewedStore = create<RecentlyViewedState>()(
  persist(
    (set, get) => ({
      products: [],

      addProduct: (product) => {
        set((state) => {
          // Remove if already exists
          const filtered = state.products.filter((p) => p.id !== product.id);

          // Add to beginning with timestamp
          const newProducts = [
            { ...product, viewedAt: Date.now() },
            ...filtered,
          ].slice(0, MAX_RECENT_PRODUCTS);

          return { products: newProducts };
        });
      },

      clearHistory: () => set({ products: [] }),

      getRecentProducts: (limit = 8) => {
        return get().products.slice(0, limit);
      },
    }),
    {
      name: 'antigravity-recently-viewed',
    }
  )
);
