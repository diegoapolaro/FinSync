import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useOutletContext, useNavigate, Link } from 'react-router-dom';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  PiggyBank,
  PieChart,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle2,
  ArrowRight,
  PlusCircle,
  Sparkles,
} from 'lucide-react';
import {
  getDetalhamento,
  getResumoPeriodo,
  getTransacoesRange,
  updateTransacaoStatus,
} from '../services/api';
import { formatCurrency, formatDate } from '../utils/formatters';
import {
  primeiroDiaMes,
  ultimoDiaMes,
  periodoEfetivoParaApi,
} from '../utils/filterTransacoes';
import { TIPO_TRANSACAO, STATUS_TRANSACAO } from '../utils/constants';
import { useToast } from '../contexts/ToastContext';
import ChartContainer from '../components/reports/ChartContainer';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
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

export default function DashboardPage() {
  const { contaSelecionadaId, contas = [], abrirModalNovaConta } = useOutletContext() || {};
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [dataRef, setDataRef] = useState(() => new Date());
  const [resumo, setResumo] = useState(null);
  const [detalhamento, setDetalhamento] = useState([]);
  const [transacoes, setTransacoes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [atualizandoStatusId, setAtualizandoStatusId] = useState(null);
  const requestIdRef = useRef(0);

  const periodoApi = useMemo(
    () => periodoEfetivoParaApi('mes', dataRef, new Date(), primeiroDiaMes(dataRef), ultimoDiaMes(dataRef)),
    [dataRef],
  );

  const carregarDados = useCallback(async () => {
    const reqId = ++requestIdRef.current;
    if (!contaSelecionadaId) {
      if (requestIdRef.current === reqId) setCarregando(false);
      return;
    }

    try {
      const [res, det, txns] = await Promise.all([
        getResumoPeriodo(contaSelecionadaId, periodoApi.dataInicio, periodoApi.dataFim),
        getDetalhamento(contaSelecionadaId, periodoApi.dataInicio, periodoApi.dataFim),
        getTransacoesRange(contaSelecionadaId, periodoApi.dataInicio, periodoApi.dataFim, 1, 100),
      ]);

      if (requestIdRef.current !== reqId) return;
      setResumo(res);
      setDetalhamento(det || []);
      setTransacoes(txns?.data ?? []);
    } catch {
      if (requestIdRef.current !== reqId) return;
      setResumo(null);
      setTransacoes([]);
      setDetalhamento([]);
    } finally {
      if (requestIdRef.current === reqId) setCarregando(false);
    }
  }, [contaSelecionadaId, periodoApi]);

  useEffect(() => {
    setCarregando(true);
    carregarDados();
  }, [carregarDados]);

  function navegarMes(dir) {
    const nova = new Date(dataRef);
    nova.setMonth(nova.getMonth() + dir);
    setDataRef(nova);
  }

  const totalEntradas = resumo?.totalEntradas ?? 0;
  const totalSaidas = resumo?.totalSaidas ?? 0;
  const saldoMes = resumo?.saldo ?? (totalEntradas - totalSaidas);

  // Taxa de Poupança = ((Entradas - Saídas) / Entradas) * 100
  const taxaPoupanca = useMemo(() => {
    if (totalEntradas <= 0) return 0;
    const taxa = ((totalEntradas - totalSaidas) / totalEntradas) * 100;
    return Math.round(taxa * 10) / 10;
  }, [totalEntradas, totalSaidas]);

  const statusPoupanca = useMemo(() => {
    if (taxaPoupanca >= 25) {
      return {
        label: 'Excelente',
        badgeClass: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30',
        desc: `${taxaPoupanca}% guardada da sua renda neste mês.`,
      };
    }
    if (taxaPoupanca >= 10) {
      return {
        label: 'Boa',
        badgeClass: 'bg-primary/10 text-primary border-primary/30',
        desc: `${taxaPoupanca}% reservada da receita líquida.`,
      };
    }
    if (taxaPoupanca >= 0) {
      return {
        label: 'Atenção',
        badgeClass: 'bg-amber-500/10 text-amber-500 border-amber-500/30',
        desc: 'Saldo positivo, mas com margem de poupança estreita.',
      };
    }
    return {
      label: 'Déficit',
      badgeClass: 'bg-rose-500/10 text-rose-500 border-rose-500/30',
      desc: 'Despesas superaram os ganhos neste período.',
    };
  }, [taxaPoupanca]);

  // Despesas por Categoria para Donut
  const categorias = useMemo(() => {
    const saidas = detalhamento.filter((d) => d.total < 0);
    const total = saidas.reduce((s, d) => s + Math.abs(d.total), 0);
    return saidas.map((d) => ({
      nome: d.categoriaNome || 'Outros',
      total: Math.abs(d.total),
      percent: total > 0 ? (Math.abs(d.total) / total) * 100 : 0,
      corOriginal: d.categoriaCor,
    }));
  }, [detalhamento]);

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
        color: c.corOriginal && c.corOriginal !== '#747874' ? c.corOriginal : donutColors[i % donutColors.length],
        dasharray: `${dashLen} ${circ}`,
        dashoffset: -offset,
      };
      offset += dashLen;
      return seg;
    });
  }, [categorias]);

  // Evolução Semanal / Mensal do Fluxo de Caixa
  const semanasEvolucao = useMemo(() => {
    const entradas = transacoes.filter((t) => t.tipo === TIPO_TRANSACAO.ENTRADA);
    const saidas = transacoes.filter((t) => t.tipo === TIPO_TRANSACAO.SAIDA);
    const ultimoDia = ultimoDiaMes(dataRef).getDate();
    const weeklyData = [];

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
      weeklyData.push({
        semana: w + 1,
        label: `Sem ${w + 1} (${diaInicio}-${diaFim})`,
        entradas: entSemana,
        saidas: saiSemana,
      });
    }

    const maxVal = Math.max(...weeklyData.map((w) => Math.max(w.entradas, w.saidas)), 1);
    return weeklyData.map((w) => ({
      ...w,
      entPct: (w.entradas / maxVal) * 100,
      saiPct: (w.saidas / maxVal) * 100,
    }));
  }, [transacoes, dataRef]);

  // Contas / Lançamentos Próximos do Vencimento
  const contasVencimento = useMemo(() => {
    const pendentes = transacoes.filter((t) => t.status === STATUS_TRANSACAO.PENDENTE);
    const hojeDate = new Date();
    hojeDate.setHours(0, 0, 0, 0);

    return pendentes
      .map((t) => {
        const [ano, mes, dia] = t.data.split('-').map(Number);
        const dataVenc = new Date(ano, mes - 1, dia);
        dataVenc.setHours(0, 0, 0, 0);

        const diffTime = dataVenc.getTime() - hojeDate.getTime();
        const diffDias = Math.round(diffTime / (1000 * 60 * 60 * 24));

        let statusVencimento = 'futuro';
        let statusTexto = `Em ${diffDias} dias`;
        let badgeColor = 'bg-secondary text-foreground border-border';

        if (diffDias < 0) {
          statusVencimento = 'atrasado';
          statusTexto = `Atrasado há ${Math.abs(diffDias)}d`;
          badgeColor = 'bg-rose-500/10 text-rose-500 border-rose-500/30 font-semibold';
        } else if (diffDias === 0) {
          statusVencimento = 'hoje';
          statusTexto = 'Vence Hoje!';
          badgeColor = 'bg-amber-500/10 text-amber-500 border-amber-500/30 font-bold animate-pulse';
        } else if (diffDias <= 3) {
          statusVencimento = 'proximo';
          statusTexto = `Vence em ${diffDias}d`;
          badgeColor = 'bg-amber-500/10 text-amber-500 border-amber-500/20';
        }

        return {
          ...t,
          diffDias,
          statusVencimento,
          statusTexto,
          badgeColor,
        };
      })
      .sort((a, b) => a.diffDias - b.diffDias);
  }, [transacoes]);

  async function handleQuitarTransacao(transacao) {
    setAtualizandoStatusId(transacao.id);
    try {
      await updateTransacaoStatus(transacao.id, STATUS_TRANSACAO.PAGO);
      addToast(`"${transacao.descricao}" marcada como paga com sucesso!`, 'success');
      setTransacoes((prev) =>
        prev.map((t) => (t.id === transacao.id ? { ...t, status: STATUS_TRANSACAO.PAGO } : t)),
      );
      getResumoPeriodo(contaSelecionadaId, periodoApi.dataInicio, periodoApi.dataFim).then(setResumo);
    } catch (err) {
      addToast(err.message || 'Erro ao atualizar status', 'error');
    } finally {
      setAtualizandoStatusId(null);
    }
  }

  const mesAnoDisplay = dataRef.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  const contaAtual = contas?.find((c) => String(c.id) === String(contaSelecionadaId));

  return (
    <div className="px-4 md:px-8 max-w-7xl mx-auto pb-32 md:pb-12 pt-6">
      {/* Header com Boas-vindas e Seletor de Mês */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-semibold text-foreground tracking-tight">
              Dashboard Principal
            </h1>
            {contaAtual && (
              <Badge variant="outline" className="hidden sm:inline-flex text-xs px-2.5 py-0.5 rounded-full border-primary/30 text-primary">
                {contaAtual.nome}
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Visão consolidada de receitas, despesas, reserva financeira e compromissos
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap w-full sm:w-auto justify-between sm:justify-end">
          {/* Mês Selector */}
          <div className="flex items-center bg-card rounded-xl border border-border p-1 shadow-sm">
            <Button
              variant="ghost"
              size="iconSm"
              onClick={() => navegarMes(-1)}
              title="Mês anterior"
              className="rounded-lg h-8 w-8 text-muted-foreground hover:text-foreground"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-xs font-semibold text-foreground px-3 capitalize min-w-[130px] text-center">
              {mesAnoDisplay}
            </span>
            <Button
              variant="ghost"
              size="iconSm"
              onClick={() => navegarMes(1)}
              title="Próximo mês"
              className="rounded-lg h-8 w-8 text-muted-foreground hover:text-foreground"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          <Button
            onClick={() => navigate('/lancamentos')}
            className="rounded-xl shadow-sm text-xs font-semibold flex items-center gap-1.5"
            size="sm"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Novo Lançamento</span>
          </Button>
        </div>
      </header>

      {carregando && (
        <div className="text-center py-20 text-muted-foreground text-sm">
          <span className="inline-block w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin align-middle mr-3" />
          Sincronizando indicadores do dashboard...
        </div>
      )}

      {!carregando && !contaSelecionadaId && (
        <Card className="p-8 sm:p-12 text-center border-dashed border-border/80 bg-gradient-to-b from-card to-card/50 max-w-2xl mx-auto my-8 shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-5 shadow-inner">
            <Sparkles className="w-8 h-8" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground mb-2">
            Bem-vindo ao FinSync!
          </h2>
          <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6 leading-relaxed">
            Crie sua primeira conta ou livro de caixa para começar a organizar suas receitas, despesas e relatórios financeiros com total clareza.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            {abrirModalNovaConta ? (
              <Button
                onClick={abrirModalNovaConta}
                size="lg"
                className="rounded-xl font-semibold gap-2 shadow-sm w-full sm:w-auto"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Criar Primeira Conta</span>
              </Button>
            ) : (
              <Button
                onClick={() => navigate('/ajustes')}
                size="lg"
                className="rounded-xl font-semibold gap-2 shadow-sm w-full sm:w-auto"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Criar Conta em Ajustes</span>
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => navigate('/ajustes')}
              size="lg"
              className="rounded-xl text-xs font-semibold w-full sm:w-auto"
            >
              Configurar em Ajustes
            </Button>
          </div>
        </Card>
      )}

      {!carregando && contaSelecionadaId && (
        <>
          {/* 1. Cards de Resumo & Taxa de Poupança */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {/* Total de Entradas */}
            <Card className="p-5 relative overflow-hidden flex flex-col justify-between border-border/70 hover:border-border transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Total de Entradas
                </span>
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-2xl sm:text-3xl font-semibold tracking-tight numeric-mono text-emerald-500">
                  {formatCurrency(totalEntradas)}
                </span>
                <p className="text-[11px] text-muted-foreground mt-1">Receitas totais do mês</p>
              </div>
            </Card>

            {/* Total de Saídas */}
            <Card className="p-5 relative overflow-hidden flex flex-col justify-between border-border/70 hover:border-border transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Total de Saídas
                </span>
                <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-500 flex items-center justify-center">
                  <TrendingDown className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-2xl sm:text-3xl font-semibold tracking-tight numeric-mono text-rose-500">
                  {formatCurrency(totalSaidas)}
                </span>
                <p className="text-[11px] text-muted-foreground mt-1">Despesas e pagamentos</p>
              </div>
            </Card>

            {/* Saldo do Mês */}
            <Card className="p-5 relative overflow-hidden flex flex-col justify-between border-border/70 hover:border-border transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Saldo do Mês
                </span>
                <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <Wallet className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-4">
                <span
                  className={cn(
                    'text-2xl sm:text-3xl font-semibold tracking-tight numeric-mono',
                    saldoMes >= 0 ? 'text-emerald-500' : 'text-rose-500',
                  )}
                >
                  {saldoMes >= 0 ? '+ ' : '- '}
                  {formatCurrency(Math.abs(saldoMes))}
                </span>
                <p className="text-[11px] text-muted-foreground mt-1">Resultado líquido do período</p>
              </div>
            </Card>

            {/* Taxa de Poupança (% guardada) */}
            <Card className="p-5 relative overflow-hidden flex flex-col justify-between border-border/70 hover:border-border transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Taxa de Poupança
                </span>
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                  <PiggyBank className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-bold tracking-tight numeric-mono text-foreground">
                    {taxaPoupanca > 0 ? `${taxaPoupanca}%` : '0%'}
                  </span>
                  <Badge variant="outline" className={cn('text-[10px] px-2 py-0.5 rounded-full uppercase', statusPoupanca.badgeClass)}>
                    {statusPoupanca.label}
                  </Badge>
                </div>
                <p className="text-[11px] text-muted-foreground mt-1 line-clamp-1">{statusPoupanca.desc}</p>
              </div>
            </Card>
          </div>

          {/* 2. Gráficos Dinâmicos: Rosca de Despesas e Evolução Mensal */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-8">
            {/* Gráfico de Rosca / Donut: Despesas por Categoria */}
            <div className="lg:col-span-2">
              <ChartContainer
                title="Despesas por Categoria"
                subtitle="Distribuição relativa das saídas do mês"
                icon={<PieChart className="w-4 h-4" />}
              >
                {categorias.length === 0 ? (
                  <div className="py-12 text-center px-4">
                    <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center mx-auto mb-3 text-muted-foreground">
                      <PieChart className="w-5 h-5" />
                    </div>
                    <p className="text-sm font-medium text-foreground">Nenhuma despesa neste mês</p>
                    <p className="text-xs text-muted-foreground mt-1 mb-4">
                      Registre suas saídas para visualizar a distribuição dos seus gastos por categoria.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate('/lancamentos?tipo=Saida')}
                      className="rounded-lg text-xs font-semibold text-rose-500 hover:bg-rose-500/10 border-rose-500/30"
                    >
                      <TrendingDown className="w-3.5 h-3.5 mr-1" />
                      Registrar Despesa
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="relative flex justify-center my-4">
                      <svg className="-rotate-90" height="170" viewBox="0 0 100 100" width="170">
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
                            className="donut-segment transition-all duration-300 hover:opacity-80"
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
                        <span className="text-2xl font-bold tracking-tight text-foreground numeric-mono">
                          {totalSaidas > 0 ? '100%' : '0%'}
                        </span>
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                          Total Despesas
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2 max-h-52 overflow-y-auto pr-1 custom-scrollbar mt-4">
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
                            <span className="text-xs font-medium text-foreground truncate max-w-[130px]">
                              {seg.nome}
                            </span>
                          </div>
                          <div className="flex gap-2 numeric-mono text-xs font-semibold shrink-0">
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

            {/* Gráfico de Evolução Mensal / Semanal de Fluxo */}
            <div className="lg:col-span-3">
              <ChartContainer
                title="Evolução Mensal do Fluxo"
                subtitle="Comparativo semanal de Entradas x Saídas"
                icon={<BarChart3 className="w-4 h-4" />}
              >
                {totalEntradas === 0 && totalSaidas === 0 ? (
                  <div className="py-12 text-center px-4">
                    <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center mx-auto mb-3 text-muted-foreground">
                      <BarChart3 className="w-5 h-5" />
                    </div>
                    <p className="text-sm font-medium text-foreground">Sem movimentação no período</p>
                    <p className="text-xs text-muted-foreground mt-1 mb-4">
                      Seu fluxo de caixa semanal será desenhado automaticamente conforme você registrar entradas e saídas.
                    </p>
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate('/lancamentos?tipo=Entrada')}
                        className="rounded-lg text-xs font-semibold text-emerald-500 hover:bg-emerald-500/10 border-emerald-500/30"
                      >
                        <TrendingUp className="w-3.5 h-3.5 mr-1" />
                        Nova Entrada
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate('/lancamentos?tipo=Saida')}
                        className="rounded-lg text-xs font-semibold text-rose-500 hover:bg-rose-500/10 border-rose-500/30"
                      >
                        <TrendingDown className="w-3.5 h-3.5 mr-1" />
                        Nova Saída
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="h-60 flex items-end justify-between gap-4 px-4 pb-4 border-b border-border/60 relative mt-4">
                      {semanasEvolucao.map((sem) => (
                        <div
                          key={sem.semana}
                          className="flex-1 flex justify-center items-end gap-2.5 group relative h-full"
                        >
                          <div
                            className="w-4 sm:w-5 bg-emerald-500 chart-bar rounded-t-lg transition-all duration-300 hover:brightness-110"
                            style={{
                              height: Math.max(sem.entPct, 4) + '%',
                              animationDelay: sem.semana * 100 + 'ms',
                            }}
                            title={`Entradas: ${formatCurrency(sem.entradas)}`}
                          />
                          <div
                            className="w-4 sm:w-5 bg-rose-500 chart-bar rounded-t-lg transition-all duration-300 hover:brightness-110"
                            style={{
                              height: Math.max(sem.saiPct, 4) + '%',
                              animationDelay: sem.semana * 100 + 50 + 'ms',
                            }}
                            title={`Saídas: ${formatCurrency(sem.saidas)}`}
                          />
                          <div className="absolute -bottom-6 text-[11px] font-medium text-muted-foreground uppercase text-center w-full truncate">
                            {sem.label}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-8 flex gap-8 justify-center">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-emerald-500" />
                        <span className="text-xs font-semibold text-muted-foreground tracking-wider">
                          Entradas: {formatCurrency(totalEntradas)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-rose-500" />
                        <span className="text-xs font-semibold text-muted-foreground tracking-wider">
                          Saídas: {formatCurrency(totalSaidas)}
                        </span>
                      </div>
                    </div>
                  </>
                )}
              </ChartContainer>
            </div>
          </div>

          {/* 3. Lista de Contas Próximas do Vencimento */}
          <div className="mb-8">
            <Card className="p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-foreground">
                      Contas e Lançamentos Próximos do Vencimento
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Compromissos pendentes com liquidação programada
                    </p>
                  </div>
                </div>

                {contasVencimento.length > 0 && (
                  <Link
                    to="/extrato?status=Pendente"
                    className="text-xs text-primary hover:underline font-semibold flex items-center gap-1"
                  >
                    Ver todas as pendências ({contasVencimento.length})
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                )}
              </div>

              {contasVencimento.length === 0 ? (
                <div className="py-8 text-center bg-secondary/30 rounded-2xl border border-border/50">
                  <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2 opacity-80" />
                  <h4 className="text-sm font-semibold text-foreground">Nenhuma conta pendente para este mês!</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Todos os seus lançamentos programados estão quitados e em dia.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-border/60">
                  {contasVencimento.slice(0, 6).map((item) => (
                    <div
                      key={item.id}
                      className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-secondary/40 px-2 rounded-xl transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={cn(
                            'w-2.5 h-2.5 rounded-full shrink-0',
                            item.tipo === TIPO_TRANSACAO.ENTRADA ? 'bg-emerald-500' : 'bg-rose-500',
                          )}
                        />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{item.descricao}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                            <span>Vencimento: {formatDate(item.data)}</span>
                            {item.categoriaNome && (
                              <>
                                <span>•</span>
                                <span className="truncate">{item.categoriaNome}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 justify-between sm:justify-end shrink-0 pl-5 sm:pl-0">
                        <div className="text-right">
                          <span
                            className={cn(
                              'numeric-mono text-sm font-bold block',
                              item.tipo === TIPO_TRANSACAO.ENTRADA ? 'text-emerald-500' : 'text-rose-500',
                            )}
                          >
                            {item.tipo === TIPO_TRANSACAO.ENTRADA ? '+ ' : '- '}
                            {formatCurrency(item.valor)}
                          </span>
                          <Badge variant="outline" className={cn('text-[10px] px-2 py-0.2 rounded-full', item.badgeColor)}>
                            {item.statusTexto}
                          </Badge>
                        </div>

                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleQuitarTransacao(item)}
                          disabled={atualizandoStatusId === item.id}
                          className="h-8 text-xs font-semibold rounded-lg bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500 hover:text-white transition-all"
                        >
                          {atualizandoStatusId === item.id ? (
                            'Quitando...'
                          ) : (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                              Quitar
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
