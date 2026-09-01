import { describe, it, expect } from 'vitest';
import {
  formatCurrency,
  formatDisplayDate,
  formatPeriodoLabel,
  formatCurrencyInput,
  parseCurrencyInput,
} from './formatters';

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

describe('formatCurrencyInput', () => {
  it('formata números menores que 1000 sem pontuação', () => {
    expect(formatCurrencyInput('5')).toBe('5');
    expect(formatCurrencyInput('99')).toBe('99');
    expect(formatCurrencyInput('999')).toBe('999');
  });

  it('adiciona ponto automaticamente na casa dos milhares e milhões', () => {
    expect(formatCurrencyInput('1000')).toBe('1.000');
    expect(formatCurrencyInput('1250')).toBe('1.250');
    expect(formatCurrencyInput('10000')).toBe('10.000');
    expect(formatCurrencyInput('100000')).toBe('100.000');
    expect(formatCurrencyInput('1000000')).toBe('1.000.000');
  });

  it('mantém vírgula e casas decimais durante a digitação', () => {
    expect(formatCurrencyInput('1000,')).toBe('1.000,');
    expect(formatCurrencyInput('1000,5')).toBe('1.000,5');
    expect(formatCurrencyInput('1000,50')).toBe('1.000,50');
  });

  it('limita as casas decimais em no máximo 2', () => {
    expect(formatCurrencyInput('1000,555')).toBe('1.000,55');
  });

  it('trata valores que iniciam com vírgula ou zeros à esquerda', () => {
    expect(formatCurrencyInput(',50')).toBe('0,50');
    expect(formatCurrencyInput('05')).toBe('5');
    expect(formatCurrencyInput('0')).toBe('0');
  });

  it('formata números numéricos passados como argumento', () => {
    expect(formatCurrencyInput(1000)).toBe('1.000');
    expect(formatCurrencyInput(1250.5)).toBe('1.250,5');
  });

  it('lida com entradas vazias e nulas', () => {
    expect(formatCurrencyInput('')).toBe('');
    expect(formatCurrencyInput(null)).toBe('');
    expect(formatCurrencyInput(undefined)).toBe('');
  });
});

describe('parseCurrencyInput', () => {
  it('converte string formatada com milhar e centavos para float seguro', () => {
    expect(parseCurrencyInput('1.000,50')).toBe(1000.5);
    expect(parseCurrencyInput('1.000')).toBe(1000);
    expect(parseCurrencyInput('1.000.000,00')).toBe(1000000);
    expect(parseCurrencyInput('95,00')).toBe(95);
    expect(parseCurrencyInput('0,50')).toBe(0.5);
  });

  it('lida com valores numéricos ou vazios', () => {
    expect(parseCurrencyInput(1000)).toBe(1000);
    expect(parseCurrencyInput('')).toBe(0);
    expect(parseCurrencyInput(null)).toBe(0);
    expect(parseCurrencyInput(undefined)).toBe(0);
  });
});
