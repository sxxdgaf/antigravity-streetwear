import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { Container } from '@/components/ui/Container';
import { ImageGallery } from '@/components/ui/ImageGallery';
import { ProductInfo } from './ProductInfo';
import { RelatedProducts } from './RelatedProducts';
import { Suspense } from 'react';
import { ProductGridSkeleton } from '@/components/ui/Skeleton';
import type { Metadata } from 'next';
import type { ProductWithVariants } from '@/types';

interface ProductPageProps {
  params: Promise<{ slug: string }>;
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
    .eq('is_active', true)
    .single();

  return product;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    return {
      title: 'Product Not Found',
    };
  }

  return {
    title: product.name,
    description: product.description || `Shop ${product.name} at ANTIGRAVITY`,
    openGraph: {
      title: product.name,
      description: product.description || `Shop ${product.name} at ANTIGRAVITY`,
      images: product.images?.[0] ? [{ url: product.images[0] }] : [],
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    notFound();
  }

  return (
    <div className="py-8">
      <Container>
        {/* Breadcrumb */}
        <nav className="mb-8 text-sm">
          <ol className="flex items-center gap-2 text-brand-grey-500">
            <li>
              <a href="/" className="hover:text-brand-black">Home</a>
            </li>
            <li>/</li>
            <li>
              <a href="/shop" className="hover:text-brand-black">Shop</a>
            </li>
            {product.category && (
              <>
                <li>/</li>
                <li>
                  <a
                    href={`/category/${product.category.slug}`}
                    className="hover:text-brand-black"
                  >
                    {product.category.name}
                  </a>
                </li>
              </>
            )}
            <li>/</li>
            <li className="text-brand-black">{product.name}</li>
          </ol>
        </nav>

        {/* Product Section */}
        <div className="grid lg:grid-cols-2 gap-12 mb-20">
          {/* Image Gallery */}
          <div>
            <ImageGallery images={product.images || []} productName={product.name} />
          </div>

          {/* Product Info */}
          <div>
            <ProductInfo product={product} variants={product.variants || []} />
          </div>
        </div>

        {/* Product Details */}
        {(product.description || product.details) && (
          <div className="mb-20">
            <h2 className="text-2xl font-display font-bold text-brand-black mb-6">
              Product Details
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              {product.description && (
                <div>
                  <h3 className="font-semibold text-brand-black mb-3">Description</h3>
                  <p className="text-brand-grey-600 leading-relaxed">
                    {product.description}
                  </p>
                </div>
              )}
              {product.details && (
                <div>
                  <h3 className="font-semibold text-brand-black mb-3">Details & Care</h3>
                  <ul className="space-y-2 text-brand-grey-600">
                    {(product.details as string[]).map((detail, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 bg-brand-accent rounded-full mt-2 flex-shrink-0" />
                        {detail}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Related Products */}
        <Suspense fallback={<ProductGridSkeleton count={4} />}>
          <RelatedProducts
            productId={product.id}
            categoryId={product.category_id}
          />
        </Suspense>
      </Container>
    </div>
  );
}
