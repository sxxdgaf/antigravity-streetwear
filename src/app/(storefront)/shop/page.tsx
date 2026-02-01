import { createClient } from '@/lib/supabase/server';
import { Container } from '@/components/ui/Container';
import { ProductGrid } from './ProductGrid';
import { ShopFilters } from './ShopFilters';
import { Suspense } from 'react';
import { ProductGridSkeleton } from '@/components/ui/Skeleton';

export const metadata = {
  title: 'Shop All Products',
  description: 'Browse our complete collection of premium streetwear. Hoodies, t-shirts, pants, and accessories.',
};

interface ShopPageProps {
  searchParams: Promise<{
    category?: string;
    sort?: string;
    filter?: string;
    minPrice?: string;
    maxPrice?: string;
    size?: string;
    color?: string;
    page?: string;
  }>;
}

async function getCategories() {
  const supabase = await createClient();

  const { data } = await supabase
    .from('categories')
    .select('id, name, slug')
    .eq('is_active', true)
    .order('display_order');

  return data || [];
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const params = await searchParams;
  const categories = await getCategories();

  return (
    <div className="py-8">
      <Container>
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-display font-bold text-brand-black mb-2">
            Shop All
          </h1>
          <p className="text-brand-grey-500">
            Discover our complete collection of premium streetwear
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <aside className="lg:w-64 flex-shrink-0">
            <ShopFilters categories={categories} currentParams={params} />
          </aside>

          {/* Product Grid */}
          <div className="flex-1">
            <Suspense fallback={<ProductGridSkeleton count={12} />}>
              <ProductGrid searchParams={params} />
            </Suspense>
          </div>
        </div>
      </Container>
    </div>
  );
}
