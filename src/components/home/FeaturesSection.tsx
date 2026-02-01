'use client';

import { motion } from 'framer-motion';
import { Container } from '@/components/ui/Container';
import { Truck, RefreshCw, Shield, Headphones } from 'lucide-react';

const features = [
  {
    icon: Truck,
    title: 'Free Shipping',
    description: 'On orders over PKR 10,000',
  },
  {
    icon: RefreshCw,
    title: 'Easy Returns',
    description: '14-day hassle-free returns',
  },
  {
    icon: Shield,
    title: 'Secure Payment',
    description: 'Your data is protected',
  },
  {
    icon: Headphones,
    title: '24/7 Support',
    description: 'Always here to help',
  },
];

export function FeaturesSection() {
  return (
    <section className="py-16 bg-brand-grey-50 border-y border-brand-grey-200">
      <Container>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="text-center"
            >
              <div className="w-14 h-14 mx-auto mb-4 bg-brand-black rounded-full flex items-center justify-center">
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-brand-black mb-1">{feature.title}</h3>
              <p className="text-sm text-brand-grey-500">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  );
}
