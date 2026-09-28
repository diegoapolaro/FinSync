import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import InlineTransactionEditor from './InlineTransactionEditor';

import type { CategoriaDto, ContaDto, TransacaoDto } from '../../types/api';
import { TipoTransacao, TipoConta, StatusTransacao } from '../../types/enums';

const mockCategoriasPorTipo: Record<string, CategoriaDto[]> = {
  Entrada: [
    { id: 1, nome: 'Vendas', tipo: TipoTransacao.Entrada, cor: '#000' },
    { id: 2, nome: 'Rendimentos', tipo: TipoTransacao.Entrada, cor: '#000' },
  ],
  Saida: [
    { id: 3, nome: 'Alimentação', tipo: TipoTransacao.Saida, cor: '#000' },
    { id: 4, nome: 'Transporte', tipo: TipoTransacao.Saida, cor: '#000' },
  ],
};

const mockContas: ContaDto[] = [
  { id: 1, nome: 'Conta Principal', tipo: TipoConta.Pessoal, arquivada: false },
  { id: 2, nome: 'Conta PJ', tipo: TipoConta.Comercial, arquivada: false },
];

const mockTransacao: TransacaoDto = {
  id: 10,
  descricao: 'Supermercado',
  valor: 150.75,
  tipo: TipoTransacao.Saida,
  status: StatusTransacao.Pendente,
  data: '2026-09-01',
  categoriaId: 3,
  contaId: 1,
  contaNome: 'Conta Principal',
  categoriaNome: 'Alimentação',
  categoriaCor: '#000',
};

describe('InlineTransactionEditor.jsx', () => {
  beforeEach(() => {
    localStorage.setItem('finsync_preferencias', JSON.stringify({}));
  });

  it('deve renderizar os valores iniciais da transação corretamente', () => {
    render(
      <InlineTransactionEditor
        transacao={mockTransacao}
        categoriasPorTipo={mockCategoriasPorTipo}
        contas={mockContas}
        onSalvar={vi.fn()}
        onCancelar={vi.fn()}
      />,
    );

    expect(screen.getByText('Editar Lançamento')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Supermercado')).toBeInTheDocument();
    expect(screen.getByDisplayValue('150,75')).toBeInTheDocument();
    expect(screen.getByDisplayValue('2026-09-01')).toBeInTheDocument();
  });

  it('deve chamar onSalvar com os dados atualizados ao submeter o formulário', () => {
    const handleSalvar = vi.fn();
    render(
      <InlineTransactionEditor
        transacao={mockTransacao}
        categoriasPorTipo={mockCategoriasPorTipo}
        contas={mockContas}
        onSalvar={handleSalvar}
        onCancelar={vi.fn()}
      />,
    );

    const inputDesc = screen.getByDisplayValue('Supermercado');
    fireEvent.change(inputDesc as any, { target: { value: 'Supermercado Mensal' } });

    const inputValor = screen.getByDisplayValue('150,75');
    fireEvent.change(inputValor as any, { target: { value: '180,00' } });

    const btnPago = screen.getByRole('button', { name: /Pago/i });
    fireEvent.click(btnPago as any);

    const btnSubmit = screen.getByRole('button', { name: /Salvar Alterações/i });
    fireEvent.click(btnSubmit as any);

    expect(handleSalvar).toHaveBeenCalledTimes(1);
    expect(handleSalvar).toHaveBeenCalledWith({
      descricao: 'Supermercado Mensal',
      valor: 180,
      tipo: 'Saida',
      status: 'Pago',
      data: '2026-09-01',
      categoriaId: 3,
      contaId: 1,
    });
  });

  it('deve chamar onCancelar ao clicar no botão Cancelar ou no ícone X', () => {
    const handleCancelar = vi.fn();
    render(
      <InlineTransactionEditor
        transacao={mockTransacao}
        categoriasPorTipo={mockCategoriasPorTipo}
        contas={mockContas}
        onSalvar={vi.fn()}
        onCancelar={handleCancelar}
      />,
    );

    const btnCancelar = screen.getByRole('button', { name: /Cancelar/i });
    fireEvent.click(btnCancelar as any);
    expect(handleCancelar).toHaveBeenCalledTimes(1);

    const btnFechar = screen.getByTitle(/Fechar edição/i);
    fireEvent.click(btnFechar as any);
    expect(handleCancelar).toHaveBeenCalledTimes(2);
  });

  it('deve chamar onCancelar ao pressionar a tecla Escape', () => {
    const handleCancelar = vi.fn();
    const { container } = render(
      <InlineTransactionEditor
        transacao={mockTransacao}
        categoriasPorTipo={mockCategoriasPorTipo}
        contas={mockContas}
        onSalvar={vi.fn()}
        onCancelar={handleCancelar}
      />,
    );

    const form = container.querySelector('form');
    if (form) {
      fireEvent.keyDown(form, { key: 'Escape' });
    }
    expect(handleCancelar).toHaveBeenCalledTimes(1);
  });

  it('deve exibir indicador de parcelamento quando a transação for parcelada', () => {
    render(
      <InlineTransactionEditor
        transacao={{ ...mockTransacao, parcelamentoId: 'abc-123', numeroParcela: 2, totalParcelas: 5 }}
        categoriasPorTipo={mockCategoriasPorTipo}
        contas={mockContas}
        onSalvar={vi.fn()}
        onCancelar={vi.fn()}
      />,
    );

    expect(screen.getByText('Parcela 2/5')).toBeInTheDocument();
  });

  it('deve exibir indicador de recorrência quando a transação for recorrente', () => {
    render(
      <InlineTransactionEditor
        transacao={{ ...mockTransacao, recorrenciaId: 99, frequenciaRecorrencia: 'Mensal' }}
        categoriasPorTipo={mockCategoriasPorTipo}
        contas={mockContas}
        onSalvar={vi.fn()}
        onCancelar={vi.fn()}
      />,
    );

    expect(screen.getByText('Mensal')).toBeInTheDocument();
  });
});
