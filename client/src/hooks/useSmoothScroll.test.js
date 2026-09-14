import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSmoothScroll, getScrollContainer } from './useSmoothScroll';

const mockAnimateFn = vi.fn();

vi.mock('framer-motion', async () => {
  const actual = await vi.importActual('framer-motion');
  return {
    ...actual,
    animate: (...args) => mockAnimateFn(...args),
  };
});

describe('useSmoothScroll hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAnimateFn.mockReturnValue({
      stop: vi.fn(),
    });
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('deve identificar o container com overflow-y-auto', () => {
    const main = document.createElement('main');
    main.className = 'flex-1 overflow-y-auto';
    document.body.appendChild(main);

    const child = document.createElement('div');
    main.appendChild(child);

    const container = getScrollContainer(child);
    expect(container).toBe(main);
  });

  it('deve animar o scroll do container usando framer-motion animate com física spring', () => {
    const main = document.createElement('main');
    main.className = 'overflow-y-auto';
    Object.defineProperty(main, 'scrollHeight', { value: 2000, configurable: true });
    Object.defineProperty(main, 'clientHeight', { value: 800, configurable: true });
    main.scrollTop = 0;
    main.getBoundingClientRect = () => ({ top: 0, bottom: 800 });
    document.body.appendChild(main);

    const section = document.createElement('section');
    section.id = 'categorias';
    section.getBoundingClientRect = () => ({ top: 500, bottom: 900 });
    main.appendChild(section);

    const { result } = renderHook(() => useSmoothScroll());

    act(() => {
      result.current.scrollToElement('categorias', { offset: 28 });
    });

    expect(mockAnimateFn).toHaveBeenCalled();
    const [start, end, options] = mockAnimateFn.mock.calls[0];
    expect(start).toBe(0);
    // target = 0 + (500 - 0) - 28 = 472
    expect(end).toBe(472);
    expect(options.type).toBe('spring');
    expect(options.stiffness).toBe(85);
    expect(options.damping).toBe(20);
  });

  it('deve cancelar animação se o usuário interagir com wheel', () => {
    const mockStop = vi.fn();
    mockAnimateFn.mockReturnValue({
      stop: mockStop,
    });

    const main = document.createElement('main');
    main.className = 'overflow-y-auto';
    Object.defineProperty(main, 'scrollHeight', { value: 2000, configurable: true });
    Object.defineProperty(main, 'clientHeight', { value: 800, configurable: true });
    main.scrollTop = 0;
    main.getBoundingClientRect = () => ({ top: 0, bottom: 800 });
    document.body.appendChild(main);

    const section = document.createElement('section');
    section.id = 'orcamentos';
    section.getBoundingClientRect = () => ({ top: 600, bottom: 1000 });
    main.appendChild(section);

    const { result } = renderHook(() => useSmoothScroll());

    act(() => {
      result.current.scrollToElement('orcamentos');
    });

    // Simular evento wheel do usuário
    act(() => {
      window.dispatchEvent(new Event('wheel'));
    });

    expect(mockStop).toHaveBeenCalled();
  });
});
