'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useRecentlyViewedStore } from '@/store/recentlyViewed';
import { formatPrice } from '@/lib/formatting';
import { Clock, X } from 'lucide-react';

interface RecentlyViewedProps {
  currentProductId?: string;
  limit?: number;
  showClearButton?: boolean;
}

export function RecentlyViewed({
  currentProductId,
  limit = 8,
  showClearButton = true,
}: RecentlyViewedProps) {
  const [mounted, setMounted] = useState(false);
  const { products, clearHistory } = useRecentlyViewedStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // Filter out current product and limit
  const recentProducts = products
    .filter((p) => p.id !== currentProductId)
    .slice(0, limit);

  if (recentProducts.length === 0) return null;

  return (
    <section className="py-12 md:py-16">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-brand-grey-500" />
          <h2 className="text-xl md:text-2xl font-semibold text-brand-black">
            Recently Viewed
          </h2>
        </div>
        {showClearButton && (
          <button
            onClick={clearHistory}
            className="text-sm text-brand-grey-500 hover:text-brand-black transition-colors flex items-center gap-1"
          >
            <X className="w-4 h-4" />
            Clear
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-6">
        {recentProducts.map((product, index) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            <Link
              href={`/product/${product.slug}`}
              className="group block"
            >
              <div className="aspect-[3/4] relative bg-brand-grey-100 rounded-lg overflow-hidden mb-3">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                />
              </div>
              <h3 className="text-sm font-medium text-brand-black truncate group-hover:text-brand-grey-600 transition-colors">
                {product.name}
              </h3>
              <p className="text-sm text-brand-grey-500 mt-1">
                {formatPrice(product.price)}
              </p>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
