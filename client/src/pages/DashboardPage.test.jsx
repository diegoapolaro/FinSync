import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import DashboardPage from './DashboardPage';
import { ToastProvider } from '../contexts/ToastContext';
import * as api from '../services/api';

let mockOutletContext = {
  contaSelecionadaId: '1',
  contas: [{ id: 1, nome: 'Conta Principal', tipo: 'Pessoal' }],
  abrirModalNovaConta: vi.fn(),
};

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useOutletContext: () => mockOutletContext,
    useNavigate: () => vi.fn(),
  };
});

describe('DashboardPage.jsx', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    mockOutletContext = {
      contaSelecionadaId: '1',
      contas: [{ id: 1, nome: 'Conta Principal', tipo: 'Pessoal' }],
      abrirModalNovaConta: vi.fn(),
    };
    vi.spyOn(api, 'getResumoPeriodo').mockResolvedValue({
      totalEntradas: 5000.0,
      totalSaidas: 2000.0,
      saldo: 3000.0,
    });
    vi.spyOn(api, 'getDetalhamento').mockResolvedValue([
      { categoriaId: 1, categoriaNome: 'Alimentação', categoriaCor: '#FF5733', total: -1200.0 },
      { categoriaId: 2, categoriaNome: 'Transporte', categoriaCor: '#33FF57', total: -800.0 },
    ]);
    vi.spyOn(api, 'getTransacoesRange').mockResolvedValue({
      data: [
        {
          id: 101,
          descricao: 'Fatura Cartão',
          valor: 800.0,
          tipo: 'Saida',
          status: 'Pendente',
          data: '2026-08-30',
          categoriaId: 1,
          categoriaNome: 'Alimentação',
        },
        {
          id: 102,
          descricao: 'Freelance Design',
          valor: 1500.0,
          tipo: 'Entrada',
          status: 'Pago',
          data: '2026-08-15',
          categoriaId: 2,
          categoriaNome: 'Transporte',
        },
      ],
      total: 2,
      totalPages: 1,
      pageSize: 100,
    });
    vi.spyOn(api, 'updateTransacaoStatus').mockResolvedValue();
  });

  it('deve renderizar o título do Dashboard e nome da conta', async () => {
    render(
      <ToastProvider>
        <MemoryRouter>
          <DashboardPage />
        </MemoryRouter>
      </ToastProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText('Visão Geral')).toBeInTheDocument();
      expect(screen.getByText('Conta Principal')).toBeInTheDocument();
    });
  });

  it('deve exibir os cards de resumo com valores e a taxa de poupança', async () => {
    render(
      <ToastProvider>
        <MemoryRouter>
          <DashboardPage />
        </MemoryRouter>
      </ToastProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText('Receitas')).toBeInTheDocument();
      expect(screen.getAllByText('Despesas')[0]).toBeInTheDocument();
      expect(screen.getByText('Saldo Mensal')).toBeInTheDocument();
      expect(screen.getByText('Poupança')).toBeInTheDocument();
    });

    // Taxa de poupança = ((5000 - 2000) / 5000) * 100 = 60%
    expect(screen.getAllByText('60%')[0]).toBeInTheDocument();
    expect(screen.getByText('Excelente')).toBeInTheDocument();
  });

  it('deve renderizar as setas de navegação de meses com acessibilidade e permitir avançar/retroceder', async () => {
    render(
      <ToastProvider>
        <MemoryRouter>
          <DashboardPage />
        </MemoryRouter>
      </ToastProvider>,
    );

    const btnAnterior = await screen.findByRole('button', { name: /Mês anterior/i });
    const btnProximo = await screen.findByRole('button', { name: /Próximo mês/i });

    expect(btnAnterior).toBeInTheDocument();
    expect(btnProximo).toBeInTheDocument();

    const chamadasIniciais = api.getResumoPeriodo.mock.calls.length;
    fireEvent.click(btnAnterior);

    await waitFor(() => {
      expect(api.getResumoPeriodo.mock.calls.length).toBeGreaterThan(chamadasIniciais);
    });
  });

  it('deve listar contas pendentes na Agenda Financeira e permitir quitação com 1 clique', async () => {
    render(
      <ToastProvider>
        <MemoryRouter>
          <DashboardPage />
        </MemoryRouter>
      </ToastProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText('Fatura Cartão')).toBeInTheDocument();
      expect(screen.getByText('Quitar')).toBeInTheDocument();
    });

    const btnQuitar = screen.getByRole('button', { name: /Quitar/i });
    fireEvent.click(btnQuitar);

    await waitFor(() => {
      expect(api.updateTransacaoStatus).toHaveBeenCalledWith(101, 'Pago');
    });
  });

  it('deve renderizar as seções de distribuição de despesas e agenda financeira', async () => {
    render(
      <ToastProvider>
        <MemoryRouter>
          <DashboardPage />
        </MemoryRouter>
      </ToastProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText('Distribuição de Despesas')).toBeInTheDocument();
      expect(screen.getByText('Agenda Financeira')).toBeInTheDocument();
      expect(screen.getAllByText('Alimentação')[0]).toBeInTheDocument();
      expect(screen.getByText('Transporte')).toBeInTheDocument();
    });
  });

  it('deve renderizar o card de boas-vindas com botão de criar primeira conta quando nenhuma conta estiver selecionada', async () => {
    const abrirModalMock = vi.fn();
    mockOutletContext = {
      contaSelecionadaId: '',
      contas: [],
      abrirModalNovaConta: abrirModalMock,
    };

    render(
      <ToastProvider>
        <MemoryRouter>
          <DashboardPage />
        </MemoryRouter>
      </ToastProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText('Bem-vindo ao FinSync')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Criar Conta/i })).toBeInTheDocument();
    });

    const btnCriar = screen.getByRole('button', { name: /Criar Conta/i });
    fireEvent.click(btnCriar);
    expect(abrirModalMock).toHaveBeenCalled();
  });
});
