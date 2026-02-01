'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { deleteProduct } from '@/app/actions/products';
import { Trash2, Loader2 } from 'lucide-react';

interface DeleteProductButtonProps {
  productId: string;
  productName: string;
}

export function DeleteProductButton({ productId, productName }: DeleteProductButtonProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    const result = await deleteProduct(productId);
    
    if (result.success) {
      router.refresh();
    } else {
      alert(result.error || 'Failed to delete product');
    }
    
    setIsDeleting(false);
    setShowConfirm(false);
  };

  if (showConfirm) {
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={() => setShowConfirm(false)}
          className="px-2 py-1 text-xs text-brand-grey-500 hover:text-brand-black"
          disabled={isDeleting}
        >
          Cancel
        </button>
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
        >
          {isDeleting ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Confirm'}
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setShowConfirm(true)}
      className="p-2 text-brand-grey-500 hover:text-red-500 rounded-lg hover:bg-red-50"
      title={`Delete ${productName}`}
    >
      <Trash2 className="w-4 h-4" />
    </button>
  );
}
