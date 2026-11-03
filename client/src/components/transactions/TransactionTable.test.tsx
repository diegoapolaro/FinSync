import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import TransactionTable from './TransactionTable';
import { TipoTransacao, StatusTransacao } from '../../types/enums';
import type { TransacaoDto } from '../../types/api';

const mockTransacoes: TransacaoDto[] = [
  {
    id: 1,
    descricao: 'Compra Mercado Central',
    valor: 250.5,
    tipo: TipoTransacao.Saida,
    status: StatusTransacao.Pago,
    data: '2026-11-03',
    contaId: 1,
    contaNome: 'Cartão Black Nubank',
    categoriaId: 10,
    categoriaNome: 'Alimentação',
    categoriaCor: '#10b981',
  },
  {
    id: 2,
    descricao: 'Transferência Pix Freelance',
    valor: 3500.0,
    tipo: TipoTransacao.Entrada,
    status: StatusTransacao.Pendente,
    data: '2026-11-04',
    contaId: 2,
    contaNome: 'Chave Pix Santander',
    categoriaId: 20,
    categoriaNome: 'Serviços',
    categoriaCor: '#3b82f6',
    recorrenciaId: 101,
    frequenciaRecorrencia: 'Mensal' as any,
  },
  {
    id: 3,
    descricao: 'Notebook Parcelado',
    valor: 450.0,
    tipo: TipoTransacao.Saida,
    status: StatusTransacao.Pendente,
    data: '2026-11-05',
    contaId: 3,
    contaNome: 'Banco Itaú',
    categoriaId: 30,
    categoriaNome: 'Equipamentos',
    parcelamentoId: 'parc-123',
    numeroParcela: 2,
    totalParcelas: 10,
  },
];

describe('TransactionTable', () => {
  it('deve renderizar os cabeçalhos de alta densidade institucionais', () => {
    render(
      <TransactionTable
        transacoes={mockTransacoes}
        onDelete={vi.fn()}
        onToggleStatus={vi.fn()}
      />,
    );

    expect(screen.getByText('Data / Hora')).toBeInTheDocument();
    expect(screen.getByText('Descrição da Operação')).toBeInTheDocument();
    expect(screen.getByText('Categoria')).toBeInTheDocument();
    expect(screen.getByText('Conta / Origem')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Valor Líquido')).toBeInTheDocument();
    expect(screen.getByText('Ações')).toBeInTheDocument();
  });

  it('deve renderizar os dados das transações e badges de parcelamento/recorrência', () => {
    render(
      <TransactionTable
        transacoes={mockTransacoes}
        onDelete={vi.fn()}
        onToggleStatus={vi.fn()}
      />,
    );

    expect(screen.getByText('Compra Mercado Central')).toBeInTheDocument();
    expect(screen.getByText('Transferência Pix Freelance')).toBeInTheDocument();
    expect(screen.getByText('Notebook Parcelado')).toBeInTheDocument();

    // Contas
    expect(screen.getByText('Cartão Black Nubank')).toBeInTheDocument();
    expect(screen.getByText('Chave Pix Santander')).toBeInTheDocument();
    expect(screen.getByText('Banco Itaú')).toBeInTheDocument();

    // Categorias
    expect(screen.getByText('Alimentação')).toBeInTheDocument();
    expect(screen.getByText('Serviços')).toBeInTheDocument();
    expect(screen.getByText('Equipamentos')).toBeInTheDocument();

    // Recorrência e parcelas
    expect(screen.getByText('Mensal')).toBeInTheDocument();
    expect(screen.getByText('2/10')).toBeInTheDocument();
  });

  it('deve disparar onToggleStatus ao clicar no status badge ou no botão de ação', () => {
    const handleToggle = vi.fn();
    render(
      <TransactionTable
        transacoes={mockTransacoes}
        onDelete={vi.fn()}
        onToggleStatus={handleToggle}
      />,
    );

    // Primeiro item é Pago, então o botão tem title "Marcar como Pendente"
    const botoesPendente = screen.getAllByTitle('Marcar como Pendente');
    expect(botoesPendente.length).toBeGreaterThan(0);
    fireEvent.click(botoesPendente[0]);

    expect(handleToggle).toHaveBeenCalledWith(mockTransacoes[0]);
  });

  it('deve disparar onDelete com o id correspondente ao clicar no botão excluir', () => {
    const handleDelete = vi.fn();
    render(
      <TransactionTable
        transacoes={mockTransacoes}
        onDelete={handleDelete}
        onToggleStatus={vi.fn()}
      />,
    );

    const botoesExcluir = screen.getAllByTitle('Excluir transação');
    expect(botoesExcluir).toHaveLength(3);

    fireEvent.click(botoesExcluir[0]);
    expect(handleDelete).toHaveBeenCalledWith(1);

    fireEvent.click(botoesExcluir[1]);
    expect(handleDelete).toHaveBeenCalledWith(2);
  });

  it('deve exibir estado de carregamento', () => {
    render(
      <TransactionTable
        transacoes={[]}
        carregando={true}
        onDelete={vi.fn()}
      />,
    );

    expect(screen.getByText('Carregando transações...')).toBeInTheDocument();
  });

  it('deve exibir mensagem customizada ou padrão quando a lista de transações for vazia', () => {
    const { rerender } = render(
      <TransactionTable
        transacoes={[]}
        carregando={false}
        onDelete={vi.fn()}
        emptyMessage="Nenhum registro para exibir"
      />,
    );

    expect(screen.getByText('Nenhum registro para exibir')).toBeInTheDocument();

    rerender(
      <TransactionTable
        transacoes={[]}
        carregando={false}
        onDelete={vi.fn()}
      />,
    );

    expect(screen.getByText('Nenhuma movimentação neste período.')).toBeInTheDocument();
  });
});
