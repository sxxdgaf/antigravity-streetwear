import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q') || '';
    const category = searchParams.get('category');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const sizes = searchParams.get('sizes')?.split(',').filter(Boolean);
    const colors = searchParams.get('colors')?.split(',').filter(Boolean);
    const sort = searchParams.get('sort') || 'newest';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const offset = (page - 1) * limit;

    const supabase = await createClient();

    // Build the query
    let dbQuery = supabase
      .from('products')
      .select(`
        *,
        category:categories(id, name, slug),
        variants:product_variants(*)
      `, { count: 'exact' })
      .eq('status', 'active');

    // Full-text search on name and description
    if (query) {
      // Use Postgres full-text search with websearch_to_tsquery for better matching
      dbQuery = dbQuery.or(`name.ilike.%${query}%,description.ilike.%${query}%`);
    }

    // Category filter
    if (category) {
      // First get category ID from slug
      const { data: categoryData } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', category)
        .single();
      
      if (categoryData) {
        dbQuery = dbQuery.eq('category_id', categoryData.id);
      }
    }

    // Price range filter
    if (minPrice) {
      dbQuery = dbQuery.gte('price', parseInt(minPrice));
    }
    if (maxPrice) {
      dbQuery = dbQuery.lte('price', parseInt(maxPrice));
    }

    // Sorting
    switch (sort) {
      case 'price-asc':
        dbQuery = dbQuery.order('price', { ascending: true });
        break;
      case 'price-desc':
        dbQuery = dbQuery.order('price', { ascending: false });
        break;
      case 'name-asc':
        dbQuery = dbQuery.order('name', { ascending: true });
        break;
      case 'name-desc':
        dbQuery = dbQuery.order('name', { ascending: false });
        break;
      case 'oldest':
        dbQuery = dbQuery.order('created_at', { ascending: true });
        break;
      case 'newest':
      default:
        dbQuery = dbQuery.order('created_at', { ascending: false });
        break;
    }

    // Pagination
    dbQuery = dbQuery.range(offset, offset + limit - 1);

    const { data: products, error, count } = await dbQuery;

    if (error) {
      console.error('Search error:', error);
      return NextResponse.json(
        { error: 'Failed to search products' },
        { status: 500 }
      );
    }

    // Filter by sizes and colors (post-query filtering on variants)
    let filteredProducts = products || [];

    if (sizes && sizes.length > 0) {
      filteredProducts = filteredProducts.filter((product) =>
        product.variants?.some((v: any) => sizes.includes(v.size))
      );
    }

    if (colors && colors.length > 0) {
      filteredProducts = filteredProducts.filter((product) =>
        product.variants?.some((v: any) => colors.includes(v.color))
      );
    }

    // Get unique sizes and colors for filter options
    const allVariants = (products || []).flatMap((p) => p.variants || []);
    const availableSizes = [...new Set(allVariants.map((v: any) => v.size).filter(Boolean))];
    const availableColors = [...new Set(allVariants.map((v: any) => v.color).filter(Boolean))];

    // Get price range
    const prices = (products || []).map((p) => p.price);
    const priceRange = {
      min: Math.min(...prices, 0),
      max: Math.max(...prices, 0),
    };

    return NextResponse.json({
      products: filteredProducts,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
      filters: {
        availableSizes,
        availableColors,
        priceRange,
      },
    });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
