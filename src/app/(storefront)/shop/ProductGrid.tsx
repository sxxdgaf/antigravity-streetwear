import { createClient } from '@/lib/supabase/server';
import { ProductCard } from '@/components/ui/ProductCard';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProductGridProps {
  searchParams: {
    category?: string;
    sort?: string;
    filter?: string;
    minPrice?: string;
    maxPrice?: string;
    size?: string;
    color?: string;
    page?: string;
  };
}

const ITEMS_PER_PAGE = 12;

export async function ProductGrid({ searchParams }: ProductGridProps) {
  const supabase = await createClient();
  const page = parseInt(searchParams.page || '1');
  const offset = (page - 1) * ITEMS_PER_PAGE;

  // Build query
  let query = supabase
    .from('products')
    .select(`
      *,
      category:categories(id, name, slug),
      variants:product_variants(id, size, color, stock_quantity)
    `, { count: 'exact' })
    .eq('is_active', true);

  // Apply filters
  if (searchParams.category) {
    const { data: cat } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', searchParams.category)
      .single();
    
    if (cat) {
      query = query.eq('category_id', cat.id);
    }
  }

  if (searchParams.filter === 'new') {
    query = query.eq('is_new', true);
  } else if (searchParams.filter === 'featured') {
    query = query.eq('is_featured', true);
  } else if (searchParams.filter === 'sale') {
    query = query.not('compare_at_price', 'is', null);
  }

  if (searchParams.minPrice) {
    query = query.gte('price', parseInt(searchParams.minPrice));
  }

  if (searchParams.maxPrice) {
    query = query.lte('price', parseInt(searchParams.maxPrice));
  }

  // Apply sorting
  switch (searchParams.sort) {
    case 'price-asc':
      query = query.order('price', { ascending: true });
      break;
    case 'price-desc':
      query = query.order('price', { ascending: false });
      break;
    case 'name-asc':
      query = query.order('name', { ascending: true });
      break;
    case 'name-desc':
      query = query.order('name', { ascending: false });
      break;
    default:
      query = query.order('created_at', { ascending: false });
  }

  // Pagination
  query = query.range(offset, offset + ITEMS_PER_PAGE - 1);

  const { data: products, count } = await query;

  // Filter by size/color on client side (variants are a nested array)
  let filteredProducts = products || [];

  if (searchParams.size || searchParams.color) {
    filteredProducts = filteredProducts.filter((product) => {
      const variants = (product as any).variants || [];
      return variants.some((v: any) => {
        const sizeMatch = !searchParams.size || v.size === searchParams.size;
        const colorMatch = !searchParams.color || 
          v.color?.toLowerCase() === searchParams.color.toLowerCase();
        return sizeMatch && colorMatch && v.stock_quantity > 0;
      });
    });
  }

  const totalPages = Math.ceil((count || 0) / ITEMS_PER_PAGE);

  // Build pagination URL helper
  const buildPageUrl = (pageNum: number) => {
    const params = new URLSearchParams();
    Object.entries(searchParams).forEach(([key, value]) => {
      if (value && key !== 'page') params.set(key, value);
    });
    if (pageNum > 1) params.set('page', String(pageNum));
    const queryString = params.toString();
    return `/shop${queryString ? `?${queryString}` : ''}`;
  };

  if (filteredProducts.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-brand-grey-500 mb-4">No products found matching your criteria.</p>
        <Link
          href="/shop"
          className="text-brand-black underline hover:no-underline"
        >
          Clear all filters
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Results count */}
      <p className="text-sm text-brand-grey-500 mb-6">
        Showing {offset + 1}-{Math.min(offset + ITEMS_PER_PAGE, count || 0)} of {count} products
      </p>

      {/* Product Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-8">
        {filteredProducts.map((product, index) => (
          <ProductCard key={product.id} product={product} index={index} />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Link
            href={buildPageUrl(page - 1)}
            className={cn(
              'p-2 rounded-lg border border-brand-grey-200 hover:bg-brand-grey-50 transition-colors',
              page <= 1 && 'pointer-events-none opacity-50'
            )}
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>

          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
            .map((p, i, arr) => {
              // Add ellipsis
              if (i > 0 && p - arr[i - 1] > 1) {
                return (
                  <span key={`ellipsis-${p}`} className="flex items-center">
                    <span className="px-2 text-brand-grey-400">...</span>
                    <Link
                      href={buildPageUrl(p)}
                      className={cn(
                        'w-10 h-10 rounded-lg flex items-center justify-center text-sm font-medium transition-colors',
                        p === page
                          ? 'bg-brand-black text-white'
                          : 'hover:bg-brand-grey-100'
                      )}
                    >
                      {p}
                    </Link>
                  </span>
                );
              }
              return (
                <Link
                  key={p}
                  href={buildPageUrl(p)}
                  className={cn(
                    'w-10 h-10 rounded-lg flex items-center justify-center text-sm font-medium transition-colors',
                    p === page
                      ? 'bg-brand-black text-white'
                      : 'hover:bg-brand-grey-100'
                  )}
                >
                  {p}
                </Link>
              );
            })}

          <Link
            href={buildPageUrl(page + 1)}
            className={cn(
              'p-2 rounded-lg border border-brand-grey-200 hover:bg-brand-grey-50 transition-colors',
              page >= totalPages && 'pointer-events-none opacity-50'
            )}
          >
            <ChevronRight className="w-5 h-5" />
          </Link>
        </div>
      )}
    </div>
  );
}
