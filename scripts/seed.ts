/**
 * Database Seed Script
 * Run with: npm run db:seed
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
  console.log('🌱 Starting database seed...\n');

  try {
    // 1. Check if data already exists
    const { data: existingCategories } = await supabase
      .from('categories')
      .select('id')
      .limit(1);

    if (existingCategories && existingCategories.length > 0) {
      console.log('⚠️  Database already has data. Skipping seed.\n');
      console.log('💡 To re-seed, delete existing data in Supabase first.\n');
      process.exit(0);
    }

    // 2. Create Categories
    console.log('📁 Creating categories...');
    const { data: categories, error: catError } = await supabase
      .from('categories')
      .insert([
        {
          name: 'T-Shirts',
          slug: 't-shirts',
          description: 'Premium cotton tees with minimal design',
          display_order: 1,
          is_active: true,
        },
        {
          name: 'Hoodies',
          slug: 'hoodies',
          description: 'Oversized comfort meets street style',
          display_order: 2,
          is_active: true,
        },
        {
          name: 'Jackets',
          slug: 'jackets',
          description: 'Statement outerwear for all seasons',
          display_order: 3,
          is_active: true,
        },
        {
          name: 'Accessories',
          slug: 'accessories',
          description: 'Complete your look',
          display_order: 4,
          is_active: true,
        },
      ])
      .select();

    if (catError) throw catError;
    console.log(`✅ Created ${categories.length} categories\n`);

    // 2. Create Products
    console.log('🛍️  Creating products...');
    const products = [
      {
        name: 'Essential Black Tee',
        slug: 'essential-black-tee',
        description: 'Pure minimalism. 100% organic cotton, heavyweight fabric. The foundation of any wardrobe.',
        short_description: 'Premium heavyweight cotton tee in classic black',
        price: 45.00,
        category_id: categories.find(c => c.slug === 't-shirts')?.id,
        is_active: true,
        is_featured: true,
        is_new: true,
        tags: ['basics', 'cotton', 'unisex'],
        published_at: new Date().toISOString(),
      },
      {
        name: 'Oversized White Hoodie',
        slug: 'oversized-white-hoodie',
        description: 'Comfort redefined. Dropped shoulders, extended length. Premium fleece interior.',
        short_description: 'Luxury oversized hoodie in pristine white',
        price: 95.00,
        compare_at_price: 120.00,
        category_id: categories.find(c => c.slug === 'hoodies')?.id,
        is_active: true,
        is_featured: true,
        is_new: false,
        is_bestseller: false,
        tags: ['oversized', 'comfort', 'premium'],
        published_at: new Date().toISOString(),
      },
      {
        name: 'Storm Grey Bomber',
        slug: 'storm-grey-bomber',
        description: 'Modern classic. Water-resistant shell, quilted lining. Timeless silhouette.',
        short_description: 'Premium bomber jacket in storm grey',
        price: 185.00,
        category_id: categories.find(c => c.slug === 'jackets')?.id,
        is_active: true,
        is_featured: true,
        is_new: false,
        is_bestseller: false,
        tags: ['outerwear', 'water-resistant', 'premium'],
        published_at: new Date().toISOString(),
      },
      {
        name: 'Minimal Logo Tee',
        slug: 'minimal-logo-tee',
        description: 'Subtle branding. Organic cotton, relaxed fit. Available in three colors.',
        short_description: 'Clean logo tee in premium cotton',
        price: 48.00,
        category_id: categories.find(c => c.slug === 't-shirts')?.id,
        is_active: true,
        is_featured: false,
        is_new: true,
        is_bestseller: false,
        tags: ['logo', 'basics', 'organic'],
        published_at: new Date().toISOString(),
      },
      {
        name: 'Archive Zip Hoodie',
        slug: 'archive-zip-hoodie',
        description: 'From the vault. Full zip, embroidered details. Limited quantities.',
        short_description: 'Classic zip hoodie with archive branding',
        price: 110.00,
        category_id: categories.find(c => c.slug === 'hoodies')?.id,
        is_active: true,
        is_featured: false,
        is_new: false,
        is_bestseller: false,
        tags: ['archive', 'zip', 'embroidered'],
        published_at: new Date().toISOString(),
      },
      {
        name: 'Canvas Tote',
        slug: 'canvas-tote',
        description: 'Everyday carry. Heavy-duty canvas, reinforced handles. ANTIGRAVITY branding.',
        short_description: 'Durable canvas tote bag',
        price: 35.00,
        category_id: categories.find(c => c.slug === 'accessories')?.id,
        is_active: true,
        is_featured: true,
        tags: ['bag', 'canvas', 'everyday'],
        published_at: new Date().toISOString(),
      },
    ];

    const { data: createdProducts, error: prodError } = await supabase
      .from('products')
      .insert(products)
      .select();

    if (prodError) throw prodError;
    console.log(`✅ Created ${createdProducts.length} products\n`);

    // 3. Create Product Variants
    console.log('📦 Creating product variants...');
    const variants = [];

    for (const product of createdProducts) {
      const sizes = ['XS', 'S', 'M', 'L', 'XL'];
      const colors = ['Black', 'White', 'Grey'];

      for (const size of sizes) {
        for (const color of colors) {
          variants.push({
            product_id: product.id,
            size,
            color,
            stock_quantity: Math.floor(Math.random() * 50) + 10,
            sku: `${product.slug.toUpperCase()}-${size}-${color.substring(0, 3).toUpperCase()}`,
          });
        }
      }
    }

    const { data: createdVariants, error: varError } = await supabase
      .from('product_variants')
      .insert(variants)
      .select();

    if (varError) throw varError;
    console.log(`✅ Created ${createdVariants.length} product variants\n`);

    console.log('✨ Seed completed successfully!\n');
    console.log('📊 Summary:');
    console.log(`   - Categories: ${categories.length}`);
    console.log(`   - Products: ${createdProducts.length}`);
    console.log(`   - Variants: ${createdVariants.length}`);
    console.log('\n🚀 Your store is ready! Visit http://localhost:3000\n');

  } catch (error: any) {
    console.error('❌ Seed failed:', error.message);
    process.exit(1);
  }
}

seed();
