import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import KeyboardShortcutsModal from './KeyboardShortcutsModal';

describe('KeyboardShortcutsModal', () => {
  it('não deve renderizar quando open for false', () => {
    render(<KeyboardShortcutsModal open={false} onClose={() => {}} />);
    expect(screen.queryByText('Atalhos de Teclado')).not.toBeInTheDocument();
  });

  it('deve renderizar o título e os atalhos de navegação e ações quando open for true', () => {
    render(<KeyboardShortcutsModal open={true} onClose={() => {}} />);
    expect(screen.getByText('Atalhos de Teclado')).toBeInTheDocument();
    expect(screen.getByText('Navegação Rápida')).toBeInTheDocument();
    expect(screen.getByText('Ações & Produtividade')).toBeInTheDocument();

    // Verifica algumas teclas chaves
    expect(screen.getByText('Ir para o Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Novo lançamento financeiro')).toBeInTheDocument();
    expect(screen.getByText('Focar na barra de busca (Extrato)')).toBeInTheDocument();
  });

  it('deve chamar onClose ao clicar no botão fechar do modal', () => {
    const handleClose = vi.fn();
    render(<KeyboardShortcutsModal open={true} onClose={handleClose} />);

    const closeBtn = screen.getByRole('button', { name: /fechar/i });
    fireEvent.click(closeBtn);

    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
