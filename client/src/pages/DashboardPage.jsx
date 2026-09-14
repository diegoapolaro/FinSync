import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  PiggyBank,
  PieChart,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle2,
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
import { primeiroDiaMes, ultimoDiaMes, periodoEfetivoParaApi } from '../utils/filterTransacoes';
import { TIPO_TRANSACAO, STATUS_TRANSACAO } from '../utils/constants';
import { useToast } from '../contexts/ToastContext';
import ChartContainer from '../components/reports/ChartContainer';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

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

// Componente para números animados (Odômetro sutil)
function AnimatedNumber({ value }) {
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    let startTime;
    let animationFrame;
    const duration = 1000;
    const startValue = displayValue;
    const distance = value - startValue;

    if (distance === 0) return;

    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);

      // Easing out-cubic
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(startValue + distance * easeProgress);

      if (progress < 1) {
        animationFrame = window.requestAnimationFrame(step);
      } else {
        setDisplayValue(value);
      }
    };

    animationFrame = window.requestAnimationFrame(step);
    return () => window.cancelAnimationFrame(animationFrame);
  }, [value]);

  return <>{formatCurrency(displayValue)}</>;
}

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
    () =>
      periodoEfetivoParaApi(
        'mes',
        dataRef,
        new Date(),
        primeiroDiaMes(dataRef),
        ultimoDiaMes(dataRef),
      ),
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
        getTransacoesRange({
          contaId: contaSelecionadaId,
          dataInicio: periodoApi.dataInicio,
          dataFim: periodoApi.dataFim,
          page: 1,
          pageSize: 100,
        }),
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
  const saldoMes = resumo?.saldo ?? totalEntradas - totalSaidas;

  const taxaPoupanca = useMemo(() => {
    if (totalEntradas <= 0) return 0;
    const taxa = ((totalEntradas - totalSaidas) / totalEntradas) * 100;
    return Math.round(taxa * 10) / 10;
  }, [totalEntradas, totalSaidas]);

  const statusPoupanca = useMemo(() => {
    if (taxaPoupanca >= 25) {
      return {
        label: 'Excelente',
        badgeClass: 'bg-emerald-500/15 text-emerald-500 border-none',
        desc: `${taxaPoupanca}% guardada.`,
      };
    }
    if (taxaPoupanca >= 10) {
      return {
        label: 'Boa',
        badgeClass: 'bg-primary/15 text-primary border-none',
        desc: `${taxaPoupanca}% reservada.`,
      };
    }
    if (taxaPoupanca >= 0) {
      return {
        label: 'Atenção',
        badgeClass: 'bg-amber-500/15 text-amber-500 border-none',
        desc: 'Margem estreita.',
      };
    }
    return {
      label: 'Déficit',
      badgeClass: 'bg-rose-500/15 text-rose-500 border-none',
      desc: 'Despesas > Ganhos.',
    };
  }, [taxaPoupanca]);

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
        color:
          c.corOriginal && c.corOriginal !== '#747874'
            ? c.corOriginal
            : donutColors[i % donutColors.length],
        dasharray: `${dashLen} ${circ}`,
        dashoffset: -offset,
      };
      offset += dashLen;
      return seg;
    });
  }, [categorias]);

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
        let badgeColor = 'bg-secondary text-foreground border-none';

        if (diffDias < 0) {
          statusVencimento = 'atrasado';
          statusTexto = `Atrasado ${Math.abs(diffDias)}d`;
          badgeColor = 'bg-rose-500/15 text-rose-500 border-none font-semibold';
        } else if (diffDias === 0) {
          statusVencimento = 'hoje';
          statusTexto = 'Vence Hoje!';
          badgeColor = 'bg-amber-500/20 text-amber-500 border-none font-bold';
        } else if (diffDias <= 3) {
          statusVencimento = 'proximo';
          statusTexto = `Vence em ${diffDias}d`;
          badgeColor = 'bg-amber-500/15 text-amber-500 border-none';
        }

        return { ...t, diffDias, statusVencimento, statusTexto, badgeColor };
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
      getResumoPeriodo(contaSelecionadaId, periodoApi.dataInicio, periodoApi.dataFim).then(
        setResumo,
      );
    } catch (err) {
      addToast(err.message || 'Erro ao atualizar status', 'error');
    } finally {
      setAtualizandoStatusId(null);
    }
  }

  const mesAnoDisplay = dataRef.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  const contaAtual = contas?.find((c) => String(c.id) === String(contaSelecionadaId));

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
  };

  return (
    <div className="px-4 md:px-8 max-w-7xl mx-auto pb-32 md:pb-12 pt-6">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-foreground tracking-tight">Visão Geral</h1>
            {contaAtual && (
              <Badge className="hidden sm:inline-flex rounded-full bg-primary/10 text-primary hover:bg-primary/20 border-none font-semibold">
                {contaAtual.nome}
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-1 font-medium">
            Seu painel financeiro consolidado
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="flex items-center gap-3 flex-wrap w-full sm:w-auto justify-between sm:justify-end"
        >
          <div className="flex items-center bg-card/60 backdrop-blur-md rounded-2xl border border-border/50 shadow-sm p-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navegarMes(-1)}
              title="Mês anterior"
              aria-label="Mês anterior"
              className="rounded-xl h-9 w-9 p-0 text-muted-foreground hover:text-foreground hover:bg-secondary/60"
            >
              <ChevronLeft className="w-5 h-5 shrink-0" />
            </Button>
            <span className="text-sm font-semibold text-foreground px-4 capitalize min-w-[140px] text-center select-none">
              {mesAnoDisplay}
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navegarMes(1)}
              title="Próximo mês"
              aria-label="Próximo mês"
              className="rounded-xl h-9 w-9 p-0 text-muted-foreground hover:text-foreground hover:bg-secondary/60"
            >
              <ChevronRight className="w-5 h-5 shrink-0" />
            </Button>
          </div>

          <Button
            onClick={() => navigate('/lancamentos')}
            className="rounded-2xl shadow-lg shadow-primary/20 text-sm font-bold flex items-center gap-2 h-11 px-5 bg-primary hover:brightness-110 transition-all"
          >
            <PlusCircle className="w-5 h-5" />
            <span>Novo</span>
          </Button>
        </motion.div>
      </header>

      {carregando && (
        <div className="flex flex-col items-center justify-center py-32 text-muted-foreground">
          <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-4" />
          <span className="text-sm font-medium animate-pulse">Sincronizando dados...</span>
        </div>
      )}

      {!carregando && !contaSelecionadaId && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
          <Card className="p-8 sm:p-12 text-center border-dashed border-white/10 bg-gradient-to-b from-card/40 to-transparent max-w-2xl mx-auto my-8 shadow-xl backdrop-blur-sm rounded-3xl">
            <div className="w-20 h-20 rounded-3xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-6 shadow-inner">
              <Sparkles className="w-10 h-10" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground mb-3">
              Bem-vindo ao FinSync
            </h2>
            <p className="text-base text-muted-foreground max-w-md mx-auto mb-8 leading-relaxed">
              Crie sua primeira conta para começar a organizar sua vida financeira com clareza
              absoluta.
            </p>
            <Button
              onClick={abrirModalNovaConta || (() => navigate('/ajustes'))}
              size="lg"
              className="rounded-2xl font-bold gap-2 shadow-lg h-12 px-8"
            >
              <PlusCircle className="w-5 h-5" />
              <span>Criar Conta</span>
            </Button>
          </Card>
        </motion.div>
      )}

      {!carregando && contaSelecionadaId && (
        <motion.div variants={containerVariants} initial="hidden" animate="show">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
            <motion.div variants={itemVariants}>
              <Card className="p-6 relative overflow-hidden flex flex-col justify-between border-white/5 bg-card/60 backdrop-blur-md shadow-lg hover:bg-card/80 transition-colors rounded-3xl group">
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-colors" />
                <div className="flex items-center justify-between z-10">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                    Receitas
                  </span>
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-6 z-10">
                  <span className="text-3xl font-bold tracking-tight numeric-mono text-emerald-500">
                    <AnimatedNumber value={totalEntradas} />
                  </span>
                </div>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card className="p-6 relative overflow-hidden flex flex-col justify-between border-white/5 bg-card/60 backdrop-blur-md shadow-lg hover:bg-card/80 transition-colors rounded-3xl group">
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-rose-500/5 rounded-full blur-2xl group-hover:bg-rose-500/10 transition-colors" />
                <div className="flex items-center justify-between z-10">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                    Despesas
                  </span>
                  <div className="w-10 h-10 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
                    <TrendingDown className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-6 z-10">
                  <span className="text-3xl font-bold tracking-tight numeric-mono text-rose-500">
                    <AnimatedNumber value={totalSaidas} />
                  </span>
                </div>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card className="p-6 relative overflow-hidden flex flex-col justify-between border-white/5 bg-card/60 backdrop-blur-md shadow-lg hover:bg-card/80 transition-colors rounded-3xl group">
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors" />
                <div className="flex items-center justify-between z-10">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                    Saldo Mensal
                  </span>
                  <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                    <Wallet className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-6 z-10 flex flex-col">
                  <span
                    className={cn(
                      'text-3xl font-bold tracking-tight numeric-mono flex',
                      saldoMes >= 0 ? 'text-emerald-500' : 'text-rose-500',
                    )}
                  >
                    <span>{saldoMes >= 0 ? '+ ' : '- '}</span>
                    <AnimatedNumber value={Math.abs(saldoMes)} />
                  </span>
                </div>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card className="p-6 relative overflow-hidden flex flex-col justify-between border-white/5 bg-card/60 backdrop-blur-md shadow-lg hover:bg-card/80 transition-colors rounded-3xl group">
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl group-hover:bg-indigo-500/10 transition-colors" />
                <div className="flex items-center justify-between z-10">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                    Poupança
                  </span>
                  <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                    <PiggyBank className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-5 z-10">
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-3xl font-bold tracking-tight numeric-mono text-foreground">
                      {taxaPoupanca > 0 ? <AnimatedNumber value={taxaPoupanca} /> : '0'}%
                    </span>
                    <Badge
                      className={cn(
                        'text-[10px] px-2 py-0.5 rounded-md uppercase font-bold',
                        statusPoupanca.badgeClass,
                      )}
                    >
                      {statusPoupanca.label}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground font-medium">{statusPoupanca.desc}</p>
                </div>
              </Card>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-8">
            <motion.div variants={itemVariants} className="lg:col-span-2">
              <ChartContainer
                title="Distribuição de Despesas"
                subtitle="Seus gastos categorizados"
                icon={<PieChart className="w-5 h-5" />}
              >
                {categorias.length === 0 ? (
                  <div className="py-12 text-center px-4">
                    <PieChart className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-sm font-semibold text-foreground">Sem dados</p>
                  </div>
                ) : (
                  <>
                    <div className="relative flex justify-center my-6">
                      <svg className="-rotate-90" height="200" viewBox="0 0 100 100" width="200">
                        <circle
                          cx="50"
                          cy="50"
                          fill="transparent"
                          r="40"
                          stroke="var(--color-surface-soft)"
                          strokeWidth="12"
                        />
                        <AnimatePresence>
                          {donutSegments.map((seg, i) => (
                            <motion.circle
                              key={i}
                              initial={{ strokeDashoffset: seg.dasharray.split(' ')[1] }}
                              animate={{ strokeDashoffset: seg.dashoffset }}
                              transition={{ duration: 1, ease: 'easeOut', delay: i * 0.1 }}
                              className="hover:opacity-80 cursor-pointer"
                              cx="50"
                              cy="50"
                              fill="transparent"
                              r="40"
                              stroke={seg.color}
                              strokeDasharray={seg.dasharray}
                              strokeWidth="12"
                              strokeLinecap="round"
                            />
                          ))}
                        </AnimatePresence>
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-3xl font-bold tracking-tight text-foreground numeric-mono">
                          100%
                        </span>
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                          Despesas
                        </span>
                      </div>
                    </div>
                    <div className="space-y-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                      {donutSegments.map((seg, i) => (
                        <div
                          key={i}
                          className="flex justify-between items-center bg-background/40 p-2.5 rounded-xl border border-white/5"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: seg.color }}
                            />
                            <span className="text-sm font-semibold text-foreground">
                              {seg.nome}
                            </span>
                          </div>
                          <div className="flex gap-3 numeric-mono text-sm font-bold">
                            <span className="text-muted-foreground">{seg.pct.toFixed(0)}%</span>
                            <span className="text-foreground">{formatCurrency(seg.total)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </ChartContainer>
            </motion.div>

            <motion.div variants={itemVariants} className="lg:col-span-3">
              <Card className="p-6 border-white/5 bg-card/60 backdrop-blur-md rounded-3xl h-full shadow-lg">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-bold text-foreground">Agenda Financeira</h3>
                    <p className="text-sm text-muted-foreground font-medium">
                      Contas próximas do vencimento
                    </p>
                  </div>
                  <div className="w-10 h-10 bg-amber-500/10 text-amber-500 rounded-2xl flex items-center justify-center">
                    <Clock className="w-5 h-5" />
                  </div>
                </div>

                {contasVencimento.length === 0 ? (
                  <div className="py-16 text-center">
                    <CheckCircle2 className="w-14 h-14 text-emerald-500/30 mx-auto mb-4" />
                    <h4 className="text-base font-bold text-foreground">Tudo tranquilo!</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Nenhum vencimento pendente no radar.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {contasVencimento.slice(0, 5).map((item, i) => (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        key={item.id}
                        className="p-4 bg-background/40 border border-white/5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-background/80 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className={cn(
                              'w-1.5 h-10 rounded-full',
                              item.tipo === TIPO_TRANSACAO.ENTRADA
                                ? 'bg-emerald-500'
                                : 'bg-rose-500',
                            )}
                          />
                          <div>
                            <p className="text-sm font-bold text-foreground">{item.descricao}</p>
                            <p className="text-xs text-muted-foreground mt-0.5 font-medium">
                              Vence em: {formatDate(item.data)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4 pl-5 sm:pl-0">
                          <div className="text-left sm:text-right">
                            <span
                              className={cn(
                                'numeric-mono text-base font-bold block',
                                item.tipo === TIPO_TRANSACAO.ENTRADA
                                  ? 'text-emerald-500'
                                  : 'text-rose-500',
                              )}
                            >
                              {formatCurrency(item.valor)}
                            </span>
                            <Badge
                              className={cn(
                                'text-[10px] uppercase font-bold mt-1',
                                item.badgeColor,
                              )}
                            >
                              {item.statusTexto}
                            </Badge>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => handleQuitarTransacao(item)}
                            disabled={atualizandoStatusId === item.id}
                            className="rounded-xl h-10 bg-primary/10 text-primary hover:bg-primary hover:text-white transition-colors"
                          >
                            <CheckCircle2 className="w-4 h-4 mr-1.5" /> Quitar
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </Card>
            </motion.div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
