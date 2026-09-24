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
      expect(api.getTransacoesRange).toHaveBeenCalledWith({
        contaId: '1',
        dataInicio: expect.any(String),
        dataFim: expect.any(String),
        page: 1,
        pageSize: 20,
        categoriaId: null,
        status: null,
      });
    });

    const select = screen.getAllByLabelText('Filtrar por categoria')[0];
    fireEvent.change(select, { target: { value: '10' } });

    await waitFor(() => {
      expect(api.getTransacoesRange).toHaveBeenCalledWith({
        contaId: '1',
        dataInicio: expect.any(String),
        dataFim: expect.any(String),
        page: 1,
        pageSize: 20,
        categoriaId: 10,
        status: null,
      });
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
      expect(api.getTransacoesRange).toHaveBeenCalledWith({
        contaId: '1',
        dataInicio: expect.any(String),
        dataFim: expect.any(String),
        page: 1,
        pageSize: 20,
        categoriaId: null,
        status: null,
      });
    });

    const selectStatus = screen.getAllByLabelText('Filtrar por status')[0];
    fireEvent.change(selectStatus, { target: { value: 'Pendente' } });

    await waitFor(() => {
      expect(api.getTransacoesRange).toHaveBeenCalledWith({
        contaId: '1',
        dataInicio: expect.any(String),
        dataFim: expect.any(String),
        page: 1,
        pageSize: 20,
        categoriaId: null,
        status: 'Pendente',
      });
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

  it('deve renderizar a paginação sem erro (cn is not defined) quando houver mais de uma página de transações', async () => {
    vi.spyOn(api, 'getTransacoesRange').mockResolvedValue({
      data: Array.from({ length: 20 }, (_, i) => ({
        id: i + 1,
        descricao: `Transação ${i + 1}`,
        valor: 50.0,
        tipo: 'Saida',
        status: 'Pago',
        data: '2026-06-15',
        categoriaId: 10,
        categoriaNome: 'Alimentação',
      })),
      total: 35,
      totalPages: 2,
      pageSize: 20,
    });

    render(
      <TemaProvider>
        <MemoryRouter>
          <Extrato />
        </MemoryRouter>
      </TemaProvider>,
    );

    await waitFor(() => {
      expect(screen.getAllByText(/1–20 de 35/)[0]).toBeInTheDocument();
    });

    // Deve exibir botões de página 1 e 2 no desktop e mobile
    expect(screen.getAllByRole('button', { name: '1' })[0]).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: '2' })[0]).toBeInTheDocument();

    // Clicar na página 2
    fireEvent.click(screen.getAllByRole('button', { name: '2' })[0]);

    await waitFor(() => {
      expect(api.getTransacoesRange).toHaveBeenCalledWith(
        expect.objectContaining({
          page: 2,
        }),
      );
    });
  });

  it('deve filtrar transações por texto em tempo real usando a barra de busca', async () => {
    vi.spyOn(api, 'getTransacoesRange').mockResolvedValue({
      data: [
        {
          id: 1,
          descricao: 'Mercado SuperTop',
          valor: 150.0,
          tipo: 'Saida',
          status: 'Pago',
          data: '2026-08-10',
          categoriaId: 10,
          categoriaNome: 'Alimentação',
        },
        {
          id: 2,
          descricao: 'Farmácia Central',
          valor: 85.0,
          tipo: 'Saida',
          status: 'Pago',
          data: '2026-08-11',
          categoriaId: 10,
          categoriaNome: 'Saúde',
        },
      ],
      total: 2,
      totalPages: 1,
      pageSize: 20,
    });

    render(
      <TemaProvider>
        <MemoryRouter>
          <Extrato />
        </MemoryRouter>
      </TemaProvider>,
    );

    await waitFor(() => {
      expect(screen.getAllByText('Mercado SuperTop')[0]).toBeInTheDocument();
      expect(screen.getAllByText('Farmácia Central')[0]).toBeInTheDocument();
    });

    const searchInput = screen.getAllByLabelText('Buscar transações')[0];
    fireEvent.change(searchInput, { target: { value: 'Farmácia' } });

    expect(screen.queryByText('Mercado SuperTop')).not.toBeInTheDocument();
    expect(screen.getAllByText('Farmácia Central')[0]).toBeInTheDocument();
    expect(screen.getAllByText(/Filtro ativo: 1 movimentação\(ões\) encontrada\(s\)/)[0]).toBeInTheDocument();
  });

  it('deve filtrar transações pelo seletor de tipo (Entradas / Saídas)', async () => {
    vi.spyOn(api, 'getTransacoesRange').mockResolvedValue({
      data: [
        {
          id: 1,
          descricao: 'Venda de Consultoria',
          valor: 2500.0,
          tipo: 'Entrada',
          status: 'Pago',
          data: '2026-08-10',
          categoriaId: 20,
          categoriaNome: 'Salário',
        },
        {
          id: 2,
          descricao: 'Aluguel do Mês',
          valor: 1200.0,
          tipo: 'Saida',
          status: 'Pago',
          data: '2026-08-11',
          categoriaId: 10,
          categoriaNome: 'Moradia',
        },
      ],
      total: 2,
      totalPages: 1,
      pageSize: 20,
    });

    render(
      <TemaProvider>
        <MemoryRouter>
          <Extrato />
        </MemoryRouter>
      </TemaProvider>,
    );

    await waitFor(() => {
      expect(screen.getAllByText('Venda de Consultoria')[0]).toBeInTheDocument();
      expect(screen.getAllByText('Aluguel do Mês')[0]).toBeInTheDocument();
    });

    // Clicar em Entradas
    const btnEntradas = screen.getAllByRole('button', { name: /entradas/i })[0];
    fireEvent.click(btnEntradas);

    expect(screen.getAllByText('Venda de Consultoria')[0]).toBeInTheDocument();
    expect(screen.queryByText('Aluguel do Mês')).not.toBeInTheDocument();

    // Clicar em Saídas
    const btnSaidas = screen.getAllByRole('button', { name: /saídas/i })[0];
    fireEvent.click(btnSaidas);

    expect(screen.queryByText('Venda de Consultoria')).not.toBeInTheDocument();
    expect(screen.getAllByText('Aluguel do Mês')[0]).toBeInTheDocument();
  });
});


