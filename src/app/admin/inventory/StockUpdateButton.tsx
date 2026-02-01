'use client';

import { useState, useTransition } from 'react';
import { updateStock, InventoryChangeType } from '@/app/actions/inventory';
import { Edit2, Plus, Minus, RefreshCw, Loader2, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StockUpdateButtonProps {
  variantId: string;
  currentStock: number;
  productName: string;
  variantInfo: string;
}

const CHANGE_TYPES: { value: InventoryChangeType; label: string; icon: React.ReactNode }[] = [
  { value: 'restock', label: 'Restock', icon: <Plus className="w-4 h-4" /> },
  { value: 'sale', label: 'Sale', icon: <Minus className="w-4 h-4" /> },
  { value: 'return', label: 'Return', icon: <RefreshCw className="w-4 h-4" /> },
  { value: 'adjustment', label: 'Set Quantity', icon: <Edit2 className="w-4 h-4" /> },
  { value: 'damaged', label: 'Damaged', icon: <X className="w-4 h-4" /> },
];

export function StockUpdateButton({
  variantId,
  currentStock,
  productName,
  variantInfo,
}: StockUpdateButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [changeType, setChangeType] = useState<InventoryChangeType>('restock');
  const [quantity, setQuantity] = useState(0);
  const [notes, setNotes] = useState('');

  const handleSubmit = () => {
    if (quantity === 0 && changeType !== 'adjustment') {
      alert('Please enter a quantity');
      return;
    }

    const form = new FormData();
    form.append('variantId', variantId);
    form.append('changeType', changeType);
    form.append('quantity', quantity.toString());
    form.append('notes', notes);

    startTransition(async () => {
      const result = await updateStock(form);
      if (result.success) {
        setIsOpen(false);
        setQuantity(0);
        setNotes('');
      } else {
        alert(result.error || 'Failed to update stock');
      }
    });
  };

  const getNewStock = () => {
    switch (changeType) {
      case 'restock':
      case 'return':
        return currentStock + Math.abs(quantity);
      case 'sale':
      case 'damaged':
        return Math.max(0, currentStock - Math.abs(quantity));
      case 'adjustment':
        return quantity;
      default:
        return currentStock + quantity;
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="px-3 py-1.5 text-sm text-brand-grey-600 hover:text-brand-black hover:bg-brand-grey-100 rounded-lg transition-colors"
      >
        Update Stock
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setIsOpen(false)}
          />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-brand-black">Update Stock</h3>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-2 text-brand-grey-400 hover:text-brand-black rounded-lg hover:bg-brand-grey-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-4">
              <p className="font-medium text-brand-black">{productName}</p>
              {variantInfo && (
                <p className="text-sm text-brand-grey-500">{variantInfo}</p>
              )}
              <p className="text-sm text-brand-grey-500 mt-1">
                Current stock: <span className="font-medium">{currentStock}</span>
              </p>
            </div>

            <div className="space-y-4">
              {/* Change Type */}
              <div>
                <label className="block text-sm font-medium text-brand-grey-700 mb-2">
                  Action
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {CHANGE_TYPES.map((type) => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => {
                        setChangeType(type.value);
                        if (type.value === 'adjustment') {
                          setQuantity(currentStock);
                        }
                      }}
                      className={cn(
                        'flex items-center justify-center gap-2 px-3 py-2 text-sm rounded-lg border transition-colors',
                        changeType === type.value
                          ? 'border-brand-black bg-brand-black text-white'
                          : 'border-brand-grey-200 hover:border-brand-grey-300'
                      )}
                    >
                      {type.icon}
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity */}
              <div>
                <label className="block text-sm font-medium text-brand-grey-700 mb-1">
                  {changeType === 'adjustment' ? 'New Quantity' : 'Quantity'}
                </label>
                <input
                  type="number"
                  min="0"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-2 border border-brand-grey-200 rounded-lg focus:ring-2 focus:ring-brand-black focus:border-transparent"
                />
                {changeType !== 'adjustment' && quantity > 0 && (
                  <p className="text-sm text-brand-grey-500 mt-1">
                    New stock will be: <span className="font-medium">{getNewStock()}</span>
                  </p>
                )}
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-brand-grey-700 mb-1">
                  Notes (optional)
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Reason for change..."
                  className="w-full px-4 py-2 border border-brand-grey-200 rounded-lg focus:ring-2 focus:ring-brand-black focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 text-brand-grey-600 hover:text-brand-black transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isPending}
                className="flex items-center gap-2 px-4 py-2 bg-brand-black text-white rounded-lg hover:bg-brand-grey-800 transition-colors disabled:opacity-50"
              >
                {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                Update Stock
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
