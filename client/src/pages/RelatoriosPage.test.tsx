import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route, Outlet } from 'react-router-dom';
import RelatoriosPage from './RelatoriosPage';
import { ToastProvider } from '../contexts/ToastContext';
import * as api from '../services/api';
import {
  ResumoPeriodoDto,
  DetalhamentoCategoriaDto,
  PagedResponse,
  TransacaoDto,
  ContaResumoDto
} from '../types/api';
import { TipoTransacao, StatusTransacao } from '../types/enums';

const mockOutletContext = {
  contaSelecionadaId: '1',
  contas: [{ id: 1, nome: 'Conta Comercial', tipo: 'Comercial' }],
};

function Wrapper() {
  return <Outlet context={mockOutletContext} />;
}

describe('RelatoriosPage.jsx', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(api, 'getResumoPeriodo').mockResolvedValue({
      totalEntradas: 4000.0,
      totalSaidas: 1500.0,
      saldo: 2500.0,
    } as ResumoPeriodoDto);

    vi.spyOn(api, 'getDetalhamento').mockResolvedValue([
      { categoriaId: 1, categoriaNome: 'Insumos', total: -1500.0, categoriaCor: '#000000' },
    ] as DetalhamentoCategoriaDto[]);

    vi.spyOn(api, 'getTransacoesRange').mockResolvedValue({
      data: [
        {
          id: 1,
          descricao: 'Venda de Balcão',
          valor: 4000.0,
          tipo: TipoTransacao.Entrada,
          status: StatusTransacao.Pago,
          data: '2026-08-10',
          categoriaId: 2,
          categoriaNome: 'Vendas',
          contaId: 1,
          contaNome: 'Conta Comercial',
        },
      ],
      total: 1,
      page: 1,
      totalPages: 1,
      pageSize: 100,
    } as PagedResponse<TransacaoDto>);

    vi.spyOn(api, 'getResumoConta').mockResolvedValue({
      totalEntradas: 4000.0,
      totalSaidas: 1500.0,
      saldo: 2500.0,
      totalEntradasHoje: 0,
      totalSaidasHoje: 0,
      saldoDiario: 0,
      totalEntradasMes: 4000.0,
      totalSaidasMes: 1500.0,
      saldoMensal: 2500.0,
      quantidadeTransacoes: 1,
    } as ContaResumoDto);

    vi.spyOn(api, 'exportarTransacoes').mockResolvedValue(new Blob(['csv data'], { type: 'text/csv' }));
  });

  it('deve renderizar as abas de navegação avançada', async () => {
    render(
      <ToastProvider>
        <MemoryRouter>
          <Routes>
            <Route element={<Wrapper />}>
              <Route index element={<RelatoriosPage />} />
            </Route>
          </Routes>
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
          <Routes>
            <Route element={<Wrapper />}>
              <Route index element={<RelatoriosPage />} />
            </Route>
          </Routes>
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
          <Routes>
            <Route element={<Wrapper />}>
              <Route index element={<RelatoriosPage />} />
            </Route>
          </Routes>
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
          <Routes>
            <Route element={<Wrapper />}>
              <Route index element={<RelatoriosPage />} />
            </Route>
          </Routes>
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
