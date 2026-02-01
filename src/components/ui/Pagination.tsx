'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange?: (page: number) => void;
  className?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className,
}: PaginationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;

    if (onPageChange) {
      onPageChange(page);
    } else {
      // Update URL
      const params = new URLSearchParams(searchParams.toString());
      if (page === 1) {
        params.delete('page');
      } else {
        params.set('page', page.toString());
      }
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    }
  };

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | 'ellipsis')[] = [];
    const showEllipsisStart = currentPage > 3;
    const showEllipsisEnd = currentPage < totalPages - 2;

    if (totalPages <= 7) {
      // Show all pages
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      if (showEllipsisStart) {
        pages.push('ellipsis');
      }

      // Show pages around current
      const start = showEllipsisStart ? Math.max(2, currentPage - 1) : 2;
      const end = showEllipsisEnd
        ? Math.min(totalPages - 1, currentPage + 1)
        : totalPages - 1;

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (showEllipsisEnd) {
        pages.push('ellipsis');
      }

      // Always show last page
      pages.push(totalPages);
    }

    return pages;
  };

  if (totalPages <= 1) return null;

  const pages = getPageNumbers();

  return (
    <nav
      aria-label="Pagination"
      className={cn('flex items-center justify-center gap-1', className)}
    >
      {/* Previous Button */}
      <button
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="Previous page"
        className={cn(
          'p-2 rounded-lg transition-colors',
          currentPage === 1
            ? 'text-brand-grey-300 cursor-not-allowed'
            : 'text-brand-grey-600 hover:bg-brand-grey-100'
        )}
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      {/* Page Numbers */}
      <div className="flex items-center gap-1">
        {pages.map((page, index) =>
          page === 'ellipsis' ? (
            <span
              key={`ellipsis-${index}`}
              className="px-2 text-brand-grey-400"
            >
              <MoreHorizontal className="w-5 h-5" />
            </span>
          ) : (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              aria-label={`Page ${page}`}
              aria-current={currentPage === page ? 'page' : undefined}
              className={cn(
                'min-w-[40px] h-10 px-3 rounded-lg text-sm font-medium transition-colors',
                currentPage === page
                  ? 'bg-brand-black text-white'
                  : 'text-brand-grey-600 hover:bg-brand-grey-100'
              )}
            >
              {page}
            </button>
          )
        )}
      </div>

      {/* Next Button */}
      <button
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="Next page"
        className={cn(
          'p-2 rounded-lg transition-colors',
          currentPage === totalPages
            ? 'text-brand-grey-300 cursor-not-allowed'
            : 'text-brand-grey-600 hover:bg-brand-grey-100'
        )}
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </nav>
  );
}

// Load More Button variant
interface LoadMoreProps {
  hasMore: boolean;
  isLoading: boolean;
  onLoadMore: () => void;
  className?: string;
}

export function LoadMore({
  hasMore,
  isLoading,
  onLoadMore,
  className,
}: LoadMoreProps) {
  if (!hasMore) return null;

  return (
    <div className={cn('flex justify-center', className)}>
      <button
        onClick={onLoadMore}
        disabled={isLoading}
        className={cn(
          'px-8 py-3 border border-brand-black rounded-lg text-sm font-medium transition-colors',
          isLoading
            ? 'opacity-50 cursor-not-allowed'
            : 'hover:bg-brand-black hover:text-white'
        )}
      >
        {isLoading ? 'Loading...' : 'Load More'}
      </button>
    </div>
  );
}

// Infinite scroll hook
import { useEffect, useRef, useCallback } from 'react';

interface UseInfiniteScrollOptions {
  hasMore: boolean;
  isLoading: boolean;
  onLoadMore: () => void;
  rootMargin?: string;
  threshold?: number;
}

export function useInfiniteScroll({
  hasMore,
  isLoading,
  onLoadMore,
  rootMargin = '200px',
  threshold = 0,
}: UseInfiniteScrollOptions) {
  const observerRef = useRef<IntersectionObserver | null>(null);

  const lastElementRef = useCallback(
    (node: HTMLElement | null) => {
      if (isLoading) return;

      if (observerRef.current) {
        observerRef.current.disconnect();
      }

      observerRef.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasMore) {
            onLoadMore();
          }
        },
        { rootMargin, threshold }
      );

      if (node) {
        observerRef.current.observe(node);
      }
    },
    [isLoading, hasMore, onLoadMore, rootMargin, threshold]
  );

  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  return { lastElementRef };
}
