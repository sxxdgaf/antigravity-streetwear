'use client';

import { useState, useTransition } from 'react';
import { createCategory, updateCategory } from '@/app/actions/categories';
import { Category } from '@/types';
import { useRouter } from 'next/navigation';
import { Save, Loader2 } from 'lucide-react';
import { ImageUpload } from '@/components/admin/ImageUpload';
import { cn } from '@/lib/utils';

interface CategoryFormProps {
  category?: Category;
}

export function CategoryForm({ category }: CategoryFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [formData, setFormData] = useState({
    name: category?.name || '',
    slug: category?.slug || '',
    description: category?.description || '',
    image_url: category?.image_url || '',
    display_order: category?.display_order || 0,
    is_active: category?.is_active ?? true,
  });

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleNameChange = (name: string) => {
    setFormData({
      ...formData,
      name,
      slug: !category ? generateSlug(name) : formData.slug,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const form = new FormData();
    if (category) {
      form.append('categoryId', category.id);
    }
    form.append('name', formData.name);
    form.append('slug', formData.slug);
    form.append('description', formData.description);
    form.append('image_url', formData.image_url);
    form.append('display_order', formData.display_order.toString());
    form.append('is_active', formData.is_active.toString());

    startTransition(async () => {
      const result = category
        ? await updateCategory(form)
        : await createCategory(form);

      if (result.success) {
        router.push('/admin/categories');
      } else {
        alert(result.error || 'Failed to save category');
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white rounded-xl border border-brand-grey-200 p-6">
        <h2 className="text-lg font-semibold text-brand-black mb-4">Category Details</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-brand-grey-700 mb-1">
              Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="Category name"
              className="w-full px-4 py-2 border border-brand-grey-200 rounded-lg focus:ring-2 focus:ring-brand-black focus:border-transparent"
            />
          </div>

          {/* Slug */}
          <div>
            <label className="block text-sm font-medium text-brand-grey-700 mb-1">
              Slug *
            </label>
            <input
              type="text"
              required
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              placeholder="category-slug"
              className="w-full px-4 py-2 border border-brand-grey-200 rounded-lg focus:ring-2 focus:ring-brand-black focus:border-transparent font-mono text-sm"
            />
          </div>

          {/* Description */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-brand-grey-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Category description"
              rows={3}
              className="w-full px-4 py-2 border border-brand-grey-200 rounded-lg focus:ring-2 focus:ring-brand-black focus:border-transparent resize-none"
            />
          </div>

          {/* Display Order */}
          <div>
            <label className="block text-sm font-medium text-brand-grey-700 mb-1">
              Display Order
            </label>
            <input
              type="number"
              min="0"
              value={formData.display_order}
              onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
              className="w-full px-4 py-2 border border-brand-grey-200 rounded-lg focus:ring-2 focus:ring-brand-black focus:border-transparent"
            />
            <p className="text-xs text-brand-grey-500 mt-1">
              Lower numbers appear first
            </p>
          </div>

          {/* Is Active */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, is_active: !formData.is_active })}
              className={cn(
                'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                formData.is_active ? 'bg-green-500' : 'bg-brand-grey-300'
              )}
            >
              <span
                className={cn(
                  'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                  formData.is_active ? 'translate-x-6' : 'translate-x-1'
                )}
              />
            </button>
            <label className="text-sm font-medium text-brand-grey-700">
              Active
            </label>
          </div>
        </div>
      </div>

      {/* Image Upload */}
      <div className="bg-white rounded-xl border border-brand-grey-200 p-6">
        <h2 className="text-lg font-semibold text-brand-black mb-4">Category Image</h2>
        <ImageUpload
          bucket="products"
          value={formData.image_url ? [formData.image_url] : []}
          onChange={(urls) => setFormData({ ...formData, image_url: urls[0] || '' })}
          aspectRatio="16/9"
        />
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-2 border border-brand-grey-200 rounded-lg text-brand-grey-600 hover:bg-brand-grey-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="flex items-center gap-2 px-6 py-2 bg-brand-black text-white rounded-lg hover:bg-brand-grey-800 transition-colors disabled:opacity-50"
        >
          {isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {category ? 'Update' : 'Create'} Category
        </button>
      </div>
    </form>
  );
}
