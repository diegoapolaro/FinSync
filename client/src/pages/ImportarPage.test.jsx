import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ImportarPage from './ImportarPage';
import { ToastProvider } from '../contexts/ToastContext';
import * as api from '../services/api';

const mockNavigate = vi.fn();
let mockOutletContext = {
  contaSelecionadaId: '1',
  contas: [{ id: 1, nome: 'Conta Teste', tipo: 'Pessoal' }],
  categorias: [
    { id: 1, nome: 'Alimentação', tipo: 'Saida' },
    { id: 2, nome: 'Salário', tipo: 'Entrada' },
  ],
};

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useOutletContext: () => mockOutletContext,
    useNavigate: () => mockNavigate,
  };
});

describe('ImportarPage.jsx', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    mockNavigate.mockClear();
  });

  it('deve renderizar a área de upload inicial com sucesso', () => {
    render(
      <ToastProvider>
        <ImportarPage />
      </ToastProvider>,
    );

    expect(screen.getByText('Conciliação Inteligente')).toBeInTheDocument();
    expect(screen.getByText('Arraste e solte seu arquivo CSV')).toBeInTheDocument();
  });

  it('deve processar upload de arquivo CSV e renderizar tabela de preview', async () => {
    vi.spyOn(api, 'importarArquivoCsv').mockResolvedValue([
      {
        data: '2026-09-01',
        descricao: 'Compra Mercado',
        valor: 150.0,
        tipo: 'Saida',
      },
    ]);

    render(
      <ToastProvider>
        <ImportarPage />
      </ToastProvider>,
    );

    const input = document.getElementById('csvUpload');
    const file = new File(['data,descricao,valor,tipo'], 'extrato.csv', { type: 'text/csv' });

    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText('Planilha Lida com Sucesso')).toBeInTheDocument();
      expect(screen.getByText('Compra Mercado')).toBeInTheDocument();
    });
  });

  it('deve permitir selecionar categoria e confirmar importação em lote', async () => {
    vi.spyOn(api, 'importarArquivoCsv').mockResolvedValue([
      {
        data: '2026-09-01',
        descricao: 'Compra Mercado',
        valor: 150.0,
        tipo: 'Saida',
      },
    ]);
    const mockCriarLote = vi
      .spyOn(api, 'createTransacoesLote')
      .mockResolvedValue([{ id: 1, descricao: 'Compra Mercado' }]);

    render(
      <ToastProvider>
        <ImportarPage />
      </ToastProvider>,
    );

    const input = document.getElementById('csvUpload');
    const file = new File(['data,descricao,valor,tipo'], 'extrato.csv', { type: 'text/csv' });
    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText('Compra Mercado')).toBeInTheDocument();
    });

    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: '1' } });

    const btnImportar = screen.getByRole('button', { name: /importar lote/i });
    fireEvent.click(btnImportar);

    await waitFor(() => {
      expect(mockCriarLote).toHaveBeenCalledWith([
        expect.objectContaining({
          contaId: 1,
          categoriaId: 1,
          descricao: 'Compra Mercado',
          valor: 150.0,
          tipo: 'Saida',
          status: 'Pago',
        }),
      ]);
      expect(mockNavigate).toHaveBeenCalledWith('/extrato');
    });
  });
});
