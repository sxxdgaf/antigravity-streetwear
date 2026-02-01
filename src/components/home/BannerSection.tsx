'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function BannerSection() {
  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left Banner */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Link
              href="/category/hoodies"
              className="group block relative aspect-[4/3] rounded-xl overflow-hidden"
            >
              <Image
                src="/images/banners/hoodies-banner.jpg"
                alt="Hoodies Collection"
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />
              <div className="absolute inset-0 p-8 flex flex-col justify-center">
                <p className="text-brand-accent font-medium tracking-widest uppercase text-sm mb-2">
                  Premium Collection
                </p>
                <h3 className="text-3xl sm:text-4xl font-display font-bold text-white mb-4">
                  Hoodies &<br />Sweatshirts
                </h3>
                <Button className="w-fit bg-white text-brand-black hover:bg-brand-grey-100">
                  Shop Now
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </Link>
          </motion.div>

          {/* Right Banner */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <Link
              href="/shop?filter=sale"
              className="group block relative aspect-[4/3] rounded-xl overflow-hidden"
            >
              <Image
                src="/images/banners/sale-banner.jpg"
                alt="Sale Collection"
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-l from-black/60 to-transparent" />
              <div className="absolute inset-0 p-8 flex flex-col justify-center items-end text-right">
                <p className="text-red-400 font-medium tracking-widest uppercase text-sm mb-2">
                  Limited Time
                </p>
                <h3 className="text-3xl sm:text-4xl font-display font-bold text-white mb-2">
                  Up to 40%
                </h3>
                <p className="text-xl text-white/80 mb-4">Off Selected Items</p>
                <Button className="bg-white text-brand-black hover:bg-brand-grey-100">
                  Shop Sale
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
