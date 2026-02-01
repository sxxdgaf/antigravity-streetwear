'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect } from 'react';

interface PrefetchOptions {
  onMouseEnter?: boolean;
  onVisible?: boolean;
  delay?: number;
}

export function usePrefetch() {
  const router = useRouter();

  const prefetch = useCallback(
    (href: string) => {
      router.prefetch(href);
    },
    [router]
  );

  return { prefetch };
}

export function usePrefetchOnHover(href: string, enabled: boolean = true) {
  const { prefetch } = usePrefetch();

  const handleMouseEnter = useCallback(() => {
    if (enabled) {
      prefetch(href);
    }
  }, [href, enabled, prefetch]);

  return { onMouseEnter: handleMouseEnter };
}

// Prefetch multiple routes at once
export function usePrefetchRoutes(routes: string[]) {
  const router = useRouter();

  useEffect(() => {
    routes.forEach((route) => {
      router.prefetch(route);
    });
  }, [routes, router]);
}

// Common routes to prefetch
export const COMMON_ROUTES = [
  '/shop',
  '/collections',
  '/cart',
  '/about',
];
