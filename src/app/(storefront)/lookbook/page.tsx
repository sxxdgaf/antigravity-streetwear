'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Container } from '@/components/ui/Container';
import { ArrowRight, X } from 'lucide-react';

// Sample lookbook data - in production, this would come from the database
const lookbookImages = [
  {
    id: '1',
    src: '/images/lookbook/look-1.jpg',
    title: 'Urban Edge',
    products: ['Oversized Hoodie', 'Cargo Pants'],
  },
  {
    id: '2',
    src: '/images/lookbook/look-2.jpg',
    title: 'Street Classic',
    products: ['Essential Tee', 'Relaxed Jeans'],
  },
  {
    id: '3',
    src: '/images/lookbook/look-3.jpg',
    title: 'Night Out',
    products: ['Bomber Jacket', 'Slim Pants'],
  },
  {
    id: '4',
    src: '/images/lookbook/look-4.jpg',
    title: 'Minimal Flow',
    products: ['Crewneck Sweat', 'Wide Leg Trousers'],
  },
  {
    id: '5',
    src: '/images/lookbook/look-5.jpg',
    title: 'Bold Statement',
    products: ['Graphic Hoodie', 'Joggers'],
  },
  {
    id: '6',
    src: '/images/lookbook/look-6.jpg',
    title: 'Effortless Cool',
    products: ['Oversized Tee', 'Shorts'],
  },
];

export default function LookbookPage() {
  const [selectedImage, setSelectedImage] = useState<typeof lookbookImages[0] | null>(null);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="relative h-[60vh] min-h-[400px] bg-brand-black">
        <Image
          src="/images/lookbook/lookbook-hero.jpg"
          alt="Lookbook Hero"
          fill
          className="object-cover opacity-60"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center text-white"
          >
            <p className="text-brand-accent font-medium tracking-widest uppercase text-sm mb-4">
              Season 01 / 2026
            </p>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-display font-bold mb-6">
              The Lookbook
            </h1>
            <p className="text-lg text-white/70 max-w-lg mx-auto px-4">
              Explore our latest collection through curated looks that define urban style.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Gallery */}
      <Container className="py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {lookbookImages.map((image, index) => (
            <motion.div
              key={image.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <button
                onClick={() => setSelectedImage(image)}
                className="group block relative aspect-[3/4] w-full rounded-lg overflow-hidden"
              >
                <Image
                  src={image.src}
                  alt={image.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                  <h3 className="text-xl font-display font-bold text-white mb-1">
                    {image.title}
                  </h3>
                  <p className="text-sm text-white/70">
                    {image.products.join(' • ')}
                  </p>
                </div>
              </button>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-20"
        >
          <h2 className="text-3xl font-display font-bold text-brand-black mb-4">
            Shop the Looks
          </h2>
          <p className="text-brand-grey-500 mb-8 max-w-lg mx-auto">
            Find your style. Every piece in the lookbook is available now.
          </p>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 px-8 py-4 bg-brand-black text-white rounded-lg font-medium hover:bg-brand-grey-800 transition-colors"
          >
            Shop Collection
            <ArrowRight className="w-5 h-5" />
          </Link>
        </motion.div>
      </Container>

      {/* Lightbox */}
      {selectedImage && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-6 right-6 p-2 text-white hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-8 h-8" />
          </button>
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="relative max-w-4xl w-full aspect-[3/4] max-h-[85vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={selectedImage.src}
              alt={selectedImage.title}
              fill
              className="object-contain"
            />
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
              <h3 className="text-2xl font-display font-bold text-white mb-2">
                {selectedImage.title}
              </h3>
              <p className="text-white/70 mb-4">
                Featured: {selectedImage.products.join(', ')}
              </p>
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 text-brand-accent hover:text-white transition-colors"
              >
                Shop these items
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
