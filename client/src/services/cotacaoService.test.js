import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  COTACAO_PADRAO,
  carregarCotacoesCache,
  getCotacao,
  converterDeBRL,
  converterParaBRL,
  setCotacoesManual,
  buscarCotacoesAoVivo,
} from './cotacaoService';

describe('cotacaoService', () => {
  beforeEach(() => {
    localStorage.clear();
    setCotacoesManual({ USD: 5.5, EUR: 6.0 });
  });

  it('deve converter 55.000 reais para aproximadamente 10.000 dólares com taxa 5.5', () => {
    const convertidoUSD = converterDeBRL(55000, 'US Dollar (USD - $)');
    expect(convertidoUSD).toBe(10000);
  });

  it('deve converter 55.000 reais para euros com taxa 6.0', () => {
    const convertidoEUR = converterDeBRL(55000, 'Euro (EUR - €)');
    expect(convertidoEUR).toBeCloseTo(9166.67, 1);
  });

  it('não deve alterar valor se a moeda for Real Brasileiro', () => {
    expect(converterDeBRL(55000, 'Real Brasileiro (BRL - R$)')).toBe(55000);
    expect(converterParaBRL(55000, 'Real Brasileiro (BRL - R$)')).toBe(55000);
  });

  it('deve converter de volta para BRL corretamente', () => {
    const valorEmBRL = converterParaBRL(10000, 'US Dollar (USD - $)');
    expect(valorEmBRL).toBe(55000);
  });

  it('deve lidar com valores falsy ou zero', () => {
    expect(converterDeBRL(0, 'US Dollar (USD - $)')).toBe(0);
    expect(converterDeBRL(null, 'US Dollar (USD - $)')).toBe(0);
    expect(converterParaBRL(0, 'US Dollar (USD - $)')).toBe(0);
  });

  it('deve persistir cotações manuais no localStorage', () => {
    setCotacoesManual({ USD: 5.0, EUR: 5.8 });
    expect(getCotacao('US Dollar (USD - $)')).toBe(5.0);
    expect(converterDeBRL(50000, 'US Dollar (USD - $)')).toBe(10000);
  });

  it('deve utilizar fallback caso a API falhe', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));
    const cotacoes = await buscarCotacoesAoVivo();
    expect(cotacoes.USD).toBeDefined();
    expect(cotacoes.EUR).toBeDefined();
  });
});
