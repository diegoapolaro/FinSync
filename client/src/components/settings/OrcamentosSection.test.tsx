import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import OrcamentosSection from './OrcamentosSection';
import { ToastProvider } from '../../contexts/ToastContext';
import * as api from '../../services/api';
import type { CategoriaDto, StatusOrcamentoDto, OrcamentoDto } from '../../types/api';
import { TipoTransacao } from '../../types/enums';

const mockCategorias: CategoriaDto[] = [
  { id: 10, nome: 'Alimentação', tipo: TipoTransacao.Saida, cor: '#ff4433' },
  { id: 20, nome: 'Transporte', tipo: TipoTransacao.Saida, cor: '#3b82f6' },
  { id: 30, nome: 'Salário', tipo: TipoTransacao.Entrada, cor: '#00cc4b' },
];

const mockOrcamentosResumo: StatusOrcamentoDto[] = [
  {
    id: 1,
    categoriaId: 10,
    valorLimite: 1000,
    totalGasto: 450,
    percentualUso: 45,
    mes: new Date().getMonth() + 1,
    ano: new Date().getFullYear(),
  },
];

describe('OrcamentosSection.jsx and OrcamentoModal', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  function renderComponent(props = {}) {
    return render(
      <ToastProvider>
        <OrcamentosSection categorias={mockCategorias} {...props} />
      </ToastProvider>,
    );
  }

  it('deve carregar e renderizar os orçamentos do mês', async () => {
    vi.spyOn(api, 'getOrcamentosResumo').mockResolvedValue(mockOrcamentosResumo as any as any);

    renderComponent();

    expect(screen.getByText('Carregando orçamentos...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Alimentação')).toBeInTheDocument();
      expect(screen.getByText(/45.0% utilizado/i)).toBeInTheDocument();
    });
  });

  it('deve abrir o modal ao clicar no botão "Novo Orçamento"', async () => {
    vi.spyOn(api, 'getOrcamentosResumo').mockResolvedValue(mockOrcamentosResumo as any as any);

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Alimentação')).toBeInTheDocument();
    });

    const btnNovo = screen.getByRole('button', { name: /novo orçamento/i });
    expect(btnNovo).toBeInTheDocument();

    fireEvent.click(btnNovo as any);

    // O modal deve estar presente e visível na tela
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Novo Orçamento' })).toBeInTheDocument();
      expect(screen.getByLabelText(/categoria/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/valor limite/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /salvar limite/i })).toBeInTheDocument();
    });
  });

  it('deve permitir preencher o formulário e criar um novo orçamento', async () => {
    vi.spyOn(api, 'getOrcamentosResumo').mockResolvedValue([] as any as any);
    const createSpy = vi.spyOn(api, 'createOrcamento').mockResolvedValue({ id: 2 } as any as any);

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Nenhum limite definido neste mês.')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /novo orçamento/i } as any));

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Novo Orçamento' })).toBeInTheDocument();
    });

    // Selecionar categoria de saída (Transporte)
    const selectCat = screen.getByLabelText(/categoria/i);
    fireEvent.change(selectCat as any, { target: { value: '20' } });

    // Preencher valor
    const inputValor = screen.getByLabelText(/valor limite/i);
    fireEvent.change(inputValor as any, { target: { value: '350.00' } });

    // Submeter
    fireEvent.click(screen.getByRole('button', { name: /salvar limite/i } as any));

    await waitFor(() => {
      expect(createSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          categoriaId: 20,
          valorLimite: 350,
        }),
      );
    });
  });

  it('deve permitir abrir o modal em modo de edição e atualizar o limite', async () => {
    vi.spyOn(api, 'getOrcamentosResumo').mockResolvedValue(mockOrcamentosResumo as any as any);
    const updateSpy = vi.spyOn(api, 'updateOrcamento').mockResolvedValue({} as any as any);

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Alimentação')).toBeInTheDocument();
    });

    // Botões de ação (editar e excluir)
    const buttons = screen.getAllByRole('button');
    // Encontrar o botão de edição (ícone do lápis)
    const editBtn = buttons.find((btn) => btn.querySelector('.lucide-pencil'));
    expect(editBtn).toBeDefined();

    fireEvent.click(editBtn as any);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Editar Orçamento' })).toBeInTheDocument();
      expect(screen.getByDisplayValue('1000')).toBeInTheDocument();
      // Na edição, o seletor de categoria deve estar desabilitado
      expect(screen.getByLabelText(/categoria/i)).toBeDisabled();
    });

    // Alterar o valor limite
    const inputValor = screen.getByLabelText(/valor limite/i);
    fireEvent.change(inputValor as any, { target: { value: '1200' } });

    fireEvent.click(screen.getByRole('button', { name: /salvar limite/i } as any));

    await waitFor(() => {
      expect(updateSpy).toHaveBeenCalledWith('1', { valorLimite: 1200 });
    });
  });

  it('deve permitir excluir um orçamento após confirmação', async () => {
    vi.spyOn(api, 'getOrcamentosResumo').mockResolvedValue(mockOrcamentosResumo as any as any);
    const deleteSpy = vi.spyOn(api, 'deleteOrcamento').mockResolvedValue({} as any as any);
    vi.spyOn(window, 'confirm').mockReturnValue(true);

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Alimentação')).toBeInTheDocument();
    });

    const buttons = screen.getAllByRole('button');
    const deleteBtn = buttons.find((btn) => btn.querySelector('.lucide-trash-2'));
    expect(deleteBtn).toBeDefined();

    fireEvent.click(deleteBtn as any);

    await waitFor(() => {
      expect(deleteSpy).toHaveBeenCalledWith('1');
    });
  });

  it('deve exibir aviso amigável quando não houver categorias de saída cadastradas', async () => {
    vi.spyOn(api, 'getOrcamentosResumo').mockResolvedValue([] as any as any);

    // Passar apenas categorias do tipo Entrada
    const apenasEntradas: CategoriaDto[] = [{ id: 99, nome: 'Vendas', tipo: TipoTransacao.Entrada, cor: '#00cc4b' }];
    render(
      <ToastProvider>
        <OrcamentosSection categorias={apenasEntradas} />
      </ToastProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText('Nenhum limite definido neste mês.')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /novo orçamento/i } as any));

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Novo Orçamento' })).toBeInTheDocument();
      expect(screen.getByText(/nenhuma categoria de despesa encontrada/i)).toBeInTheDocument();
    });
  });

  it('não deve roubar o foco para o botão X ao digitar números no campo de valor limite', async () => {
    vi.spyOn(api, 'getOrcamentosResumo').mockResolvedValue([] as any as any);

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Nenhum limite definido neste mês.')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /novo orçamento/i } as any));

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Novo Orçamento' })).toBeInTheDocument();
    });

    const inputValor = screen.getByLabelText(/valor limite/i);
    inputValor.focus();
    expect(document.activeElement).toBe(inputValor);

    // Digita primeiro dígito
    fireEvent.change(inputValor as any, { target: { value: '5' } });
    expect(document.activeElement).toBe(inputValor);

    // Digita segundo dígito
    fireEvent.change(inputValor as any, { target: { value: '50' } });
    expect(document.activeElement).toBe(inputValor);

    // O botão de fechar não deve ter recebido o foco
    const closeBtn = screen.getByRole('button', { name: /fechar/i });
    expect(document.activeElement).not.toBe(closeBtn);
  });
});
