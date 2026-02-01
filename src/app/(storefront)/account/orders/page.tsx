'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { formatPrice } from '@/lib/formatting';
import { 
  Package, 
  ChevronRight, 
  Eye, 
  Truck, 
  CheckCircle, 
  Clock, 
  XCircle,
  Search
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Mock orders data
const mockOrders = [
  {
    id: 'ORD-2024-001',
    date: '2024-01-15',
    status: 'delivered',
    total: 15500,
    items: [
      {
        id: '1',
        name: 'Oversized Gravity Hoodie',
        image: '/images/products/hoodie-1.jpg',
        price: 8500,
        quantity: 1,
        size: 'L',
        color: 'Black',
      },
      {
        id: '2',
        name: 'Minimal Logo Cap',
        image: '/images/products/cap-1.jpg',
        price: 2500,
        quantity: 2,
        color: 'White',
      },
    ],
  },
  {
    id: 'ORD-2024-002',
    date: '2024-01-20',
    status: 'shipped',
    total: 6500,
    trackingNumber: 'TRK123456789',
    items: [
      {
        id: '3',
        name: 'Cargo Street Pants',
        image: '/images/products/pants-1.jpg',
        price: 6500,
        quantity: 1,
        size: 'M',
        color: 'Olive',
      },
    ],
  },
  {
    id: 'ORD-2024-003',
    date: '2024-01-22',
    status: 'processing',
    total: 4500,
    items: [
      {
        id: '4',
        name: 'Essential Tee',
        image: '/images/products/tee-1.jpg',
        price: 4500,
        quantity: 1,
        size: 'M',
        color: 'Black',
      },
    ],
  },
];

const statusConfig = {
  pending: { label: 'Pending', icon: Clock, color: 'text-yellow-600 bg-yellow-50' },
  processing: { label: 'Processing', icon: Clock, color: 'text-blue-600 bg-blue-50' },
  shipped: { label: 'Shipped', icon: Truck, color: 'text-purple-600 bg-purple-50' },
  delivered: { label: 'Delivered', icon: CheckCircle, color: 'text-green-600 bg-green-50' },
  cancelled: { label: 'Cancelled', icon: XCircle, color: 'text-red-600 bg-red-50' },
};

type OrderStatus = keyof typeof statusConfig;

export default function OrdersPage() {
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredOrders = mockOrders.filter(
    (order) =>
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.items.some((item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
  );

  if (mockOrders.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="w-16 h-16 mx-auto text-brand-grey-300 mb-6" />
        <h2 className="text-xl font-semibold text-brand-black mb-2">
          No orders yet
        </h2>
        <p className="text-brand-grey-500 mb-6">
          When you place an order, it will appear here.
        </p>
        <Link href="/shop">
          <Button>Start Shopping</Button>
        </Link>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="mb-8">
        <h1 className="text-2xl font-display font-bold text-brand-black mb-2">
          My Orders
        </h1>
        <p className="text-brand-grey-500">
          View and track your order history
        </p>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-grey-400" />
        <input
          type="text"
          placeholder="Search orders by ID or product name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-3 border border-brand-grey-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-black"
        />
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        <AnimatePresence>
          {filteredOrders.map((order) => {
            const status = statusConfig[order.status as OrderStatus];
            const isExpanded = expandedOrder === order.id;

            return (
              <motion.div
                key={order.id}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="border border-brand-grey-200 rounded-xl overflow-hidden"
              >
                {/* Order Header */}
                <button
                  onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                  className="w-full p-4 flex items-center justify-between text-left hover:bg-brand-grey-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="hidden sm:block">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${status.color}`}
                      >
                        <status.icon className="w-5 h-5" />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-brand-black">
                          {order.id}
                        </span>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${status.color}`}
                        >
                          {status.label}
                        </span>
                      </div>
                      <div className="text-sm text-brand-grey-500 mt-1">
                        {new Date(order.date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                        {' • '}
                        {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-semibold text-brand-black">
                      {formatPrice(order.total)}
                    </span>
                    <ChevronRight
                      className={`w-5 h-5 text-brand-grey-400 transition-transform ${
                        isExpanded ? 'rotate-90' : ''
                      }`}
                    />
                  </div>
                </button>

                {/* Order Details */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="border-t border-brand-grey-200"
                    >
                      <div className="p-4 space-y-4">
                        {/* Order Items */}
                        {order.items.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center gap-4"
                          >
                            <div className="relative w-16 h-16 bg-brand-grey-100 rounded-lg overflow-hidden shrink-0">
                              {item.image ? (
                                <Image
                                  src={item.image}
                                  alt={item.name}
                                  fill
                                  className="object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Package className="w-6 h-6 text-brand-grey-300" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <Link
                                href={`/products/${item.name.toLowerCase().replace(/ /g, '-')}`}
                                className="font-medium text-brand-black hover:underline line-clamp-1"
                              >
                                {item.name}
                              </Link>
                              <div className="text-sm text-brand-grey-500">
                                {item.size && `Size: ${item.size}`}
                                {item.size && item.color && ' • '}
                                {item.color && `Color: ${item.color}`}
                                {' • '}
                                Qty: {item.quantity}
                              </div>
                            </div>
                            <div className="font-semibold text-brand-black">
                              {formatPrice(item.price * item.quantity)}
                            </div>
                          </div>
                        ))}

                        {/* Tracking Info */}
                        {order.trackingNumber && (
                          <div className="bg-brand-grey-50 rounded-lg p-4 mt-4">
                            <div className="text-sm text-brand-grey-500 mb-1">
                              Tracking Number
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="font-mono font-medium text-brand-black">
                                {order.trackingNumber}
                              </span>
                              <Button size="sm" variant="secondary">
                                <Truck className="w-4 h-4 mr-2" />
                                Track Package
                              </Button>
                            </div>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex items-center gap-3 pt-4">
                          <Button size="sm" variant="secondary">
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </Button>
                          {order.status === 'delivered' && (
                            <Button size="sm" variant="secondary">
                              Buy Again
                            </Button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {filteredOrders.length === 0 && (
          <div className="text-center py-12 text-brand-grey-500">
            No orders found matching "{searchQuery}"
          </div>
        )}
      </div>
    </motion.div>
  );
}
