import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { Plus, Edit2 } from 'lucide-react';
import { DeleteCategoryButton } from './DeleteCategoryButton';
import { cn } from '@/lib/utils';

export const metadata = {
  title: 'Categories | Admin',
};

async function getCategories() {
  const supabase = await createClient();

  const { data: categories } = await supabase
    .from('categories')
    .select(`
      *,
      products:products(count)
    `)
    .order('display_order', { ascending: true });

  return categories || [];
}

export default async function CategoriesPage() {
  const categories = await getCategories();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-brand-black">Categories</h1>
          <p className="text-brand-grey-500">Manage product categories</p>
        </div>
        <Link
          href="/admin/categories/new"
          className="flex items-center gap-2 px-4 py-2 bg-brand-black text-white rounded-lg hover:bg-brand-grey-800 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Category
        </Link>
      </div>

      {/* Categories Grid */}
      {categories.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <div
              key={category.id}
              className="bg-white rounded-xl border border-brand-grey-200 overflow-hidden hover:shadow-lg transition-shadow"
            >
              {/* Category Image */}
              <div className="aspect-[16/9] bg-brand-grey-100 relative">
                {category.image_url ? (
                  <img
                    src={category.image_url}
                    alt={category.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-brand-grey-400">
                    <span className="text-4xl font-display">{category.name.charAt(0)}</span>
                  </div>
                )}
                {/* Status Badge */}
                <span
                  className={cn(
                    'absolute top-3 right-3 px-2.5 py-1 text-xs font-medium rounded-full',
                    category.is_active
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  )}
                >
                  {category.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>

              {/* Category Info */}
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-brand-black">{category.name}</h3>
                    <p className="text-sm text-brand-grey-500 mt-1 line-clamp-2">
                      {category.description || 'No description'}
                    </p>
                  </div>
                  <span className="text-xs text-brand-grey-400 bg-brand-grey-100 px-2 py-1 rounded">
                    #{category.display_order}
                  </span>
                </div>

                <div className="mt-4 pt-4 border-t border-brand-grey-100 flex items-center justify-between">
                  <span className="text-sm text-brand-grey-500">
                    {(category as any).products?.[0]?.count || 0} products
                  </span>
                  <div className="flex items-center gap-1">
                    <Link
                      href={`/admin/categories/${category.id}`}
                      className="p-2 text-brand-grey-500 hover:text-brand-black hover:bg-brand-grey-100 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Link>
                    <DeleteCategoryButton
                      categoryId={category.id}
                      categoryName={category.name}
                      hasProducts={(category as any).products?.[0]?.count > 0}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-brand-grey-200 p-12 text-center">
          <h3 className="text-lg font-semibold text-brand-black mb-2">No categories yet</h3>
          <p className="text-brand-grey-500 mb-6">
            Create your first category to organize your products.
          </p>
          <Link
            href="/admin/categories/new"
            className="inline-flex items-center gap-2 px-6 py-3 bg-brand-black text-white rounded-lg hover:bg-brand-grey-800 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Category
          </Link>
        </div>
      )}
    </div>
  );
}
