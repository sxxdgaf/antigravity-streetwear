import { createClient } from '@/lib/supabase/server';
import { StatsCard } from '@/components/admin/StatsCard';
import { formatPrice, formatRelativeTime } from '@/lib/formatting';
import { Package, ShoppingCart, DollarSign, Users, TrendingUp, Clock } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'Dashboard',
};

async function getDashboardStats() {
  const supabase = await createClient();

  // Get total products count
  const { count: productsCount } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true);

  // Get total orders count
  const { count: ordersCount } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true });

  // Get pending orders count
  const { count: pendingOrdersCount } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending');

  // Get total revenue
  const { data: revenueData } = await supabase
    .from('orders')
    .select('total')
    .in('status', ['confirmed', 'processing', 'shipped', 'delivered']) as { data: { total: number }[] | null };

  const totalRevenue = revenueData?.reduce((sum, order) => sum + order.total, 0) || 0;

  // Get low stock variants count
  const { data: lowStockData } = await supabase
    .from('product_variants')
    .select('stock_quantity, low_stock_threshold')
    .eq('is_active', true) as { data: { stock_quantity: number; low_stock_threshold: number }[] | null };

  const lowStockCount = lowStockData?.filter(
    (v) => v.stock_quantity <= v.low_stock_threshold
  ).length || 0;

  // Get customers count
  const { count: customersCount } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'customer');

  return {
    productsCount: productsCount || 0,
    ordersCount: ordersCount || 0,
    pendingOrdersCount: pendingOrdersCount || 0,
    totalRevenue,
    lowStockCount,
    customersCount: customersCount || 0,
  };
}

interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  total: number;
  status: string;
  created_at: string;
}

async function getRecentOrders(): Promise<Order[]> {
  const supabase = await createClient();

  const { data: orders } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5) as { data: Order[] | null };

  return orders || [];
}

async function getLowStockProducts() {
  const supabase = await createClient();

  const { data: variants } = await supabase
    .from('product_variants')
    .select(`
      *,
      product:products(name, slug)
    `)
    .eq('is_active', true)
    .lte('stock_quantity', 10)
    .order('stock_quantity', { ascending: true })
    .limit(5);

  return variants || [];
}

export default async function AdminDashboardPage() {
  const [stats, recentOrders, lowStockProducts] = await Promise.all([
    getDashboardStats(),
    getRecentOrders(),
    getLowStockProducts(),
  ]);

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-display font-bold text-brand-black">Dashboard</h1>
        <p className="text-brand-grey-500">Welcome back! Here&apos;s what&apos;s happening.</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatsCard
          title="Total Revenue"
          value={formatPrice(stats.totalRevenue)}
          icon={DollarSign}
        />
        <StatsCard
          title="Total Orders"
          value={stats.ordersCount}
          icon={ShoppingCart}
        />
        <StatsCard
          title="Pending Orders"
          value={stats.pendingOrdersCount}
          icon={Clock}
        />
        <StatsCard
          title="Active Products"
          value={stats.productsCount}
          icon={Package}
        />
        <StatsCard
          title="Low Stock Items"
          value={stats.lowStockCount}
          icon={TrendingUp}
        />
        <StatsCard
          title="Customers"
          value={stats.customersCount}
          icon={Users}
        />
      </div>

      {/* Recent orders & Low stock */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white rounded-xl border border-brand-grey-200 overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-brand-grey-200">
            <h2 className="font-medium text-brand-black">Recent Orders</h2>
            <Link
              href="/admin/orders"
              className="text-sm text-brand-grey-500 hover:text-brand-black transition-colors"
            >
              View all →
            </Link>
          </div>
          <div className="divide-y divide-brand-grey-100">
            {recentOrders.length === 0 ? (
              <div className="p-8 text-center text-brand-grey-500">
                No orders yet
              </div>
            ) : (
              recentOrders.map((order) => (
                <Link
                  key={order.id}
                  href={`/admin/orders/${order.id}`}
                  className="flex items-center justify-between p-4 hover:bg-brand-grey-50 transition-colors"
                >
                  <div>
                    <p className="font-medium text-brand-black">{order.order_number}</p>
                    <p className="text-sm text-brand-grey-500">{order.customer_name}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-brand-black">{formatPrice(order.total)}</p>
                    <p className="text-xs text-brand-grey-400">
                      {formatRelativeTime(order.created_at)}
                    </p>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Low Stock Alert */}
        <div className="bg-white rounded-xl border border-brand-grey-200 overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-brand-grey-200">
            <h2 className="font-medium text-brand-black">Low Stock Alert</h2>
            <Link
              href="/admin/inventory"
              className="text-sm text-brand-grey-500 hover:text-brand-black transition-colors"
            >
              Manage inventory →
            </Link>
          </div>
          <div className="divide-y divide-brand-grey-100">
            {lowStockProducts.length === 0 ? (
              <div className="p-8 text-center text-brand-grey-500">
                All products are well stocked
              </div>
            ) : (
              lowStockProducts.map((variant: any) => (
                <Link
                  key={variant.id}
                  href={`/admin/products/${variant.product?.slug}`}
                  className="flex items-center justify-between p-4 hover:bg-brand-grey-50 transition-colors"
                >
                  <div>
                    <p className="font-medium text-brand-black">
                      {variant.product?.name}
                    </p>
                    <p className="text-sm text-brand-grey-500">
                      {variant.size} / {variant.color}
                    </p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        variant.stock_quantity === 0
                          ? 'bg-red-100 text-red-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {variant.stock_quantity} left
                    </span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
