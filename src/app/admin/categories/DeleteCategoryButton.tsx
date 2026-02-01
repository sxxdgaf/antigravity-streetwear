'use client';

import { useTransition } from 'react';
import { deleteCategory } from '@/app/actions/categories';
import { Trash2, Loader2 } from 'lucide-react';

interface DeleteCategoryButtonProps {
  categoryId: string;
  categoryName: string;
  hasProducts: boolean;
}

export function DeleteCategoryButton({ categoryId, categoryName, hasProducts }: DeleteCategoryButtonProps) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (hasProducts) {
      alert('Cannot delete a category with products. Please reassign or delete the products first.');
      return;
    }

    if (!confirm(`Are you sure you want to delete "${categoryName}"? This action cannot be undone.`)) {
      return;
    }

    const formData = new FormData();
    formData.append('categoryId', categoryId);

    startTransition(async () => {
      const result = await deleteCategory(formData);
      if (!result.success) {
        alert(result.error || 'Failed to delete category');
      }
    });
  };

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={isPending}
      className="p-2 text-brand-grey-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
    >
      {isPending ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Trash2 className="w-4 h-4" />
      )}
    </button>
  );
}
