import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { CategoryForm } from '@/components/admin/CategoryForm';

export const metadata = {
  title: 'New Category | Admin',
};

export default function NewCategoryPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/categories"
          className="p-2 text-brand-grey-500 hover:text-brand-black rounded-lg hover:bg-brand-grey-100"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-display font-bold text-brand-black">New Category</h1>
          <p className="text-brand-grey-500">Create a new product category</p>
        </div>
      </div>

      {/* Form */}
      <CategoryForm />
    </div>
  );
}
