'use server';

/**
 * Product Server Actions
 */

import { createClient, createAdminClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { isAdmin } from './auth';
import { z } from 'zod';
import { slugify } from '@/lib/formatting';

// Validation schema
const productSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  description: z.string().optional(),
  shortDescription: z.string().optional(),
  price: z.coerce.number().min(0),
  compareAtPrice: z.coerce.number().optional().nullable(),
  categoryId: z.string().uuid().optional().nullable(),
  isActive: z.coerce.boolean().default(true),
  isFeatured: z.coerce.boolean().default(false),
  isNew: z.coerce.boolean().default(false),
  isBestseller: z.coerce.boolean().default(false),
  tags: z.string().optional(),
  images: z.string().optional(), // JSON array of URLs
});

const variantSchema = z.object({
  size: z.string().min(1),
  color: z.string().min(1),
  colorHex: z.string().optional(),
  stockQuantity: z.coerce.number().int().min(0),
  sku: z.string().optional(),
});

export type ProductActionState = {
  error?: string;
  success?: boolean;
  message?: string;
  productId?: string;
};

/**
 * Create a new product
 */
export async function createProduct(
  prevState: ProductActionState | null,
  formData: FormData
): Promise<ProductActionState> {
  // Check admin access
  const hasAccess = await isAdmin();
  if (!hasAccess) {
    return { error: 'Unauthorized' };
  }

  // Validate input
  const validatedFields = productSchema.safeParse({
    name: formData.get('name'),
    slug: formData.get('slug') || slugify(formData.get('name')?.toString() || ''),
    description: formData.get('description'),
    shortDescription: formData.get('shortDescription'),
    price: formData.get('price'),
    compareAtPrice: formData.get('compareAtPrice') || null,
    categoryId: formData.get('categoryId') || null,
    isActive: formData.get('isActive') === 'true',
    isFeatured: formData.get('isFeatured') === 'true',
    isNew: formData.get('isNew') === 'true',
    isBestseller: formData.get('isBestseller') === 'true',
    tags: formData.get('tags'),
    images: formData.get('images'),
  });

  if (!validatedFields.success) {
    return {
      error: validatedFields.error.errors[0]?.message || 'Invalid input',
    };
  }

  const data = validatedFields.data;
  const supabase = createAdminClient();

  // Parse images JSON
  let images: string[] = [];
  if (data.images) {
    try {
      images = JSON.parse(data.images);
    } catch {
      images = [];
    }
  }

  // Parse tags
  const tags = data.tags
    ? data.tags.split(',').map((t) => t.trim()).filter(Boolean)
    : [];

  // Insert product
  const { data: product, error } = await (supabase
    .from('products') as any)
    .insert({
      name: data.name,
      slug: data.slug,
      description: data.description || null,
      short_description: data.shortDescription || null,
      price: data.price,
      compare_at_price: data.compareAtPrice || null,
      category_id: data.categoryId || null,
      thumbnail_url: images[0] || null,
      images: images,
      is_active: data.isActive,
      is_featured: data.isFeatured,
      is_new: data.isNew,
      is_bestseller: data.isBestseller,
      tags,
      published_at: data.isActive ? new Date().toISOString() : null,
    })
    .select()
    .single();

  if (error) {
    console.error('Create product error:', error);
    if (error.code === '23505') {
      return { error: 'A product with this slug already exists' };
    }
    return { error: 'Failed to create product' };
  }

  revalidatePath('/admin/products');
  revalidatePath('/shop');

  return {
    success: true,
    message: 'Product created successfully',
    productId: product.id,
  };
}

/**
 * Update a product
 */
