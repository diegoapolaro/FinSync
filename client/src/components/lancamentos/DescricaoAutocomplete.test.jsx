import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import DescricaoAutocomplete from './DescricaoAutocomplete';
import * as api from '../../services/api';

vi.mock('../../services/api', () => ({
  getSugestoesDescricao: vi.fn(),
}));

const mockSugestoes = [
  { descricao: 'Supermercado Extra', totalUsos: 15, ultimaData: '2026-09-10', categoriaId: 1 },
  { descricao: 'Padaria Central', totalUsos: 8, ultimaData: '2026-09-08', categoriaId: 2 },
  { descricao: 'Farmácia Popular', totalUsos: 3, ultimaData: '2026-09-05', categoriaId: 3 },
  { descricao: 'Posto Shell', totalUsos: 1, ultimaData: '2026-09-01', categoriaId: 4 },
];

describe('DescricaoAutocomplete.jsx', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.getSugestoesDescricao.mockResolvedValue(mockSugestoes);
  });

  it('deve renderizar o campo com placeholder e valor inicial', async () => {
    render(
      <DescricaoAutocomplete
        value="Compras do mês"
        onChange={vi.fn()}
        placeholder="Digite a descrição"
      />,
    );

    const input = screen.getByPlaceholderText('Digite a descrição');
    expect(input).toBeInTheDocument();
    expect(input.value).toBe('Compras do mês');
    await waitFor(() => expect(api.getSugestoesDescricao).toHaveBeenCalled());
  });

  it('deve carregar sugestões da API ao focar no campo e ordenar mais frequentes no topo', async () => {
    render(
      <DescricaoAutocomplete
        value=""
        onChange={vi.fn()}
        tipo="Saida"
        contaId={1}
      />,
    );

    await waitFor(() => {
      expect(api.getSugestoesDescricao).toHaveBeenCalledWith({
        contaId: 1,
        tipo: 'Saida',
        limite: 60,
      });
    });

    const input = screen.getByRole('textbox');
    fireEvent.focus(input);

    // Deve abrir o menu flutuante com as opções
    expect(screen.getByText('Sugestões Frequentes')).toBeInTheDocument();
    expect(screen.getByText('15x')).toBeInTheDocument();
    expect(screen.getByText('8x')).toBeInTheDocument();

    const options = screen.getAllByRole('option');
    expect(options[0]).toHaveTextContent('Supermercado Extra');
    expect(options[1]).toHaveTextContent('Padaria Central');
    expect(options[2]).toHaveTextContent('Farmácia Popular');
  });

  it('deve filtrar dinamicamente as sugestões conforme o usuário digita (insensível a maiúsculas e acentos)', async () => {
    const handleChange = vi.fn();
    const { rerender } = render(
      <DescricaoAutocomplete
        value=""
        onChange={handleChange}
        tipo="Saida"
        contaId={1}
      />,
    );

    await waitFor(() => expect(api.getSugestoesDescricao).toHaveBeenCalled());

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'farmacia' } });
    expect(handleChange).toHaveBeenCalled();

    // Rerenderiza com o novo valor digitado
    rerender(
      <DescricaoAutocomplete
        value="farmacia"
        onChange={handleChange}
        tipo="Saida"
        contaId={1}
      />,
    );

    // Apenas Farmácia Popular deve aparecer, as outras não
    expect(screen.getByText('Farmácia Popular')).toBeInTheDocument();
    expect(screen.queryByText('Supermercado Extra')).not.toBeInTheDocument();
    expect(screen.queryByText('Padaria Central')).not.toBeInTheDocument();
  });

  it('deve selecionar sugestão ao clicar e fechar o dropdown', async () => {
    const handleChange = vi.fn();
    const handleSelect = vi.fn();

    render(
      <DescricaoAutocomplete
        value=""
        onChange={handleChange}
        onSelect={handleSelect}
        tipo="Saida"
        contaId={1}
      />,
    );

    await waitFor(() => expect(api.getSugestoesDescricao).toHaveBeenCalled());

    const input = screen.getByRole('textbox');
    fireEvent.focus(input);

    const option = screen.getByText('Padaria Central');
    fireEvent.mouseDown(option);

    expect(handleChange).toHaveBeenCalledWith({
      target: { value: 'Padaria Central' },
    });
    expect(handleSelect).toHaveBeenCalledWith(
      expect.objectContaining({ descricao: 'Padaria Central', totalUsos: 8 }),
    );

    // Menu deve fechar
    expect(screen.queryByText('Sugestões Frequentes')).not.toBeInTheDocument();
  });

  it('deve navegar pelas opções usando setas do teclado e selecionar com Enter', async () => {
    const handleChange = vi.fn();
    const handleSelect = vi.fn();

    render(
      <DescricaoAutocomplete
        value=""
        onChange={handleChange}
        onSelect={handleSelect}
        tipo="Saida"
        contaId={1}
      />,
    );

    await waitFor(() => expect(api.getSugestoesDescricao).toHaveBeenCalled());

    const input = screen.getByRole('textbox');
    fireEvent.focus(input);

    // Seta para baixo -> seleciona primeira opção (Supermercado Extra)
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    const options = screen.getAllByRole('option');
    expect(options[0]).toHaveAttribute('aria-selected', 'true');

    // Seta para baixo -> segunda opção (Padaria Central)
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    expect(options[1]).toHaveAttribute('aria-selected', 'true');

    // Pressiona Enter
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(handleChange).toHaveBeenCalledWith({
      target: { value: 'Padaria Central' },
    });
    expect(handleSelect).toHaveBeenCalledWith(
      expect.objectContaining({ descricao: 'Padaria Central' }),
    );
  });

  it('deve fechar as sugestões ao pressionar Escape', async () => {
    render(
      <DescricaoAutocomplete
        value=""
        onChange={vi.fn()}
        tipo="Saida"
        contaId={1}
      />,
    );

    await waitFor(() => expect(api.getSugestoesDescricao).toHaveBeenCalled());

    const input = screen.getByRole('textbox');
    fireEvent.focus(input);

    expect(screen.getByText('Sugestões Frequentes')).toBeInTheDocument();

    fireEvent.keyDown(input, { key: 'Escape' });
    expect(screen.queryByText('Sugestões Frequentes')).not.toBeInTheDocument();
  });
});
