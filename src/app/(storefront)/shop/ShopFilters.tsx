'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { ChevronDown, X, SlidersHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface ShopFiltersProps {
  categories: { id: string; name: string; slug: string }[];
  currentParams: {
    category?: string;
    sort?: string;
    filter?: string;
    minPrice?: string;
    maxPrice?: string;
    size?: string;
    color?: string;
  };
}

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const COLORS = [
  { name: 'Black', value: 'black', hex: '#000000' },
  { name: 'White', value: 'white', hex: '#FFFFFF' },
  { name: 'Grey', value: 'grey', hex: '#6B7280' },
  { name: 'Navy', value: 'navy', hex: '#1E3A5F' },
  { name: 'Olive', value: 'olive', hex: '#556B2F' },
  { name: 'Sand', value: 'sand', hex: '#C2B280' },
];

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'name-asc', label: 'Name: A to Z' },
  { value: 'name-desc', label: 'Name: Z to A' },
];

const FILTER_OPTIONS = [
  { value: 'new', label: 'New Arrivals' },
  { value: 'featured', label: 'Featured' },
  { value: 'sale', label: 'On Sale' },
];

const PRICE_RANGES = [
  { min: 0, max: 3000, label: 'Under PKR 3,000' },
  { min: 3000, max: 5000, label: 'PKR 3,000 - 5,000' },
  { min: 5000, max: 10000, label: 'PKR 5,000 - 10,000' },
  { min: 10000, max: 999999, label: 'Over PKR 10,000' },
];

