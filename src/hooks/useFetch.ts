'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

interface UseFetchOptions<T> {
  cacheKey?: string;
  cacheTTL?: number; // in milliseconds
  revalidateOnFocus?: boolean;
  revalidateOnReconnect?: boolean;
  dedupingInterval?: number;
  fallbackData?: T;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
}

// In-memory cache
const cache = new Map<string, CacheEntry<any>>();
const pendingRequests = new Map<string, Promise<any>>();

export function useFetch<T>(
  url: string | null,
  options: UseFetchOptions<T> = {}
) {
  const {
    cacheKey = url,
    cacheTTL = 5 * 60 * 1000, // 5 minutes default
    revalidateOnFocus = true,
    revalidateOnReconnect = true,
    dedupingInterval = 2000,
    fallbackData,
    onSuccess,
    onError,
  } = options;

  const [data, setData] = useState<T | undefined>(() => {
    if (cacheKey && cache.has(cacheKey)) {
      const entry = cache.get(cacheKey);
      if (entry && entry.expiresAt > Date.now()) {
        return entry.data;
      }
    }
    return fallbackData;
  });
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(!data);
  const [isValidating, setIsValidating] = useState(false);

  const lastFetchRef = useRef<number>(0);

  const fetchData = useCallback(
    async (skipCache = false) => {
      if (!url || !cacheKey) return;

      // Check deduping interval
      const now = Date.now();
      if (now - lastFetchRef.current < dedupingInterval && !skipCache) {
        return;
      }
      lastFetchRef.current = now;

      // Check cache
      if (!skipCache && cache.has(cacheKey)) {
        const entry = cache.get(cacheKey);
        if (entry && entry.expiresAt > now) {
          setData(entry.data);
          return entry.data;
        }
      }

      // Check if there's a pending request
      if (pendingRequests.has(cacheKey)) {
        const pendingData = await pendingRequests.get(cacheKey);
        setData(pendingData);
        return pendingData;
      }

      setIsValidating(true);
      if (!data) setIsLoading(true);

      try {
        const fetchPromise = fetch(url).then(async (res) => {
          if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
          }
          return res.json();
        });

        pendingRequests.set(cacheKey, fetchPromise);
        const result = await fetchPromise;

        // Update cache
        cache.set(cacheKey, {
          data: result,
          timestamp: now,
          expiresAt: now + cacheTTL,
        });

        setData(result);
        setError(null);
        onSuccess?.(result);

        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Fetch failed');
        setError(error);
        onError?.(error);
        throw error;
      } finally {
        setIsLoading(false);
        setIsValidating(false);
        pendingRequests.delete(cacheKey);
      }
    },
    [url, cacheKey, cacheTTL, dedupingInterval, data, onSuccess, onError]
  );

  // Initial fetch
  useEffect(() => {
    fetchData();
  }, [url]); // Only refetch when URL changes

  // Revalidate on focus
  useEffect(() => {
    if (!revalidateOnFocus) return;

    const handleFocus = () => {
      fetchData();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [revalidateOnFocus, fetchData]);

  // Revalidate on reconnect
  useEffect(() => {
    if (!revalidateOnReconnect) return;

    const handleOnline = () => {
      fetchData(true);
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [revalidateOnReconnect, fetchData]);

  const mutate = useCallback(
    (newData?: T | ((current: T | undefined) => T)) => {
      if (typeof newData === 'function') {
        const updater = newData as (current: T | undefined) => T;
        setData((current) => {
          const updated = updater(current);
          if (cacheKey) {
            cache.set(cacheKey, {
              data: updated,
              timestamp: Date.now(),
              expiresAt: Date.now() + cacheTTL,
            });
          }
          return updated;
        });
      } else if (newData !== undefined) {
        setData(newData);
        if (cacheKey) {
          cache.set(cacheKey, {
            data: newData,
            timestamp: Date.now(),
            expiresAt: Date.now() + cacheTTL,
          });
        }
      } else {
        // Revalidate
        fetchData(true);
      }
    },
    [cacheKey, cacheTTL, fetchData]
  );

  return {
    data,
    error,
    isLoading,
    isValidating,
    mutate,
    revalidate: () => fetchData(true),
  };
}

// Clear all cache
export function clearCache() {
  cache.clear();
}

// Clear specific cache key
export function invalidateCache(key: string) {
  cache.delete(key);
}

// Pre-populate cache
export function setCache<T>(key: string, data: T, ttl = 5 * 60 * 1000) {
  const now = Date.now();
  cache.set(key, {
    data,
    timestamp: now,
    expiresAt: now + ttl,
  });
}
