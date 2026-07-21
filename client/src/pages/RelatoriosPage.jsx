import { useCallback, useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  getDetalhamento,
  getResumoPeriodo,
} from '../services/api';
import { formatCurrency } from '../utils/formatters';

function formatDateOnly(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function primeiroDiaMes(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function ultimoDiaMes(date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

const periodos = [
  { id: 'diario', label: 'Diário' },
  { id: 'mensal', label: 'Mensal' },
  { id: 'personalizado', label: 'Personalizado' },
];

export default function RelatoriosPage() {
  const { contaSelecionadaId } = useOutletContext();

  const [periodo, setPeriodo] = useState('mensal');
  const [dataRef, setDataRef] = useState(() => new Date());
  const [personalizadoInicio, setPersonalizadoInicio] = useState(() => formatDateOnly(primeiroDiaMes(new Date())));
  const [personalizadoFim, setPersonalizadoFim] = useState(() => formatDateOnly(new Date()));
  const [resumo, setResumo] = useState(null);
  const [detalhamento, setDetalhamento] = useState([]);
  const [carregando, setCarregando] = useState(true);

  const dataInicio =
    periodo === 'personalizado'
      ? personalizadoInicio
      : periodo === 'diario'
        ? formatDateOnly(dataRef)
        : formatDateOnly(primeiroDiaMes(dataRef));

  const dataFim =
    periodo === 'personalizado'
      ? personalizadoFim
      : periodo === 'diario'
        ? formatDateOnly(dataRef)
        : formatDateOnly(ultimoDiaMes(dataRef));

  const carregarDados = useCallback(async () => {
    if (!contaSelecionadaId) {
      setCarregando(false);
      return;
    }

    try {
      const [res, det] = await Promise.all([
        getResumoPeriodo(contaSelecionadaId, dataInicio, dataFim),
        getDetalhamento(contaSelecionadaId, dataInicio, dataFim),
      ]);
      setResumo(res);
      setDetalhamento(det);
    } catch {
      setResumo(null);
      setDetalhamento([]);
    } finally {
      setCarregando(false);
    }
  }, [contaSelecionadaId, dataInicio, dataFim]);

  useEffect(() => {
    setCarregando(true);
    carregarDados();
  }, [carregarDados]);

  function navegar(direcao) {
    const nova = new Date(dataRef);
    if (periodo === 'diario') {
      nova.setDate(nova.getDate() + direcao);
    } else if (periodo === 'mensal') {
      nova.setMonth(nova.getMonth() + direcao);
    }
    setDataRef(nova);
  }

  const totalEntradas = resumo?.totalEntradas ?? 0;
  const totalSaidas = resumo?.totalSaidas ?? 0;
  const saldoPeriodo = resumo?.saldo ?? 0;
  const totalGeral = totalEntradas + totalSaidas;

  const maxPercent = Math.max(...detalhamento.map((d) => Math.abs(d.total)), 0.01);

  return (
    <div className="px-margin-mobile md:px-margin-desktop max-w-7xl mx-auto space-y-md mt-md pt-4 md:pt-6">
      <section className="mb-xl">
        <h1 className="font-headline-xl text-headline-xl text-on-background mb-base">Relatórios Detalhados</h1>
        <p className="text-on-surface-variant font-body-md max-w-2xl">
          Visualize o desempenho das suas finanças com precisão documental. Filtre por período e analise cada centavo movimentado.
        </p>
      </section>

      <section className="mb-xl flex flex-col lg:flex-row lg:items-end justify-between gap-xl">
        <div className="flex items-center gap-base bg-surface-container p-1 rounded-lg">
          {periodos.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => { setPeriodo(p.id); if (p.id !== 'personalizado') setDataRef(new Date()); }}
              className={
                periodo === p.id
                  ? 'px-6 py-2 rounded font-label-caps text-label-caps uppercase tracking-widest ink-stamp-active font-bold'
                  : 'px-6 py-2 rounded font-label-caps text-label-caps uppercase tracking-widest text-on-surface-variant hover:bg-surface-container-high transition-all'
              }
            >
              {p.label}
            </button>
          ))}
        </div>

        <div className="flex flex-col md:flex-row items-center gap-md">
          <div className="flex flex-col gap-1 w-full md:w-auto">
            <label className="font-label-caps text-label-caps text-on-surface-variant ml-1">DE</label>
            <input
              className="bg-white border border-outline-variant rounded-lg px-4 py-2 font-data-md text-data-md"
              type="date"
              value={personalizadoInicio}
              onChange={(e) => setPersonalizadoInicio(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1 w-full md:w-auto">
            <label className="font-label-caps text-label-caps text-on-surface-variant ml-1">ATÉ</label>
            <input
              className="bg-white border border-outline-variant rounded-lg px-4 py-2 font-data-md text-data-md"
              type="date"
              value={personalizadoFim}
              onChange={(e) => setPersonalizadoFim(e.target.value)}
            />
          </div>
          <button
            type="button"
            onClick={() => { setPeriodo('personalizado'); setCarregando(true); carregarDados(); }}
            className="md:mt-5 bg-primary text-on-primary px-8 py-2.5 rounded-lg font-bold hover:bg-primary-container transition-all self-stretch"
          >
            Filtrar
          </button>
        </div>
      </section>

      {periodo !== 'personalizado' && (
        <div className="flex items-center gap-4 mb-6">
          <button
            type="button"
            onClick={() => navegar(-1)}
            className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors p-1"
          >
            chevron_left
          </button>
          <span className="font-label-caps text-label-caps text-on-surface-variant tracking-widest">
            {periodo === 'diario'
              ? dataRef.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' }).toUpperCase()
              : dataRef.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }).toUpperCase()
            }
          </span>
          <button
            type="button"
            onClick={() => navegar(1)}
            className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors p-1"
          >
            chevron_right
          </button>
        </div>
      )}

      {carregando && (
        <p className="text-body-sm font-body-sm text-on-surface-variant text-center py-12">Carregando relatório...</p>
      )}

      {!carregando && !contaSelecionadaId && (
        <p className="text-body-sm font-body-sm text-on-surface-variant text-center py-12">Selecione uma conta para ver os relatórios.</p>
      )}

      {!carregando && contaSelecionadaId && (
        <>
          <section className="grid grid-cols-1 md:grid-cols-3 gap-md mb-xl">
            <div className="md:col-span-2 bg-white p-gutter rounded-xl shadow-sm border-l-4 border-primary relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 opacity-5 pointer-events-none">
                <span className="material-symbols-outlined text-[120px]">account_balance_wallet</span>
              </div>
              <h3 className="font-label-caps text-label-caps text-on-surface-variant mb-base">SALDO DO PERÍODO</h3>
              <div className="flex items-baseline gap-xs">
                <span className="font-data-md text-data-md text-primary opacity-60">R$</span>
                <span className="font-headline-xl text-headline-xl text-on-background">{formatCurrency(saldoPeriodo).replace('R$', '').trim()}</span>
              </div>
              <div className="mt-4 flex items-center gap-xs text-primary">
                <span className="material-symbols-outlined text-sm">trending_up</span>
                <span className="font-label-caps text-label-caps">{saldoPeriodo >= 0 ? 'Positivo no período' : 'Negativo no período'}</span>
              </div>
            </div>

            <div className="bg-white p-gutter rounded-xl shadow-sm border-l-4 border-secondary flex flex-col justify-center">
              <h3 className="font-label-caps text-label-caps text-on-surface-variant mb-base">ENTRADAS</h3>
              <div className="flex items-baseline gap-xs">
                <span className="font-data-md text-data-md text-primary">R$</span>
                <span className="font-data-lg text-data-lg text-on-background">{formatCurrency(totalEntradas).replace('R$', '').trim()}</span>
              </div>
              <div className="mt-xl">
                <h3 className="font-label-caps text-label-caps text-on-surface-variant mb-base">SAÍDAS</h3>
                <div className="flex items-baseline gap-xs">
                  <span className="font-data-md text-data-md text-error">R$</span>
                  <span className="font-data-lg text-data-lg text-on-background">{formatCurrency(totalSaidas).replace('R$', '').trim()}</span>
                </div>
              </div>
            </div>
          </section>

          <section className="bg-white rounded-xl shadow-sm overflow-hidden border-l-4 border-tertiary">
            <div className="p-gutter border-b border-outline-variant flex justify-between items-center bg-surface-container-low">
              <h2 className="font-headline-lg text-headline-lg text-on-surface">Detalhamento por Categoria</h2>
            </div>

            {detalhamento.length === 0 && (
              <p className="text-body-sm font-body-sm text-on-surface-variant text-center py-12">Nenhum lançamento neste período.</p>
            )}

            {detalhamento.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="font-label-caps text-label-caps text-on-surface-variant border-b border-outline-variant">
                      <th className="px-gutter py-4 font-bold">CATEGORIA</th>
                      <th className="px-gutter py-4 font-bold">TRANSAÇÕES</th>
                      <th className="px-gutter py-4 font-bold text-right">VALOR TOTAL</th>
                      <th className="px-gutter py-4 font-bold text-right">PERCENTUAL</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/30">
                    {detalhamento.map((item) => {
                      const absTotal = Math.abs(item.total);
                      const isEntrada = item.total >= 0;
                      const percent = totalGeral > 0 ? (absTotal / totalGeral) * 100 : 0;
                      const barColor = isEntrada ? 'bg-primary' : 'bg-error';
                      const icon = item.categoriaNome?.toLowerCase().includes('aliment')
                        ? 'restaurant'
                        : item.categoriaNome?.toLowerCase().includes('transp')
                          ? 'directions_car'
                          : item.categoriaNome?.toLowerCase().includes('morad') || item.categoriaNome?.toLowerCase().includes('habit')
                            ? 'home'
                            : item.categoriaNome?.toLowerCase().includes('venda')
                              ? 'shopping_cart'
                              : item.categoriaNome?.toLowerCase().includes('sal')
                                ? 'payments'
                                : item.categoriaNome?.toLowerCase().includes('invest')
                                  ? 'trending_up'
                                  : 'receipt_long';

                      return (
                        <tr key={item.categoriaId ?? 'sem-categoria'} className="hover:bg-surface-container transition-colors group">
                          <td className="px-gutter py-5">
                            <div className="flex items-center gap-md">
                              <span className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary">
                                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>{icon}</span>
                              </span>
                              <div>
                                <div className="font-body-md font-bold text-on-surface">{item.categoriaNome || 'Sem Categoria'}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-gutter py-5">
                            <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-label-caps border border-primary/30">
                              {Math.ceil(absTotal / 100)} ITENS
                            </span>
                          </td>
                          <td className="px-gutter py-5 text-right font-data-md text-on-background">
                            {formatCurrency(absTotal)}
                          </td>
                          <td className="px-gutter py-5 text-right">
                            <div className="w-full bg-outline-variant h-1 rounded-full overflow-hidden">
                              <div className={barColor + ' h-full'} style={{ width: Math.max(percent, 2) + '%' }}></div>
                            </div>
                            <span className="text-label-caps text-on-surface-variant">{percent.toFixed(0)}%</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section className="mt-xl grid grid-cols-1 md:grid-cols-2 gap-md">
            <div className="bg-white p-gutter rounded-xl shadow-sm border border-outline-variant/30">
              <h4 className="font-label-caps text-label-caps text-on-surface-variant mb-md uppercase">Fluxo de Caixa Semanal</h4>
              <div className="h-48 flex items-end justify-between gap-2 px-2">
                {[40, 60, 35, 90, 55, 45, 100].map((h, i) => (
                  <div key={i} className="bg-primary/20 w-full rounded-t" style={{ height: h + '%' }}></div>
                ))}
              </div>
            </div>
            <div className="bg-white p-gutter rounded-xl shadow-sm flex items-center justify-center border border-outline-variant/30">
              <div className="text-center">
                <span className="material-symbols-outlined text-outline-variant text-6xl mb-4">analytics</span>
                <p className="font-body-md text-on-surface-variant">Gere gráficos avançados para uma visão panorâmica dos seus investimentos.</p>
                <button className="mt-4 text-primary font-bold hover:underline">Ver Analytics</button>
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
}