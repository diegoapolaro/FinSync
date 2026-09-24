import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useKeyboardShortcuts } from './useKeyboardShortcuts';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

describe('useKeyboardShortcuts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('deve navegar para /lancamentos ao pressionar "n"', () => {
    renderHook(() => useKeyboardShortcuts());

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'n' }));
    });

    expect(mockNavigate).toHaveBeenCalledWith('/lancamentos');
  });

  it('deve navegar para as páginas corretas com as teclas d, e, r, i, a', () => {
    renderHook(() => useKeyboardShortcuts());

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'd' }));
    });
    expect(mockNavigate).toHaveBeenCalledWith('/');

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'e' }));
    });
    expect(mockNavigate).toHaveBeenCalledWith('/extrato');

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'r' }));
    });
    expect(mockNavigate).toHaveBeenCalledWith('/relatorios');

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'i' }));
    });
    expect(mockNavigate).toHaveBeenCalledWith('/importar');

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'a' }));
    });
    expect(mockNavigate).toHaveBeenCalledWith('/ajustes');
  });

  it('deve chamar onToggleHelp ao pressionar "?"', () => {
    const onToggleHelp = vi.fn();
    renderHook(() => useKeyboardShortcuts({ onToggleHelp }));

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: '?' }));
    });

    expect(onToggleHelp).toHaveBeenCalledTimes(1);
  });

  it('deve chamar onCloseModal ao pressionar "Escape"', () => {
    const onCloseModal = vi.fn();
    renderHook(() => useKeyboardShortcuts({ onCloseModal }));

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    });

    expect(onCloseModal).toHaveBeenCalledTimes(1);
  });

  it('deve focar no campo de busca ao pressionar "/"', () => {
    const searchInput = document.createElement('input');
    searchInput.setAttribute('data-shortcut', 'search');
    const focusSpy = vi.spyOn(searchInput, 'focus');
    document.body.appendChild(searchInput);

    renderHook(() => useKeyboardShortcuts());

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: '/' }));
    });

    expect(focusSpy).toHaveBeenCalledTimes(1);
  });

  it('não deve disparar atalhos de navegação quando o usuário estiver digitando em um input', () => {
    const input = document.createElement('input');
    document.body.appendChild(input);
    input.focus();

    renderHook(() => useKeyboardShortcuts());

    act(() => {
      input.dispatchEvent(new KeyboardEvent('keydown', { key: 'n', bubbles: true }));
    });

    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
