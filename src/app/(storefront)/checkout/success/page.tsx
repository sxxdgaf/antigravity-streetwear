'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';
import { useCartStore } from '@/store/cart';
import { formatPrice } from '@/lib/formatting';
import { CheckCircle, Package, Truck, Mail, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('order_id');
  const clearCart = useCartStore((state) => state.clearCart);
  const [orderDetails, setOrderDetails] = useState<{
    orderNumber: string;
    total: number;
    email: string;
  } | null>(null);

  useEffect(() => {
    // Clear cart on successful checkout
    clearCart();

    // Trigger confetti animation
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#0a0a0a', '#c9a962', '#fafafa'],
    });

    // Fetch order details
    if (orderId) {
      // In production, fetch from API
      setOrderDetails({
        orderNumber: `AG-2026-${orderId.slice(0, 8).toUpperCase()}`,
        total: 13500,
        email: 'john.doe@example.com',
      });
    }
  }, [orderId, clearCart]);

  return (
    <Container className="py-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-lg mx-auto text-center"
      >
        {/* Success Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', delay: 0.2 }}
          className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <CheckCircle className="w-10 h-10 text-green-600" />
        </motion.div>

        {/* Heading */}
        <h1 className="text-3xl font-display font-bold text-brand-black mb-4">
          Order Confirmed!
        </h1>
        <p className="text-brand-grey-500 mb-8">
          Thank you for your purchase. Your order has been received and is being processed.
        </p>

        {/* Order Details */}
        {orderDetails && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-brand-grey-50 rounded-xl p-6 mb-8 text-left"
          >
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-brand-grey-500 mb-1">Order Number</div>
                <div className="font-mono font-semibold text-brand-black">
                  {orderDetails.orderNumber}
                </div>
              </div>
              <div>
                <div className="text-sm text-brand-grey-500 mb-1">Total</div>
                <div className="font-semibold text-brand-black">
                  {formatPrice(orderDetails.total)}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* What's Next */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="space-y-4 mb-8"
        >
          <h3 className="font-semibold text-brand-black">What happens next?</h3>
          <div className="space-y-3 text-left">
            <div className="flex items-start gap-3 p-4 bg-white border border-brand-grey-200 rounded-lg">
              <Mail className="w-5 h-5 text-brand-accent mt-0.5" />
              <div>
                <div className="font-medium text-brand-black">Order Confirmation</div>
                <div className="text-sm text-brand-grey-500">
                  We've sent a confirmation email with your order details.
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-white border border-brand-grey-200 rounded-lg">
              <Package className="w-5 h-5 text-brand-accent mt-0.5" />
              <div>
                <div className="font-medium text-brand-black">Order Processing</div>
                <div className="text-sm text-brand-grey-500">
                  Your order is being prepared for shipment.
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-white border border-brand-grey-200 rounded-lg">
              <Truck className="w-5 h-5 text-brand-accent mt-0.5" />
              <div>
                <div className="font-medium text-brand-black">Shipping Updates</div>
                <div className="text-sm text-brand-grey-500">
                  You'll receive tracking information once your order ships.
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/account/orders">
            <Button variant="secondary">View Order Details</Button>
          </Link>
          <Link href="/shop">
            <Button>
              Continue Shopping
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </motion.div>
    </Container>
  );
}
