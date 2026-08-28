import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Extrato from './Extrato';
import { TemaProvider } from '../contexts/ThemeContext';
import * as api from '../services/api';

const mockOutletContext = {
  contaSelecionadaId: '1',
  categorias: [
    { id: 10, nome: 'Alimentação', tipo: 'Saida' },
    { id: 20, nome: 'Salário', tipo: 'Entrada' },
  ],
};

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useOutletContext: () => mockOutletContext,
    useNavigate: () => vi.fn(),
  };
});

describe('Extrato.jsx category and status filter', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(api, 'getTransacoesRange').mockResolvedValue({
      data: [
        {
          id: 1,
          descricao: 'Mercado',
          valor: 150.0,
          tipo: 'Saida',
          status: 'Pago',
          data: '2026-08-10',
          categoriaId: 10,
          categoriaNome: 'Alimentação',
        },
      ],
      total: 1,
      totalPages: 1,
      pageSize: 20,
    });
    vi.spyOn(api, 'getResumoPeriodo').mockResolvedValue({
      totalEntradas: 0,
      totalSaidas: 150.0,
      saldo: -150.0,
    });
    vi.spyOn(api, 'updateTransacaoStatus').mockResolvedValue();
  });

  it('deve renderizar os seletores de categorias e status com as opções carregadas', async () => {
    render(
      <TemaProvider>
        <MemoryRouter>
          <Extrato />
        </MemoryRouter>
      </TemaProvider>,
    );

    await waitFor(() => {
      expect(screen.getAllByLabelText('Filtrar por categoria')[0]).toBeInTheDocument();
      expect(screen.getAllByLabelText('Filtrar por status')[0]).toBeInTheDocument();
    });

    expect(screen.getAllByRole('option', { name: 'Todas as categorias' })[0]).toBeInTheDocument();
    expect(screen.getAllByRole('option', { name: 'Alimentação' })[0]).toBeInTheDocument();
    expect(screen.getAllByRole('option', { name: 'Salário' })[0]).toBeInTheDocument();

    expect(screen.getAllByRole('option', { name: 'Todos os status' })[0]).toBeInTheDocument();
    expect(screen.getAllByRole('option', { name: 'Pagos' })[0]).toBeInTheDocument();
    expect(screen.getAllByRole('option', { name: 'Pendentes' })[0]).toBeInTheDocument();
  });

  it('deve chamar getTransacoesRange com categoriaId selecionada', async () => {
    render(
      <TemaProvider>
        <MemoryRouter>
          <Extrato />
        </MemoryRouter>
      </TemaProvider>,
    );

    await waitFor(() => {
      expect(api.getTransacoesRange).toHaveBeenCalledWith(
        '1',
        expect.any(String),
        expect.any(String),
        1,
        20,
        null,
        null,
      );
    });

    const select = screen.getAllByLabelText('Filtrar por categoria')[0];
    fireEvent.change(select, { target: { value: '10' } });

    await waitFor(() => {
      expect(api.getTransacoesRange).toHaveBeenCalledWith(
        '1',
        expect.any(String),
        expect.any(String),
        1,
        20,
        10,
        null,
      );
    });
  });

  it('deve chamar getTransacoesRange com status selecionado', async () => {
    render(
      <TemaProvider>
        <MemoryRouter>
          <Extrato />
        </MemoryRouter>
      </TemaProvider>,
    );

    await waitFor(() => {
      expect(api.getTransacoesRange).toHaveBeenCalledWith(
        '1',
        expect.any(String),
        expect.any(String),
        1,
        20,
        null,
        null,
      );
    });

    const selectStatus = screen.getAllByLabelText('Filtrar por status')[0];
    fireEvent.change(selectStatus, { target: { value: 'Pendente' } });

    await waitFor(() => {
      expect(api.getTransacoesRange).toHaveBeenCalledWith(
        '1',
        expect.any(String),
        expect.any(String),
        1,
        20,
        null,
        'Pendente',
      );
    });
  });

  it('deve alternar status da transação ao clicar no botão de toggle', async () => {
    render(
      <TemaProvider>
        <MemoryRouter>
          <Extrato />
        </MemoryRouter>
      </TemaProvider>,
    );

    await waitFor(() => {
      expect(screen.getAllByText('Mercado')[0]).toBeInTheDocument();
    });

    const btnToggle = screen.getAllByTitle('Marcar como Pendente')[0];
    fireEvent.click(btnToggle);

    await waitFor(() => {
      expect(api.updateTransacaoStatus).toHaveBeenCalledWith(1, 'Pendente');
    });
  });
});

