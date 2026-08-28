import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LancamentosPage from './LancamentosPage';
import { ToastProvider } from '../contexts/ToastContext';
import * as api from '../services/api';

let mockOutletContext = {
  contas: [
    { id: 1, nome: 'Principal', tipo: 'Pessoal' },
    { id: 2, nome: 'Empresa', tipo: 'Comercial' },
  ],
  contaSelecionadaId: '1',
};

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useOutletContext: () => mockOutletContext,
    useSearchParams: () => [new URLSearchParams(), vi.fn()],
  };
});

vi.mock('../services/api', () => ({
  getCategorias: vi.fn(),
  getTransacoes: vi.fn(),
  createTransacao: vi.fn(),
  updateTransacao: vi.fn(),
  updateTransacaoStatus: vi.fn(),
  deleteTransacao: vi.fn(),
}));

const mockCategorias = [
  { id: 10, nome: 'Vendas Balcão', tipo: 'Entrada' },
  { id: 11, nome: 'Rendimentos', tipo: 'Entrada' },
  { id: 20, nome: 'Alimentação', tipo: 'Saida' },
  { id: 21, nome: 'Transporte', tipo: 'Saida' },
];

const mockTransacoes = [
  {
    id: 1,
    descricao: 'Venda de Pizza',
    valor: 85.5,
    tipo: 'Entrada',
    status: 'Pago',
    data: '2026-08-26',
    contaId: 1,
    categoriaId: 10,
    categoriaNome: 'Vendas Balcão',
  },
  {
    id: 2,
    descricao: 'Compra de Insumos',
    valor: 42.0,
    tipo: 'Saida',
    status: 'Pendente',
    data: '2026-08-26',
    contaId: 1,
    categoriaId: 20,
    categoriaNome: 'Alimentação',
  },
];