export async function updateProduct(
  productId: string,
  prevState: ProductActionState | null,
  formData: FormData
): Promise<ProductActionState> {
  const hasAccess = await isAdmin();
  if (!hasAccess) {
    return { error: 'Unauthorized' };
  }

  const validatedFields = productSchema.safeParse({
    name: formData.get('name'),
    slug: formData.get('slug'),
    description: formData.get('description'),
    shortDescription: formData.get('shortDescription'),
    price: formData.get('price'),
    compareAtPrice: formData.get('compareAtPrice') || null,
    categoryId: formData.get('categoryId') || null,
    isActive: formData.get('isActive') === 'true',
    isFeatured: formData.get('isFeatured') === 'true',
    isNew: formData.get('isNew') === 'true',
    isBestseller: formData.get('isBestseller') === 'true',
    tags: formData.get('tags'),
    images: formData.get('images'),
  });

  if (!validatedFields.success) {
    return {
      error: validatedFields.error.errors[0]?.message || 'Invalid input',
    };
  }

  const data = validatedFields.data;
  const supabase = createAdminClient();

  let images: string[] = [];
  if (data.images) {
    try {
      images = JSON.parse(data.images);
    } catch {
      images = [];
    }
  }

  const tags = data.tags
    ? data.tags.split(',').map((t) => t.trim()).filter(Boolean)
    : [];

  const { error } = await (supabase
    .from('products') as any)
    .update({
      name: data.name,
      slug: data.slug,
      description: data.description || null,
      short_description: data.shortDescription || null,
      price: data.price,
      compare_at_price: data.compareAtPrice || null,
      category_id: data.categoryId || null,
      thumbnail_url: images[0] || null,
      images,
      is_active: data.isActive,
      is_featured: data.isFeatured,
      is_new: data.isNew,
      is_bestseller: data.isBestseller,
      tags,
    })
    .eq('id', productId);

  if (error) {
    console.error('Update product error:', error);
    if (error.code === '23505') {
      return { error: 'A product with this slug already exists' };
    }
    return { error: 'Failed to update product' };
  }

  revalidatePath('/admin/products');
  revalidatePath(`/admin/products/${data.slug}`);
  revalidatePath('/shop');

  return {
    success: true,
    message: 'Product updated successfully',
  };
}

/**
 * Delete a product
 */
export async function deleteProduct(productId: string): Promise<ProductActionState> {
  const hasAccess = await isAdmin();
  if (!hasAccess) {
    return { error: 'Unauthorized' };
  }

  const supabase = createAdminClient();

  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', productId);

  if (error) {
    console.error('Delete product error:', error);
    return { error: 'Failed to delete product' };
  }

  revalidatePath('/admin/products');
  revalidatePath('/shop');

  return {
    success: true,
    message: 'Product deleted successfully',
  };
}

/**
 * Add a product variant
 */
export async function addProductVariant(
  productId: string,
  prevState: ProductActionState | null,
  formData: FormData
): Promise<ProductActionState> {
  const hasAccess = await isAdmin();
  if (!hasAccess) {
    return { error: 'Unauthorized' };
  }

  const validatedFields = variantSchema.safeParse({
    size: formData.get('size'),
    color: formData.get('color'),
    colorHex: formData.get('colorHex'),
    stockQuantity: formData.get('stockQuantity'),
    sku: formData.get('sku'),
  });

  if (!validatedFields.success) {
    return {
      error: validatedFields.error.errors[0]?.message || 'Invalid input',
    };
  }

  const data = validatedFields.data;
  const supabase = createAdminClient();

  const { error } = await (supabase
    .from('product_variants') as any)
    .insert({
      product_id: productId,
      size: data.size,
      color: data.color,
      color_hex: data.colorHex || null,
      stock_quantity: data.stockQuantity,
      sku: data.sku || null,
    });

  if (error) {
    console.error('Add variant error:', error);
    if (error.code === '23505') {
      return { error: 'This size/color combination already exists' };
    }
    return { error: 'Failed to add variant' };
  }

  revalidatePath('/admin/products');

  return {
    success: true,
    message: 'Variant added successfully',
  };
}

/**
 * Update a product variant
 */
export async function updateProductVariant(
  variantId: string,
  prevState: ProductActionState | null,
  formData: FormData
): Promise<ProductActionState> {
  const hasAccess = await isAdmin();
  if (!hasAccess) {
    return { error: 'Unauthorized' };
  }

  const stockQuantity = parseInt(formData.get('stockQuantity')?.toString() || '0');

  const supabase = createAdminClient();

  const { error } = await (supabase
    .from('product_variants') as any)
    .update({
      stock_quantity: stockQuantity,
      sku: formData.get('sku')?.toString() || null,
      is_active: formData.get('isActive') === 'true',
    })
    .eq('id', variantId);

  if (error) {
    console.error('Update variant error:', error);
    return { error: 'Failed to update variant' };
  }

  revalidatePath('/admin/products');
  revalidatePath('/admin/inventory');

  return {
    success: true,
    message: 'Variant updated successfully',
  };
}

/**
 * Delete a product variant
 */
export async function deleteProductVariant(variantId: string): Promise<ProductActionState> {
  const hasAccess = await isAdmin();
  if (!hasAccess) {
    return { error: 'Unauthorized' };
  }

  const supabase = createAdminClient();

  const { error } = await supabase
    .from('product_variants')
    .delete()
    .eq('id', variantId);

  if (error) {
    console.error('Delete variant error:', error);
    return { error: 'Failed to delete variant' };
  }

  revalidatePath('/admin/products');
  revalidatePath('/admin/inventory');

  return {
    success: true,
    message: 'Variant deleted successfully',
  };
}
