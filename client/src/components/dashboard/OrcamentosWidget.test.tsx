// @ts-nocheck
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import OrcamentosWidget from './OrcamentosWidget';
import * as api from '../../services/api';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

describe('OrcamentosWidget', () => {
  const categoriasMock: any = [
    { id: 1, nome: 'Alimentação', cor: '#ff5500', tipo: 'Despesa' as const },
    { id: 2, nome: 'Transporte', cor: '#00cc4b', tipo: 'Despesa' as const },
  ] as any;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve exibir mensagem quando não houver orçamentos cadastrados', async () => {
    vi.spyOn(api, 'getOrcamentosResumo').mockResolvedValue([] as any as any);

    render(<OrcamentosWidget mes={9} ano={2026} categorias={categoriasMock as any} />);

    expect(screen.getByText('Carregando orçamentos...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Nenhum orçamento ativo')).toBeInTheDocument();
    });

    const btn = screen.getByRole('button', { name: /definir orçamentos/i });
    fireEvent.click(btn as any);
    expect(mockNavigate).toHaveBeenCalledWith('/ajustes#orcamentos');
  });

  it('deve renderizar lista de orçamentos com progresso e badges correspondentes', async () => {
    vi.spyOn(api, 'getOrcamentosResumo').mockResolvedValue([
      {
        id: 10, categoriaId: 1, valorLimite: 1000, totalGasto: 400, percentualUso: 40, mes: 9, ano: 2026,
      },
      {
        id: 11, categoriaId: 2, valorLimite: 500, totalGasto: 600, percentualUso: 120, mes: 9, ano: 2026,
      },
    ] as any as any);

    render(<OrcamentosWidget mes={9} ano={2026} categorias={categoriasMock as any} />);

    await waitFor(() => {
      expect(screen.getByText('Alimentação')).toBeInTheDocument();
      expect(screen.getByText('Transporte')).toBeInTheDocument();
    });

    // Badge 40% (sob controle)
    expect(screen.getByText('40%')).toBeInTheDocument();

    // Badge Estourado (120%)
    expect(screen.getByText(/Estourado \(120%\)/)).toBeInTheDocument();
  });
});
