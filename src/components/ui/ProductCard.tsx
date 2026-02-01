'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Heart, ShoppingBag } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatPrice } from '@/lib/formatting';
import { Product } from '@/types';
import { motion } from 'framer-motion';
import { Badge } from './Badge';

interface ProductCardProps {
  product: Product;
  index?: number;
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const isOnSale = product.compare_at_price && product.compare_at_price > product.price;
  const discountPercent = isOnSale
    ? Math.round((1 - product.price / product.compare_at_price!) * 100)
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
    >
      <Link href={`/products/${product.slug}`} className="group block">
        {/* Image Container */}
        <div className="relative aspect-[3/4] bg-brand-grey-100 rounded-lg overflow-hidden mb-4">
          {product.images?.[0] ? (
            <>
              <Image
                src={product.images[0]}
                alt={product.name}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              {/* Second image on hover */}
              {product.images[1] && (
                <Image
                  src={product.images[1]}
                  alt={product.name}
                  fill
                  className="object-cover absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                />
              )}
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-brand-grey-400">
              <ShoppingBag className="w-12 h-12" />
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {product.is_new && <Badge variant="accent">New</Badge>}
            {isOnSale && <Badge variant="error">-{discountPercent}%</Badge>}
            {product.is_featured && <Badge>Featured</Badge>}
          </div>

          {/* Quick Actions */}
          <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => {
                e.preventDefault();
                // TODO: Add to wishlist
              }}
              className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-brand-grey-50 transition-colors"
              aria-label="Add to wishlist"
            >
              <Heart className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Add Button */}
          <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
            <button
              onClick={(e) => {
                e.preventDefault();
                // TODO: Quick add to cart
              }}
              className="w-full py-3 bg-brand-black text-white text-sm font-medium rounded-lg hover:bg-brand-grey-800 transition-colors"
            >
              Quick Add
            </button>
          </div>
        </div>

        {/* Product Info */}
        <div className="space-y-1">
          <p className="text-xs text-brand-grey-500 uppercase tracking-wider">
            {product.category?.name || 'Uncategorized'}
          </p>
          <h3 className="font-medium text-brand-black group-hover:text-brand-grey-600 transition-colors line-clamp-1">
            {product.name}
          </h3>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-brand-black">{formatPrice(product.price)}</span>
            {isOnSale && (
              <span className="text-sm text-brand-grey-400 line-through">
                {formatPrice(product.compare_at_price!)}
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
