import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { Eye, Package, Truck, CheckCircle, XCircle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatCurrency, formatDate } from '@/lib/formatting';
import type { Order, User } from '@/types';

export const metadata = {
  title: 'Orders | Admin',
};

type OrderWithUser = Order & {
  user: Pick<User, 'email' | 'full_name'> | null;
  order_items: { count: number }[];
};

async function getOrders(status?: string): Promise<OrderWithUser[]> {
  const supabase = await createClient();

  let query = supabase
    .from('orders')
    .select(`
      *,
      user:users(email, full_name),
      order_items:order_items(count)
    `)
    .order('created_at', { ascending: false });

  if (status && status !== 'all') {
    query = query.eq('status', status);
  }

  const { data: orders } = await query.limit(100).returns<OrderWithUser[]>();

  return orders || [];
}

const STATUS_CONFIG = {
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  confirmed: { label: 'Confirmed', color: 'bg-blue-100 text-blue-800', icon: CheckCircle },
  processing: { label: 'Processing', color: 'bg-purple-100 text-purple-800', icon: Package },
  shipped: { label: 'Shipped', color: 'bg-indigo-100 text-indigo-800', icon: Truck },
  delivered: { label: 'Delivered', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-800', icon: XCircle },
  refunded: { label: 'Refunded', color: 'bg-orange-100 text-orange-800', icon: XCircle },
};

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const orders = await getOrders(status);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-display font-bold text-brand-black">Orders</h1>
        <p className="text-brand-grey-500">Manage customer orders</p>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {[
          { value: 'all', label: 'All Orders' },
          { value: 'pending', label: 'Pending' },
          { value: 'processing', label: 'Processing' },
          { value: 'shipped', label: 'Shipped' },
          { value: 'delivered', label: 'Delivered' },
          { value: 'cancelled', label: 'Cancelled' },
        ].map((tab) => (
          <Link
            key={tab.value}
            href={tab.value === 'all' ? '/admin/orders' : `/admin/orders?status=${tab.value}`}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
              (!status && tab.value === 'all') || status === tab.value
                ? 'bg-brand-black text-white'
                : 'bg-brand-grey-100 text-brand-grey-600 hover:bg-brand-grey-200'
            )}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {/* Orders Table */}
      {orders.length > 0 ? (
        <div className="bg-white rounded-xl border border-brand-grey-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-brand-grey-50 border-b border-brand-grey-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium text-brand-grey-500">Order</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-brand-grey-500">Customer</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-brand-grey-500">Date</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-brand-grey-500">Items</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-brand-grey-500">Total</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-brand-grey-500">Status</th>
                  <th className="px-6 py-4 text-right text-sm font-medium text-brand-grey-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-grey-100">
                {orders.map((order) => {
                  const statusConfig = STATUS_CONFIG[order.status as keyof typeof STATUS_CONFIG];
                  const StatusIcon = statusConfig?.icon || Clock;

                  return (
                    <tr key={order.id} className="hover:bg-brand-grey-50">
                      <td className="px-6 py-4">
                        <span className="font-mono text-sm text-brand-black">
                          {order.order_number}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-medium text-brand-black">
                            {order.user?.full_name || order.customer_name || 'Guest'}
                          </p>
                          <p className="text-xs text-brand-grey-500">
                            {order.user?.email || order.customer_email}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-brand-grey-600">
                        {formatDate(order.created_at)}
                      </td>
                      <td className="px-6 py-4 text-sm text-brand-grey-600">
                        {order.order_items?.[0]?.count || 0} items
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-brand-black">
                        {formatCurrency(order.total)}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={cn(
                            'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium',
                            statusConfig?.color
                          )}
                        >
                          <StatusIcon className="w-3 h-3" />
                          {statusConfig?.label || order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-brand-grey-600 hover:text-brand-black hover:bg-brand-grey-100 rounded-lg transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                          View
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-brand-grey-200 p-12 text-center">
          <Package className="w-12 h-12 text-brand-grey-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-brand-black mb-2">No orders found</h3>
          <p className="text-brand-grey-500">
            {status ? `No ${status} orders at the moment.` : 'Orders will appear here once customers start purchasing.'}
          </p>
        </div>
      )}
    </div>
  );
}
