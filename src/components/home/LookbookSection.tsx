'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function LookbookSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });

  const y1 = useTransform(scrollYProgress, [0, 1], [100, -100]);
  const y2 = useTransform(scrollYProgress, [0, 1], [50, -50]);
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0]);

  return (
    <section ref={containerRef} className="py-20 bg-brand-black overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Content */}
          <motion.div
            style={{ opacity }}
            className="order-2 lg:order-1"
          >
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-brand-accent font-medium tracking-widest uppercase text-sm mb-4"
            >
              Season 01 / 2026
            </motion.p>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl sm:text-5xl font-display font-bold text-white leading-tight mb-6"
            >
              The
              <br />
              <span className="text-brand-accent">Lookbook</span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg text-brand-grey-400 mb-8 max-w-md"
            >
              Explore our latest collection through the lens of urban culture. 
              Where street meets sophistication.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Link href="/lookbook">
                <Button className="bg-white text-brand-black hover:bg-brand-grey-100">
                  View Lookbook
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </motion.div>
          </motion.div>

          {/* Images */}
          <div className="order-1 lg:order-2 relative h-[500px] lg:h-[600px]">
            <motion.div
              style={{ y: y1 }}
              className="absolute top-0 right-0 w-[60%] aspect-[3/4] rounded-lg overflow-hidden shadow-2xl"
            >
              <Image
                src="/images/lookbook/look-1.jpg"
                alt="Lookbook Image 1"
                fill
                className="object-cover"
              />
            </motion.div>

            <motion.div
              style={{ y: y2 }}
              className="absolute bottom-0 left-0 w-[55%] aspect-[3/4] rounded-lg overflow-hidden shadow-2xl"
            >
              <Image
                src="/images/lookbook/look-2.jpg"
                alt="Lookbook Image 2"
                fill
                className="object-cover"
              />
            </motion.div>

            {/* Decorative element */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 border border-brand-accent/30 rounded-full" />
          </div>
        </div>
      </div>
    </section>
  );
}
