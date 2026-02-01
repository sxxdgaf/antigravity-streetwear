'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { formatPrice } from '@/lib/formatting';
import { Search, X, Clock, TrendingUp, ArrowRight, Loader2, Package } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useDebounce } from '@/hooks/useDebounce';

interface ProductSuggestion {
  type: 'product';
  id: string;
  name: string;
  slug: string;
  price: number;
  image: string | null;
  url: string;
}

interface CategorySuggestion {
  type: 'category';
  id: string;
  name: string;
  slug: string;
  url: string;
}

interface Suggestions {
  products: ProductSuggestion[];
  categories: CategorySuggestion[];
  popular: string[];
}

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SEARCH_HISTORY_KEY = 'antigravity-search-history';
const MAX_HISTORY = 5;

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestions | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  const debouncedQuery = useDebounce(query, 300);

  // Load search history from localStorage
  useEffect(() => {
    const history = localStorage.getItem(SEARCH_HISTORY_KEY);
    if (history) {
      setSearchHistory(JSON.parse(history));
    }
  }, []);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery('');
      setSuggestions(null);
    }
  }, [isOpen]);

  // Fetch suggestions
  useEffect(() => {
    if (debouncedQuery.length < 2) {
      setSuggestions(null);
      return;
    }

    const fetchSuggestions = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `/api/products/suggestions?q=${encodeURIComponent(debouncedQuery)}`
        );
        const data = await response.json();
        setSuggestions(data.suggestions);
      } catch (error) {
        console.error('Failed to fetch suggestions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSuggestions();
  }, [debouncedQuery]);

  // Save to search history
  const saveToHistory = useCallback((term: string) => {
    const newHistory = [term, ...searchHistory.filter((h) => h !== term)].slice(
      0,
      MAX_HISTORY
    );
    setSearchHistory(newHistory);
    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(newHistory));
  }, [searchHistory]);

  // Clear search history
  const clearHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem(SEARCH_HISTORY_KEY);
  };

  // Handle search submit
  const handleSearch = (searchQuery: string = query) => {
    if (searchQuery.trim()) {
      saveToHistory(searchQuery.trim());
      router.push(`/shop?q=${encodeURIComponent(searchQuery.trim())}`);
      onClose();
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  const hasResults =
    suggestions &&
    (suggestions.products.length > 0 ||
      suggestions.categories.length > 0 ||
      suggestions.popular.length > 0);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-0 left-0 right-0 z-50 p-4 sm:p-8"
          >
            <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden">
              {/* Search Input */}
              <div className="relative flex items-center border-b border-brand-grey-200">
                <Search className="absolute left-4 w-5 h-5 text-brand-grey-400" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Search products, categories..."
                  className="w-full pl-12 pr-12 py-4 text-lg focus:outline-none"
                />
                {isLoading && (
                  <Loader2 className="absolute right-12 w-5 h-5 text-brand-grey-400 animate-spin" />
                )}
                <button
                  onClick={onClose}
                  className="absolute right-4 p-1 hover:bg-brand-grey-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-brand-grey-500" />
                </button>
              </div>

              {/* Results Container */}
              <div className="max-h-[60vh] overflow-y-auto">
                {/* Search History (when no query) */}
                {!query && searchHistory.length > 0 && (
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-brand-grey-500">
                        Recent Searches
                      </span>
                      <button
                        onClick={clearHistory}
                        className="text-xs text-brand-grey-400 hover:text-brand-black"
                      >
                        Clear all
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {searchHistory.map((term, i) => (
                        <button
                          key={i}
                          onClick={() => handleSearch(term)}
                          className="flex items-center gap-2 px-3 py-1.5 bg-brand-grey-50 rounded-full text-sm text-brand-grey-600 hover:bg-brand-grey-100 transition-colors"
                        >
                          <Clock className="w-3.5 h-3.5" />
                          {term}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Trending Searches (when no query) */}
                {!query && (
                  <div className="p-4 border-t border-brand-grey-100">
                    <span className="text-sm font-medium text-brand-grey-500 mb-3 block">
                      Trending
                    </span>
                    <div className="space-y-2">
                      {['Oversized Hoodie', 'Cargo Pants', 'Streetwear', 'New Arrivals'].map(
                        (term, i) => (
                          <button
                            key={i}
                            onClick={() => handleSearch(term)}
                            className="flex items-center gap-3 w-full p-2 hover:bg-brand-grey-50 rounded-lg transition-colors"
                          >
                            <TrendingUp className="w-4 h-4 text-brand-accent" />
                            <span className="text-brand-black">{term}</span>
                          </button>
                        )
                      )}
                    </div>
                  </div>
                )}

                {/* Suggestions */}
                {query && hasResults && (
                  <>
                    {/* Category Suggestions */}
                    {suggestions.categories.length > 0 && (
                      <div className="p-4 border-b border-brand-grey-100">
                        <span className="text-sm font-medium text-brand-grey-500 mb-2 block">
                          Categories
                        </span>
                        <div className="space-y-1">
                          {suggestions.categories.map((cat) => (
                            <Link
                              key={cat.id}
                              href={cat.url}
                              onClick={onClose}
                              className="flex items-center justify-between p-2 hover:bg-brand-grey-50 rounded-lg transition-colors"
                            >
                              <span className="font-medium text-brand-black">
                                {cat.name}
                              </span>
                              <ArrowRight className="w-4 h-4 text-brand-grey-400" />
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Product Suggestions */}
                    {suggestions.products.length > 0 && (
                      <div className="p-4">
                        <span className="text-sm font-medium text-brand-grey-500 mb-2 block">
                          Products
                        </span>
                        <div className="space-y-2">
                          {suggestions.products.map((product) => (
                            <Link
                              key={product.id}
                              href={product.url}
                              onClick={onClose}
                              className="flex items-center gap-4 p-2 hover:bg-brand-grey-50 rounded-lg transition-colors"
                            >
                              <div className="relative w-14 h-14 bg-brand-grey-100 rounded-lg overflow-hidden shrink-0">
                                {product.image ? (
                                  <Image
                                    src={product.image}
                                    alt={product.name}
                                    fill
                                    className="object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <Package className="w-6 h-6 text-brand-grey-300" />
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-brand-black line-clamp-1">
                                  {product.name}
                                </div>
                                <div className="text-sm text-brand-grey-500">
                                  {formatPrice(product.price)}
                                </div>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* View All Results */}
                    <div className="p-4 border-t border-brand-grey-100">
                      <button
                        onClick={() => handleSearch()}
                        className="w-full py-3 bg-brand-black text-white rounded-lg font-medium hover:bg-brand-grey-800 transition-colors"
                      >
                        View all results for "{query}"
                      </button>
                    </div>
                  </>
                )}

                {/* No Results */}
                {query && debouncedQuery.length >= 2 && !isLoading && !hasResults && (
                  <div className="p-8 text-center">
                    <Search className="w-12 h-12 mx-auto text-brand-grey-300 mb-4" />
                    <p className="text-brand-grey-600 mb-2">
                      No results found for "{query}"
                    </p>
                    <p className="text-sm text-brand-grey-400">
                      Try different keywords or browse our categories
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
