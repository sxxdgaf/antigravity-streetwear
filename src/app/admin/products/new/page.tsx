import { createClient } from '@/lib/supabase/server';
import { ProductForm } from '@/components/admin/ProductForm';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata = {
  title: 'New Product',
};

async function getCategories() {
  const supabase = await createClient();
  
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true });

  return categories || [];
}

export default async function NewProductPage() {
  const categories = await getCategories();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/products"
          className="p-2 text-brand-grey-500 hover:text-brand-black rounded-lg hover:bg-brand-grey-100"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-display font-bold text-brand-black">New Product</h1>
          <p className="text-brand-grey-500">Add a new product to your catalog</p>
        </div>
      </div>

      {/* Form */}
      <ProductForm categories={categories} />
    </div>
  );
}
