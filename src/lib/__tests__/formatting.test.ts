import { describe, it, expect } from 'vitest';
import { formatPrice, formatDate, pluralize, truncate } from '@/lib/formatting';

describe('Formatting Utilities', () => {
  describe('formatPrice', () => {
    it('should format price in PKR', () => {
      expect(formatPrice(4999)).toContain('4,999');
    });

    it('should handle zero', () => {
      expect(formatPrice(0)).toContain('0');
    });

    it('should handle large numbers', () => {
      expect(formatPrice(1000000)).toContain('1,000,000');
    });
  });

  describe('formatDate', () => {
    it('should format date correctly', () => {
      const date = new Date('2025-01-15');
      const formatted = formatDate(date);
      expect(formatted).toContain('15');
      expect(formatted).toContain('2025');
    });

    it('should handle string dates', () => {
      const formatted = formatDate('2025-01-15');
      expect(formatted).toContain('15');
    });
  });

  describe('pluralize', () => {
    it('should return singular for count of 1', () => {
      expect(pluralize(1, 'item', 'items')).toBe('1 item');
    });

    it('should return plural for count other than 1', () => {
      expect(pluralize(0, 'item', 'items')).toBe('0 items');
      expect(pluralize(2, 'item', 'items')).toBe('2 items');
      expect(pluralize(100, 'item', 'items')).toBe('100 items');
    });
  });

  describe('truncate', () => {
    it('should truncate long strings', () => {
      const text = 'This is a very long string that should be truncated';
      expect(truncate(text, 20)).toBe('This is a very long...');
    });

    it('should not truncate short strings', () => {
      const text = 'Short';
      expect(truncate(text, 20)).toBe('Short');
    });

    it('should handle exact length', () => {
      const text = 'Exactly twenty chars';
      expect(truncate(text, 20)).toBe('Exactly twenty chars');
    });
  });
});
