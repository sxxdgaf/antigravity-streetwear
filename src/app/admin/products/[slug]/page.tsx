import { createClient } from '@/lib/supabase/server';
import { ProductForm } from '@/components/admin/ProductForm';
import { VariantManager } from './VariantManager';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { notFound } from 'next/navigation';
import type { ProductWithVariants, Category } from '@/types';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return {
    title: `Edit ${slug}`,
  };
}

async function getProduct(slug: string): Promise<ProductWithVariants | null> {
  const supabase = await createClient();
  
  const { data: product } = await supabase
    .from('products')
    .select(`
      *,
      category:categories(id, name, slug),
      variants:product_variants(*)
    `)
    .eq('slug', slug)
    .single()
    .returns<ProductWithVariants>();

  return product;
}

async function getCategories(): Promise<Category[]> {
  const supabase = await createClient();
  
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true })
    .returns<Category[]>();

  return categories || [];
}

export default async function EditProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [product, categories] = await Promise.all([
    getProduct(slug),
    getCategories(),
  ]);

  if (!product) {
    notFound();
  }

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
          <h1 className="text-2xl font-display font-bold text-brand-black">{product.name}</h1>
          <p className="text-brand-grey-500">Edit product details and variants</p>
        </div>
      </div>

      {/* Product form */}
      <ProductForm product={product} categories={categories} />

      {/* Variants section */}
      <VariantManager productId={product.id} variants={product.variants || []} />
    </div>
  );
}
