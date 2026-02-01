import { createClient } from '@/lib/supabase/server';
import {
  HeroSection,
  FeaturedProducts,
  CategoriesSection,
  LookbookSection,
  NewArrivals,
  FeaturesSection,
  BannerSection,
} from '@/components/home';

async function getFeaturedProducts() {
  const supabase = await createClient();

  const { data } = await supabase
    .from('products')
    .select(`
      *,
      category:categories(id, name, slug)
    `)
    .eq('is_active', true)
    .eq('is_featured', true)
    .order('created_at', { ascending: false })
    .limit(8);

  return data || [];
}

async function getNewArrivals() {
  const supabase = await createClient();

  const { data } = await supabase
    .from('products')
    .select(`
      *,
      category:categories(id, name, slug)
    `)
    .eq('is_active', true)
    .eq('is_new', true)
    .order('created_at', { ascending: false })
    .limit(4);

  return data || [];
}

async function getCategories() {
  const supabase = await createClient();

  const { data } = await supabase
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true })
    .limit(4);

  return data || [];
}

export default async function HomePage() {
  const [featuredProducts, newArrivals, categories] = await Promise.all([
    getFeaturedProducts(),
    getNewArrivals(),
    getCategories(),
  ]);

  return (
    <>
      <HeroSection />
      <FeaturesSection />
      <FeaturedProducts products={featuredProducts} />
      <CategoriesSection categories={categories} />
      <LookbookSection />
      <BannerSection />
      {newArrivals.length > 0 && <NewArrivals products={newArrivals} />}
    </>
  );
}
