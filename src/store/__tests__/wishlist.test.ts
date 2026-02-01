import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useWishlistStore } from '@/store/wishlist';

// Reset store before each test
beforeEach(() => {
  useWishlistStore.setState({ items: [] });
});

describe('Wishlist Store', () => {
  const mockProduct = {
    id: 'prod-1',
    name: 'Test Hoodie',
    slug: 'test-hoodie',
    image: '/test-image.jpg',
    price: 4999,
  };

  describe('addItem', () => {
    it('should add a new item to wishlist', () => {
      const { result } = renderHook(() => useWishlistStore());

      act(() => {
        result.current.addItem(mockProduct);
      });

      expect(result.current.items).toHaveLength(1);
      expect(result.current.items[0]).toEqual(mockProduct);
    });

    it('should not add duplicate items', () => {
      const { result } = renderHook(() => useWishlistStore());

      act(() => {
        result.current.addItem(mockProduct);
        result.current.addItem(mockProduct);
      });

      expect(result.current.items).toHaveLength(1);
    });
  });

  describe('removeItem', () => {
    it('should remove item from wishlist', () => {
      const { result } = renderHook(() => useWishlistStore());

      act(() => {
        result.current.addItem(mockProduct);
        result.current.removeItem(mockProduct.id);
      });

      expect(result.current.items).toHaveLength(0);
    });
  });

  describe('toggleItem', () => {
    it('should add item if not in wishlist', () => {
      const { result } = renderHook(() => useWishlistStore());

      act(() => {
        result.current.toggleItem(mockProduct);
      });

      expect(result.current.items).toHaveLength(1);
    });

    it('should remove item if already in wishlist', () => {
      const { result } = renderHook(() => useWishlistStore());

      act(() => {
        result.current.addItem(mockProduct);
        result.current.toggleItem(mockProduct);
      });

      expect(result.current.items).toHaveLength(0);
    });
  });

  describe('isInWishlist', () => {
    it('should return true if item is in wishlist', () => {
      const { result } = renderHook(() => useWishlistStore());

      act(() => {
        result.current.addItem(mockProduct);
      });

      expect(result.current.isInWishlist(mockProduct.id)).toBe(true);
    });

    it('should return false if item is not in wishlist', () => {
      const { result } = renderHook(() => useWishlistStore());

      expect(result.current.isInWishlist('non-existent')).toBe(false);
    });
  });

  describe('clearWishlist', () => {
    it('should remove all items from wishlist', () => {
      const { result } = renderHook(() => useWishlistStore());

      act(() => {
        result.current.addItem(mockProduct);
        result.current.addItem({ ...mockProduct, id: 'prod-2' });
        result.current.clearWishlist();
      });

      expect(result.current.items).toHaveLength(0);
    });
  });
});
