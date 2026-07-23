import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  getDetalhamento,
  getResumoPeriodo,
  getTransacoesRange,
} from '../services/api';
import { formatCurrency } from '../utils/formatters';
import { TIPO_TRANSACAO } from '../utils/constants';
import SummaryCard from '../components/common/SummaryCard';
import ResponsiveGrid from '../components/common/ResponsiveGrid';
import ChartContainer from '../components/reports/ChartContainer';

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

export default function RelatoriosPage() {
  const { contaSelecionadaId } = useOutletContext();

  const [dataRef, setDataRef] = useState(() => new Date());
  const [resumo, setResumo] = useState(null);
  const [detalhamento, setDetalhamento] = useState([]);
  const [transacoes, setTransacoes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const requestIdRef = useRef(0);

  const dataInicio = formatDateOnly(primeiroDiaMes(dataRef));
  const dataFim = formatDateOnly(ultimoDiaMes(dataRef));

  const carregarDados = useCallback(async () => {
    const reqId = ++requestIdRef.current;
    if (!contaSelecionadaId) {
      if (requestIdRef.current === reqId) setCarregando(false);
      return;
    }

    try {
      const [res, txns] = await Promise.all([
        getResumoPeriodo(contaSelecionadaId, dataInicio, dataFim),
        getTransacoesRange(contaSelecionadaId, dataInicio, dataFim),
      ]);
      if (requestIdRef.current !== reqId) return;
      setResumo(res);
      setTransacoes(txns);
    } catch {
      if (requestIdRef.current !== reqId) return;
      setResumo(null);
      setTransacoes([]);
    }

    try {
      const det = await getDetalhamento(contaSelecionadaId, dataInicio, dataFim);
      if (requestIdRef.current !== reqId) return;
      setDetalhamento(det);
    } catch {
      if (requestIdRef.current !== reqId) return;
      setDetalhamento([]);
    } finally {
      if (requestIdRef.current === reqId) setCarregando(false);
    }
  }, [contaSelecionadaId, dataInicio, dataFim]);

  useEffect(() => { setCarregando(true); carregarDados(); }, [carregarDados]);

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
      .filter((t) => t.tipo === TIPO_TRANSACAO.SAIDA)
      .sort((a, b) => b.valor - a.valor)
      .slice(0, 5);
  }, [transacoes]);

  const maxSaida = maioresSaidas.length > 0 ? Math.max(...maioresSaidas.map((t) => t.valor)) : 1;

  const semanas = useMemo(() => {
    const weeklyData = [];
    const entradas = transacoes.filter((t) => t.tipo === TIPO_TRANSACAO.ENTRADA);
    const saidas = transacoes.filter((t) => t.tipo === TIPO_TRANSACAO.SAIDA);
    for (let w = 0; w < 4; w++) {
      const diaInicio = w * 7 + 1;
      const diaFim = Math.min((w + 1) * 7, new Date(dataRef.getFullYear(), dataRef.getMonth() + 1, 0).getDate());
      const entSemana = entradas.filter((t) => { const d = parseInt(t.data.slice(8, 10)); return d >= diaInicio && d <= diaFim; }).reduce((s, t) => s + t.valor, 0);
      const saiSemana = saidas.filter((t) => { const d = parseInt(t.data.slice(8, 10)); return d >= diaInicio && d <= diaFim; }).reduce((s, t) => s + t.valor, 0);
      weeklyData.push({ semana: w + 1, entradas: entSemana, saidas: saiSemana });
    }
    const maxVal = Math.max(...weeklyData.map((w) => Math.max(w.entradas, w.saidas)), 1);
    return weeklyData.map((w) => ({ ...w, entPct: (w.entradas / maxVal) * 100, saiPct: (w.saidas / maxVal) * 100 }));
  }, [transacoes, dataRef]);

  const mesAnoDisplay = dataRef.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  const donutSegments = useMemo(() => {
    const total = categorias.reduce((s, c) => s + c.percent, 0) || 100;
    let offset = 0;
    return categorias.map((c, i) => {
      const pct = (c.percent / total) * 100;
      const circ = 2 * Math.PI * 40;
      const dashLen = (pct / 100) * circ;
      const seg = { ...c, pct, color: donutColors[i % donutColors.length], dasharray: `${dashLen} ${circ}`, dashoffset: -offset };
      offset += dashLen;
      return seg;
    });
  }, [categorias]);

  return (
    <div className="px-4 md:px-8 max-w-7xl mx-auto pb-32 md:pb-12 pt-4 md:pt-6">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-primaria mb-1">RELATÓRIOS</h2>
          <nav className="flex gap-2 text-sm text-on-surface-variant">
            <span>FinSync</span>
            <span>/</span>
            <span className="text-laranja font-semibold">Relatórios Mensais</span>
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => navegar(-1)} className="material-symbols-outlined p-1 text-on-surface-variant hover:text-primaria">chevron_left</button>
          <span className="font-mono text-sm text-on-surface px-3 py-1.5 rounded-lg border border-line">{mesAnoDisplay}</span>
          <button onClick={() => navegar(1)} className="material-symbols-outlined p-1 text-on-surface-variant hover:text-primaria">chevron_right</button>
        </div>
      </header>

      {carregando && (
        <p className="text-sm text-on-surface-variant text-center py-12"><span className="spinner inline-block align-middle mr-2" />Carregando relatório...</p>
      )}

      {!carregando && !contaSelecionadaId && (
        <p className="text-sm text-on-surface-variant text-center py-12">Selecione uma conta para ver os relatórios.</p>
      )}

      {!carregando && contaSelecionadaId && (
        <>
          <div className="mb-6">
            <ResponsiveGrid cols={3} gap={4}>
              <SummaryCard tipo="entrada" value={totalEntradas} />
              <SummaryCard tipo="saida" value={totalSaidas} />
              <SummaryCard tipo="saldo" value={saldoPeriodo} />
            </ResponsiveGrid>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mb-6">
            <div className="lg:col-span-3">
              <ChartContainer title="MOVIMENTO POR SEMANA" icon="bar_chart">
                <div className="h-56 flex items-end justify-between gap-2 px-2 pb-2 border-b border-line relative">
                  {semanas.map((sem) => (
                    <div key={sem.semana} className="flex-1 flex justify-center items-end gap-1.5 group relative h-full">
                      <div className="w-3.5 bg-entrada chart-bar rounded-t" style={{ height: Math.max(sem.entPct, 2) + '%', animationDelay: (sem.semana * 100) + 'ms' }} title={'Entradas: ' + formatCurrency(sem.entradas)} />
                      <div className="w-3.5 bg-saida chart-bar rounded-t" style={{ height: Math.max(sem.saiPct, 2) + '%', animationDelay: (sem.semana * 100 + 50) + 'ms' }} title={'Saídas: ' + formatCurrency(sem.saidas)} />
                      <div className="absolute -bottom-6 text-[10px] font-semibold text-on-surface-variant uppercase">SEM {sem.semana}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-8 flex gap-4 justify-center">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded bg-entrada" />
                    <span className="text-[10px] font-semibold text-on-surface-variant uppercase">ENTRADAS</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded bg-saida" />
                    <span className="text-[10px] font-semibold text-on-surface-variant uppercase">SAÍDAS</span>
                  </div>
                </div>
              </ChartContainer>
            </div>

            <div className="lg:col-span-2">
              <ChartContainer title="DISTRIBUIÇÃO POR CATEGORIA" icon="donut_small">
                {categorias.length === 0 ? (
                  <p className="text-sm text-on-surface-variant text-center py-8">Nenhuma categoria no período.</p>
                ) : (
                  <>
                    <div className="relative flex justify-center mb-4">
                      <svg className="-rotate-90" height="160" viewBox="0 0 100 100" width="160">
                        <circle cx="50" cy="50" fill="transparent" r="40" stroke="var(--color-surface-container-low)" strokeWidth="18" />
                        {donutSegments.map((seg, i) => (
                          <circle key={i} className="donut-segment" cx="50" cy="50" fill="transparent" r="40" stroke={seg.color} strokeDasharray={seg.dasharray} strokeDashoffset={seg.dashoffset} strokeWidth="18" />
                        ))}
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-xl font-bold text-on-surface">{totalSaidas > 0 ? '100%' : '0%'}</span>
                        <span className="text-[10px] font-semibold text-on-surface-variant">TOTAL</span>
                      </div>
                    </div>
                    <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                      {donutSegments.map((seg, i) => (
                        <div key={i} className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: seg.color }} />
                            <span className="text-sm text-on-surface">{seg.nome}</span>
                          </div>
                          <div className="flex gap-3 font-mono text-sm">
                            <span className="text-on-surface-variant">{seg.pct.toFixed(0)}%</span>
                            <span className="text-on-surface">{formatCurrency(seg.total)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </ChartContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <ChartContainer title="MAIORES SAÍDAS" icon="arrow_downward">
                {maioresSaidas.length === 0 ? (
                  <p className="text-sm text-on-surface-variant text-center py-8">Nenhuma saída no período.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-line text-[10px] font-semibold text-on-surface-variant uppercase tracking-wider">
                          <th className="pb-2.5 px-1 w-8" />
                          <th className="pb-2.5 px-1">DESCRIÇÃO</th>
                          <th className="pb-2.5 px-1">DATA</th>
                          <th className="pb-2.5 px-1 text-right">VALOR</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-line/30">
                        {maioresSaidas.map((t) => {
                          const pct = (t.valor / maxSaida) * 100;
                          return (
                            <tr key={t.id} className="group hover:bg-surface-variant transition-all relative">
                              <td className="py-3 px-1">
                                <span className="material-symbols-outlined text-on-surface-variant">{categoriaIcon(t.categoriaNome)}</span>
                              </td>
                              <td className="py-3 px-1 relative">
                                <div className="font-medium text-on-surface">{t.descricao}</div>
                                <div className="absolute bottom-0 left-0 h-1 bg-saida/20 w-full rounded-full" />
                                <div className="absolute bottom-0 left-0 h-1 bg-saida rounded-full transition-all duration-700" style={{ width: pct + '%' }} />
                              </td>
                              <td className="py-3 px-1 font-mono text-sm text-on-surface-variant">
                                {t.data ? new Date(t.data + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) : ''}
                              </td>
                              <td className="py-3 px-1 text-right font-mono text-sm font-semibold text-saida">- {formatCurrency(t.valor)}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </ChartContainer>
            </div>

            <div>
              <ChartContainer title="COMPARATIVO" icon="compare_arrows">
                <div className="space-y-3">
                  <div className="bg-surface-variant p-4 rounded-lg border border-line/30">
                    <span className="text-[10px] font-semibold text-on-surface-variant uppercase tracking-wider block mb-1.5">SALDO ATUAL</span>
                    <div className="flex justify-between items-center">
                      <span className={'font-mono text-lg font-semibold ' + (saldoPeriodo >= 0 ? 'text-entrada' : 'text-saida')}>
                        {saldoPeriodo >= 0 ? '+ ' : '- '}{formatCurrency(Math.abs(saldoPeriodo))}
                      </span>
                      <span className={'material-symbols-outlined ' + (saldoPeriodo >= 0 ? 'text-entrada' : 'text-saida')}>
                        {saldoPeriodo >= 0 ? 'arrow_upward' : 'arrow_downward'}
                      </span>
                    </div>
                  </div>

                  <div className="bg-surface-variant p-4 rounded-lg border border-line/30">
                    <span className="text-[10px] font-semibold text-on-surface-variant uppercase tracking-wider block mb-1.5">TOTAL MOVIMENTADO</span>
                    <div className="flex justify-between items-center">
                      <span className="font-mono text-lg font-semibold text-on-surface">{formatCurrency(totalGeral)}</span>
                    </div>
                  </div>

                  <div className="bg-surface-variant p-4 rounded-lg border border-line/30">
                    <span className="text-[10px] font-semibold text-on-surface-variant uppercase tracking-wider block mb-1.5">RELAÇÃO RECEITA/DESPESA</span>
                    <div className="flex justify-between items-center">
                      <span className={'font-mono text-lg font-semibold ' + (totalSaidas > 0 && totalEntradas / totalSaidas >= 1 ? 'text-entrada' : 'text-saida')}>
                        {totalSaidas > 0 ? (totalEntradas / totalSaidas).toFixed(2) + 'x' : 'N/A'}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-line/30">
                    <p className="text-xs text-on-surface-variant italic">
                      {totalSaidas > 0
                        ? 'Sua receita cobre ' + ((totalEntradas / totalSaidas) * 100).toFixed(0) + '% das despesas do período.'
                        : 'Nenhuma despesa registrada no período.'}
                    </p>
                  </div>
                </div>
              </ChartContainer>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