describe('LancamentosPage.jsx', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.scrollTo = vi.fn();
    mockOutletContext = {
      contas: [
        { id: 1, nome: 'Principal', tipo: 'Pessoal' },
        { id: 2, nome: 'Empresa', tipo: 'Comercial' },
      ],
      contaSelecionadaId: '1',
    };
    api.getCategorias.mockResolvedValue(mockCategorias);
    api.getTransacoes.mockResolvedValue({
      data: mockTransacoes,
      total: 2,
      totalPages: 1,
    });
    api.updateTransacaoStatus.mockResolvedValue();
  });

  function renderPage() {
    return render(
      <ToastProvider>
        <LancamentosPage />
      </ToastProvider>,
    );
  }

  describe('Renderização e Navegação', () => {
    it('deve renderizar o cabeçalho com data, campos do formulário e botões de tipo', async () => {
      renderPage();

      await waitFor(() => {
        expect(screen.getByText(/Hoje,/i)).toBeInTheDocument();
      });

      expect(screen.getByText('Novo Lançamento')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Receita/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Despesa/i })).toBeInTheDocument();
      expect(screen.getByPlaceholderText('0,00')).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText('Ex: Venda no balcão, Supermercado, Aluguel...'),
      ).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Confirmar Lançamento/i })).toBeInTheDocument();
    });

    it('deve listar as transações da data carregada com status e badges', async () => {
      renderPage();

      await waitFor(() => {
        expect(screen.getByText('Venda de Pizza')).toBeInTheDocument();
        expect(screen.getByText('Compra de Insumos')).toBeInTheDocument();
      });

      expect(screen.getAllByText('Vendas Balcão').length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText('Alimentação')).toBeInTheDocument();
      expect(screen.getAllByText('Pago').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('Pendente').length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText(/Total:\s*2/i)).toBeInTheDocument();
    });

    it('deve exibir mensagem de estado vazio quando não houver transações', async () => {
      api.getTransacoes.mockResolvedValue({ data: [], total: 0 });
      renderPage();

      await waitFor(() => {
        expect(screen.getByText('Nenhum lançamento registrado nesta data.')).toBeInTheDocument();
      });
    });

    it('deve navegar para Ontem e Amanhã recarregando os registros', async () => {
      renderPage();

      await waitFor(() => {
        expect(api.getTransacoes).toHaveBeenCalled();
      });

      const btnOntem = screen.getByRole('button', { name: /Ontem/i });
      fireEvent.click(btnOntem);

      await waitFor(() => {
        expect(screen.getByText(/Ontem,/i)).toBeInTheDocument();
        expect(api.getTransacoes).toHaveBeenCalledTimes(2);
      });

      const btnAmanha = screen.getByRole('button', { name: /Amanhã/i });
      fireEvent.click(btnAmanha);

      await waitFor(() => {
        expect(screen.getByText(/Hoje,/i)).toBeInTheDocument();
        expect(api.getTransacoes).toHaveBeenCalledTimes(3);
      });
    });
  });

  describe('Alternância de Tipo e Filtro de Categorias', () => {
    it('deve filtrar categorias conforme o tipo selecionado (Receita vs Despesa)', async () => {
      renderPage();

      await waitFor(() => {
        expect(screen.getByRole('option', { name: 'Vendas Balcão' })).toBeInTheDocument();
      });

      // Em modo Receita (padrão)
      expect(screen.getByRole('option', { name: 'Vendas Balcão' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'Rendimentos' })).toBeInTheDocument();
      expect(screen.queryByRole('option', { name: 'Alimentação' })).not.toBeInTheDocument();

      // Alternar para Despesa
      const btnDespesa = screen.getByRole('button', { name: /Despesa/i });
      fireEvent.click(btnDespesa);

      // Em modo Despesa
      expect(screen.getByRole('option', { name: 'Alimentação' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'Transporte' })).toBeInTheDocument();
      expect(screen.queryByRole('option', { name: 'Vendas Balcão' })).not.toBeInTheDocument();
    });
  });

  describe('Preenchimento e Criação de Lançamento', () => {
    it('deve preencher o formulário e chamar createTransacao ao submeter com sucesso', async () => {
      api.createTransacao.mockResolvedValue({ id: 3 });
      renderPage();

      await waitFor(() => {
        expect(screen.getByRole('option', { name: 'Vendas Balcão' })).toBeInTheDocument();
      });

      const inputValor = screen.getByPlaceholderText('0,00');
      const inputDesc = screen.getByPlaceholderText(
        'Ex: Venda no balcão, Supermercado, Aluguel...',
      );
      const selectCat = screen.getAllByRole('combobox').find((el) => !el.id.includes('contaId'));

      fireEvent.change(inputValor, { target: { value: '120,50' } });
      fireEvent.change(inputDesc, { target: { value: 'Consultoria Financeira' } });
      fireEvent.change(selectCat, { target: { value: '10' } });

      const btnSubmit = screen.getByRole('button', { name: /Confirmar Lançamento/i });
      fireEvent.click(btnSubmit);

      await waitFor(() => {
        expect(api.createTransacao).toHaveBeenCalledWith({
          descricao: 'Consultoria Financeira',
          valor: 120.5,
          tipo: 'Entrada',
          status: 'Pago',
          data: expect.any(String),
          contaId: 1,
          categoriaId: 10,
          parcelado: false,
          totalParcelas: null,
          modoValorParcelamento: null,
          tornarRecorrente: false,
          frequenciaRecorrencia: null,
          dataFimRecorrencia: null,
        });
      });

      await waitFor(() => {
        expect(screen.getByText('Lançamento registrado com sucesso!')).toBeInTheDocument();
      });

      // Formulário deve ser limpo
      expect(inputValor.value).toBe('');
      expect(inputDesc.value).toBe('');
    });

    it('deve permitir selecionar status Pendente e trocar de conta ao criar transação', async () => {
      api.createTransacao.mockResolvedValue({ id: 4 });
      renderPage();

      await waitFor(() => {
        expect(screen.getAllByRole('button', { name: /Pendente/i })[0]).toBeInTheDocument();
      });

      const btnPendente = screen.getAllByRole('button', { name: /Pendente/i })[0];
      fireEvent.click(btnPendente);

      const selectConta = screen.getByLabelText('Conta');
      fireEvent.change(selectConta, { target: { value: '2' } });

      const inputValor = screen.getByPlaceholderText('0,00');
      const inputDesc = screen.getByPlaceholderText(
        'Ex: Venda no balcão, Supermercado, Aluguel...',
      );

      fireEvent.change(inputValor, { target: { value: '200' } });
      fireEvent.change(inputDesc, { target: { value: 'Prestação de Serviço' } });

      const btnSubmit = screen.getByRole('button', { name: /Confirmar Lançamento/i });
      fireEvent.click(btnSubmit);

      await waitFor(() => {
        expect(api.createTransacao).toHaveBeenCalledWith({
          descricao: 'Prestação de Serviço',
          valor: 200,
          tipo: 'Entrada',
          status: 'Pendente',
          data: expect.any(String),
          contaId: 2,
          categoriaId: null,
          parcelado: false,
          totalParcelas: null,
          modoValorParcelamento: null,
          tornarRecorrente: false,
          frequenciaRecorrencia: null,
          dataFimRecorrencia: null,
        });
      });
    });

    it('deve permitir criar uma compra parcelada em 3x', async () => {
      api.createTransacao.mockResolvedValue({ id: 5 });
      renderPage();

      const btnParcelado = screen.getByRole('button', { name: /Parcelado/i });
      fireEvent.click(btnParcelado);

      const btn3x = screen.getByRole('button', { name: '3x' });
      fireEvent.click(btn3x);

      const inputValor = screen.getByPlaceholderText('0,00');
      const inputDesc = screen.getByPlaceholderText(
        'Ex: Venda no balcão, Supermercado, Aluguel...',
      );

      fireEvent.change(inputValor, { target: { value: '300' } });
      fireEvent.change(inputDesc, { target: { value: 'Monitor Ultrawide' } });

      const btnSubmit = screen.getByRole('button', { name: /Gerar 3x Parcelas/i });
      fireEvent.click(btnSubmit);

      await waitFor(() => {
        expect(api.createTransacao).toHaveBeenCalledWith({
          descricao: 'Monitor Ultrawide',
          valor: 300,
          tipo: 'Entrada',
          status: 'Pago',
          data: expect.any(String),
          contaId: 1,
          categoriaId: null,
          parcelado: true,
          totalParcelas: 3,
          modoValorParcelamento: 'Total',
          tornarRecorrente: false,
          frequenciaRecorrencia: null,
          dataFimRecorrencia: null,
        });
      });
    });

    it('deve permitir criar um lançamento fixo/recorrente mensal', async () => {
      api.createTransacao.mockResolvedValue({ id: 6 });
      renderPage();

      const btnRecorrente = screen.getByRole('button', { name: /Fixo \/ Recorrente/i });
      fireEvent.click(btnRecorrente);

      const inputValor = screen.getByPlaceholderText('0,00');
      const inputDesc = screen.getByPlaceholderText(
        'Ex: Venda no balcão, Supermercado, Aluguel...',
      );

      fireEvent.change(inputValor, { target: { value: '45,90' } });
      fireEvent.change(inputDesc, { target: { value: 'Spotify Família' } });

      const btnSubmit = screen.getByRole('button', { name: /Confirmar Recorrência/i });
      fireEvent.click(btnSubmit);

      await waitFor(() => {
        expect(api.createTransacao).toHaveBeenCalledWith({
          descricao: 'Spotify Família',
          valor: 45.9,
          tipo: 'Entrada',
          status: 'Pago',
          data: expect.any(String),
          contaId: 1,
          categoriaId: null,
          parcelado: false,
          totalParcelas: null,
          modoValorParcelamento: null,
          tornarRecorrente: true,
          frequenciaRecorrencia: 'Mensal',
          dataFimRecorrencia: null,
        });
      });
    });

    it('deve exibir toast de erro quando a API createTransacao falhar', async () => {
      api.createTransacao.mockRejectedValue(new Error('Erro ao salvar no banco'));
      renderPage();

      const inputValor = screen.getByPlaceholderText('0,00');
      const inputDesc = screen.getByPlaceholderText(
        'Ex: Venda no balcão, Supermercado, Aluguel...',
      );

      fireEvent.change(inputValor, { target: { value: '50' } });
      fireEvent.change(inputDesc, { target: { value: 'Teste falha' } });

      const btnSubmit = screen.getByRole('button', { name: /Confirmar Lançamento/i });
      fireEvent.click(btnSubmit);

      await waitFor(() => {
        expect(screen.getByText('Erro ao salvar no banco')).toBeInTheDocument();
      });
    });
  });

  describe('Modo de Edição e Cancelamento', () => {
    it('deve preencher os dados no formulário ao clicar em editar e permitir cancelamento', async () => {
      renderPage();

      await waitFor(() => {
        expect(screen.getByText('Venda de Pizza')).toBeInTheDocument();
      });

      const btnEditar = screen.getAllByTitle('Editar')[0];
      fireEvent.click(btnEditar);

      expect(screen.getByText('Editar Lançamento')).toBeInTheDocument();
      expect(screen.getByText('Modo Edição')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Venda de Pizza')).toBeInTheDocument();
      expect(screen.getByDisplayValue('85,5')).toBeInTheDocument();

      const btnCancelar = screen.getByRole('button', { name: /Cancelar/i });
      expect(btnCancelar).toBeInTheDocument();
      fireEvent.click(btnCancelar);

      expect(screen.getByText('Novo Lançamento')).toBeInTheDocument();
      expect(screen.queryByText('Modo Edição')).not.toBeInTheDocument();
    });

    it('deve submeter a atualização com updateTransacao ao salvar alterações', async () => {
      api.updateTransacao.mockResolvedValue({ id: 1 });
      renderPage();

      await waitFor(() => {
        expect(screen.getByText('Venda de Pizza')).toBeInTheDocument();
      });

      const btnEditar = screen.getAllByTitle('Editar')[0];
      fireEvent.click(btnEditar);

      const inputDesc = screen.getByDisplayValue('Venda de Pizza');
      fireEvent.change(inputDesc, { target: { value: 'Venda de Pizza Especial' } });

      const btnSalvar = screen.getByRole('button', { name: /Salvar Alterações/i });
      fireEvent.click(btnSalvar);

      await waitFor(() => {
        expect(api.updateTransacao).toHaveBeenCalledWith(1, expect.objectContaining({
          descricao: 'Venda de Pizza Especial',
          valor: 85.5,
          tipo: 'Entrada',
          status: 'Pago',
          data: expect.any(String),
          contaId: 1,
          categoriaId: 10,
        }));
      });

      await waitFor(() => {
        expect(screen.getByText('Lançamento atualizado!')).toBeInTheDocument();
      });
    });
  });

  describe('Quick Status Toggle em Lançamentos', () => {
    it('deve alternar status de Pendente para Pago e de Pago para Pendente com 1 clique', async () => {
      renderPage();

      await waitFor(() => {
        expect(screen.getByText('Compra de Insumos')).toBeInTheDocument();
      });

      const btnMarcarPago = screen.getByTitle('Marcar como Pago');
      fireEvent.click(btnMarcarPago);

      await waitFor(() => {
        expect(api.updateTransacaoStatus).toHaveBeenCalledWith(2, 'Pago');
        expect(screen.getByText('Lançamento marcado como Pago!')).toBeInTheDocument();
      });
    });
  });

  describe('Exclusão de Transação', () => {
    it('deve chamar deleteTransacao e recarregar a lista', async () => {
      api.deleteTransacao.mockResolvedValue();
      renderPage();

      await waitFor(() => {
        expect(screen.getByText('Venda de Pizza')).toBeInTheDocument();
      });

      const btnExcluir = screen.getAllByTitle('Excluir')[0];
      fireEvent.click(btnExcluir);

      await waitFor(() => {
        expect(api.deleteTransacao).toHaveBeenCalledWith(1, {});
        expect(screen.getByText('Lançamento excluído com sucesso.')).toBeInTheDocument();
      });
    });

    it('deve exibir toast de erro quando deleteTransacao falhar', async () => {
      api.deleteTransacao.mockRejectedValue(new Error('Erro ao excluir'));
      renderPage();

      await waitFor(() => {
        expect(screen.getByText('Venda de Pizza')).toBeInTheDocument();
      });

      const btnExcluir = screen.getAllByTitle('Excluir')[0];
      fireEvent.click(btnExcluir);

      await waitFor(() => {
        expect(screen.getByText('Erro ao excluir')).toBeInTheDocument();
      });
    });
  });
});

