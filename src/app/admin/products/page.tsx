import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import Image from 'next/image';
import { formatPrice } from '@/lib/formatting';
import { Plus, Search, MoreVertical, Edit, Trash2 } from 'lucide-react';
import { DeleteProductButton } from './DeleteProductButton';

export const metadata = {
  title: 'Products',
};

async function getProducts() {
  const supabase = await createClient();

  const { data: products } = await supabase
    .from('products')
    .select(`
      *,
      category:categories(name),
      variants:product_variants(id, size, color, stock_quantity)
    `)
    .order('created_at', { ascending: false });

  return products || [];
}

export default async function AdminProductsPage() {
  const products = await getProducts();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-brand-black">Products</h1>
          <p className="text-brand-grey-500">{products.length} products total</p>
        </div>
        <Link href="/admin/products/new" className="btn-primary">
          <Plus className="w-5 h-5" />
          Add Product
        </Link>
      </div>

      {/* Search & Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-grey-400" />
          <input
            type="text"
            placeholder="Search products..."
            className="input w-full pl-10"
          />
        </div>
      </div>

      {/* Products table */}
      <div className="bg-white rounded-xl border border-brand-grey-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-brand-grey-200 bg-brand-grey-50">
              <th className="px-4 py-3 text-left text-xs font-medium text-brand-grey-500 uppercase tracking-wider">
                Product
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-brand-grey-500 uppercase tracking-wider">
                Category
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-brand-grey-500 uppercase tracking-wider">
                Price
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-brand-grey-500 uppercase tracking-wider">
                Stock
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-brand-grey-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-brand-grey-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-grey-100">
            {products.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-brand-grey-500">
                  No products found. <Link href="/admin/products/new" className="text-brand-black underline">Add your first product</Link>
                </td>
              </tr>
            ) : (
              products.map((product: any) => {
                const totalStock = product.variants?.reduce(
                  (sum: number, v: any) => sum + v.stock_quantity,
                  0
                ) || 0;

                return (
                  <tr key={product.id} className="hover:bg-brand-grey-50">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative w-12 h-12 bg-brand-grey-100 rounded-lg overflow-hidden flex-shrink-0">
                          {product.thumbnail_url ? (
                            <Image
                              src={product.thumbnail_url}
                              alt={product.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-brand-grey-400">
                              <span className="text-xs">No img</span>
                            </div>
                          )}
                        </div>
                        <div>
                          <Link
                            href={`/admin/products/${product.slug}`}
                            className="font-medium text-brand-black hover:underline"
                          >
                            {product.name}
                          </Link>
                          <p className="text-sm text-brand-grey-500">
                            {product.variants?.length || 0} variants
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-brand-grey-600">
                      {product.category?.name || '—'}
                    </td>
                    <td className="px-4 py-4">
                      <span className="font-medium">{formatPrice(product.price)}</span>
                      {product.compare_at_price && (
                        <span className="text-sm text-brand-grey-400 line-through ml-2">
                          {formatPrice(product.compare_at_price)}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          totalStock === 0
                            ? 'bg-red-100 text-red-700'
                            : totalStock < 10
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-green-100 text-green-700'
                        }`}
                      >
                        {totalStock} units
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          product.is_active
                            ? 'bg-green-100 text-green-700'
                            : 'bg-brand-grey-100 text-brand-grey-600'
                        }`}
                      >
                        {product.is_active ? 'Active' : 'Draft'}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/products/${product.slug}`}
                          className="p-2 text-brand-grey-500 hover:text-brand-black rounded-lg hover:bg-brand-grey-100"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <DeleteProductButton productId={product.id} productName={product.name} />
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
