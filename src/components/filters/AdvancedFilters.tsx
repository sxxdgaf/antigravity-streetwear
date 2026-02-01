'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { formatPrice } from '@/lib/formatting';
import { ChevronDown, X, SlidersHorizontal } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

interface FilterState {
  category: string | null;
  minPrice: number | null;
  maxPrice: number | null;
  sizes: string[];
  colors: string[];
  sort: string;
}

interface AdvancedFiltersProps {
  categories?: FilterOption[];
  sizes?: string[];
  colors?: string[];
  priceRange?: { min: number; max: number };
  productCount?: number;
}

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'name-asc', label: 'Name: A to Z' },
  { value: 'name-desc', label: 'Name: Z to A' },
];

const DEFAULT_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const DEFAULT_COLORS = ['Black', 'White', 'Grey', 'Navy', 'Olive', 'Beige'];

export function AdvancedFilters({
  categories = [],
  sizes = DEFAULT_SIZES,
  colors = DEFAULT_COLORS,
  priceRange = { min: 0, max: 20000 },
  productCount = 0,
}: AdvancedFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<string[]>([
    'category',
    'price',
    'size',
    'color',
  ]);

  // Parse current filters from URL
  const [filters, setFilters] = useState<FilterState>(() => ({
    category: searchParams.get('category'),
    minPrice: searchParams.get('minPrice') ? parseInt(searchParams.get('minPrice')!) : null,
    maxPrice: searchParams.get('maxPrice') ? parseInt(searchParams.get('maxPrice')!) : null,
    sizes: searchParams.get('sizes')?.split(',').filter(Boolean) || [],
    colors: searchParams.get('colors')?.split(',').filter(Boolean) || [],
    sort: searchParams.get('sort') || 'newest',
  }));

  // Price range slider state
  const [priceValues, setPriceValues] = useState({
    min: filters.minPrice || priceRange.min,
    max: filters.maxPrice || priceRange.max,
  });

  // Update URL when filters change
  const updateURL = useCallback(
    (newFilters: FilterState) => {
      const params = new URLSearchParams(searchParams.toString());

      // Preserve search query
      const query = params.get('q');

      // Clear existing filter params
      params.delete('category');
      params.delete('minPrice');
      params.delete('maxPrice');
      params.delete('sizes');
      params.delete('colors');
      params.delete('sort');
      params.delete('page'); // Reset pagination

      // Add new filters
      if (newFilters.category) params.set('category', newFilters.category);
      if (newFilters.minPrice) params.set('minPrice', newFilters.minPrice.toString());
      if (newFilters.maxPrice) params.set('maxPrice', newFilters.maxPrice.toString());
      if (newFilters.sizes.length) params.set('sizes', newFilters.sizes.join(','));
      if (newFilters.colors.length) params.set('colors', newFilters.colors.join(','));
      if (newFilters.sort !== 'newest') params.set('sort', newFilters.sort);

      // Restore search query
      if (query) params.set('q', query);

      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  // Handle filter changes
  const handleFilterChange = (key: keyof FilterState, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    updateURL(newFilters);
  };

  // Toggle array filters (sizes, colors)
  const toggleArrayFilter = (key: 'sizes' | 'colors', value: string) => {
    const current = filters[key];
    const newValues = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    handleFilterChange(key, newValues);
  };

  // Apply price filter
  const applyPriceFilter = () => {
    const newFilters = {
      ...filters,
      minPrice: priceValues.min > priceRange.min ? priceValues.min : null,
      maxPrice: priceValues.max < priceRange.max ? priceValues.max : null,
    };
    setFilters(newFilters);
    updateURL(newFilters);
  };

  // Clear all filters
  const clearAllFilters = () => {
    const newFilters: FilterState = {
      category: null,
      minPrice: null,
      maxPrice: null,
      sizes: [],
      colors: [],
      sort: 'newest',
    };
    setFilters(newFilters);
    setPriceValues({ min: priceRange.min, max: priceRange.max });
    updateURL(newFilters);
  };

  // Toggle section expansion
  const toggleSection = (section: string) => {
    setExpandedSections((prev) =>
      prev.includes(section)
        ? prev.filter((s) => s !== section)
        : [...prev, section]
    );
  };

  // Count active filters
  const activeFilterCount =
    (filters.category ? 1 : 0) +
    (filters.minPrice || filters.maxPrice ? 1 : 0) +
    filters.sizes.length +
    filters.colors.length;

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Active Filters */}
      {activeFilterCount > 0 && (
        <div className="pb-4 border-b border-brand-grey-200">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-brand-black">
              Active Filters ({activeFilterCount})
            </span>
            <button
              onClick={clearAllFilters}
              className="text-xs text-brand-grey-500 hover:text-brand-black"
            >
              Clear all
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {filters.category && (
              <FilterTag
                label={filters.category}
                onRemove={() => handleFilterChange('category', null)}
              />
            )}
            {(filters.minPrice || filters.maxPrice) && (
              <FilterTag
                label={`${formatPrice(filters.minPrice || priceRange.min)} - ${formatPrice(
                  filters.maxPrice || priceRange.max
                )}`}
                onRemove={() => {
                  handleFilterChange('minPrice', null);
                  handleFilterChange('maxPrice', null);
                  setPriceValues({ min: priceRange.min, max: priceRange.max });
                }}
              />
            )}
            {filters.sizes.map((size) => (
              <FilterTag
                key={size}
                label={size}
                onRemove={() => toggleArrayFilter('sizes', size)}
              />
            ))}
            {filters.colors.map((color) => (
              <FilterTag
                key={color}
                label={color}
                onRemove={() => toggleArrayFilter('colors', color)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Categories */}
      {categories.length > 0 && (
        <FilterSection
          title="Category"
          isExpanded={expandedSections.includes('category')}
          onToggle={() => toggleSection('category')}
        >
          <div className="space-y-2">
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() =>
                  handleFilterChange(
                    'category',
                    filters.category === cat.value ? null : cat.value
                  )
                }
                className={cn(
                  'flex items-center justify-between w-full py-2 px-3 rounded-lg text-sm transition-colors',
                  filters.category === cat.value
                    ? 'bg-brand-black text-white'
                    : 'hover:bg-brand-grey-50'
                )}
              >
                <span>{cat.label}</span>
                {cat.count !== undefined && (
                  <span className="text-xs opacity-60">({cat.count})</span>
                )}
              </button>
            ))}
          </div>
        </FilterSection>
      )}

      {/* Price Range */}
      <FilterSection
        title="Price"
        isExpanded={expandedSections.includes('price')}
        onToggle={() => toggleSection('price')}
      >
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label className="text-xs text-brand-grey-500 mb-1 block">Min</label>
              <input
                type="number"
                value={priceValues.min}
                onChange={(e) =>
                  setPriceValues((prev) => ({
                    ...prev,
                    min: parseInt(e.target.value) || 0,
                  }))
                }
                className="w-full px-3 py-2 border border-brand-grey-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-black"
              />
            </div>
            <span className="text-brand-grey-400 mt-5">—</span>
            <div className="flex-1">
              <label className="text-xs text-brand-grey-500 mb-1 block">Max</label>
              <input
                type="number"
                value={priceValues.max}
                onChange={(e) =>
                  setPriceValues((prev) => ({
                    ...prev,
                    max: parseInt(e.target.value) || priceRange.max,
                  }))
                }
                className="w-full px-3 py-2 border border-brand-grey-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-black"
              />
            </div>
          </div>
          <button
            onClick={applyPriceFilter}
            className="w-full py-2 bg-brand-grey-100 text-brand-black rounded-lg text-sm font-medium hover:bg-brand-grey-200 transition-colors"
          >
            Apply
          </button>
        </div>
      </FilterSection>

      {/* Sizes */}
      <FilterSection
        title="Size"
        isExpanded={expandedSections.includes('size')}
        onToggle={() => toggleSection('size')}
      >
        <div className="grid grid-cols-3 gap-2">
          {sizes.map((size) => (
            <button
              key={size}
              onClick={() => toggleArrayFilter('sizes', size)}
              className={cn(
                'py-2 px-3 border rounded-lg text-sm font-medium transition-colors',
                filters.sizes.includes(size)
                  ? 'border-brand-black bg-brand-black text-white'
                  : 'border-brand-grey-200 hover:border-brand-grey-300'
              )}
            >
              {size}
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Colors */}
      <FilterSection
        title="Color"
        isExpanded={expandedSections.includes('color')}
        onToggle={() => toggleSection('color')}
      >
        <div className="flex flex-wrap gap-2">
          {colors.map((color) => (
            <button
              key={color}
              onClick={() => toggleArrayFilter('colors', color)}
              className={cn(
                'flex items-center gap-2 py-2 px-3 border rounded-full text-sm transition-colors',
                filters.colors.includes(color)
                  ? 'border-brand-black bg-brand-black text-white'
                  : 'border-brand-grey-200 hover:border-brand-grey-300'
              )}
            >
              <span
                className="w-4 h-4 rounded-full border border-brand-grey-200"
                style={{ backgroundColor: getColorHex(color) }}
              />
              {color}
            </button>
          ))}
        </div>
      </FilterSection>
    </div>
  );

  return (
    <>
      {/* Mobile Filter Toggle */}
      <div className="lg:hidden mb-4 flex items-center justify-between">
        <button
          onClick={() => setIsMobileOpen(true)}
          className="flex items-center gap-2 px-4 py-2 border border-brand-grey-200 rounded-lg text-sm font-medium"
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filters
          {activeFilterCount > 0 && (
            <span className="ml-1 w-5 h-5 bg-brand-black text-white text-xs rounded-full flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </button>

        {/* Sort Dropdown */}
        <select
          value={filters.sort}
          onChange={(e) => handleFilterChange('sort', e.target.value)}
          className="px-4 py-2 border border-brand-grey-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-black"
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Desktop Filters */}
      <div className="hidden lg:block">
        <div className="flex items-center justify-between mb-6">
          <span className="text-sm text-brand-grey-500">
            {productCount} {productCount === 1 ? 'product' : 'products'}
          </span>
          <select
            value={filters.sort}
            onChange={(e) => handleFilterChange('sort', e.target.value)}
            className="px-4 py-2 border border-brand-grey-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-black"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <FilterContent />
      </div>

      {/* Mobile Filter Drawer */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileOpen(false)}
              className="fixed inset-0 bg-black/50 z-50 lg:hidden"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween' }}
              className="fixed left-0 top-0 bottom-0 w-80 max-w-[85vw] bg-white z-50 lg:hidden overflow-y-auto"
            >
              <div className="sticky top-0 bg-white px-4 py-4 border-b border-brand-grey-200 flex items-center justify-between">
                <h2 className="font-semibold text-brand-black">Filters</h2>
                <button
                  onClick={() => setIsMobileOpen(false)}
                  className="p-2 hover:bg-brand-grey-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-4">
                <FilterContent />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

// Filter Section Component
function FilterSection({
  title,
  isExpanded,
  onToggle,
  children,
}: {
  title: string;
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="border-b border-brand-grey-200 pb-4">
      <button
        onClick={onToggle}
        className="flex items-center justify-between w-full py-2 font-medium text-brand-black"
      >
        {title}
        <ChevronDown
          className={cn(
            'w-4 h-4 transition-transform',
            isExpanded && 'rotate-180'
          )}
        />
      </button>
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="pt-2">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Filter Tag Component
function FilterTag({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-1 bg-brand-grey-100 rounded-full text-sm">
      {label}
      <button
        onClick={onRemove}
        className="p-0.5 hover:bg-brand-grey-200 rounded-full"
      >
        <X className="w-3 h-3" />
      </button>
    </span>
  );
}

// Helper to get color hex
function getColorHex(color: string): string {
  const colorMap: Record<string, string> = {
    Black: '#000000',
    White: '#FFFFFF',
    Grey: '#808080',
    Navy: '#000080',
    Olive: '#808000',
    Beige: '#F5F5DC',
    Red: '#FF0000',
    Blue: '#0000FF',
    Green: '#008000',
    Brown: '#8B4513',
  };
  return colorMap[color] || '#CCCCCC';
}
