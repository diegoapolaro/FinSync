import { describe, it, expect } from 'vitest';
import { transacoesFiltradasPorPeriodo, periodoEfetivoParaApi } from './filterTransacoes';

const transacoes = [
  { id: 1, data: '2026-08-02', valor: 100 },
  { id: 2, data: '2026-08-05', valor: 200 },
  { id: 3, data: '2026-08-28', valor: 300 },
  { id: 4, data: '2026-09-05', valor: 400 },
];

describe('transacoesFiltradasPorPeriodo', () => {
  it('returns all transactions for "mes" mode', () => {
    const result = transacoesFiltradasPorPeriodo(
      transacoes,
      'mes',
      new Date(2026, 7, 3),
      new Date(2026, 7, 1),
      new Date(2026, 7, 31),
    );
    expect(result).toHaveLength(4);
  });

  it('filters by exact day for "dia" mode', () => {
    const result = transacoesFiltradasPorPeriodo(
      transacoes,
      'dia',
      new Date(2026, 7, 2),
      new Date(2026, 7, 1),
      new Date(2026, 7, 31),
    );
    expect(result.map((t) => t.id)).toEqual([1]);
  });

  it('filters inclusive range for "periodo" mode', () => {
    const result = transacoesFiltradasPorPeriodo(
      transacoes,
      'periodo',
      new Date(2026, 7, 3),
      new Date(2026, 7, 28),
      new Date(2026, 8, 5),
    );
    expect(result.map((t) => t.id)).toEqual([3, 4]);
  });

  it('returns empty array when nothing matches', () => {
    const result = transacoesFiltradasPorPeriodo(
      transacoes,
      'dia',
      new Date(2026, 7, 15),
      new Date(2026, 7, 1),
      new Date(2026, 7, 31),
    );
    expect(result).toEqual([]);
  });
});

describe('periodoEfetivoParaApi', () => {
  const mesRef = new Date(2026, 7, 3); // agosto/2026
  const dia = new Date(2026, 7, 2);
  const inicio = new Date(2026, 7, 28);
  const fim = new Date(2026, 8, 5);

  it('uses full month for "mes" mode', () => {
    expect(periodoEfetivoParaApi('mes', mesRef, dia, inicio, fim)).toEqual({
      dataInicio: '2026-08-01',
      dataFim: '2026-08-31',
    });
  });

  it('uses same day for "dia" mode', () => {
    expect(periodoEfetivoParaApi('dia', mesRef, dia, inicio, fim)).toEqual({
      dataInicio: '2026-08-02',
      dataFim: '2026-08-02',
    });
  });

  it('uses custom range for "periodo" mode', () => {
    expect(periodoEfetivoParaApi('periodo', mesRef, dia, inicio, fim)).toEqual({
      dataInicio: '2026-08-28',
      dataFim: '2026-09-05',
    });
  });
});
