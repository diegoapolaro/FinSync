import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Dialog } from './dialog';

describe('Dialog', () => {
  it('deve chamar onOpenChange(false) ao clicar no backdrop (overlay)', () => {
    const onOpenChange = vi.fn();
    const { container } = render(
      <Dialog open onOpenChange={onOpenChange}>
        <div>Conteúdo do modal</div>
      </Dialog>,
    );

    const overlay = container.firstChild as HTMLElement;
    fireEvent.click(overlay);

    expect(onOpenChange).toHaveBeenCalledTimes(1);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('NÃO deve chamar onOpenChange ao clicar dentro do painel', () => {
    const onOpenChange = vi.fn();
    render(
      <Dialog open onOpenChange={onOpenChange}>
        <button type="button">Botão interno</button>
      </Dialog>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Botão interno' }));

    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it('o painel deve possuir classes de scroll para conteúdos altos', () => {
    const { container } = render(
      <Dialog open onOpenChange={vi.fn()}>
        <div>Conteúdo alto</div>
      </Dialog>,
    );

    const painel = screen.getByRole('dialog');
    expect(painel.className).toContain('max-h-[calc(100vh-2rem)]');
    expect(painel.className).toContain('overflow-y-auto');
    expect(container.firstChild).not.toBe(painel);
  });
});
