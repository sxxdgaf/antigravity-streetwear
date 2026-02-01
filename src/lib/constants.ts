/**
 * Application Constants
 */

// Site metadata
export const SITE_CONFIG = {
  name: 'ANTIGRAVITY',
  tagline: 'DEFY THE ORDINARY',
  description: 'Premium streetwear for those who reject the ordinary',
  url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  ogImage: '/images/og-image.jpg',
  links: {
    instagram: 'https://instagram.com/antigravity',
    twitter: 'https://twitter.com/antigravity',
    tiktok: 'https://tiktok.com/@antigravity',
  },
};

// Navigation links
export const NAV_LINKS = [
  { label: 'Shop', href: '/shop' },
  { label: 'Lookbook', href: '/lookbook' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
] as const;

// Product categories
export const CATEGORIES = [
  { id: 'hoodies', name: 'Hoodies', slug: 'hoodies' },
  { id: 't-shirts', name: 'T-Shirts', slug: 't-shirts' },
  { id: 'pants', name: 'Pants', slug: 'pants' },
  { id: 'jackets', name: 'Jackets', slug: 'jackets' },
  { id: 'accessories', name: 'Accessories', slug: 'accessories' },
] as const;

// Size options
export const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'One Size'] as const;

// Color options
export const COLORS = [
  { name: 'Black', hex: '#0a0a0a' },
  { name: 'White', hex: '#FAFAFA' },
  { name: 'Charcoal', hex: '#36454F' },
  { name: 'Grey', hex: '#808080' },
  { name: 'Cream', hex: '#FFFDD0' },
  { name: 'Navy', hex: '#1B2838' },
  { name: 'Olive', hex: '#556B2F' },
  { name: 'Washed Black', hex: '#2C2C2C' },
] as const;

// Sort options
export const SORT_OPTIONS = [
  { label: 'Newest', value: 'created_at-desc' },
  { label: 'Price: Low to High', value: 'price-asc' },
  { label: 'Price: High to Low', value: 'price-desc' },
  { label: 'Best Sellers', value: 'sales_count-desc' },
] as const;

// Price ranges for filtering
export const PRICE_RANGES = [
  { label: 'Under ₨5,000', min: 0, max: 5000 },
  { label: '₨5,000 - ₨10,000', min: 5000, max: 10000 },
  { label: '₨10,000 - ₨15,000', min: 10000, max: 15000 },
  { label: '₨15,000+', min: 15000, max: null },
] as const;

// Order statuses with labels and colors
export const ORDER_STATUSES = {
  pending: { label: 'Pending', color: 'yellow' },
  confirmed: { label: 'Confirmed', color: 'blue' },
  processing: { label: 'Processing', color: 'indigo' },
  shipped: { label: 'Shipped', color: 'purple' },
  delivered: { label: 'Delivered', color: 'green' },
  cancelled: { label: 'Cancelled', color: 'red' },
  refunded: { label: 'Refunded', color: 'gray' },
} as const;

// Currency formatting
export const CURRENCY = {
  code: 'PKR',
  symbol: '₨',
  locale: 'en-PK',
};

// Pagination defaults
export const PAGINATION = {
  defaultPageSize: 12,
  pageSizeOptions: [12, 24, 48],
};

// Image placeholders
export const PLACEHOLDER_IMAGE = '/images/placeholder-product.jpg';
export const PLACEHOLDER_AVATAR = '/images/placeholder-avatar.jpg';

// Animation durations (in seconds)
export const ANIMATION = {
  fast: 0.2,
  normal: 0.3,
  slow: 0.5,
  pageTransition: 0.4,
};

// Breakpoints (matching Tailwind)
export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;
