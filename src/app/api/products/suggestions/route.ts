import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q') || '';

    if (!query || query.length < 2) {
      return NextResponse.json({ suggestions: [] });
    }

    const supabase = await createClient();

    // Get product suggestions
    const { data: products } = await supabase
      .from('products')
      .select('id, name, slug, price, images')
      .eq('status', 'active')
      .ilike('name', `%${query}%`)
      .limit(5);

    // Get category suggestions
    const { data: categories } = await supabase
      .from('categories')
      .select('id, name, slug')
      .ilike('name', `%${query}%`)
      .limit(3);

    // Format suggestions
    const productSuggestions = (products || []).map((p) => ({
      type: 'product' as const,
      id: p.id,
      name: p.name,
      slug: p.slug,
      price: p.price,
      image: p.images?.[0] || null,
      url: `/products/${p.slug}`,
    }));

    const categorySuggestions = (categories || []).map((c) => ({
      type: 'category' as const,
      id: c.id,
      name: c.name,
      slug: c.slug,
      url: `/category/${c.slug}`,
    }));

    // Popular search terms (could be from analytics)
    const popularSearches = [
      'hoodie',
      'oversized',
      'cargo pants',
      'streetwear',
      'black',
    ].filter((term) => term.toLowerCase().includes(query.toLowerCase()));

    return NextResponse.json({
      suggestions: {
        products: productSuggestions,
        categories: categorySuggestions,
        popular: popularSearches.slice(0, 3),
      },
    });
  } catch (error) {
    console.error('Suggestions error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
