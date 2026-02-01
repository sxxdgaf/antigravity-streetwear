'use client';

import { useState, useTransition } from 'react';
import { updateTrackingInfo } from '@/app/actions/orders';
import { Truck, Edit2, Save, X, Loader2, ExternalLink } from 'lucide-react';

interface TrackingInfoProps {
  orderId: string;
  trackingNumber?: string | null;
  trackingUrl?: string | null;
}

export function TrackingInfo({ orderId, trackingNumber, trackingUrl }: TrackingInfoProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [formData, setFormData] = useState({
    tracking_number: trackingNumber || '',
    tracking_url: trackingUrl || '',
  });

  const handleSave = () => {
    const form = new FormData();
    form.append('orderId', orderId);
    form.append('tracking_number', formData.tracking_number);
    form.append('tracking_url', formData.tracking_url);

    startTransition(async () => {
      const result = await updateTrackingInfo(form);
      if (result.success) {
        setIsEditing(false);
      } else {
        alert(result.error || 'Failed to update tracking info');
      }
    });
  };

  const handleCancel = () => {
    setFormData({
      tracking_number: trackingNumber || '',
      tracking_url: trackingUrl || '',
    });
    setIsEditing(false);
  };

  return (
    <div className="bg-white rounded-xl border border-brand-grey-200">
      <div className="p-4 border-b border-brand-grey-200 flex items-center justify-between">
        <h2 className="font-semibold text-brand-black flex items-center gap-2">
          <Truck className="w-5 h-5" />
          Tracking Information
        </h2>
        {!isEditing && (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="p-2 text-brand-grey-500 hover:text-brand-black hover:bg-brand-grey-100 rounded-lg transition-colors"
          >
            <Edit2 className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="p-4">
        {isEditing ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-brand-grey-700 mb-1">
                Tracking Number
              </label>
              <input
                type="text"
                value={formData.tracking_number}
                onChange={(e) => setFormData({ ...formData, tracking_number: e.target.value })}
                placeholder="e.g., 1Z999AA10123456784"
                className="w-full px-3 py-2 border border-brand-grey-200 rounded-lg focus:ring-2 focus:ring-brand-black focus:border-transparent font-mono text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-brand-grey-700 mb-1">
                Tracking URL
              </label>
              <input
                type="url"
                value={formData.tracking_url}
                onChange={(e) => setFormData({ ...formData, tracking_url: e.target.value })}
                placeholder="https://www.ups.com/track?tracknum=..."
                className="w-full px-3 py-2 border border-brand-grey-200 rounded-lg focus:ring-2 focus:ring-brand-black focus:border-transparent text-sm"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={handleCancel}
                disabled={isPending}
                className="px-3 py-1.5 text-sm text-brand-grey-600 hover:text-brand-black transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={isPending}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-brand-black text-white rounded-lg hover:bg-brand-grey-800 transition-colors disabled:opacity-50"
              >
                {isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Save
              </button>
            </div>
          </div>
        ) : (
          <>
            {trackingNumber ? (
              <div className="space-y-3">
                <div>
                  <span className="text-sm text-brand-grey-500 block">Tracking Number</span>
                  <span className="font-mono text-brand-black">{trackingNumber}</span>
                </div>
                {trackingUrl && (
                  <a
                    href={trackingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm text-brand-accent hover:underline"
                  >
                    Track Package
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            ) : (
              <p className="text-sm text-brand-grey-500">
                No tracking information added yet.
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
