'use client';

import { useState, useTransition } from 'react';
import { updateOrderStatus, OrderStatus } from '@/app/actions/orders';
import { ChevronDown, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OrderStatusUpdaterProps {
  orderId: string;
  currentStatus: string;
}

const STATUS_OPTIONS: { value: OrderStatus; label: string; color: string }[] = [
  { value: 'pending', label: 'Pending', color: 'text-yellow-600' },
  { value: 'confirmed', label: 'Confirmed', color: 'text-blue-600' },
  { value: 'processing', label: 'Processing', color: 'text-purple-600' },
  { value: 'shipped', label: 'Shipped', color: 'text-indigo-600' },
  { value: 'delivered', label: 'Delivered', color: 'text-green-600' },
  { value: 'cancelled', label: 'Cancelled', color: 'text-red-600' },
  { value: 'refunded', label: 'Refunded', color: 'text-orange-600' },
];

export function OrderStatusUpdater({ orderId, currentStatus }: OrderStatusUpdaterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleStatusChange = (newStatus: OrderStatus) => {
    if (newStatus === currentStatus) {
      setIsOpen(false);
      return;
    }

    const confirmMessage =
      newStatus === 'cancelled'
        ? 'Are you sure you want to cancel this order? This action cannot be easily undone.'
        : newStatus === 'refunded'
        ? 'Are you sure you want to mark this order as refunded?'
        : `Update order status to "${newStatus}"?`;

    if (!confirm(confirmMessage)) {
      setIsOpen(false);
      return;
    }

    const formData = new FormData();
    formData.append('orderId', orderId);
    formData.append('status', newStatus);

    startTransition(async () => {
      const result = await updateOrderStatus(formData);
      if (!result.success) {
        alert(result.error || 'Failed to update status');
      }
      setIsOpen(false);
    });
  };

  const currentOption = STATUS_OPTIONS.find((s) => s.value === currentStatus);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={isPending}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-brand-grey-200 rounded-lg hover:bg-brand-grey-50 transition-colors disabled:opacity-50"
      >
        {isPending ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <>
            <span className={cn('font-medium', currentOption?.color)}>
              {currentOption?.label || currentStatus}
            </span>
            <ChevronDown className="w-4 h-4 text-brand-grey-400" />
          </>
        )}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-brand-grey-200 rounded-lg shadow-lg z-20 py-1">
            {STATUS_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleStatusChange(option.value)}
                className={cn(
                  'w-full px-4 py-2 text-left text-sm hover:bg-brand-grey-50 transition-colors',
                  option.value === currentStatus && 'bg-brand-grey-50 font-medium'
                )}
              >
                <span className={option.color}>{option.label}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
