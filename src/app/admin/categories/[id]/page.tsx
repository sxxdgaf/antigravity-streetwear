import { createClient } from '@/lib/supabase/server';
import { CategoryForm } from '@/components/admin/CategoryForm';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { notFound } from 'next/navigation';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: category } = await supabase
    .from('categories')
    .select('name')
    .eq('id', id)
    .single();

  return {
    title: `Edit ${category?.name || 'Category'} | Admin`,
  };
}

async function getCategory(id: string) {
  const supabase = await createClient();
  
  const { data: category } = await supabase
    .from('categories')
    .select('*')
    .eq('id', id)
    .single();

  return category;
}

export default async function EditCategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const category = await getCategory(id);

  if (!category) {
    notFound();
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/categories"
          className="p-2 text-brand-grey-500 hover:text-brand-black rounded-lg hover:bg-brand-grey-100"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-display font-bold text-brand-black">Edit {category.name}</h1>
          <p className="text-brand-grey-500">Update category details</p>
        </div>
      </div>

      {/* Form */}
      <CategoryForm category={category} />
    </div>
  );
}
