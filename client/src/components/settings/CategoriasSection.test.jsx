import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CategoriasSection, { CATEGORY_COLORS, PIZZARIA_PRESETS, QUICK_EMOJIS } from './CategoriasSection';
import { ToastProvider } from '../../contexts/ToastContext';
import * as api from '../../services/api';

const mockCategorias = [
  { id: 1, nome: '🍕 Pizzas & Salão', tipo: 'Entrada', cor: '#00cc4b' },
  { id: 2, nome: '🧀 Queijos & Laticínios', tipo: 'Saida', cor: '#f59e0b' },
];

describe('CategoriasSection.jsx', () => {
  const mockSetCategorias = vi.fn();

  beforeEach(() => {
    vi.restoreAllMocks();
    mockSetCategorias.mockClear();
  });

  function renderSection(categorias = mockCategorias) {
    return render(
      <ToastProvider>
        <CategoriasSection categorias={categorias} setCategorias={mockSetCategorias} />
      </ToastProvider>,
    );
  }

  it('deve conter 24 cores na paleta expandida', () => {
    expect(CATEGORY_COLORS.length).toBe(24);
  });

  it('deve renderizar a lista de categorias existentes', () => {
    renderSection();
    expect(screen.getByText('🍕 Pizzas & Salão')).toBeInTheDocument();
    expect(screen.getByText('🧀 Queijos & Laticínios')).toBeInTheDocument();
    expect(screen.getByText('2 CATEGORIA(S)')).toBeInTheDocument();
  });

  it('deve renderizar os modelos sugeridos para pizzaria e preencher formulário ao clicar', () => {
    renderSection();

    expect(screen.getByText(/Modelos Sugeridos para Pizzaria/i)).toBeInTheDocument();
    
    // Clicar no preset de Embalagens
    const btnEmbalagens = screen.getByRole('button', { name: /📦 Embalagens & Caixas/i });
    expect(btnEmbalagens).toBeInTheDocument();
    fireEvent.click(btnEmbalagens);

    // O formulário de nova categoria deve abrir preenchido
    const inputNome = screen.getByPlaceholderText('Nome da categoria (ex: Vendas, Alimentação...)');
    expect(inputNome).toBeInTheDocument();
    expect(inputNome.value).toBe('📦 Embalagens & Caixas');
  });

  it('deve permitir aplicar emoji ao nome da categoria', () => {
    renderSection();

    // Abrir formulário
    const btnNova = screen.getByRole('button', { name: /Nova Categoria/i });
    fireEvent.click(btnNova);

    const inputNome = screen.getByPlaceholderText('Nome da categoria (ex: Vendas, Alimentação...)');
    fireEvent.change(inputNome, { target: { value: 'Forno e Manutenção' } });

    // Clicar no emoji 🔥
    const btnFogo = screen.getByTitle('Adicionar 🔥');
    fireEvent.click(btnFogo);

    expect(inputNome.value).toBe('🔥 Forno e Manutenção');
  });

  it('deve criar uma nova categoria chamando a API createCategoria', async () => {
    const novaCriada = { id: 3, nome: '🛵 Motoboy & Entregas', tipo: 'Saida', cor: '#0ea5e9' };
    vi.spyOn(api, 'createCategoria').mockResolvedValue(novaCriada);

    renderSection();

    const btnPreset = screen.getByRole('button', { name: /🛵 Motoboy & Entregas/i });
    fireEvent.click(btnPreset);

    const btnSalvar = screen.getByRole('button', { name: 'Salvar Categoria' });
    fireEvent.click(btnSalvar);

    await waitFor(() => {
      expect(api.createCategoria).toHaveBeenCalledWith({
        nome: '🛵 Motoboy & Entregas',
        tipo: 'Saida',
        cor: '#0ea5e9',
      });
      expect(mockSetCategorias).toHaveBeenCalled();
    });
  });

  it('deve abrir modal de edição ao clicar em uma categoria e permitir atualizar', async () => {
    vi.spyOn(api, 'updateCategoria').mockResolvedValue();

    renderSection();

    const card = screen.getByText('🧀 Queijos & Laticínios');
    fireEvent.click(card);

    expect(screen.getByRole('heading', { name: 'Editar Categoria' })).toBeInTheDocument();

    const inputNome = screen.getByDisplayValue('🧀 Queijos & Laticínios');
    fireEvent.change(inputNome, { target: { value: '🧀 Queijos & Mussarela' } });

    const btnSalvar = screen.getByRole('button', { name: 'Salvar' });
    fireEvent.click(btnSalvar);

    await waitFor(() => {
      expect(api.updateCategoria).toHaveBeenCalledWith(2, {
        nome: '🧀 Queijos & Mussarela',
        tipo: 'Saida',
        cor: '#f59e0b',
      });
    });
  });
});
