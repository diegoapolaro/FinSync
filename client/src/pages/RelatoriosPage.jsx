import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  BarChart3,
  PieChart,
  ArrowDownRight,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { getDetalhamento, getResumoPeriodo, getTransacoesRange } from '../services/api';
import { formatCurrency } from '../utils/formatters';
import {
  primeiroDiaMes,
  ultimoDiaMes,
  periodoEfetivoParaApi,
  transacoesFiltradasPorPeriodo,
} from '../utils/filterTransacoes';
import { TIPO_TRANSACAO } from '../utils/constants';
import SummaryCard from '../components/common/SummaryCard';
import ResponsiveGrid from '../components/common/ResponsiveGrid';
import ChartContainer from '../components/reports/ChartContainer';
import PeriodoPicker from '../components/common/PeriodoPicker';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { cn } from '@/lib/utils';

const donutColors = [
  '#0052ff', // Coinbase Blue
  '#05b169', // Emerald
  '#f4b000', // Amber
  '#6366f1', // Indigo
  '#0d9488', // Teal
  '#8b5cf6', // Purple
  '#ec4899', // Pink
  '#64748b', // Slate
];

export default function RelatoriosPage() {
  const { contaSelecionadaId } = useOutletContext();

  const [dataRef, setDataRef] = useState(() => new Date());
  const [filtroTipo, setFiltroTipo] = useState('mes');
  const [dataSelecionada, setDataSelecionada] = useState(() => new Date());
  const [dataInicio, setDataInicio] = useState(() => primeiroDiaMes(dataRef));
  const [dataFim, setDataFim] = useState(() => new Date());

  const [resumo, setResumo] = useState(null);
  const [detalhamento, setDetalhamento] = useState([]);
  const [transacoes, setTransacoes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const requestIdRef = useRef(0);

  const periodoApi = useMemo(
    () => periodoEfetivoParaApi(filtroTipo, dataRef, dataSelecionada, dataInicio, dataFim),
    [filtroTipo, dataRef, dataSelecionada, dataInicio, dataFim],
  );

  const carregarDados = useCallback(async () => {
    const reqId = ++requestIdRef.current;
    if (!contaSelecionadaId) {
      if (requestIdRef.current === reqId) setCarregando(false);
      return;
    }

    try {
      const [res] = await Promise.all([
        getResumoPeriodo(contaSelecionadaId, periodoApi.dataInicio, periodoApi.dataFim),
      ]);
      if (requestIdRef.current !== reqId) return;
      setResumo(res);

      const todasTransacoes = [];
      let page = 1;
      while (true) {
        const txns = await getTransacoesRange(
          contaSelecionadaId,
          periodoApi.dataInicio,
          periodoApi.dataFim,
          page,
          100,
        );
        const paginaAtual = txns?.data ?? [];
        todasTransacoes.push(...paginaAtual);
        if (paginaAtual.length < 100) break;
        page += 1;
      }

      if (requestIdRef.current !== reqId) return;
      setTransacoes(todasTransacoes);
    } catch {
      if (requestIdRef.current !== reqId) return;
      setResumo(null);
      setTransacoes([]);
    }

    try {
      const det = await getDetalhamento(
        contaSelecionadaId,
        periodoApi.dataInicio,
        periodoApi.dataFim,
      );
      if (requestIdRef.current !== reqId) return;
      setDetalhamento(det);
    } catch {
      if (requestIdRef.current !== reqId) return;
      setDetalhamento([]);
    } finally {
      if (requestIdRef.current === reqId) setCarregando(false);
    }
  }, [contaSelecionadaId, periodoApi]);

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

  const transacoesFiltradas = useMemo(
    () =>
      transacoesFiltradasPorPeriodo(transacoes, filtroTipo, dataSelecionada, dataInicio, dataFim),
    [transacoes, filtroTipo, dataSelecionada, dataInicio, dataFim],
  );

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
    return transacoesFiltradas
      .filter((t) => t.tipo === TIPO_TRANSACAO.SAIDA)
      .sort((a, b) => b.valor - a.valor)
      .slice(0, 5);
  }, [transacoesFiltradas]);

  const maxSaida = maioresSaidas.length > 0 ? Math.max(...maioresSaidas.map((t) => t.valor)) : 1;

  const semanas = useMemo(() => {
    if (filtroTipo === 'dia') return [];
    const entradas = transacoesFiltradas.filter((t) => t.tipo === TIPO_TRANSACAO.ENTRADA);
    const saidas = transacoesFiltradas.filter((t) => t.tipo === TIPO_TRANSACAO.SAIDA);
    const weeklyData = [];

    if (filtroTipo === 'periodo') {
      const inicioMs = new Date(
        dataInicio.getFullYear(),
        dataInicio.getMonth(),
        dataInicio.getDate(),
      ).getTime();
      const fimMs = new Date(
        dataFim.getFullYear(),
        dataFim.getMonth(),
        dataFim.getDate(),
      ).getTime();
      const totalDias = Math.max(0, Math.round((fimMs - inicioMs) / 86400000) + 1);
      const numSemanas = Math.ceil(totalDias / 7);
      for (let w = 0; w < numSemanas; w++) {
        const diaIni = w * 7;
        const diaFim = Math.min((w + 1) * 7 - 1, totalDias - 1);
        const entSemana = entradas
          .filter((t) => {
            const dia = Math.floor(
              (new Date(t.data + 'T12:00:00').getTime() - inicioMs) / 86400000,
            );
            return dia >= diaIni && dia <= diaFim;
          })
          .reduce((s, t) => s + t.valor, 0);
        const saiSemana = saidas
          .filter((t) => {
            const dia = Math.floor(
              (new Date(t.data + 'T12:00:00').getTime() - inicioMs) / 86400000,
            );
            return dia >= diaIni && dia <= diaFim;
          })
          .reduce((s, t) => s + t.valor, 0);
        weeklyData.push({ semana: w + 1, entradas: entSemana, saidas: saiSemana });
      }
    } else {
      const ultimoDia = ultimoDiaMes(dataRef).getDate();
      for (let w = 0; w < 4; w++) {
        const diaInicio = w * 7 + 1;
        const diaFim = Math.min((w + 1) * 7, ultimoDia);
        const entSemana = entradas
          .filter((t) => {
            const d = parseInt(t.data.slice(8, 10), 10);
            return d >= diaInicio && d <= diaFim;
          })
          .reduce((s, t) => s + t.valor, 0);
        const saiSemana = saidas
          .filter((t) => {
            const d = parseInt(t.data.slice(8, 10), 10);
            return d >= diaInicio && d <= diaFim;
          })
          .reduce((s, t) => s + t.valor, 0);
        weeklyData.push({ semana: w + 1, entradas: entSemana, saidas: saiSemana });
      }
    }

    const maxVal = Math.max(...weeklyData.map((w) => Math.max(w.entradas, w.saidas)), 1);
    return weeklyData.map((w) => ({
      ...w,
      entPct: (w.entradas / maxVal) * 100,
      saiPct: (w.saidas / maxVal) * 100,
    }));
  }, [transacoesFiltradas, filtroTipo, dataInicio, dataFim, dataRef]);

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
    <div className="px-4 md:px-8 max-w-7xl mx-auto pb-32 md:pb-12 pt-6">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-normal text-foreground tracking-[-0.03em]">
            Relatórios
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Análise detalhada de fluxo financeiro por período
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {filtroTipo === 'mes' && (
            <div className="flex items-center bg-secondary rounded-xl border border-border p-1 shadow-sm">
              <Button
                variant="ghost"
                size="iconSm"
                onClick={() => navegar(-1)}
                title="Mês anterior"
                className="rounded-lg h-8 w-8 text-muted-foreground hover:text-foreground"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-xs font-semibold text-foreground px-3 capitalize">
                {mesAnoDisplay}
              </span>
              <Button
                variant="ghost"
                size="iconSm"
                onClick={() => navegar(1)}
                title="Próximo mês"
                className="rounded-lg h-8 w-8 text-muted-foreground hover:text-foreground"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
          <PeriodoPicker
            filtroTipo={filtroTipo}
            setFiltroTipo={setFiltroTipo}
            dataSelecionada={dataSelecionada}
            setDataSelecionada={setDataSelecionada}
            dataInicio={dataInicio}
            setDataInicio={setDataInicio}
            dataFim={dataFim}
            setDataFim={setDataFim}
            mesReferencia={dataRef}
          />
        </div>
      </header>

      {carregando && (
        <div className="text-center py-16 text-muted-foreground text-sm">
          <span className="inline-block w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin align-middle mr-2" />
          Gerando relatórios...
        </div>
      )}

      {!carregando && !contaSelecionadaId && (
        <Card className="p-8 text-center text-sm text-muted-foreground border-dashed border-border/80">
          Selecione uma conta para ver os relatórios.
        </Card>
      )}

      {!carregando && contaSelecionadaId && (
        <>
          <div className="mb-8">
            <ResponsiveGrid cols={3} gap={4}>
              <SummaryCard tipo="entrada" value={totalEntradas} />
              <SummaryCard tipo="saida" value={totalSaidas} />
              <SummaryCard tipo="saldo" value={saldoPeriodo} />
            </ResponsiveGrid>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-8">
            {filtroTipo !== 'dia' && (
              <div className="lg:col-span-3">
                <ChartContainer
                  title="Movimento por Semana"
                  subtitle="Comparativo semanal de entradas e saídas"
                  icon={<BarChart3 className="w-4 h-4" />}
                >
                  <div className="h-56 flex items-end justify-between gap-3 px-3 pb-3 border-b border-border/60 relative">
                    {semanas.map((sem) => (
                      <div
                        key={sem.semana}
                        className="flex-1 flex justify-center items-end gap-2 group relative h-full"
                      >
                        <div
                          className="w-4 bg-[#05b169] chart-bar rounded-t-lg"
                          style={{
                            height: Math.max(sem.entPct, 3) + '%',
                            animationDelay: sem.semana * 100 + 'ms',
                          }}
                          title={'Entradas: ' + formatCurrency(sem.entradas)}
                        />
                        <div
                          className="w-4 bg-[#cf202f] chart-bar rounded-t-lg"
                          style={{
                            height: Math.max(sem.saiPct, 3) + '%',
                            animationDelay: sem.semana * 100 + 50 + 'ms',
                          }}
                          title={'Saídas: ' + formatCurrency(sem.saidas)}
                        />
                        <div className="absolute -bottom-6 text-[10px] font-bold text-muted-foreground uppercase">
                          Sem {sem.semana}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-8 flex gap-6 justify-center">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-[#05b169]" />
                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Entradas
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-[#cf202f]" />
                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Saídas
                      </span>
                    </div>
                  </div>
                </ChartContainer>
              </div>
            )}

            <div className={filtroTipo === 'dia' ? 'lg:col-span-5' : 'lg:col-span-2'}>
              <ChartContainer
                title="Distribuição por Categoria"
                subtitle="Participação relativa nas despesas"
                icon={<PieChart className="w-4 h-4" />}
              >
                {categorias.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-12">
                    Nenhuma despesa categorizada no período.
                  </p>
                ) : (
                  <>
                    <div className="relative flex justify-center mb-6">
                      <svg className="-rotate-90" height="160" viewBox="0 0 100 100" width="160">
                        <circle
                          cx="50"
                          cy="50"
                          fill="transparent"
                          r="40"
                          stroke="hsl(var(--secondary))"
                          strokeWidth="16"
                        />
                        {donutSegments.map((seg, i) => (
                          <circle
                            key={i}
                            className="donut-segment"
                            cx="50"
                            cy="50"
                            fill="transparent"
                            r="40"
                            stroke={seg.color}
                            strokeDasharray={seg.dasharray}
                            strokeDashoffset={seg.dashoffset}
                            strokeWidth="16"
                          />
                        ))}
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-2xl font-bold tracking-tight text-foreground">
                          {totalSaidas > 0 ? '100%' : '0%'}
                        </span>
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                          Saídas
                        </span>
                      </div>
                    </div>
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                      {donutSegments.map((seg, i) => (
                        <div
                          key={i}
                          className="flex justify-between items-center py-1.5 border-b border-border/40 last:border-0"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <div
                              className="w-2.5 h-2.5 rounded-full shrink-0"
                              style={{ backgroundColor: seg.color }}
                            />
                            <span className="text-xs font-semibold text-foreground truncate max-w-[130px]">
                              {seg.nome}
                            </span>
                          </div>
                          <div className="flex gap-2.5 numeric-mono text-xs font-semibold shrink-0">
                            <span className="text-muted-foreground">{seg.pct.toFixed(0)}%</span>
                            <span className="text-foreground">{formatCurrency(seg.total)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </ChartContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <ChartContainer
                title="Maiores Saídas"
                subtitle="Principais desembolsos individuais"
                icon={<ArrowDownRight className="w-4 h-4" />}
              >
                {maioresSaidas.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    Nenhuma saída no período.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {maioresSaidas.map((t) => {
                      const pct = (t.valor / maxSaida) * 100;
                      return (
                        <div key={t.id} className="space-y-1.5">
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-semibold text-foreground truncate max-w-[200px] md:max-w-[300px]">
                              {t.descricao}
                            </span>
                            <span className="numeric-mono font-bold text-[#cf202f]">
                              - {formatCurrency(t.valor)}
                            </span>
                          </div>
                          <div className="h-2 w-full bg-secondary/80 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-[#cf202f] rounded-full transition-all duration-500"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </ChartContainer>
            </div>

            <div>
              <ChartContainer
                title="Balanço Comparativo"
                subtitle="Indicadores de liquidez e fluxo"
                icon={<TrendingUp className="w-4 h-4" />}
              >
                <div className="space-y-3">
                  <div className="bg-secondary p-4 rounded-2xl border border-border">
                    <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                      Saldo do Período
                    </span>
                    <span
                      className={cn(
                        'numeric-mono text-xl font-bold tracking-tight',
                        saldoPeriodo >= 0 ? 'text-entrada' : 'text-saida',
                      )}
                    >
                      {saldoPeriodo >= 0 ? '+ ' : '- '}
                      {formatCurrency(Math.abs(saldoPeriodo))}
                    </span>
                  </div>

                  <div className="bg-secondary p-4 rounded-2xl border border-border">
                    <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                      Volume Total Movimentado
                    </span>
                    <span className="numeric-mono text-xl font-bold tracking-tight text-foreground">
                      {formatCurrency(totalGeral)}
                    </span>
                  </div>

                  <div className="bg-secondary p-4 rounded-2xl border border-border">
                    <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                      Taxa de Cobertura
                    </span>
                    <span className="numeric-mono text-xl font-bold tracking-tight text-foreground">
                      {totalSaidas > 0 ? (totalEntradas / totalSaidas).toFixed(2) + 'x' : 'N/A'}
                    </span>
                    <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                      {totalSaidas > 0
                        ? `Suas receitas cobrem ${((totalEntradas / totalSaidas) * 100).toFixed(0)}% das despesas deste período.`
                        : 'Nenhuma despesa registrada.'}
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
