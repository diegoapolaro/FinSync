import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import RecorrenciasSection from './RecorrenciasSection';
import { ToastProvider } from '../../contexts/ToastContext';
import * as api from '../../services/api';

vi.mock('../../services/api', () => ({
  getRecorrencias: vi.fn(),
  getResumoRecorrencias: vi.fn(),
  createRecorrencia: vi.fn(),
  updateRecorrencia: vi.fn(),
  toggleRecorrenciaAtivo: vi.fn(),
  deleteRecorrencia: vi.fn(),
}));

import type { ContaDto, CategoriaDto, RecorrenciaDto, ResumoRecorrenciasDto } from '../../types/api';
import { TipoTransacao, TipoConta, FrequenciaRecorrencia, StatusTransacao } from '../../types/enums';

const mockContas: ContaDto[] = [{ id: 1, nome: 'Conta Corrente', tipo: TipoConta.Pessoal, arquivada: false }];
const mockCategorias: CategoriaDto[] = [
  { id: 10, nome: 'Streaming', tipo: TipoTransacao.Saida, cor: '#000' },
  { id: 20, nome: 'Salário', tipo: TipoTransacao.Entrada, cor: '#000' },
];

const mockRecorrencias: RecorrenciaDto[] = [
  {
    id: 1,
    descricao: 'Netflix',
    valor: 55.9,
    tipo: TipoTransacao.Saida,
    frequencia: FrequenciaRecorrencia.Mensal,
    dataInicio: '2026-08-01',
    dataFim: null,
    statusPadrao: StatusTransacao.Pendente,
    ativo: true,
    proximoVencimento: '2026-09-01',
    contaId: 1,
    contaNome: 'Conta Corrente',
    categoriaId: 10,
    categoriaNome: 'Streaming',
    totalTransacoesGeradas: 12,
  },
  {
    id: 2,
    descricao: 'Salário Mensal',
    valor: 6000.0,
    tipo: TipoTransacao.Entrada,
    frequencia: FrequenciaRecorrencia.Mensal,
    dataInicio: '2026-08-05',
    dataFim: null,
    statusPadrao: StatusTransacao.Pago,
    ativo: true,
    proximoVencimento: '2026-09-05',
    contaId: 1,
    contaNome: 'Conta Corrente',
    categoriaId: 20,
    categoriaNome: 'Salário',
    totalTransacoesGeradas: 12,
  },
];

const mockResumo: ResumoRecorrenciasDto = {
  totalReceitasFixas: 6000.0,
  totalDespesasFixas: 55.9,
  saldoFixo: 5944.1,
  totalAtivas: 2,
  totalPausadas: 0,
};

describe('RecorrenciasSection.jsx', () => {
  beforeEach(() => {
    localStorage.setItem('finsync_preferencias', JSON.stringify({}));
    vi.clearAllMocks();
    vi.mocked(api.getRecorrencias).mockResolvedValue(mockRecorrencias);
    vi.mocked(api.getResumoRecorrencias).mockResolvedValue(mockResumo);
  });

  function renderComponent() {
    return render(
      <ToastProvider>
        <RecorrenciasSection contas={mockContas} categorias={mockCategorias} />
      </ToastProvider>,
    );
  }

  it('deve renderizar métricas de resumo e listagem de assinaturas', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Netflix')).toBeInTheDocument();
      expect(screen.getByText('Salário Mensal')).toBeInTheDocument();
    });

    expect(screen.getByText('Receitas Fixas / Mês')).toBeInTheDocument();
    expect(screen.getByText('Despesas Fixas / Mês')).toBeInTheDocument();
    expect(screen.getByText('Saldo Fixo Líquido')).toBeInTheDocument();
    expect(screen.getByText(/2 ativas/i)).toBeInTheDocument();
  });

  it('deve permitir abrir modal e criar uma nova recorrência', async () => {
    vi.mocked(api.createRecorrencia).mockResolvedValue({ id: 3 } as RecorrenciaDto);
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Netflix')).toBeInTheDocument();
    });

    const btnNovo = screen.getByRole('button', { name: /Nova Recorrência/i });
    fireEvent.click(btnNovo);

    expect(screen.getByText('Nova Recorrência Periódica')).toBeInTheDocument();

    const inputDesc = screen.getByPlaceholderText('Ex: Netflix, Salário, Aluguel...');
    const inputValor = screen.getByPlaceholderText('0,00');

    fireEvent.change(inputDesc, { target: { value: 'Spotify' } });
    fireEvent.change(inputValor, { target: { value: '34,90' } });

    const btnSubmit = screen.getByRole('button', { name: /Criar Recorrência/i });
    fireEvent.click(btnSubmit);

    await waitFor(() => {
      expect(api.createRecorrencia).toHaveBeenCalledWith({
        descricao: 'Spotify',
        valor: 34.9,
        tipo: 'Saida',
        frequencia: 'Mensal',
        dataInicio: expect.any(String),
        dataFim: null,
        statusPadrao: 'Pendente',
        contaId: 1,
        categoriaId: null,
      });
    });
  });

  it('deve pausar/ativar recorrência ao alternar switch', async () => {
    vi.mocked(api.toggleRecorrenciaAtivo).mockResolvedValue({} as RecorrenciaDto);
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Netflix')).toBeInTheDocument();
    });

    const switches = screen.getAllByRole('switch', { name: /Ativar\/Pausar recorrência/i });
    fireEvent.click(switches[0]);

    await waitFor(() => {
      expect(api.toggleRecorrenciaAtivo).toHaveBeenCalledWith('1');
    });
  });

  it('deve abrir modal de exclusão e chamar deleteRecorrencia', async () => {
    vi.mocked(api.deleteRecorrencia).mockResolvedValue({} as any);
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Netflix')).toBeInTheDocument();
    });

    const btnsExcluir = screen.getAllByTitle('Excluir regra');
    fireEvent.click(btnsExcluir[0]);

    expect(screen.getByText('Excluir Regra de Recorrência')).toBeInTheDocument();

    const btnConfirmar = screen.getByRole('button', {
      name: /Excluir Regra e Transações Futuras Pendentes/i,
    });
    fireEvent.click(btnConfirmar);

    await waitFor(() => {
      expect(api.deleteRecorrencia).toHaveBeenCalledWith('1', true);
    });
  });
});
