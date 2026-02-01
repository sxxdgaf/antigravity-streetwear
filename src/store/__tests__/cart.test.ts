import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCartStore } from '@/store/cart';

// Reset store before each test
beforeEach(() => {
  useCartStore.setState({ items: [] });
});

describe('Cart Store', () => {
  const mockProduct = {
    productId: 'prod-1',
    variantId: 'var-1',
    name: 'Test Hoodie',
    slug: 'test-hoodie',
    image: '/test-image.jpg',
    price: 4999,
    quantity: 1,
    size: 'M',
    color: 'Black',
    maxQuantity: 10,
  };

  describe('addItem', () => {
    it('should add a new item to cart', () => {
      const { result } = renderHook(() => useCartStore());

      act(() => {
        result.current.addItem(mockProduct);
      });

      expect(result.current.items).toHaveLength(1);
      expect(result.current.items[0]).toEqual(mockProduct);
    });

    it('should increase quantity if item already exists', () => {
      const { result } = renderHook(() => useCartStore());

      act(() => {
        result.current.addItem(mockProduct);
        result.current.addItem(mockProduct);
      });

      expect(result.current.items).toHaveLength(1);
      expect(result.current.items[0].quantity).toBe(2);
    });

    it('should not exceed max quantity', () => {
      const { result } = renderHook(() => useCartStore());

      act(() => {
        result.current.addItem({ ...mockProduct, quantity: 10 });
        result.current.addItem(mockProduct);
      });

      expect(result.current.items[0].quantity).toBe(10);
    });
  });

  describe('removeItem', () => {
    it('should remove item from cart', () => {
      const { result } = renderHook(() => useCartStore());

      act(() => {
        result.current.addItem(mockProduct);
        result.current.removeItem(mockProduct.variantId);
      });

      expect(result.current.items).toHaveLength(0);
    });
  });

  describe('updateQuantity', () => {
    it('should update item quantity', () => {
      const { result } = renderHook(() => useCartStore());

      act(() => {
        result.current.addItem(mockProduct);
        result.current.updateQuantity(mockProduct.variantId, 5);
      });

      expect(result.current.items[0].quantity).toBe(5);
    });

    it('should remove item if quantity is 0', () => {
      const { result } = renderHook(() => useCartStore());

      act(() => {
        result.current.addItem(mockProduct);
        result.current.updateQuantity(mockProduct.variantId, 0);
      });

      expect(result.current.items).toHaveLength(0);
    });
  });

  describe('clearCart', () => {
    it('should remove all items from cart', () => {
      const { result } = renderHook(() => useCartStore());

      act(() => {
        result.current.addItem(mockProduct);
        result.current.addItem({ ...mockProduct, variantId: 'var-2' });
        result.current.clearCart();
      });

      expect(result.current.items).toHaveLength(0);
    });
  });

  describe('computed values', () => {
    it('should calculate total items correctly', () => {
      const { result } = renderHook(() => useCartStore());

      act(() => {
        result.current.addItem({ ...mockProduct, quantity: 2 });
        result.current.addItem({ ...mockProduct, variantId: 'var-2', quantity: 3 });
      });

      expect(result.current.totalItems).toBe(5);
    });

    it('should calculate subtotal correctly', () => {
      const { result } = renderHook(() => useCartStore());

      act(() => {
        result.current.addItem({ ...mockProduct, quantity: 2, price: 1000 });
        result.current.addItem({ ...mockProduct, variantId: 'var-2', quantity: 1, price: 500 });
      });

      expect(result.current.subtotal).toBe(2500);
    });
  });
});
