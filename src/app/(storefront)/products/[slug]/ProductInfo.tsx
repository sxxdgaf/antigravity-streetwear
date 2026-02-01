'use client';

import { useState } from 'react';
import { ProductWithVariants, ProductVariant } from '@/types';
import { formatPrice } from '@/lib/formatting';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Heart, ShoppingBag, Ruler, Truck, RefreshCw, Shield, Minus, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface ProductInfoProps {
  product: ProductWithVariants;
  variants: ProductVariant[];
}

export function ProductInfo({ product, variants }: ProductInfoProps) {
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [showSizeGuide, setShowSizeGuide] = useState(false);

  // Get unique sizes and colors from variants
  const sizes = [...new Set(variants.map((v) => v.size).filter(Boolean))] as string[];
  const colors = [...new Set(variants.map((v) => v.color).filter(Boolean))] as string[];

  // Find selected variant
  const selectedVariant = variants.find(
    (v) =>
      (!sizes.length || v.size === selectedSize) &&
      (!colors.length || v.color === selectedColor)
  );

  // Check stock
  const isInStock = selectedVariant ? selectedVariant.stock_quantity > 0 : true;
  const stockCount = selectedVariant?.stock_quantity || 0;

  // Calculate price with modifier
  const finalPrice = product.price + (selectedVariant?.price_adjustment || 0);

  const isOnSale = product.compare_at_price && product.compare_at_price > product.price;
  const discountPercent = isOnSale
    ? Math.round((1 - product.price / product.compare_at_price!) * 100)
    : 0;

  const handleAddToCart = () => {
    if (sizes.length && !selectedSize) {
      alert('Please select a size');
      return;
    }
    if (colors.length && !selectedColor) {
      alert('Please select a color');
      return;
    }
    // TODO: Add to cart logic
    console.log('Add to cart:', {
      product,
      variant: selectedVariant,
      quantity,
    });
  };

  return (
    <div className="space-y-6">
      {/* Category & Badges */}
      <div className="flex items-center gap-3">
        {product.category && (
          <span className="text-sm text-brand-grey-500 uppercase tracking-wider">
            {product.category.name}
          </span>
        )}
        <div className="flex gap-2">
          {product.is_new && <Badge variant="accent">New</Badge>}
          {isOnSale && <Badge variant="error">-{discountPercent}%</Badge>}
        </div>
      </div>

      {/* Product Name */}
      <h1 className="text-3xl sm:text-4xl font-display font-bold text-brand-black">
        {product.name}
      </h1>

      {/* Price */}
      <div className="flex items-baseline gap-3">
        <span className="text-2xl font-bold text-brand-black">
          {formatPrice(finalPrice)}
        </span>
        {isOnSale && (
          <span className="text-lg text-brand-grey-400 line-through">
            {formatPrice(product.compare_at_price!)}
          </span>
        )}
      </div>

      {/* Short Description */}
      {product.description && (
        <p className="text-brand-grey-600 leading-relaxed line-clamp-3">
          {product.description}
        </p>
      )}

      {/* Color Selection */}
      {colors.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-brand-black">
              Color: {selectedColor || 'Select'}
            </span>
          </div>
          <div className="flex gap-3">
            {colors.map((color) => {
              const colorHex = getColorHex(color);
              const variant = variants.find((v) => v.color === color);
              const hasStock = variant ? variant.stock_quantity > 0 : true;

              return (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  disabled={!hasStock}
                  className={cn(
                    'w-10 h-10 rounded-full border-2 transition-all relative',
                    selectedColor === color
                      ? 'ring-2 ring-brand-black ring-offset-2'
                      : 'hover:scale-110',
                    color.toLowerCase() === 'white' && 'border-brand-grey-200',
                    !hasStock && 'opacity-50 cursor-not-allowed'
                  )}
                  style={{ backgroundColor: colorHex }}
                  title={color}
                >
                  {!hasStock && (
                    <span className="absolute inset-0 flex items-center justify-center">
                      <span className="w-full h-0.5 bg-red-500 rotate-45 absolute" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Size Selection */}
      {sizes.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-brand-black">
              Size: {selectedSize || 'Select'}
            </span>
            <button
              onClick={() => setShowSizeGuide(true)}
              className="text-sm text-brand-grey-500 hover:text-brand-black flex items-center gap-1"
            >
              <Ruler className="w-4 h-4" />
              Size Guide
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {sizes.map((size) => {
              const variant = variants.find(
                (v) => v.size === size && (!selectedColor || v.color === selectedColor)
              );
              const hasStock = variant ? variant.stock_quantity > 0 : true;

              return (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  disabled={!hasStock}
                  className={cn(
                    'min-w-[48px] px-4 py-2.5 text-sm font-medium border rounded-lg transition-all',
                    selectedSize === size
                      ? 'bg-brand-black text-white border-brand-black'
                      : hasStock
                      ? 'border-brand-grey-200 hover:border-brand-black'
                      : 'border-brand-grey-100 text-brand-grey-300 cursor-not-allowed line-through'
                  )}
                >
                  {size}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Quantity & Add to Cart */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Quantity Selector */}
        <div className="flex items-center border border-brand-grey-200 rounded-lg">
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="p-3 hover:bg-brand-grey-50 transition-colors"
            disabled={quantity <= 1}
          >
            <Minus className="w-4 h-4" />
          </button>
          <span className="w-12 text-center font-medium">{quantity}</span>
          <button
            onClick={() => setQuantity(Math.min(stockCount || 10, quantity + 1))}
            className="p-3 hover:bg-brand-grey-50 transition-colors"
            disabled={quantity >= stockCount}
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Add to Cart Button */}
        <Button
          onClick={handleAddToCart}
          disabled={!isInStock}
          className="flex-1"
          size="lg"
          leftIcon={<ShoppingBag className="w-5 h-5" />}
        >
          {isInStock ? 'Add to Cart' : 'Out of Stock'}
        </Button>

        {/* Wishlist Button */}
        <Button
          variant="outline"
          size="lg"
          className="px-4"
          aria-label="Add to wishlist"
        >
          <Heart className="w-5 h-5" />
        </Button>
      </div>

      {/* Stock Status */}
      {selectedVariant && (
        <p
          className={cn(
            'text-sm',
            stockCount > 10
              ? 'text-green-600'
              : stockCount > 0
              ? 'text-yellow-600'
              : 'text-red-600'
          )}
        >
          {stockCount > 10
            ? 'In Stock'
            : stockCount > 0
            ? `Only ${stockCount} left in stock`
            : 'Out of Stock'}
        </p>
      )}

      {/* Features */}
      <div className="pt-6 border-t border-brand-grey-200 grid grid-cols-3 gap-4">
        <div className="text-center">
          <Truck className="w-6 h-6 mx-auto mb-2 text-brand-grey-600" />
          <p className="text-xs text-brand-grey-500">Free Shipping</p>
        </div>
        <div className="text-center">
          <RefreshCw className="w-6 h-6 mx-auto mb-2 text-brand-grey-600" />
          <p className="text-xs text-brand-grey-500">14-Day Returns</p>
        </div>
        <div className="text-center">
          <Shield className="w-6 h-6 mx-auto mb-2 text-brand-grey-600" />
          <p className="text-xs text-brand-grey-500">Secure Payment</p>
        </div>
      </div>

      {/* Size Guide Modal */}
      <AnimatePresence>
        {showSizeGuide && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={() => setShowSizeGuide(false)}
          >
            <div className="absolute inset-0 bg-black/50" />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-white rounded-xl p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold text-brand-black mb-4">Size Guide</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="py-2 px-3 text-left">Size</th>
                      <th className="py-2 px-3 text-center">Chest (in)</th>
                      <th className="py-2 px-3 text-center">Length (in)</th>
                      <th className="py-2 px-3 text-center">Shoulder (in)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { size: 'XS', chest: '34-36', length: '26', shoulder: '16' },
                      { size: 'S', chest: '36-38', length: '27', shoulder: '17' },
                      { size: 'M', chest: '38-40', length: '28', shoulder: '18' },
                      { size: 'L', chest: '40-42', length: '29', shoulder: '19' },
                      { size: 'XL', chest: '42-44', length: '30', shoulder: '20' },
                      { size: 'XXL', chest: '44-46', length: '31', shoulder: '21' },
                    ].map((row) => (
                      <tr key={row.size} className="border-b">
                        <td className="py-2 px-3 font-medium">{row.size}</td>
                        <td className="py-2 px-3 text-center">{row.chest}</td>
                        <td className="py-2 px-3 text-center">{row.length}</td>
                        <td className="py-2 px-3 text-center">{row.shoulder}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <button
                onClick={() => setShowSizeGuide(false)}
                className="mt-6 w-full py-2 bg-brand-black text-white rounded-lg hover:bg-brand-grey-800"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function getColorHex(colorName: string): string {
  const colorMap: Record<string, string> = {
    black: '#000000',
    white: '#FFFFFF',
    grey: '#6B7280',
    gray: '#6B7280',
    navy: '#1E3A5F',
    olive: '#556B2F',
    sand: '#C2B280',
    burgundy: '#800020',
    cream: '#FFFDD0',
    red: '#DC2626',
    blue: '#2563EB',
    green: '#16A34A',
  };

  return colorMap[colorName.toLowerCase()] || '#6B7280';
}
