'use client';

import { useState, useTransition } from 'react';
import { addProductVariant, updateProductVariant, deleteProductVariant } from '@/app/actions/products';
import { ProductVariant } from '@/types';
import { Plus, Edit2, Trash2, X, Save, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VariantManagerProps {
  productId: string;
  variants: ProductVariant[];
}

interface VariantFormData {
  size: string;
  color: string;
  sku: string;
  stock_quantity: number;
  price_modifier: number;
}

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'OSFA'];
const COLORS = [
  'Black',
  'White',
  'Grey',
  'Navy',
  'Olive',
  'Sand',
  'Burgundy',
  'Cream',
];

export function VariantManager({ productId, variants }: VariantManagerProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [formData, setFormData] = useState<VariantFormData>({
    size: '',
    color: '',
    sku: '',
    stock_quantity: 0,
    price_modifier: 0,
  });

  const resetForm = () => {
    setFormData({
      size: '',
      color: '',
      sku: '',
      stock_quantity: 0,
      price_modifier: 0,
    });
    setIsAdding(false);
    setEditingId(null);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const form = new FormData();
    form.append('productId', productId);
    form.append('size', formData.size);
    form.append('color', formData.color);
    form.append('sku', formData.sku);
    form.append('stockQuantity', formData.stock_quantity.toString());
    form.append('colorHex', '');

    startTransition(async () => {
      const result = await addProductVariant(productId, null, form);
      if (result.success) {
        resetForm();
      } else {
        alert(result.error || 'Failed to add variant');
      }
    });
  };

  const handleEdit = (variant: ProductVariant) => {
    setEditingId(variant.id);
    setFormData({
      size: variant.size || '',
      color: variant.color || '',
      sku: variant.sku || '',
      stock_quantity: variant.stock_quantity,
      price_modifier: variant.price_adjustment,
    });
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;

    const form = new FormData();
    form.append('variantId', editingId);
    form.append('size', formData.size);
    form.append('color', formData.color);
    form.append('sku', formData.sku);
    form.append('stock_quantity', formData.stock_quantity.toString());
    form.append('price_modifier', formData.price_modifier.toString());

    startTransition(async () => {
      const result = await updateProductVariant(editingId, null, form);
      if (result.success) {
        resetForm();
      } else {
        alert(result.error || 'Failed to update variant');
      }
    });
  };

  const handleDelete = async (variantId: string) => {
    if (!confirm('Are you sure you want to delete this variant?')) return;

    startTransition(async () => {
      const result = await deleteProductVariant(variantId);
      if (!result.success) {
        alert(result.error || 'Failed to delete variant');
      }
    });
  };

  return (
    <div className="bg-white rounded-xl border border-brand-grey-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-brand-black">Product Variants</h2>
          <p className="text-sm text-brand-grey-500">Manage sizes, colors, and stock levels</p>
        </div>
        {!isAdding && !editingId && (
          <button
            type="button"
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 px-4 py-2 bg-brand-black text-white rounded-lg hover:bg-brand-grey-800 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Variant
          </button>
        )}
      </div>

      {/* Add/Edit Form */}
      {(isAdding || editingId) && (
        <form
          onSubmit={editingId ? handleUpdate : handleAdd}
          className="mb-6 p-4 bg-brand-grey-50 rounded-lg border border-brand-grey-200"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-brand-grey-700 mb-1">
                Size
              </label>
              <select
                value={formData.size}
                onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                className="w-full px-3 py-2 border border-brand-grey-200 rounded-lg focus:ring-2 focus:ring-brand-black focus:border-transparent"
              >
                <option value="">Select size</option>
                {SIZES.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-brand-grey-700 mb-1">
                Color
              </label>
              <select
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className="w-full px-3 py-2 border border-brand-grey-200 rounded-lg focus:ring-2 focus:ring-brand-black focus:border-transparent"
              >
                <option value="">Select color</option>
                {COLORS.map((color) => (
                  <option key={color} value={color}>
                    {color}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-brand-grey-700 mb-1">
                SKU *
              </label>
              <input
                type="text"
                required
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                placeholder="AG-PROD-001-BLK-M"
                className="w-full px-3 py-2 border border-brand-grey-200 rounded-lg focus:ring-2 focus:ring-brand-black focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-brand-grey-700 mb-1">
                Stock *
              </label>
              <input
                type="number"
                required
                min="0"
                value={formData.stock_quantity}
                onChange={(e) => setFormData({ ...formData, stock_quantity: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-brand-grey-200 rounded-lg focus:ring-2 focus:ring-brand-black focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-brand-grey-700 mb-1">
                Price Modifier
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.price_modifier}
                onChange={(e) => setFormData({ ...formData, price_modifier: parseFloat(e.target.value) || 0 })}
                placeholder="0.00"
                className="w-full px-3 py-2 border border-brand-grey-200 rounded-lg focus:ring-2 focus:ring-brand-black focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 text-brand-grey-600 hover:text-brand-black transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex items-center gap-2 px-4 py-2 bg-brand-black text-white rounded-lg hover:bg-brand-grey-800 transition-colors disabled:opacity-50"
            >
              {isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {editingId ? 'Update' : 'Add'} Variant
            </button>
          </div>
        </form>
      )}

      {/* Variants Table */}
      {variants.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-brand-grey-200">
                <th className="px-4 py-3 text-left text-sm font-medium text-brand-grey-500">SKU</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-brand-grey-500">Size</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-brand-grey-500">Color</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-brand-grey-500">Stock</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-brand-grey-500">Price Mod.</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-brand-grey-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-grey-100">
              {variants.map((variant) => (
                <tr key={variant.id} className="hover:bg-brand-grey-50">
                  <td className="px-4 py-3 text-sm font-mono text-brand-grey-700">
                    {variant.sku}
                  </td>
                  <td className="px-4 py-3 text-sm text-brand-grey-700">
                    {variant.size || '-'}
                  </td>
                  <td className="px-4 py-3 text-sm text-brand-grey-700">
                    {variant.color || '-'}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                        variant.stock_quantity === 0
                          ? 'bg-red-100 text-red-800'
                          : variant.stock_quantity <= 10
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-green-100 text-green-800'
                      )}
                    >
                      {variant.stock_quantity}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-brand-grey-700">
                    {variant.price_adjustment !== 0 ? (
                      <span className={variant.price_adjustment > 0 ? 'text-green-600' : 'text-red-600'}>
                        {variant.price_adjustment > 0 ? '+' : ''}${variant.price_adjustment.toFixed(2)}
                      </span>
                    ) : (
                      '-'
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => handleEdit(variant)}
                        disabled={isPending || editingId === variant.id}
                        className="p-2 text-brand-grey-500 hover:text-brand-black hover:bg-brand-grey-100 rounded-lg transition-colors disabled:opacity-50"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(variant.id)}
                        disabled={isPending}
                        className="p-2 text-brand-grey-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-8 text-brand-grey-500">
          <p>No variants added yet.</p>
          <p className="text-sm mt-1">Add variants to manage different sizes, colors, and stock levels.</p>
        </div>
      )}
    </div>
  );
}
