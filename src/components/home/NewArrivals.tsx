'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { ProductCard } from '@/components/ui/ProductCard';
import { Product } from '@/types';

interface NewArrivalsProps {
  products: Product[];
}

export function NewArrivals({ products }: NewArrivalsProps) {
  return (
    <section className="py-20 bg-white">
      <Container>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-12"
        >
          <div>
            <p className="text-brand-accent font-medium tracking-widest uppercase text-sm mb-2">
              Just Dropped
            </p>
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-brand-black">
              New Arrivals
            </h2>
          </div>
          <Link
            href="/shop?filter=new"
            className="group flex items-center gap-2 text-sm font-medium text-brand-black hover:text-brand-grey-600 transition-colors"
          >
            View All
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product, index) => (
            <ProductCard key={product.id} product={product} index={index} />
          ))}
        </div>
      </Container>
    </section>
  );
}
