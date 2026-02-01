'use client';

import { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import Image from 'next/image';

interface ImageUploadProps {
  value: string[];
  onChange: (urls: string[]) => void;
  maxFiles?: number;
  bucket?: string;
  folder?: string;
  className?: string;
}

export function ImageUpload({
  value = [],
  onChange,
  maxFiles = 5,
  bucket = 'products',
  folder = '',
  className,
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleUpload = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return;
      if (value.length >= maxFiles) {
        alert(`Maximum ${maxFiles} images allowed`);
        return;
      }

      setIsUploading(true);

      try {
        const uploadPromises = Array.from(files)
          .slice(0, maxFiles - value.length)
          .map(async (file) => {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('bucket', bucket);
            formData.append('folder', folder);

            const response = await fetch('/api/upload', {
              method: 'POST',
              body: formData,
            });

            if (!response.ok) {
              throw new Error('Upload failed');
            }

            const data = await response.json();
            return data.url;
          });

        const urls = await Promise.all(uploadPromises);
        onChange([...value, ...urls]);
      } catch (error) {
        console.error('Upload error:', error);
        alert('Failed to upload image. Please try again.');
      } finally {
        setIsUploading(false);
      }
    },
    [value, maxFiles, bucket, folder, onChange]
  );

  const handleRemove = useCallback(
    (index: number) => {
      const newUrls = [...value];
      newUrls.splice(index, 1);
      onChange(newUrls);
    },
    [value, onChange]
  );

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
      handleUpload(e.dataTransfer.files);
    },
    [handleUpload]
  );

  return (
    <div className={cn('space-y-4', className)}>
      {/* Upload zone */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={cn(
          'relative border-2 border-dashed rounded-lg p-8 text-center transition-colors',
          dragActive
            ? 'border-brand-black bg-brand-grey-100'
            : 'border-brand-grey-300 hover:border-brand-grey-400',
          isUploading && 'pointer-events-none opacity-50'
        )}
      >
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => handleUpload(e.target.files)}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={isUploading || value.length >= maxFiles}
        />
        
        {isUploading ? (
          <div className="flex flex-col items-center">
            <Loader2 className="w-10 h-10 text-brand-grey-400 animate-spin mb-2" />
            <p className="text-sm text-brand-grey-500">Uploading...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <Upload className="w-10 h-10 text-brand-grey-400 mb-2" />
            <p className="text-sm text-brand-grey-600 mb-1">
              Drag & drop images here, or click to browse
            </p>
            <p className="text-xs text-brand-grey-400">
              PNG, JPG, WebP up to 5MB ({value.length}/{maxFiles} uploaded)
            </p>
          </div>
        )}
      </div>

      {/* Image previews */}
      {value.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {value.map((url, index) => (
            <div
              key={url}
              className="relative aspect-square bg-brand-grey-100 rounded-lg overflow-hidden group"
            >
              <Image
                src={url}
                alt={`Upload ${index + 1}`}
                fill
                className="object-cover"
              />
              <button
                type="button"
                onClick={() => handleRemove(index)}
                className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-4 h-4" />
              </button>
              {index === 0 && (
                <span className="absolute bottom-2 left-2 px-2 py-1 bg-brand-black/80 text-brand-white text-xs rounded">
                  Primary
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
