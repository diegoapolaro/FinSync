import { describe, it, expect } from 'vitest';
import { formatCurrency, formatDisplayDate } from './formatters';

describe('formatCurrency', () => {
  it('formats number as BRL currency', () => {
    const result = formatCurrency(1234.56);
    expect(result).toMatch(/1\.234,56/);
    expect(result).toContain('R$');
  });

  it('handles zero', () => {
    expect(formatCurrency(0)).toContain('0,00');
  });

  it('handles null/undefined', () => {
    expect(formatCurrency(null)).toContain('0,00');
    expect(formatCurrency(undefined)).toContain('0,00');
  });
});

describe('formatDisplayDate', () => {
  it('formats ISO date string', () => {
    const result = formatDisplayDate('2026-07-08');
    expect(result).toContain('08');
    expect(result).toContain('2026');
  });

  it('returns empty string for falsy input', () => {
    expect(formatDisplayDate('')).toBe('');
    expect(formatDisplayDate(null)).toBe('');
    expect(formatDisplayDate(undefined)).toBe('');
  });
});
