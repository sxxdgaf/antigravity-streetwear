'use client';

import { useActionState } from 'react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ImageUpload } from './ImageUpload';
import { slugify } from '@/lib/formatting';
import { createProduct, updateProduct, type ProductActionState } from '@/app/actions/products';
import { Loader2 } from 'lucide-react';
import type { Product, Category } from '@/types/database';

interface ProductFormProps {
  product?: Product;
  categories: Category[];
}

export function ProductForm({ product, categories }: ProductFormProps) {
  const router = useRouter();
  const isEditing = !!product;
  
  const [name, setName] = useState(product?.name || '');
  const [slug, setSlug] = useState(product?.slug || '');
  const [images, setImages] = useState<string[]>(
    product?.images ? (product.images as string[]) : []
  );

  // Bound action for create/update
  const boundAction = isEditing
    ? updateProduct.bind(null, product.id)
    : createProduct;

  const [state, formAction, isPending] = useActionState<ProductActionState | null, FormData>(
    boundAction,
    null
  );

  // Auto-generate slug from name
  useEffect(() => {
    if (!isEditing && name) {
      setSlug(slugify(name));
    }
  }, [name, isEditing]);

  // Redirect on success for new products
  useEffect(() => {
    if (state?.success && state?.productId && !isEditing) {
      router.push(`/admin/products`);
    }
  }, [state, isEditing, router]);

  return (
    <form action={formAction} className="space-y-8">
      {/* Error message */}
      {state?.error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
          {state.error}
        </div>
      )}

      {/* Success message */}
      {state?.success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-600 text-sm">
          {state.message}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic info */}
          <div className="bg-white rounded-xl border border-brand-grey-200 p-6">
            <h2 className="font-medium text-lg mb-4">Basic Information</h2>
            
            <div className="space-y-4">
              {/* Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-brand-grey-700 mb-1">
                  Product Name *
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input w-full"
                  placeholder="e.g., VOID Oversized Hoodie"
                />
              </div>

              {/* Slug */}
              <div>
                <label htmlFor="slug" className="block text-sm font-medium text-brand-grey-700 mb-1">
                  URL Slug *
                </label>
                <input
                  id="slug"
                  name="slug"
                  type="text"
                  required
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="input w-full"
                  placeholder="void-oversized-hoodie"
                />
                <p className="text-xs text-brand-grey-400 mt-1">
                  URL: /shop/{slug || 'product-slug'}
                </p>
              </div>

              {/* Short description */}
              <div>
                <label htmlFor="shortDescription" className="block text-sm font-medium text-brand-grey-700 mb-1">
                  Short Description
                </label>
                <input
                  id="shortDescription"
                  name="shortDescription"
                  type="text"
                  defaultValue={product?.short_description || ''}
                  className="input w-full"
                  placeholder="Brief product tagline"
                />
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-brand-grey-700 mb-1">
                  Full Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={5}
                  defaultValue={product?.description || ''}
                  className="input w-full resize-none"
                  placeholder="Detailed product description..."
                />
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="bg-white rounded-xl border border-brand-grey-200 p-6">
            <h2 className="font-medium text-lg mb-4">Images</h2>
            <ImageUpload
              value={images}
              onChange={setImages}
              maxFiles={6}
              bucket="products"
              folder={slug || 'temp'}
            />
            {/* Hidden field to pass images to form action */}
            <input type="hidden" name="images" value={JSON.stringify(images)} />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status */}
          <div className="bg-white rounded-xl border border-brand-grey-200 p-6">
            <h2 className="font-medium text-lg mb-4">Status</h2>
            
            <div className="space-y-3">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="isActive"
                  value="true"
                  defaultChecked={product?.is_active ?? true}
                  className="w-4 h-4 rounded border-brand-grey-300"
                />
                <span className="text-sm">Active (visible in store)</span>
              </label>

              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="isFeatured"
                  value="true"
                  defaultChecked={product?.is_featured ?? false}
                  className="w-4 h-4 rounded border-brand-grey-300"
                />
                <span className="text-sm">Featured product</span>
              </label>

              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="isNew"
                  value="true"
                  defaultChecked={product?.is_new ?? false}
                  className="w-4 h-4 rounded border-brand-grey-300"
                />
                <span className="text-sm">Mark as new</span>
              </label>

              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="isBestseller"
                  value="true"
                  defaultChecked={product?.is_bestseller ?? false}
                  className="w-4 h-4 rounded border-brand-grey-300"
                />
                <span className="text-sm">Bestseller</span>
              </label>
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-white rounded-xl border border-brand-grey-200 p-6">
            <h2 className="font-medium text-lg mb-4">Pricing</h2>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="price" className="block text-sm font-medium text-brand-grey-700 mb-1">
                  Price (PKR) *
                </label>
                <input
                  id="price"
                  name="price"
                  type="number"
                  required
                  min="0"
                  step="1"
                  defaultValue={product?.price || ''}
                  className="input w-full"
                  placeholder="0"
                />
              </div>

              <div>
                <label htmlFor="compareAtPrice" className="block text-sm font-medium text-brand-grey-700 mb-1">
                  Compare at Price
                </label>
                <input
                  id="compareAtPrice"
                  name="compareAtPrice"
                  type="number"
                  min="0"
                  step="1"
                  defaultValue={product?.compare_at_price || ''}
                  className="input w-full"
                  placeholder="Original price for sale display"
                />
              </div>
            </div>
          </div>

          {/* Category */}
          <div className="bg-white rounded-xl border border-brand-grey-200 p-6">
            <h2 className="font-medium text-lg mb-4">Organization</h2>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="categoryId" className="block text-sm font-medium text-brand-grey-700 mb-1">
                  Category
                </label>
                <select
                  id="categoryId"
                  name="categoryId"
                  defaultValue={product?.category_id || ''}
                  className="input w-full"
                >
                  <option value="">No category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="tags" className="block text-sm font-medium text-brand-grey-700 mb-1">
                  Tags
                </label>
                <input
                  id="tags"
                  name="tags"
                  type="text"
                  defaultValue={product?.tags?.join(', ') || ''}
                  className="input w-full"
                  placeholder="oversized, cotton, essential"
                />
                <p className="text-xs text-brand-grey-400 mt-1">
                  Comma-separated list of tags
                </p>
              </div>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isPending}
            className="btn-primary w-full"
          >
            {isPending ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                {isEditing ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              isEditing ? 'Update Product' : 'Create Product'
            )}
          </button>
        </div>
      </div>
    </form>
  );
}
