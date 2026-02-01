'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';
import { formatPrice } from '@/lib/formatting';
import { Heart, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Placeholder wishlist items - will be replaced with Zustand store
const initialWishlistItems = [
  {
    id: '1',
    productId: 'prod-1',
    name: 'Oversized Gravity Hoodie',
    slug: 'oversized-gravity-hoodie',
    image: '/images/products/hoodie-1.jpg',
    price: 8500,
    compareAtPrice: null,
    isInStock: true,
  },
  {
    id: '2',
    productId: 'prod-2',
    name: 'Minimal Logo Cap',
    slug: 'minimal-logo-cap',
    image: '/images/products/cap-1.jpg',
    price: 2500,
    compareAtPrice: 3000,
    isInStock: true,
  },
  {
    id: '3',
    productId: 'prod-3',
    name: 'Cargo Street Pants',
    slug: 'cargo-street-pants',
    image: '/images/products/pants-1.jpg',
    price: 6500,
    compareAtPrice: null,
    isInStock: false,
  },
];

export default function WishlistPage() {
  const [wishlistItems, setWishlistItems] = useState(initialWishlistItems);

  const removeFromWishlist = (id: string) => {
    setWishlistItems((items) => items.filter((item) => item.id !== id));
  };

  const addToCart = (id: string) => {
    // TODO: Implement add to cart
    console.log('Add to cart:', id);
    // Optionally remove from wishlist after adding to cart
  };

  if (wishlistItems.length === 0) {
    return (
      <Container className="py-20">
        <div className="text-center max-w-md mx-auto">
          <Heart className="w-16 h-16 mx-auto text-brand-grey-300 mb-6" />
          <h1 className="text-2xl font-display font-bold text-brand-black mb-4">
            Your wishlist is empty
          </h1>
          <p className="text-brand-grey-500 mb-8">
            Save items you love by clicking the heart icon on product pages.
          </p>
          <Link href="/shop">
            <Button size="lg">
              Start Shopping
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
          My Wishlist
        </h1>
        <span className="text-brand-grey-500">
          {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'}
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        <AnimatePresence mode="popLayout">
          {wishlistItems.map((item) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="group"
            >
              {/* Image Container */}
              <div className="relative aspect-[3/4] bg-brand-grey-100 rounded-lg overflow-hidden mb-4">
                <Link href={`/products/${item.slug}`}>
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ShoppingBag className="w-12 h-12 text-brand-grey-300" />
                    </div>
                  )}
                </Link>

                {/* Remove Button */}
                <button
                  onClick={() => removeFromWishlist(item.id)}
                  className="absolute top-3 right-3 w-9 h-9 bg-white rounded-full flex items-center justify-center shadow-md text-brand-grey-500 hover:text-red-500 transition-colors"
                  aria-label="Remove from wishlist"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                {/* Out of Stock Overlay */}
                {!item.isInStock && (
                  <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                    <span className="text-brand-grey-600 font-medium">Out of Stock</span>
                  </div>
                )}

                {/* Sale Badge */}
                {item.compareAtPrice && (
                  <span className="absolute top-3 left-3 px-2 py-1 bg-red-500 text-white text-xs font-medium rounded">
                    Sale
                  </span>
                )}
              </div>

              {/* Product Info */}
              <div className="space-y-2">
                <Link
                  href={`/products/${item.slug}`}
                  className="block font-medium text-brand-black hover:text-brand-grey-600 transition-colors line-clamp-1"
                >
                  {item.name}
                </Link>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-brand-black">
                    {formatPrice(item.price)}
                  </span>
                  {item.compareAtPrice && (
                    <span className="text-sm text-brand-grey-400 line-through">
                      {formatPrice(item.compareAtPrice)}
                    </span>
                  )}
                </div>

                {/* Add to Cart Button */}
                <Button
                  onClick={() => addToCart(item.id)}
                  disabled={!item.isInStock}
                  className="w-full mt-2"
                  size="sm"
                  variant={item.isInStock ? 'primary' : 'secondary'}
                >
                  {item.isInStock ? (
                    <>
                      <ShoppingBag className="w-4 h-4 mr-2" />
                      Add to Cart
                    </>
                  ) : (
                    'Out of Stock'
                  )}
                </Button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </Container>
  );
}
