import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { Container } from '@/components/ui/Container';
import { ProductCard } from '@/components/ui/ProductCard';
import SortSelect from '@/components/SortSelect';
import Image from 'next/image';
import type { Metadata } from 'next';
import type { Category, Product } from '@/types/database';

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ sort?: string; page?: string }>;
}

async function getCategory(slug: string): Promise<Category | null> {
  const supabase = await createClient();

  const { data } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single();

  return data;
}

async function getCategoryProducts(
  categoryId: string,
  sort?: string,
  page = 1
): Promise<{ products: Product[]; total: number; itemsPerPage: number }> {
  const supabase = await createClient();
  const itemsPerPage = 12;
  const offset = (page - 1) * itemsPerPage;

  let query = supabase
    .from('products')
    .select(`
      *,
      category:categories(id, name, slug)
    `, { count: 'exact' })
    .eq('category_id', categoryId)
    .eq('is_active', true);

  // Apply sorting
  switch (sort) {
    case 'price-asc':
      query = query.order('price', { ascending: true });
      break;
    case 'price-desc':
      query = query.order('price', { ascending: false });
      break;
    case 'name-asc':
      query = query.order('name', { ascending: true });
      break;
    default:
      query = query.order('created_at', { ascending: false });
  }

  query = query.range(offset, offset + itemsPerPage - 1);

  const { data, count } = await query;

  return { products: data || [], total: count || 0, itemsPerPage };
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategory(slug);

  if (!category) {
    return { title: 'Category Not Found' };
  }

  return {
    title: `${category.name} | Shop`,
    description: category.description || `Shop ${category.name} at ANTIGRAVITY`,
  };
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { slug } = await params;
  const { sort, page } = await searchParams;
  const category = await getCategory(slug);

  if (!category) {
    notFound();
  }

  const { products, total, itemsPerPage } = await getCategoryProducts(
    category.id,
    sort,
    parseInt(page || '1')
  );

  const totalPages = Math.ceil(total / itemsPerPage);
  const currentPage = parseInt(page || '1');

  return (
    <div>
      {/* Category Hero */}
      <div className="relative h-64 sm:h-80 bg-brand-grey-100">
        {category.image_url && (
          <Image
            src={category.image_url}
            alt={category.name}
            fill
            className="object-cover"
          />
        )}
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white">
            <h1 className="text-4xl sm:text-5xl font-display font-bold mb-3">
              {category.name}
            </h1>
            {category.description && (
              <p className="text-lg text-white/80 max-w-lg mx-auto px-4">
                {category.description}
              </p>
            )}
          </div>
        </div>
      </div>

      <Container className="py-12">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <p className="text-brand-grey-500">
            {total} {total === 1 ? 'product' : 'products'}
          </p>
          <div className="flex items-center gap-4">
            <label className="text-sm text-brand-grey-500">Sort by:</label>
            <SortSelect slug={slug} current={sort} />
          </div>
        </div>

        {/* Products Grid */}
        {products.length > 0 ? (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-12">
              {products.map((product, index) => (
                <ProductCard key={product.id} product={product} index={index} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <a
                    key={pageNum}
                    href={`/category/${slug}?${sort ? `sort=${sort}&` : ''}page=${pageNum}`}
                    className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-medium transition-colors ${
                      pageNum === currentPage
                        ? 'bg-brand-black text-white'
                        : 'hover:bg-brand-grey-100'
                    }`}
                  >
                    {pageNum}
                  </a>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16">
            <p className="text-brand-grey-500">No products found in this category.</p>
          </div>
        )}
      </Container>
    </div>
  );
}
