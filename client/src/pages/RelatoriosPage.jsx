import { useCallback, useEffect, useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  getDetalhamento,
  getResumoPeriodo,
  getTransacoesRange,
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

function categoriaIcon(nome) {
  if (!nome) return 'receipt_long';
  const n = nome.toLowerCase();
  if (n.includes('aliment')) return 'restaurant';
  if (n.includes('transp')) return 'directions_car';
  if (n.includes('morad') || n.includes('habit')) return 'home';
  if (n.includes('venda')) return 'shopping_cart';
  if (n.includes('sal')) return 'payments';
  if (n.includes('invest')) return 'trending_up';
  if (n.includes('fixo') || n.includes('energ') || n.includes('agua') || n.includes('luz')) return 'bolt';
  if (n.includes('super') || n.includes('mercado')) return 'shopping_cart';
  return 'receipt_long';
}

const donutColors = [
  '#7c4dff', '#ff9800', '#009688', '#ffeb3b',
  '#e91e63', '#00bcd4', '#4caf50', '#ff5722',
];

function AnimatedCounter({ value }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (value === 0) {
      setDisplay(0);
      return;
    }
    const duration = 500;
    const start = performance.now();
    function tick(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setDisplay(easeOut * value);
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }, [value]);

  return (
    <>{display.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</>
  );
}

export default function RelatoriosPage() {
  const { contaSelecionadaId } = useOutletContext();

  const [dataRef, setDataRef] = useState(() => new Date());
  const [resumo, setResumo] = useState(null);
  const [detalhamento, setDetalhamento] = useState([]);
  const [transacoes, setTransacoes] = useState([]);
  const [carregando, setCarregando] = useState(true);

  const dataInicio = formatDateOnly(primeiroDiaMes(dataRef));
  const dataFim = formatDateOnly(ultimoDiaMes(dataRef));

  const carregarDados = useCallback(async () => {
    if (!contaSelecionadaId) {
      setCarregando(false);
      return;
    }

    try {
      const [res, det, txns] = await Promise.all([
        getResumoPeriodo(contaSelecionadaId, dataInicio, dataFim),
        getDetalhamento(contaSelecionadaId, dataInicio, dataFim),
        getTransacoesRange(contaSelecionadaId, dataInicio, dataFim),
      ]);
      setResumo(res);
      setDetalhamento(det);
      setTransacoes(txns);
    } catch {
      setResumo(null);
      setDetalhamento([]);
      setTransacoes([]);
    } finally {
      setCarregando(false);
    }
  }, [contaSelecionadaId, dataInicio, dataFim]);

  useEffect(() => {
    setCarregando(true);
    carregarDados();
  }, [carregarDados]);

  function navegar(dir) {
    const nova = new Date(dataRef);
    nova.setMonth(nova.getMonth() + dir);
    setDataRef(nova);
  }

  const totalEntradas = resumo?.totalEntradas ?? 0;
  const totalSaidas = resumo?.totalSaidas ?? 0;
  const saldoPeriodo = resumo?.saldo ?? 0;
  const totalGeral = totalEntradas + totalSaidas;

  const categorias = useMemo(() => {
    const saidas = detalhamento.filter((d) => d.total < 0);
    const total = saidas.reduce((s, d) => s + Math.abs(d.total), 0);
    return saidas.map((d) => ({
      nome: d.categoriaNome || 'Outros',
      total: Math.abs(d.total),
      percent: total > 0 ? (Math.abs(d.total) / total) * 100 : 0,
    }));
  }, [detalhamento]);

  const maioresSaidas = useMemo(() => {
    return transacoes
      .filter((t) => t.tipo === 'Saida' || t.tipo === 'Saída')
      .sort((a, b) => b.valor - a.valor)
      .slice(0, 5);
  }, [transacoes]);

  const maxSaida = maioresSaidas.length > 0 ? Math.max(...maioresSaidas.map((t) => t.valor)) : 1;

  const semanas = useMemo(() => {
    const weeklyData = [];
    const entradas = transacoes.filter((t) => t.tipo === 'Entrada');
    const saidas = transacoes.filter((t) => t.tipo === 'Saida' || t.tipo === 'Saída');

    for (let w = 0; w < 4; w++) {
      const diaInicio = w * 7 + 1;
      const diaFim = Math.min((w + 1) * 7, new Date(dataRef.getFullYear(), dataRef.getMonth() + 1, 0).getDate());

      const entSemana = entradas
        .filter((t) => {
          const d = parseInt(t.data.slice(8, 10));
          return d >= diaInicio && d <= diaFim;
        })
        .reduce((s, t) => s + t.valor, 0);

      const saiSemana = saidas
        .filter((t) => {
          const d = parseInt(t.data.slice(8, 10));
          return d >= diaInicio && d <= diaFim;
        })
        .reduce((s, t) => s + t.valor, 0);

      weeklyData.push({ semana: w + 1, entradas: entSemana, saidas: saiSemana });
    }

    const maxVal = Math.max(...weeklyData.map((w) => Math.max(w.entradas, w.saidas)), 1);
    return weeklyData.map((w) => ({
      ...w,
      entPct: (w.entradas / maxVal) * 100,
      saiPct: (w.saidas / maxVal) * 100,
    }));
  }, [transacoes, dataRef]);

  const mesAnoLabel = dataRef.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }).toUpperCase();
  const mesAnoDisplay = dataRef.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  const donutSegments = useMemo(() => {
    const total = categorias.reduce((s, c) => s + c.percent, 0) || 100;
    let offset = 0;
    return categorias.map((c, i) => {
      const pct = (c.percent / total) * 100;
      const circ = 2 * Math.PI * 40;
      const dashLen = (pct / 100) * circ;
      const seg = {
        ...c,
        pct,
        color: donutColors[i % donutColors.length],
        dasharray: `${dashLen} ${circ}`,
        dashoffset: -offset,
      };
      offset += dashLen;
      return seg;
    });
  }, [categorias]);

  return (
    <div className="px-margin-mobile md:px-margin-desktop max-w-7xl mx-auto pb-32 md:pb-12 space-y-md pt-4 md:pt-6">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-lg gap-md">
        <div>
          <h2 className="font-headline-xl text-headline-xl text-primary mb-base">RELATÓRIOS</h2>
          <nav className="flex gap-sm text-body-sm text-outline">
            <span>FinSync</span>
            <span>/</span>
            <span>Analytics</span>
            <span>/</span>
            <span className="text-secondary font-bold">Relatórios Mensais</span>
          </nav>
        </div>
        <div className="flex items-center gap-sm">
          <button
            onClick={() => navegar(-1)}
            className="btn-base material-symbols-outlined text-on-surface-variant hover:text-primary p-1"
          >
            chevron_left
          </button>
          <button className="btn-base flex items-center gap-sm bg-surface-container-high px-md py-sm rounded-lg border border-outline-variant hover:border-primary group">
            <span className="font-data-md text-data-md text-on-surface">{mesAnoDisplay}</span>
            <span className="material-symbols-outlined text-outline group-hover:text-primary">expand_more</span>
          </button>
          <button
            onClick={() => navegar(1)}
            className="btn-base material-symbols-outlined text-on-surface-variant hover:text-primary p-1"
          >
            chevron_right
          </button>
        </div>
      </header>

        {carregando && (
        <p className="text-body-sm font-body-sm text-on-surface-variant text-center py-12"><span className="spinner inline-block align-middle mr-2" />Carregando relatório...</p>
      )}

      {!carregando && !contaSelecionadaId && (
        <p className="text-body-sm font-body-sm text-on-surface-variant text-center py-12">Selecione uma conta para ver os relatórios.</p>
      )}

      {!carregando && contaSelecionadaId && (
        <>
          <section className="grid grid-cols-1 md:grid-cols-3 gap-md mb-lg">
            <div className="paper-shadow bg-gradient-to-br from-[#2F6B4F1A] to-white rounded-xl p-md border-l-4 border-primary relative overflow-hidden group hover:translate-y-[-2px] transition-all">
              <div className="flex justify-between items-start mb-sm">
                <span className="font-label-caps text-label-caps text-primary tracking-widest">ENTRADAS DO MÊS</span>
                <div className="bg-primary-container text-on-primary-container w-8 h-8 rounded-full flex items-center justify-center">
                  <span className="material-symbols-outlined">add</span>
                </div>
              </div>
              <div className="flex items-baseline gap-xs">
                <span className="font-body-md text-body-md text-primary">R$</span>
                <span className="font-headline-lg text-headline-lg text-primary">
                  <AnimatedCounter value={totalEntradas} />
                </span>
              </div>
              <div className="mt-sm flex items-center gap-xs text-body-sm text-primary">
                <span className="material-symbols-outlined text-[18px]">trending_up</span>
                <span>Total de entradas do período</span>
              </div>
            </div>

            <div className="paper-shadow bg-gradient-to-br from-[#B23A2E1A] to-white rounded-xl p-md border-l-4 border-error relative overflow-hidden group hover:translate-y-[-2px] transition-all">
              <div className="flex justify-between items-start mb-sm">
                <span className="font-label-caps text-label-caps text-error tracking-widest">SAÍDAS DO MÊS</span>
                <div className="bg-error-container text-on-error-container w-8 h-8 rounded-full flex items-center justify-center">
                  <span className="material-symbols-outlined">remove</span>
                </div>
              </div>
              <div className="flex items-baseline gap-xs">
                <span className="font-body-md text-body-md text-error">R$</span>
                <span className="font-headline-lg text-headline-lg text-error">
                  <AnimatedCounter value={totalSaidas} />
                </span>
              </div>
              <div className="mt-sm flex items-center gap-xs text-body-sm text-error">
                <span className="material-symbols-outlined text-[18px]">trending_down</span>
                <span>Total de saídas do período</span>
              </div>
            </div>

            <div className="paper-shadow bg-gradient-to-br from-[#4A7C7E1A] to-white rounded-xl p-md border-l-4 border-tertiary relative overflow-hidden group hover:translate-y-[-2px] transition-all">
              <div className="flex justify-between items-start mb-sm">
                <span className="font-label-caps text-label-caps text-tertiary tracking-widest">SALDO</span>
                <div className="bg-tertiary-container text-on-tertiary-container w-8 h-8 rounded-full flex items-center justify-center">
                  <span className="material-symbols-outlined">balance</span>
                </div>
              </div>
              <div className="flex items-baseline gap-xs">
                <span className="font-body-md text-body-md text-tertiary">R$</span>
                <span className="font-headline-lg text-headline-lg text-tertiary">
                  <AnimatedCounter value={saldoPeriodo} />
                </span>
              </div>
              <div className="mt-sm flex items-center gap-xs text-body-sm text-tertiary">
                <span className="material-symbols-outlined text-[18px]">info</span>
                <span>{saldoPeriodo >= 0 ? 'Saldo positivo no período' : 'Saldo negativo no período'}</span>
              </div>
            </div>
          </section>

          <section className="grid grid-cols-1 lg:grid-cols-5 gap-md mb-lg">
            <div className="lg:col-span-3 paper-shadow bg-surface-container-lowest rounded-xl p-md">
              <div className="flex justify-between items-center mb-lg">
                <h3 className="font-headline-lg text-[24px] text-on-surface">MOVIMENTO POR SEMANA</h3>
                <span className="material-symbols-outlined text-outline">more_vert</span>
              </div>
              <div className="h-64 flex items-end justify-between gap-sm px-md pb-md border-b border-outline-variant relative">
                {semanas.map((sem) => (
                  <div key={sem.semana} className="flex-1 flex justify-center items-end gap-2 group relative h-full">
                    <div
                      className="w-4 bg-primary chart-bar"
                      style={{ height: Math.max(sem.entPct, 2) + '%', animationDelay: (sem.semana * 100) + 'ms' }}
                      title={'Entradas: ' + formatCurrency(sem.entradas)}
                    />
                    <div
                      className="w-4 bg-error chart-bar"
                      style={{ height: Math.max(sem.saiPct, 2) + '%', animationDelay: (sem.semana * 100 + 50) + 'ms' }}
                      title={'Saídas: ' + formatCurrency(sem.saidas)}
                    />
                    <div className="absolute -bottom-8 font-label-caps text-label-caps">SEM {sem.semana}</div>
                  </div>
                ))}
              </div>
              <div className="mt-12 flex gap-md justify-center">
                <div className="flex items-center gap-xs">
                  <div className="w-3 h-3 bg-primary rounded-sm"></div>
                  <span className="font-label-caps text-[10px] text-outline">ENTRADAS</span>
                </div>
                <div className="flex items-center gap-xs">
                  <div className="w-3 h-3 bg-error rounded-sm"></div>
                  <span className="font-label-caps text-[10px] text-outline">SAÍDAS</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2 paper-shadow bg-surface-container-lowest rounded-xl p-md">
              <h3 className="font-headline-lg text-[24px] text-on-surface mb-lg">DISTRIBUIÇÃO POR CATEGORIA</h3>
              {categorias.length === 0 ? (
                <p className="text-body-sm text-on-surface-variant text-center py-8">Nenhuma categoria no período.</p>
              ) : (
                <>
                  <div className="relative flex justify-center mb-lg">
                    <svg className="-rotate-90" height="180" viewBox="0 0 100 100" width="180">
                      <circle cx="50" cy="50" fill="transparent" r="40" stroke="#f0f5f0" strokeWidth="20" />
                      {donutSegments.map((seg, i) => (
                        <circle
                          key={i}
                          className="donut-segment"
                          cx="50" cy="50" fill="transparent" r="40"
                          stroke={seg.color}
                          strokeDasharray={seg.dasharray}
                          strokeDashoffset={seg.dashoffset}
                          strokeWidth="20"
                        />
                      ))}
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="font-headline-lg text-[28px] text-on-surface">
                        {totalSaidas > 0 ? '100%' : '0%'}
                      </span>
                      <span className="font-label-caps text-[10px] text-outline">TOTAL</span>
                    </div>
                  </div>
                  <div className="space-y-sm max-h-48 overflow-y-auto pr-xs">
                    {donutSegments.map((seg, i) => (
                      <div key={i} className="flex justify-between items-center group">
                        <div className="flex items-center gap-sm">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: seg.color }}></div>
                          <span className="font-body-sm text-body-sm text-on-surface">{seg.nome}</span>
                        </div>
                        <div className="flex gap-md font-data-md text-data-md">
                          <span className="text-outline">{seg.pct.toFixed(0)}%</span>
                          <span className="text-on-surface">{formatCurrency(seg.total)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </section>

          <section className="grid grid-cols-1 lg:grid-cols-3 gap-md">
            <div className="lg:col-span-2 paper-shadow bg-surface-container-lowest rounded-xl p-md overflow-hidden">
              <h3 className="font-headline-lg text-[24px] text-on-surface mb-lg">MAIORES SAÍDAS</h3>
              {maioresSaidas.length === 0 ? (
                <p className="text-body-sm text-on-surface-variant text-center py-8">Nenhuma saída no período.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-outline-variant font-label-caps text-label-caps text-outline">
                        <th className="pb-sm px-xs w-10"></th>
                        <th className="pb-sm px-xs">DESCRIÇÃO</th>
                        <th className="pb-sm px-xs">DATA</th>
                        <th className="pb-sm px-xs text-right">VALOR</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/30">
                      {maioresSaidas.map((t) => {
                        const pct = (t.valor / maxSaida) * 100;
                        return (
                          <tr key={t.id} className="group hover:bg-surface-container transition-all relative">
                            <td className="py-md px-xs">
                              <span className="material-symbols-outlined text-outline">{categoriaIcon(t.categoriaNome)}</span>
                            </td>
                            <td className="py-md px-xs relative">
                              <div className="font-body-md text-on-surface">{t.descricao}</div>
                              <div className="absolute bottom-0 left-0 h-1 bg-error/20 w-full rounded-full"></div>
                              <div className="absolute bottom-0 left-0 h-1 bg-error rounded-full transition-all duration-700" style={{ width: pct + '%' }}></div>
                            </td>
                            <td className="py-md px-xs font-data-md text-outline">
                              {t.data ? new Date(t.data + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) : ''}
                            </td>
                            <td className="py-md px-xs text-right font-data-lg text-error">- {formatCurrency(t.valor)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="paper-shadow bg-surface-container-lowest rounded-xl p-md">
              <h3 className="font-headline-lg text-[24px] text-on-surface mb-lg">COMPARATIVO</h3>
              <div className="space-y-md">
                <div className="bg-surface p-md rounded-lg border border-outline-variant/30 group cursor-default">
                  <span className="font-label-caps text-label-caps text-outline block mb-base">SALDO ATUAL</span>
                  <div className="flex justify-between items-center">
                    <span className={'font-data-lg text-data-lg ' + (saldoPeriodo >= 0 ? 'text-primary' : 'text-error')}>
                      {saldoPeriodo >= 0 ? '+ ' : '- '}{formatCurrency(Math.abs(saldoPeriodo))}
                    </span>
                    <div className={'flex items-center ' + (saldoPeriodo >= 0 ? 'text-primary' : 'text-error')}>
                      <span className="material-symbols-outlined font-bold">
                        {saldoPeriodo >= 0 ? 'arrow_upward' : 'arrow_downward'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-surface p-md rounded-lg border border-outline-variant/30 group cursor-default">
                  <span className="font-label-caps text-label-caps text-outline block mb-base">TOTAL MOVIMENTADO</span>
                  <div className="flex justify-between items-center">
                    <span className="font-data-lg text-data-lg text-on-surface">{formatCurrency(totalGeral)}</span>
                  </div>
                </div>

                <div className="bg-surface p-md rounded-lg border border-outline-variant/30 group cursor-default">
                  <span className="font-label-caps text-label-caps text-outline block mb-base">RELAÇÃO RECEITA/DESPESA</span>
                  <div className="flex justify-between items-center">
                    <span className={'font-data-lg text-data-lg ' + (totalSaidas > 0 && totalEntradas / totalSaidas >= 1 ? 'text-primary' : 'text-error')}>
                      {totalSaidas > 0 ? (totalEntradas / totalSaidas).toFixed(2) + 'x' : 'N/A'}
                    </span>
                  </div>
                </div>

                <div className="pt-sm border-t border-outline-variant/30">
                  <p className="font-body-sm text-body-sm text-on-surface-variant italic">
                    {totalSaidas > 0
                      ? 'Sua receita cobre ' + ((totalEntradas / totalSaidas) * 100).toFixed(0) + '% das despesas do período.'
                      : 'Nenhuma despesa registrada no período.'}
                  </p>
                </div>
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
