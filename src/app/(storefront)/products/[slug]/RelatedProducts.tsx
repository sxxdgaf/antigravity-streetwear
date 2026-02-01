import { createClient } from '@/lib/supabase/server';
import { ProductCard } from '@/components/ui/ProductCard';

interface RelatedProductsProps {
  productId: string;
  categoryId: string | null;
}

export async function RelatedProducts({ productId, categoryId }: RelatedProductsProps) {
  const supabase = await createClient();

  let query = supabase
    .from('products')
    .select(`
      *,
      category:categories(id, name, slug)
    `)
    .eq('is_active', true)
    .neq('id', productId)
    .limit(4);

  // Prefer products from the same category
  if (categoryId) {
    query = query.eq('category_id', categoryId);
  }

  const { data: products } = await query;

  // If not enough products in same category, fetch more
  let relatedProducts = products || [];
  
  if (relatedProducts.length < 4 && categoryId) {
    const { data: moreProducts } = await supabase
      .from('products')
      .select(`
        *,
        category:categories(id, name, slug)
      `)
      .eq('is_active', true)
      .neq('id', productId)
      .neq('category_id', categoryId)
      .limit(4 - relatedProducts.length);

    relatedProducts = [...relatedProducts, ...(moreProducts || [])];
  }

  if (relatedProducts.length === 0) {
    return null;
  }

  return (
    <section>
      <h2 className="text-2xl font-display font-bold text-brand-black mb-8">
        You May Also Like
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {relatedProducts.map((product, index) => (
          <ProductCard key={product.id} product={product} index={index} />
        ))}
      </div>
    </section>
  );
}
