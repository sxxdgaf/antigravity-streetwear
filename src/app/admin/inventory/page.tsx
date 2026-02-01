import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { Package, AlertTriangle, TrendingUp, Archive } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/formatting';
import { StockUpdateButton } from './StockUpdateButton';

export const metadata = {
  title: 'Inventory | Admin',
};

async function getInventory(filter?: string) {
  const supabase = await createClient();

  let query = supabase
    .from('product_variants')
    .select(`
      *,
      product:products(id, name, slug, images, price, is_active)
    `)
    .order('stock_quantity', { ascending: true });

  const { data: variants } = await query;

  if (!variants) return [];

  // Apply filters
  let filtered = variants;
  if (filter === 'out-of-stock') {
    filtered = variants.filter((v) => v.stock_quantity === 0);
  } else if (filter === 'low-stock') {
    filtered = variants.filter((v) => v.stock_quantity > 0 && v.stock_quantity <= 10);
  } else if (filter === 'in-stock') {
    filtered = variants.filter((v) => v.stock_quantity > 10);
  }

  return filtered;
}

async function getStats() {
  const supabase = await createClient();

  const { data: variants } = await supabase
    .from('product_variants')
    .select('stock_quantity');

  if (!variants) return { total: 0, outOfStock: 0, lowStock: 0, inStock: 0, totalUnits: 0 };

  return {
    total: variants.length,
    outOfStock: variants.filter((v) => v.stock_quantity === 0).length,
    lowStock: variants.filter((v) => v.stock_quantity > 0 && v.stock_quantity <= 10).length,
    inStock: variants.filter((v) => v.stock_quantity > 10).length,
    totalUnits: variants.reduce((sum, v) => sum + v.stock_quantity, 0),
  };
}

export default async function InventoryPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const { filter } = await searchParams;
  const [inventory, stats] = await Promise.all([getInventory(filter), getStats()]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-display font-bold text-brand-black">Inventory</h1>
        <p className="text-brand-grey-500">Manage stock levels across all products</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl border border-brand-grey-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-brand-grey-100 rounded-lg">
              <Package className="w-5 h-5 text-brand-grey-600" />
            </div>
            <div>
              <p className="text-sm text-brand-grey-500">Total Variants</p>
              <p className="text-xl font-bold text-brand-black">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-brand-grey-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Archive className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-brand-grey-500">Total Units</p>
              <p className="text-xl font-bold text-brand-black">{stats.totalUnits.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-brand-grey-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-brand-grey-500">In Stock</p>
              <p className="text-xl font-bold text-green-600">{stats.inStock}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-brand-grey-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-brand-grey-500">Low Stock</p>
              <p className="text-xl font-bold text-yellow-600">{stats.lowStock}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-brand-grey-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <Package className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-brand-grey-500">Out of Stock</p>
              <p className="text-xl font-bold text-red-600">{stats.outOfStock}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {[
          { value: undefined, label: 'All Inventory' },
          { value: 'out-of-stock', label: 'Out of Stock' },
          { value: 'low-stock', label: 'Low Stock' },
          { value: 'in-stock', label: 'In Stock' },
        ].map((tab) => (
          <Link
            key={tab.value || 'all'}
            href={tab.value ? `/admin/inventory?filter=${tab.value}` : '/admin/inventory'}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
              filter === tab.value || (!filter && !tab.value)
                ? 'bg-brand-black text-white'
                : 'bg-brand-grey-100 text-brand-grey-600 hover:bg-brand-grey-200'
            )}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {/* Inventory Table */}
      {inventory.length > 0 ? (
        <div className="bg-white rounded-xl border border-brand-grey-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-brand-grey-50 border-b border-brand-grey-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium text-brand-grey-500">Product</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-brand-grey-500">SKU</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-brand-grey-500">Variant</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-brand-grey-500">Price</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-brand-grey-500">Stock</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-brand-grey-500">Status</th>
                  <th className="px-6 py-4 text-right text-sm font-medium text-brand-grey-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-grey-100">
                {inventory.map((variant) => {
                  const product = (variant as any).product;
                  const isOutOfStock = variant.stock_quantity === 0;
                  const isLowStock = variant.stock_quantity > 0 && variant.stock_quantity <= 10;

                  return (
                    <tr key={variant.id} className={cn('hover:bg-brand-grey-50', !product?.is_active && 'opacity-60')}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-brand-grey-100 rounded-lg overflow-hidden flex-shrink-0">
                            {product?.images?.[0] ? (
                              <img
                                src={product.images[0]}
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-brand-grey-400">
                                <Package className="w-6 h-6" />
                              </div>
                            )}
                          </div>
                          <div>
                            <Link
                              href={`/admin/products/${product?.slug}`}
                              className="font-medium text-brand-black hover:underline"
                            >
                              {product?.name || 'Unknown Product'}
                            </Link>
                            {!product?.is_active && (
                              <span className="ml-2 text-xs text-brand-grey-400">(Inactive)</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-mono text-sm text-brand-grey-600">{variant.sku}</span>
                      </td>
                      <td className="px-6 py-4 text-sm text-brand-grey-600">
                        {variant.size && variant.color
                          ? `${variant.size} / ${variant.color}`
                          : variant.size || variant.color || '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-brand-grey-600">
                        {formatCurrency((product?.price || 0) + variant.price_modifier)}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={cn(
                            'inline-flex items-center px-2.5 py-1 rounded-full text-sm font-medium',
                            isOutOfStock
                              ? 'bg-red-100 text-red-800'
                              : isLowStock
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-green-100 text-green-800'
                          )}
                        >
                          {variant.stock_quantity}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={cn(
                            'text-xs font-medium',
                            isOutOfStock
                              ? 'text-red-600'
                              : isLowStock
                              ? 'text-yellow-600'
                              : 'text-green-600'
                          )}
                        >
                          {isOutOfStock ? 'Out of Stock' : isLowStock ? 'Low Stock' : 'In Stock'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <StockUpdateButton
                          variantId={variant.id}
                          currentStock={variant.stock_quantity}
                          productName={product?.name || 'Product'}
                          variantInfo={
                            variant.size && variant.color
                              ? `${variant.size} / ${variant.color}`
                              : variant.size || variant.color || ''
                          }
                        />
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
          <h3 className="text-lg font-semibold text-brand-black mb-2">No inventory items found</h3>
          <p className="text-brand-grey-500">
            {filter ? `No items match the "${filter}" filter.` : 'Add products with variants to manage inventory.'}
          </p>
        </div>
      )}
    </div>
  );
}
