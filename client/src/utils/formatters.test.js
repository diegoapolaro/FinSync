import { describe, it, expect } from 'vitest';
import { formatCurrency, formatDisplayDate, formatPeriodoLabel } from './formatters';

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

describe('formatPeriodoLabel', () => {
  const dataRef = new Date(2026, 7, 3); // 03/08/2026

  it('formats "mes" with capitalized month name', () => {
    const label = formatPeriodoLabel('mes', dataRef, dataRef, dataRef, dataRef);
    expect(label).toBe('Agosto de 2026');
  });

  it('formats "dia" with full date', () => {
    const dia = new Date(2026, 7, 2);
    const label = formatPeriodoLabel('dia', dia, dataRef, dataRef, dataRef);
    expect(label).toBe('02 de agosto de 2026');
  });

  it('formats "periodo" with short range', () => {
    const inicio = new Date(2026, 7, 28);
    const fim = new Date(2026, 8, 5);
    const label = formatPeriodoLabel('periodo', dataRef, inicio, fim, dataRef);
    expect(label).toBe('28 ago - 05 set 2026');
  });
});
