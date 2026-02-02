import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { ArrowLeft, MapPin, CreditCard, Truck, Package } from 'lucide-react';
import { notFound } from 'next/navigation';
import { formatCurrency, formatDate } from '@/lib/formatting';
import { cn } from '@/lib/utils';
import { OrderStatusUpdater } from './OrderStatusUpdater';
import { TrackingInfo } from './TrackingInfo';
import type { OrderWithDetails } from '@/types';
import { parseJsonImages } from '@/types';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: order } = await supabase
    .from('orders')
    .select('order_number')
    .eq('id', id)
    .single();

  return {
    title: `Order ${order?.order_number || id} | Admin`,
  };
}

async function getOrder(id: string): Promise<OrderWithDetails | null> {
  const supabase = await createClient();

  const { data: order } = await supabase
    .from('orders')
    .select(`
      *,
      user:users(id, email, full_name),
      order_items:order_items(
        *,
        product:products(id, name, slug, images),
        variant:product_variants(id, size, color, sku)
      )
    `)
    .eq('id', id)
    .single()
    .returns<OrderWithDetails>();

  return order;
}

const STATUS_STEPS = [
  { key: 'pending', label: 'Pending' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'processing', label: 'Processing' },
  { key: 'shipped', label: 'Shipped' },
  { key: 'delivered', label: 'Delivered' },
];

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await getOrder(id);

  if (!order) {
    notFound();
  }

  const currentStepIndex = STATUS_STEPS.findIndex((s) => s.key === order.status);
  const isCancelled = ['cancelled', 'refunded'].includes(order.status);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/orders"
            className="p-2 text-brand-grey-500 hover:text-brand-black rounded-lg hover:bg-brand-grey-100"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-display font-bold text-brand-black">
              Order {order.order_number}
            </h1>
            <p className="text-brand-grey-500">
              Placed on {formatDate(order.created_at)}
            </p>
          </div>
        </div>
        <OrderStatusUpdater orderId={order.id} currentStatus={order.status} />
      </div>

      {/* Status Progress */}
      {!isCancelled && (
        <div className="bg-white rounded-xl border border-brand-grey-200 p-6">
          <div className="flex items-center justify-between">
            {STATUS_STEPS.map((step, index) => {
              const isCompleted = index <= currentStepIndex;
              const isCurrent = index === currentStepIndex;

              return (
                <div key={step.key} className="flex items-center flex-1">
                  <div className="flex flex-col items-center">
                    <div
                      className={cn(
                        'w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium',
                        isCompleted
                          ? 'bg-green-500 text-white'
                          : 'bg-brand-grey-200 text-brand-grey-500'
                      )}
                    >
                      {index + 1}
                    </div>
                    <span
                      className={cn(
                        'mt-2 text-sm',
                        isCurrent ? 'font-medium text-brand-black' : 'text-brand-grey-500'
                      )}
                    >
                      {step.label}
                    </span>
                  </div>
                  {index < STATUS_STEPS.length - 1 && (
                    <div
                      className={cn(
                        'flex-1 h-1 mx-4',
                        index < currentStepIndex ? 'bg-green-500' : 'bg-brand-grey-200'
                      )}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Cancelled Banner */}
      {isCancelled && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-red-800 font-medium">
            This order has been {order.status}.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Items */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-brand-grey-200">
            <div className="p-4 border-b border-brand-grey-200">
              <h2 className="font-semibold text-brand-black flex items-center gap-2">
                <Package className="w-5 h-5" />
                Order Items
              </h2>
            </div>
            <div className="divide-y divide-brand-grey-100">
              {order.order_items?.map((item) => {
                const productImages = item.product ? parseJsonImages(item.product.images) : [];
                return (
                  <div key={item.id} className="p-4 flex gap-4">
                    <div className="w-20 h-20 bg-brand-grey-100 rounded-lg overflow-hidden flex-shrink-0">
                      {productImages[0] ? (
                        <img
                          src={productImages[0]}
                          alt={item.product?.name || 'Product'}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-brand-grey-400">
                          <Package className="w-8 h-8" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <Link
                        href={`/admin/products/${item.product?.slug}`}
                        className="font-medium text-brand-black hover:underline"
                      >
                        {item.product?.name || 'Product'}
                      </Link>
                      <div className="mt-1 text-sm text-brand-grey-500">
                        {item.variant?.size && <span>Size: {item.variant.size}</span>}
                        {item.variant?.size && item.variant?.color && <span> / </span>}
                        {item.variant?.color && <span>Color: {item.variant.color}</span>}
                      </div>
                      <div className="mt-1 text-xs text-brand-grey-400 font-mono">
                        SKU: {item.variant?.sku}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-brand-black">
                        {formatCurrency(item.unit_price)}
                      </p>
                      <p className="text-sm text-brand-grey-500">Qty: {item.quantity}</p>
                      <p className="text-sm font-medium text-brand-grey-700">
                        {formatCurrency(item.total_price)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
            {/* Order Summary */}
            <div className="p-4 bg-brand-grey-50 border-t border-brand-grey-200">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-brand-grey-500">Subtotal</span>
                  <span className="text-brand-grey-700">{formatCurrency(order.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-brand-grey-500">Shipping</span>
                  <span className="text-brand-grey-700">{formatCurrency(order.shipping_cost)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-brand-grey-500">Tax</span>
                  <span className="text-brand-grey-700">{formatCurrency(order.tax_amount)}</span>
                </div>
                {order.discount_amount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-brand-grey-500">Discount</span>
                    <span className="text-green-600">-{formatCurrency(order.discount_amount)}</span>
                  </div>
                )}
                <div className="flex justify-between pt-2 border-t border-brand-grey-200">
                  <span className="font-medium text-brand-black">Total</span>
                  <span className="font-bold text-brand-black">{formatCurrency(order.total)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Tracking Information */}
          <TrackingInfo
            orderId={order.id}
            trackingNumber={order.tracking_number}
            carrier={order.carrier}
          />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer Info */}
          <div className="bg-white rounded-xl border border-brand-grey-200">
            <div className="p-4 border-b border-brand-grey-200">
              <h2 className="font-semibold text-brand-black">Customer</h2>
            </div>
            <div className="p-4">
              <p className="font-medium text-brand-black">
                {order.user?.full_name || order.customer_name || 'Guest'}
              </p>
              <p className="text-sm text-brand-grey-500">
                {order.user?.email || order.customer_email}
              </p>
              {order.user?.id && (
                <Link
                  href={`/admin/customers/${order.user.id}`}
                  className="text-sm text-brand-accent hover:underline mt-2 inline-block"
                >
                  View customer profile
                </Link>
              )}
            </div>
          </div>

          {/* Shipping Address */}
          <div className="bg-white rounded-xl border border-brand-grey-200">
            <div className="p-4 border-b border-brand-grey-200">
              <h2 className="font-semibold text-brand-black flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Shipping Address
              </h2>
            </div>
            <div className="p-4 text-sm text-brand-grey-700">
              <p className="font-medium">{order.customer_name}</p>
              <p>{order.shipping_address_line1}</p>
              {order.shipping_address_line2 && (
                <p>{order.shipping_address_line2}</p>
              )}
              <p>
                {order.shipping_city}{order.shipping_state ? `, ${order.shipping_state}` : ''}{' '}
                {order.shipping_postal_code || ''}
              </p>
              <p>{order.shipping_country}</p>
              {order.customer_phone && (
                <p className="mt-2">{order.customer_phone}</p>
              )}
            </div>
          </div>

          {/* Payment Info */}
          <div className="bg-white rounded-xl border border-brand-grey-200">
            <div className="p-4 border-b border-brand-grey-200">
              <h2 className="font-semibold text-brand-black flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                Payment
              </h2>
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-brand-grey-500">Status</span>
                <span
                  className={cn(
                    'px-2 py-0.5 text-xs font-medium rounded-full',
                    order.payment_status === 'paid'
                      ? 'bg-green-100 text-green-800'
                      : order.payment_status === 'refunded'
                      ? 'bg-orange-100 text-orange-800'
                      : 'bg-yellow-100 text-yellow-800'
                  )}
                >
                  {order.payment_status}
                </span>
              </div>
              {order.payment_method && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-brand-grey-500">Method</span>
                  <span className="text-sm text-brand-grey-700 capitalize">
                    {order.payment_method.replace('_', ' ')}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Timestamps */}
          <div className="bg-white rounded-xl border border-brand-grey-200">
            <div className="p-4 border-b border-brand-grey-200">
              <h2 className="font-semibold text-brand-black">Timeline</h2>
            </div>
            <div className="p-4 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-brand-grey-500">Created</span>
                <span className="text-brand-grey-700">{formatDate(order.created_at)}</span>
              </div>
              {order.shipped_at && (
                <div className="flex justify-between">
                  <span className="text-brand-grey-500">Shipped</span>
                  <span className="text-brand-grey-700">{formatDate(order.shipped_at)}</span>
                </div>
              )}
              {order.delivered_at && (
                <div className="flex justify-between">
                  <span className="text-brand-grey-500">Delivered</span>
                  <span className="text-brand-grey-700">{formatDate(order.delivered_at)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
