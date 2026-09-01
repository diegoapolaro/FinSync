import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import InlineTransactionEditor from './InlineTransactionEditor';

const mockCategoriasPorTipo = {
  Entrada: [
    { id: 1, nome: 'Vendas', tipo: 'Entrada' },
    { id: 2, nome: 'Rendimentos', tipo: 'Entrada' },
  ],
  Saida: [
    { id: 3, nome: 'Alimentação', tipo: 'Saida' },
    { id: 4, nome: 'Transporte', tipo: 'Saida' },
  ],
};

const mockContas = [
  { id: 1, nome: 'Conta Principal', tipo: 'Pessoal' },
  { id: 2, nome: 'Conta PJ', tipo: 'Comercial' },
];

const mockTransacao = {
  id: 10,
  descricao: 'Supermercado',
  valor: 150.75,
  tipo: 'Saida',
  status: 'Pendente',
  data: '2026-09-01',
  categoriaId: 3,
  contaId: 1,
};

describe('InlineTransactionEditor.jsx', () => {
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
    fireEvent.change(inputDesc, { target: { value: 'Supermercado Mensal' } });

    const inputValor = screen.getByDisplayValue('150,75');
    fireEvent.change(inputValor, { target: { value: '180,00' } });

    const btnPago = screen.getByRole('button', { name: /Pago/i });
    fireEvent.click(btnPago);

    const btnSubmit = screen.getByRole('button', { name: /Salvar Alterações/i });
    fireEvent.click(btnSubmit);

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
    fireEvent.click(btnCancelar);
    expect(handleCancelar).toHaveBeenCalledTimes(1);

    const btnFechar = screen.getByTitle(/Fechar edição/i);
    fireEvent.click(btnFechar);
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
    fireEvent.keyDown(form, { key: 'Escape' });
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