import { createClient } from '@/lib/supabase/server';
import { ProductForm } from '@/components/admin/ProductForm';
import { VariantManager } from './VariantManager';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { notFound } from 'next/navigation';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return {
    title: `Edit ${slug}`,
  };
}

interface ProductWithVariants {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  short_description: string | null;
  price: number;
  compare_at_price: number | null;
  cost_price: number | null;
  category_id: string | null;
  thumbnail_url: string | null;
  images: string[];
  is_active: boolean;
  is_featured: boolean;
  is_new: boolean;
  is_bestseller: boolean;
  tags: string[];
  published_at: string | null;
  created_at: string;
  updated_at: string;
  sku: string | null;
  barcode: string | null;
  weight: number | null;
  dimensions: string | null;
  meta_title: string | null;
  meta_description: string | null;
  og_image: string | null;
  variants: any[];
}

async function getProduct(slug: string): Promise<ProductWithVariants | null> {
  const supabase = await createClient();
  
  const { data: product } = await (supabase
    .from('products')
    .select(`
      *,
      variants:product_variants(*)
    `)
    .eq('slug', slug)
    .single() as any) as { data: ProductWithVariants | null };

  return product;
}

async function getCategories() {
  const supabase = await createClient();
  
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true });

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
