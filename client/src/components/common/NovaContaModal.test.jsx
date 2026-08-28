import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import NovaContaModal from './NovaContaModal';
import { ToastProvider } from '../../contexts/ToastContext';
import * as api from '../../services/api';

vi.mock('../../services/api', () => ({
  createConta: vi.fn(),
}));

describe('NovaContaModal.jsx', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('não deve renderizar quando open for false', () => {
    render(
      <ToastProvider>
        <NovaContaModal open={false} onOpenChange={() => {}} onContaCriada={() => {}} />
      </ToastProvider>,
    );

    expect(screen.queryByText('Nova Conta ou Livro')).not.toBeInTheDocument();
  });

  it('deve renderizar campos e permitir alternar entre tipo Pessoal e Comercial', () => {
    render(
      <ToastProvider>
        <NovaContaModal open={true} onOpenChange={() => {}} onContaCriada={() => {}} />
      </ToastProvider>,
    );

    expect(screen.getByText('Nova Conta ou Livro')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Ex: Pessoal, Pizzaria/i)).toBeInTheDocument();

    const btnPessoal = screen.getByRole('button', { name: /Pessoal Gastos do dia a dia/i });
    const btnComercial = screen.getByRole('button', { name: /Comercial Empresa ou negócio/i });

    expect(btnPessoal).toBeInTheDocument();
    expect(btnComercial).toBeInTheDocument();

    fireEvent.click(btnComercial);
    expect(btnComercial.className).toContain('border-primary');
  });

  it('deve chamar createConta e onContaCriada com os dados corretos ao submeter', async () => {
    const onContaCriadaMock = vi.fn();
    const onOpenChangeMock = vi.fn();
    vi.mocked(api.createConta).mockResolvedValue({
      id: 99,
      nome: 'Pizzaria Express',
      tipo: 'Comercial',
    });

    render(
      <ToastProvider>
        <NovaContaModal
          open={true}
          onOpenChange={onOpenChangeMock}
          onContaCriada={onContaCriadaMock}
        />
      </ToastProvider>,
    );

    const inputNome = screen.getByPlaceholderText(/Ex: Pessoal, Pizzaria/i);
    fireEvent.change(inputNome, { target: { value: 'Pizzaria Express' } });

    const btnComercial = screen.getByRole('button', { name: /Comercial Empresa ou negócio/i });
    fireEvent.click(btnComercial);

    const btnSubmit = screen.getByRole('button', { name: /Criar Conta/i });
    fireEvent.click(btnSubmit);

    await waitFor(() => {
      expect(api.createConta).toHaveBeenCalledWith({
        nome: 'Pizzaria Express',
        tipo: 'Comercial',
      });
      expect(onContaCriadaMock).toHaveBeenCalledWith({
        id: 99,
        nome: 'Pizzaria Express',
        tipo: 'Comercial',
      });
      expect(onOpenChangeMock).toHaveBeenCalledWith(false);
    });
  });
});