export function ShopFilters({ categories, currentParams }: ShopFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [openSections, setOpenSections] = useState({
    category: true,
    price: true,
    size: false,
    color: false,
  });

  const updateParams = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (value === null || value === '') {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    
    // Reset page when filters change
    if (key !== 'page') {
      params.delete('page');
    }

    router.push(`${pathname}?${params.toString()}`);
  };

  const clearAllFilters = () => {
    router.push(pathname);
  };

  const hasActiveFilters = Object.keys(currentParams).some(
    (key) => key !== 'sort' && currentParams[key as keyof typeof currentParams]
  );

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Active Filters */}
      {hasActiveFilters && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-brand-black">Active Filters</span>
            <button
              onClick={clearAllFilters}
              className="text-xs text-brand-grey-500 hover:text-brand-black"
            >
              Clear All
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {currentParams.category && (
              <FilterTag
                label={categories.find((c) => c.slug === currentParams.category)?.name || currentParams.category}
                onRemove={() => updateParams('category', null)}
              />
            )}
            {currentParams.filter && (
              <FilterTag
                label={FILTER_OPTIONS.find((f) => f.value === currentParams.filter)?.label || currentParams.filter}
                onRemove={() => updateParams('filter', null)}
              />
            )}
            {currentParams.size && (
              <FilterTag
                label={`Size: ${currentParams.size}`}
                onRemove={() => updateParams('size', null)}
              />
            )}
            {currentParams.color && (
              <FilterTag
                label={`Color: ${currentParams.color}`}
                onRemove={() => updateParams('color', null)}
              />
            )}
            {(currentParams.minPrice || currentParams.maxPrice) && (
              <FilterTag
                label={`Price: ${currentParams.minPrice || '0'} - ${currentParams.maxPrice || '∞'}`}
                onRemove={() => {
                  updateParams('minPrice', null);
                  updateParams('maxPrice', null);
                }}
              />
            )}
          </div>
        </div>
      )}

      {/* Sort (Mobile) */}
      <div className="lg:hidden">
        <label className="text-sm font-medium text-brand-black mb-2 block">Sort By</label>
        <select
          value={currentParams.sort || 'newest'}
          onChange={(e) => updateParams('sort', e.target.value)}
          className="w-full px-3 py-2 border border-brand-grey-200 rounded-lg text-sm"
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Filter By */}
      <FilterSection title="Filter By" isOpen={true}>
        <div className="space-y-2">
          {FILTER_OPTIONS.map((option) => (
            <label key={option.value} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="filter"
                checked={currentParams.filter === option.value}
                onChange={() => updateParams('filter', option.value)}
                className="w-4 h-4 text-brand-black border-brand-grey-300 focus:ring-brand-black"
              />
              <span className="text-sm text-brand-grey-700">{option.label}</span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Categories */}
      <FilterSection
        title="Category"
        isOpen={openSections.category}
        onToggle={() => toggleSection('category')}
      >
        <div className="space-y-2">
          {categories.map((category) => (
            <label key={category.id} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="category"
                checked={currentParams.category === category.slug}
                onChange={() => updateParams('category', category.slug)}
                className="w-4 h-4 text-brand-black border-brand-grey-300 focus:ring-brand-black"
              />
              <span className="text-sm text-brand-grey-700">{category.name}</span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Price Range */}
      <FilterSection
        title="Price"
        isOpen={openSections.price}
        onToggle={() => toggleSection('price')}
      >
        <div className="space-y-2">
          {PRICE_RANGES.map((range, index) => (
            <label key={index} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="price"
                checked={
                  currentParams.minPrice === String(range.min) &&
                  currentParams.maxPrice === String(range.max)
                }
                onChange={() => {
                  updateParams('minPrice', String(range.min));
                  updateParams('maxPrice', String(range.max));
                }}
                className="w-4 h-4 text-brand-black border-brand-grey-300 focus:ring-brand-black"
              />
              <span className="text-sm text-brand-grey-700">{range.label}</span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Sizes */}
      <FilterSection
        title="Size"
        isOpen={openSections.size}
        onToggle={() => toggleSection('size')}
      >
        <div className="flex flex-wrap gap-2">
          {SIZES.map((size) => (
            <button
              key={size}
              onClick={() => updateParams('size', currentParams.size === size ? null : size)}
              className={cn(
                'px-3 py-1.5 text-sm border rounded-lg transition-colors',
                currentParams.size === size
                  ? 'bg-brand-black text-white border-brand-black'
                  : 'border-brand-grey-200 text-brand-grey-700 hover:border-brand-grey-300'
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
        isOpen={openSections.color}
        onToggle={() => toggleSection('color')}
      >
        <div className="flex flex-wrap gap-2">
          {COLORS.map((color) => (
            <button
              key={color.value}
              onClick={() => updateParams('color', currentParams.color === color.value ? null : color.value)}
              className={cn(
                'w-8 h-8 rounded-full border-2 transition-all',
                currentParams.color === color.value
                  ? 'ring-2 ring-brand-black ring-offset-2'
                  : 'hover:scale-110',
                color.value === 'white' && 'border-brand-grey-200'
              )}
              style={{ backgroundColor: color.hex }}
              title={color.name}
            />
          ))}
        </div>
      </FilterSection>
    </div>
  );

  return (
    <>
      {/* Desktop Filters */}
      <div className="hidden lg:block sticky top-32">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-semibold text-brand-black">Filters</h2>
          <select
            value={currentParams.sort || 'newest'}
            onChange={(e) => updateParams('sort', e.target.value)}
            className="px-3 py-1.5 text-sm border border-brand-grey-200 rounded-lg bg-white"
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

      {/* Mobile Filter Button */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="lg:hidden flex items-center gap-2 w-full py-3 px-4 bg-brand-grey-100 rounded-lg text-sm font-medium"
      >
        <SlidersHorizontal className="w-4 h-4" />
        Filters & Sort
        {hasActiveFilters && (
          <span className="ml-auto w-5 h-5 bg-brand-black text-white text-xs rounded-full flex items-center justify-center">
            {Object.values(currentParams).filter(Boolean).length}
          </span>
        )}
      </button>

      {/* Mobile Filter Drawer */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 lg:hidden"
          >
            <div
              className="absolute inset-0 bg-black/50"
              onClick={() => setIsMobileOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="absolute top-0 right-0 bottom-0 w-80 max-w-[85vw] bg-white shadow-xl overflow-y-auto"
            >
              <div className="sticky top-0 bg-white border-b border-brand-grey-200 p-4 flex items-center justify-between">
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
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function FilterSection({
  title,
  isOpen,
  onToggle,
  children,
}: {
  title: string;
  isOpen: boolean;
  onToggle?: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="border-b border-brand-grey-200 pb-4">
      <button
        onClick={onToggle}
        className="flex items-center justify-between w-full py-2 text-sm font-medium text-brand-black"
        disabled={!onToggle}
      >
        {title}
        {onToggle && (
          <ChevronDown
            className={cn('w-4 h-4 transition-transform', isOpen && 'rotate-180')}
          />
        )}
      </button>
      {isOpen && <div className="pt-2">{children}</div>}
    </div>
  );
}

function FilterTag({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-1 bg-brand-grey-100 rounded-lg text-xs">
      {label}
      <button onClick={onRemove} className="hover:text-red-500">
        <X className="w-3 h-3" />
      </button>
    </span>
  );
}
