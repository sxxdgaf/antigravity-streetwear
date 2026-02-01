'use client';

import { useEffect, useRef, useState } from 'react';
import Image, { ImageProps } from 'next/image';
import { cn } from '@/lib/utils';

interface OptimizedImageProps extends Omit<ImageProps, 'onLoad'> {
  lowQualitySrc?: string;
  aspectRatio?: number;
  fadeIn?: boolean;
}

export function OptimizedImage({
  src,
  alt,
  lowQualitySrc,
  aspectRatio,
  fadeIn = true,
  className,
  ...props
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '200px',
        threshold: 0,
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      className={cn('relative overflow-hidden bg-brand-grey-100', className)}
      style={aspectRatio ? { aspectRatio: aspectRatio.toString() } : undefined}
    >
      {/* Low quality placeholder */}
      {lowQualitySrc && !isLoaded && (
        <Image
          src={lowQualitySrc}
          alt={alt}
          fill
          className="object-cover blur-lg scale-110"
          priority={false}
        />
      )}

      {/* Main image */}
      {isInView && (
        <Image
          src={src}
          alt={alt}
          className={cn(
            'object-cover transition-opacity duration-500',
            fadeIn && !isLoaded ? 'opacity-0' : 'opacity-100'
          )}
          onLoad={() => setIsLoaded(true)}
          {...props}
        />
      )}

      {/* Loading skeleton */}
      {!isLoaded && !lowQualitySrc && (
        <div className="absolute inset-0 bg-gradient-to-r from-brand-grey-100 via-brand-grey-50 to-brand-grey-100 animate-pulse" />
      )}
    </div>
  );
}

// Blur data URL generator for placeholder
export function generateBlurPlaceholder(
  width: number = 8,
  height: number = 8
): string {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  
  if (ctx) {
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, width, height);
  }
  
  return canvas.toDataURL();
}
