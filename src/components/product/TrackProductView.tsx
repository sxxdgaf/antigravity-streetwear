'use client';

import { useEffect } from 'react';
import { useRecentlyViewedStore } from '@/store/recentlyViewed';

interface TrackProductViewProps {
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    image: string;
  };
}

export function TrackProductView({ product }: TrackProductViewProps) {
  const addProduct = useRecentlyViewedStore((state) => state.addProduct);

  useEffect(() => {
    // Track the product view
    addProduct(product);
  }, [product, addProduct]);

  return null;
}
