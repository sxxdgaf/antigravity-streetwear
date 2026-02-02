/**
 * Type Exports
 */

export * from './database';

// Additional utility types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface SortOption {
  field: string;
  direction: 'asc' | 'desc';
}

export interface FilterOption {
  field: string;
  operator: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'contains';
  value: unknown;
}

export interface ProductFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sizes?: string[];
  colors?: string[];
  inStock?: boolean;
  isNew?: boolean;
  isFeatured?: boolean;
  search?: string;
}

export interface ProductSort {
  field: 'price' | 'created_at' | 'sales_count' | 'name';
  direction: 'asc' | 'desc';
}

/**
 * Helper type to safely cast Json type to string array
 */
export function parseJsonImages(images: unknown): string[] {
  if (!images) return [];
  if (Array.isArray(images)) {
    return images.filter((item): item is string => typeof item === 'string');
  }
  return [];
}

/**
 * Helper to safely parse Json to expected type
 */
export function parseJson<T>(json: unknown, fallback: T): T {
  if (!json) return fallback;
  try {
    if (typeof json === 'string') {
      return JSON.parse(json) as T;
    }
    return json as T;
  } catch {
    return fallback;
  }
}
