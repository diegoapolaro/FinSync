import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import RelatoriosPage from './RelatoriosPage';
import { ToastProvider } from '../contexts/ToastContext';
import * as api from '../services/api';

const mockOutletContext = {
  contaSelecionadaId: '1',
  contas: [{ id: 1, nome: 'Conta Comercial', tipo: 'Comercial' }],
};

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useOutletContext: () => mockOutletContext,
  };
});

describe('RelatoriosPage.jsx', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(api, 'getResumoPeriodo').mockResolvedValue({
      totalEntradas: 4000.0,
      totalSaidas: 1500.0,
      saldo: 2500.0,
    });
    vi.spyOn(api, 'getDetalhamento').mockResolvedValue([
      { categoriaId: 1, categoriaNome: 'Insumos', total: -1500.0 },
    ]);
    vi.spyOn(api, 'getTransacoesRange').mockResolvedValue({
      data: [
        {
          id: 1,
          descricao: 'Venda de Balcão',
          valor: 4000.0,
          tipo: 'Entrada',
          status: 'Pago',
          data: '2026-08-10',
          categoriaId: 2,
          categoriaNome: 'Vendas',
        },
      ],
      total: 1,
      totalPages: 1,
      pageSize: 100,
    });
    vi.spyOn(api, 'getResumoConta').mockResolvedValue({
      totalEntradas: 4000.0,
      totalSaidas: 1500.0,
      saldo: 2500.0,
    });
    vi.spyOn(api, 'exportarTransacoes').mockResolvedValue(new Blob(['csv data'], { type: 'text/csv' }));
  });

  it('deve renderizar as abas de navegação avançada', async () => {
    render(
      <ToastProvider>
        <MemoryRouter>
          <RelatoriosPage />
        </MemoryRouter>
      </ToastProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText('Visão Geral & Fluxo')).toBeInTheDocument();
      expect(screen.getByText('Comparativo Mês a Mês / Ano a Ano')).toBeInTheDocument();
      expect(screen.getByText('Balanço Patrimonial (Ativos vs. Passivos)')).toBeInTheDocument();
    });
  });

  it('deve alternar para a aba de Comparativo e exibir o gráfico/tabela comparativa', async () => {
    render(
      <ToastProvider>
        <MemoryRouter>
          <RelatoriosPage />
        </MemoryRouter>
      </ToastProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText('Comparativo Mês a Mês / Ano a Ano')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Comparativo Mês a Mês / Ano a Ano'));

    await waitFor(() => {
      expect(screen.getByText('Comparativo Periódico de Desempenho')).toBeInTheDocument();
      expect(screen.getByText('Mês a Mês')).toBeInTheDocument();
      expect(screen.getByText('Ano a Ano')).toBeInTheDocument();
    });
  });

  it('deve alternar para a aba de Balanço Patrimonial e exibir ativos vs passivos', async () => {
    render(
      <ToastProvider>
        <MemoryRouter>
          <RelatoriosPage />
        </MemoryRouter>
      </ToastProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText('Balanço Patrimonial (Ativos vs. Passivos)')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Balanço Patrimonial (Ativos vs. Passivos)'));

    await waitFor(() => {
      expect(screen.getByText('Total de Ativos & Bens')).toBeInTheDocument();
      expect(screen.getByText('Dívidas & Passivos')).toBeInTheDocument();
      expect(screen.getByText('Patrimônio Líquido')).toBeInTheDocument();
      expect(screen.getByText('Composição Patrimonial por Conta')).toBeInTheDocument();
    });
  });

  it('deve abrir o modal de Relatório PDF ao clicar no botão', async () => {
    render(
      <ToastProvider>
        <MemoryRouter>
          <RelatoriosPage />
        </MemoryRouter>
      </ToastProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText('Relatório PDF')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Relatório PDF'));

    await waitFor(() => {
      expect(screen.getByText('Relatório Financeiro Formatado')).toBeInTheDocument();
      expect(screen.getByText('Imprimir / Salvar PDF')).toBeInTheDocument();
    });
  });
});
