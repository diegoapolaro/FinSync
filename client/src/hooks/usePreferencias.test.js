import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import usePreferencias from './usePreferencias';

describe('usePreferencias hook', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('deve inicializar com todas as chaves padrão necessárias', () => {
    const { result } = renderHook(() => usePreferencias());

    expect(result.current.prefs).toEqual({
      formatoData: 'dd/mm/aaaa',
      moeda: 'Real Brasileiro (BRL - R$)',
      idioma: 'Português (Brasil)',
      tema: 'claro',
      lembreteDiario: true,
      alertaSaldoBaixo: false,
      nome: '',
      email: '',
    });
  });

  it('deve atualizar preferências e persistir no localStorage sob finsync_preferencias', () => {
    const { result } = renderHook(() => usePreferencias());

    act(() => {
      result.current.atualizar('idioma', 'English (US)');
      result.current.atualizar('moeda', 'US Dollar (USD - $)');
      result.current.atualizar('lembreteDiario', false);
      result.current.atualizar('alertaSaldoBaixo', true);
    });

    expect(result.current.prefs.idioma).toBe('English (US)');
    expect(result.current.prefs.moeda).toBe('US Dollar (USD - $)');
    expect(result.current.prefs.lembreteDiario).toBe(false);
    expect(result.current.prefs.alertaSaldoBaixo).toBe(true);

    const saved = JSON.parse(localStorage.getItem('finsync_preferencias'));
    expect(saved.idioma).toBe('English (US)');
    expect(saved.moeda).toBe('US Dollar (USD - $)');
    expect(saved.lembreteDiario).toBe(false);
    expect(saved.alertaSaldoBaixo).toBe(true);
  });

  it('deve carregar dados existentes do localStorage mesclados com padrões', () => {
    localStorage.setItem(
      'finsync_preferencias',
      JSON.stringify({
        idioma: 'Español',
        nome: 'Diego',
      })
    );

    const { result } = renderHook(() => usePreferencias());

    expect(result.current.prefs.idioma).toBe('Español');
    expect(result.current.prefs.nome).toBe('Diego');
    expect(result.current.prefs.moeda).toBe('Real Brasileiro (BRL - R$)');
    expect(result.current.prefs.formatoData).toBe('dd/mm/aaaa');
  });
});
