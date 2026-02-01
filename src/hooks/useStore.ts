'use client';

import { useEffect, useState } from 'react';

/**
 * Hook to safely use Zustand stores with SSR
 * Prevents hydration mismatch by returning default value on server
 */
export function useStore<T, F>(
  store: (callback: (state: T) => unknown) => unknown,
  callback: (state: T) => F,
  defaultValue: F
): F {
  const result = store(callback) as F;
  const [data, setData] = useState<F>(defaultValue);

  useEffect(() => {
    setData(result);
  }, [result]);

  return data;
}

/**
 * Hook to check if component is mounted (client-side)
 */
export function useIsMounted() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return isMounted;
}
