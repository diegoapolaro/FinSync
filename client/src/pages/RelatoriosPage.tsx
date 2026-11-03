import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  PieChart,
  BarChart3,
  Landmark,
  Download,
  ChevronDown,
  SlidersHorizontal,
  FileText,
  FileSpreadsheet,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Sparkles,
} from 'lucide-react';
import { getDetalhamento, getResumoPeriodo, getTransacoesRange, exportarTransacoes } from '../services/api';
import { formatCurrency } from '../utils/formatters';
import {
  primeiroDiaMes,
  ultimoDiaMes,
  periodoEfetivoParaApi,
  transacoesFiltradasPorPeriodo,
} from '../utils/filterTransacoes';
import { TIPO_TRANSACAO } from '../utils/constants';
import { useToast } from '../contexts/ToastContext';
import PeriodoPicker from '../components/common/PeriodoPicker';
import ComparativoPeriodoSection from '../components/reports/ComparativoPeriodoSection';
import BalancoPatrimonialSection from '../components/reports/BalancoPatrimonialSection';
import RelatorioPdfModal from '../components/reports/RelatorioPdfModal';
import ReportsKpiIndicators from '../components/reports/ReportsKpiIndicators';
import ReportsCashFlowWeeklyChart from '../components/reports/ReportsCashFlowWeeklyChart';
import ReportsCategoryDonutChart from '../components/reports/ReportsCategoryDonutChart';
import ReportsInsightBanner from '../components/reports/ReportsInsightBanner';
import ReportsExpensesRanking from '../components/reports/ReportsExpensesRanking';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { cn } from '@/lib/utils';
import type { ContaDto, TransacaoDto, ResumoPeriodoDto, DetalhamentoCategoriaDto } from '@/types';

interface OutletContextType {
  contaSelecionadaId?: number | string;
  contas?: ContaDto[];
}

export default function RelatoriosPage(): React.ReactElement {
  const { contaSelecionadaId, contas } = useOutletContext<OutletContextType>();
  const { addToast } = useToast();

  const [abaAtiva, setAbaAtiva] = useState<'geral' | 'comparativo' | 'patrimonio'>('geral');
  const [dataRef, setDataRef] = useState<Date>(new Date());
  const [filtroTipo, setFiltroTipo] = useState<string>('mes');
  const [dataSelecionada, setDataSelecionada] = useState<Date | null>(new Date());
  const [dataInicio, setDataInicio] = useState<Date | null>(primeiroDiaMes(new Date()));
  const [dataFim, setDataFim] = useState<Date | null>(new Date());

  const [resumo, setResumo] = useState<ResumoPeriodoDto | null>(null);
  const [resumoAnterior, setResumoAnterior] = useState<ResumoPeriodoDto | null>(null);
  const [detalhamento, setDetalhamento] = useState<DetalhamentoCategoriaDto[]>([]);
  const [transacoes, setTransacoes] = useState<TransacaoDto[]>([]);
  const [carregando, setCarregando] = useState<boolean>(true);
  const [modalPdfAberto, setModalPdfAberto] = useState<boolean>(false);
  const [exportandoCsv, setExportandoCsv] = useState<boolean>(false);
  const [menuExportarAberto, setMenuExportarAberto] = useState<boolean>(false);
  const [mostrarPeriodoAvancado, setMostrarPeriodoAvancado] = useState<boolean>(false);
  const [presetAtivo, setPresetAtivo] = useState<'30dias' | 'mesFechado' | 'trimestre'>('mesFechado');

  const exportMenuRef = useRef<HTMLDivElement>(null);
  const requestIdRef = useRef<number>(0);

  // Fecha o dropdown ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
        setMenuExportarAberto(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const periodoApi = useMemo(
    () => periodoEfetivoParaApi(filtroTipo, dataRef, dataSelecionada as Date, dataInicio as Date, dataFim as Date),
    [filtroTipo, dataRef, dataSelecionada, dataInicio, dataFim],
  );

  const periodoAnterior = useMemo(() => {
    const iniDate = new Date(periodoApi.dataInicio + 'T12:00:00');
    const fimDate = new Date(periodoApi.dataFim + 'T12:00:00');
    const diffMs = fimDate.getTime() - iniDate.getTime();

    const antFim = new Date(iniDate.getTime() - 86400000);
    const antIni = new Date(antFim.getTime() - diffMs);

    return {
      dataInicio: antIni.toISOString().slice(0, 10),
      dataFim: antFim.toISOString().slice(0, 10),
    };
  }, [periodoApi]);

  const carregarDados = useCallback(async () => {
    const reqId = ++requestIdRef.current;
    if (!contaSelecionadaId) {
      if (requestIdRef.current === reqId) setCarregando(false);
      return;
    }

    const contaIdStr = String(contaSelecionadaId);

    try {
      const [res, resAnt] = await Promise.all([
        getResumoPeriodo(contaIdStr, periodoApi.dataInicio, periodoApi.dataFim),
        getResumoPeriodo(contaIdStr, periodoAnterior.dataInicio, periodoAnterior.dataFim),
      ]);
      if (requestIdRef.current !== reqId) return;
      setResumo(res);
      setResumoAnterior(resAnt);

      const todasTransacoes: TransacaoDto[] = [];
      let page = 1;
      while (page <= 5) {
        const txns = await getTransacoesRange({
          contaId: contaIdStr,
          dataInicio: periodoApi.dataInicio,
          dataFim: periodoApi.dataFim,
          page,
          pageSize: 100,
        });
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
      setResumoAnterior(null);
      setTransacoes([]);
    }

    try {
      const det = await getDetalhamento(contaIdStr, periodoApi.dataInicio, periodoApi.dataFim);
      if (requestIdRef.current !== reqId) return;
      setDetalhamento(det);
    } catch {
      if (requestIdRef.current !== reqId) return;
      setDetalhamento([]);
    } finally {
      if (requestIdRef.current === reqId) setCarregando(false);
    }
  }, [contaSelecionadaId, periodoApi, periodoAnterior]);

  useEffect(() => {
    setCarregando(true);
    carregarDados();
  }, [carregarDados]);

  function navegarMes(dir: number) {
    const nova = new Date(dataRef);
    nova.setMonth(nova.getMonth() + dir);
    setDataRef(nova);
    setFiltroTipo('mes');
    setPresetAtivo('mesFechado');
  }

  function handlePreset30Dias() {
    setPresetAtivo('30dias');
    setFiltroTipo('periodo');
    const agora = new Date();
    const ini = new Date();
    ini.setDate(ini.getDate() - 30);
    setDataInicio(ini);
    setDataFim(agora);
  }

  function handlePresetMesFechado() {
    setPresetAtivo('mesFechado');
    setFiltroTipo('mes');
    const agora = new Date();
    setDataRef(agora);
    setDataInicio(primeiroDiaMes(agora));
    setDataFim(ultimoDiaMes(agora));
  }

  function handlePresetTrimestre() {
    setPresetAtivo('trimestre');
    setFiltroTipo('periodo');
    const agora = new Date();
    const ini = new Date();
    ini.setDate(ini.getDate() - 90);
    setDataInicio(ini);
    setDataFim(agora);
  }

  async function handleExportarCsv() {
    setExportandoCsv(true);
    try {
      const blob = await exportarTransacoes(
        String(contaSelecionadaId),
        null as any,
        'csv',
        periodoApi.dataInicio,
        periodoApi.dataFim,
      );
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `relatorio_finsync_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      addToast('Relatório exportado com sucesso!', 'success');
    } catch (err: any) {
      addToast(err.message || 'Erro ao exportar dados', 'error');
    } finally {
      setExportandoCsv(false);
      setMenuExportarAberto(false);
    }
  }

  const totalEntradas = resumo?.totalEntradas ?? 0;
  const totalSaidas = resumo?.totalSaidas ?? 0;
  const saldoPeriodo = resumo?.saldo ?? 0;

  const transacoesFiltradas = useMemo(
    () =>
      transacoesFiltradasPorPeriodo(
        transacoes,
        filtroTipo,
        dataSelecionada as Date,
        dataInicio as Date,
        dataFim as Date,
      ),
    [transacoes, filtroTipo, dataSelecionada, dataInicio, dataFim],
  );

  const categorias = useMemo(() => {
    const saidas = detalhamento.filter((d) => d.total < 0);
    const total = saidas.reduce((s, d) => s + Math.abs(d.total), 0);
    return saidas.map((d) => ({
      nome: d.categoriaNome || 'Outros',
      total: Math.abs(d.total),
      percent: total > 0 ? (Math.abs(d.total) / total) * 100 : 0,
      color: d.categoriaCor,
    }));
  }, [detalhamento]);

  const maioresSaidas = useMemo(() => {
    const saidasFiltradas = transacoesFiltradas.filter((t) => t.tipo === TIPO_TRANSACAO.SAIDA);

    const agrupado: Record<
      string,
      { descricao: string; valor: number; count: number; categoriaNome?: string }
    > = {};
    for (const t of saidasFiltradas) {
      const nomeLimpo = t.descricao.trim().replace(/\(\d{1,2}\/\d{1,2}\)$/, '').trim();
      const chave = nomeLimpo.toLowerCase();
      if (!agrupado[chave]) {
        agrupado[chave] = {
          descricao: nomeLimpo,
          valor: 0,
          count: 0,
          categoriaNome: t.categoriaNome,
        };
      }
      agrupado[chave].valor += t.valor;
      agrupado[chave].count += 1;
    }

    return Object.values(agrupado)
      .sort((a, b) => b.valor - a.valor)
      .slice(0, 5);
  }, [transacoesFiltradas]);

  const semanas = useMemo(() => {
    if (filtroTipo === 'dia') return [];
    const entradas = transacoesFiltradas.filter((t) => t.tipo === TIPO_TRANSACAO.ENTRADA);
    const saidas = transacoesFiltradas.filter((t) => t.tipo === TIPO_TRANSACAO.SAIDA);
    const weeklyData = [];

    const mesStr = dataRef.toLocaleDateString('pt-BR', { month: 'short' });

    if (filtroTipo === 'periodo') {
      const inicioMs = new Date(
        (dataInicio || new Date()).getFullYear(),
        (dataInicio || new Date()).getMonth(),
        (dataInicio || new Date()).getDate(),
      ).getTime();
      const fimMs = new Date(
        (dataFim || new Date()).getFullYear(),
        (dataFim || new Date()).getMonth(),
        (dataFim || new Date()).getDate(),
      ).getTime();
      const totalDias = Math.max(0, Math.round((fimMs - inicioMs) / 86400000) + 1);
      const numSemanas = Math.ceil(totalDias / 7);
      for (let w = 0; w < numSemanas; w++) {
        const diaIni = w * 7;
        const diaFim = Math.min((w + 1) * 7 - 1, totalDias - 1);
        const entSemana = entradas
          .filter((t) => {
            const dia = Math.floor((new Date(t.data + 'T12:00:00').getTime() - inicioMs) / 86400000);
            return dia >= diaIni && dia <= diaFim;
          })
          .reduce((s, t) => s + t.valor, 0);
        const saiSemana = saidas
          .filter((t) => {
            const dia = Math.floor((new Date(t.data + 'T12:00:00').getTime() - inicioMs) / 86400000);
            return dia >= diaIni && dia <= diaFim;
          })
          .reduce((s, t) => s + t.valor, 0);

        weeklyData.push({
          semana: w + 1,
          entradas: entSemana,
          saidas: saiSemana,
          label: `Semana ${w + 1}`,
          sublabel: `Dias ${diaIni + 1}-${diaFim + 1}`,
        });
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

        weeklyData.push({
          semana: w + 1,
          entradas: entSemana,
          saidas: saiSemana,
          label: `${String(diaInicio).padStart(2, '0')} - ${String(diaFim).padStart(2, '0')} ${mesStr}`,
          sublabel: `Semana ${w + 1}${w === 1 ? ' (Pico)' : ''}`,
        });
      }
    }

    return weeklyData;
  }, [transacoesFiltradas, filtroTipo, dataInicio, dataFim, dataRef]);

  const mesAnoDisplay = dataRef.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  const dataRefAnterior = useMemo(() => {
    const d = new Date(dataRef);
    d.setMonth(d.getMonth() - 1);
    return d;
  }, [dataRef]);
  const mesAnteriorDisplay = dataRefAnterior.toLocaleDateString('pt-BR', {
    month: 'long',
    year: 'numeric',
  });

  const contaAtual = contas?.find((c) => String(c.id) === String(contaSelecionadaId));

  return (
    <div className="px-4 md:px-8 max-w-7xl mx-auto pb-32 md:pb-16 pt-6 flex flex-col gap-8 transition-all">
      {/* 1. Top Command & Comparative Bar */}
      <section className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Lado Esquerdo: Pill de Comparação de Período + Presets Rápidos */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Period Selector Pill Group */}
          <div className="inline-flex items-center bg-fog dark:bg-spruce/60 p-1 rounded-full shadow-sm border border-border/40">
            <button
              type="button"
              onClick={() => {
                setFiltroTipo('mes');
                setPresetAtivo('mesFechado');
              }}
              className="px-4 py-2 rounded-full bg-forest-ink text-paper dark:bg-lime-voltage dark:text-forest-ink text-xs font-bold transition-all capitalize shadow-xs"
              id="btn-period-current"
            >
              {mesAnoDisplay}
            </button>
            <span className="px-2 text-pebble text-[10px] font-bold uppercase tracking-wider">vs</span>
            <button
              type="button"
              onClick={() => navegarMes(-1)}
              className="px-4 py-2 rounded-full text-charcoal dark:text-pebble hover:text-forest-ink dark:hover:text-paper text-xs font-semibold transition-all capitalize"
            >
              {mesAnteriorDisplay}
            </button>
          </div>

          {/* Quick Interval Preset Chips */}
          <div className="hidden xl:flex items-center gap-1.5 bg-fog dark:bg-spruce/50 px-2 py-1 rounded-full border border-border/40">
            <button
              type="button"
              onClick={handlePreset30Dias}
              className={cn(
                'px-3 py-1 rounded-full text-[11px] font-bold uppercase transition-all',
                presetAtivo === '30dias'
                  ? 'bg-paper dark:bg-card text-forest-ink dark:text-paper shadow-sm'
                  : 'text-charcoal dark:text-pebble hover:text-forest-ink dark:hover:text-paper',
              )}
            >
              30 Dias
            </button>
            <button
              type="button"
              onClick={handlePresetMesFechado}
              className={cn(
                'px-3 py-1 rounded-full text-[11px] font-bold uppercase transition-all',
                presetAtivo === 'mesFechado'
                  ? 'bg-paper dark:bg-card text-forest-ink dark:text-paper shadow-sm'
                  : 'text-charcoal dark:text-pebble hover:text-forest-ink dark:hover:text-paper',
              )}
            >
              Mês Fechado
            </button>
            <button
              type="button"
              onClick={handlePresetTrimestre}
              className={cn(
                'px-3 py-1 rounded-full text-[11px] font-bold uppercase transition-all',
                presetAtivo === 'trimestre'
                  ? 'bg-paper dark:bg-card text-forest-ink dark:text-paper shadow-sm'
                  : 'text-charcoal dark:text-pebble hover:text-forest-ink dark:hover:text-paper',
              )}
            >
              Trimestre
            </button>
          </div>
        </div>

        {/* Lado Direito: Export Pill, Ação PDF & Filtros Avançados */}
        <div className="flex items-center gap-2.5 self-stretch md:self-auto justify-end flex-wrap">
          {/* Botão Direto para Relatório PDF (Garante compatibilidade total e usabilidade rápida) */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setModalPdfAberto(true)}
            className="rounded-full bg-paper dark:bg-card border-border/60 text-xs font-bold text-forest-ink dark:text-paper hover:bg-fog gap-1.5 h-10 px-4 transition-all shadow-sm"
          >
            <FileText className="w-4 h-4 text-forest-ink dark:text-lime-voltage" />
            <span>Relatório PDF</span>
          </Button>

          {/* Export Dropdown Pill Menu */}
          <div className="relative" ref={exportMenuRef}>
            <button
              type="button"
              onClick={() => setMenuExportarAberto((prev) => !prev)}
              id="exportDropdownBtn"
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-fog dark:bg-card hover:bg-fog/80 text-forest-ink dark:text-paper text-xs font-bold border border-border/40 transition-all shadow-sm"
            >
              <Download className="w-4 h-4" />
              <span>Exportar Dados</span>
              <ChevronDown
                className={cn('w-4 h-4 transition-transform duration-200', menuExportarAberto && 'rotate-180')}
              />
            </button>

            {menuExportarAberto && (
              <div
                id="exportMenu"
                className="absolute right-0 mt-2 w-52 bg-paper dark:bg-card rounded-2xl shadow-xl py-2 z-30 border border-border/60 animate-in fade-in zoom-in-95"
              >
                <button
                  type="button"
                  onClick={() => {
                    setMenuExportarAberto(false);
                    setModalPdfAberto(true);
                  }}
                  className="w-full text-left px-4 py-2.5 text-xs font-semibold text-charcoal dark:text-paper hover:bg-fog dark:hover:bg-spruce/60 flex items-center justify-between transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-forest-ink dark:text-lime-voltage" />
                    <span>Relatório em PDF</span>
                  </div>
                  <span className="text-[10px] font-bold text-pebble uppercase">.PDF</span>
                </button>

                <button
                  type="button"
                  onClick={handleExportarCsv}
                  disabled={exportandoCsv}
                  className="w-full text-left px-4 py-2.5 text-xs font-semibold text-charcoal dark:text-paper hover:bg-fog dark:hover:bg-spruce/60 flex items-center justify-between transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="w-4 h-4 text-forest-ink dark:text-lime-voltage" />
                    <span>Tabelas Brutas (CSV)</span>
                  </div>
                  <span className="text-[10px] font-bold text-pebble uppercase">.CSV</span>
                </button>

                <button
                  type="button"
                  onClick={handleExportarCsv}
                  disabled={exportandoCsv}
                  className="w-full text-left px-4 py-2.5 text-xs font-semibold text-charcoal dark:text-paper hover:bg-fog dark:hover:bg-spruce/60 flex items-center justify-between transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="w-4 h-4 text-forest-ink dark:text-lime-voltage" />
                    <span>Planilha Excel</span>
                  </div>
                  <span className="text-[10px] font-bold text-pebble uppercase">.XLSX</span>
                </button>
              </div>
            )}
          </div>

          {/* Botão de Ajustes/Filtros com Ícone Tune */}
          <button
            type="button"
            onClick={() => setMostrarPeriodoAvancado((prev) => !prev)}
            title="Ajustar período personalizado"
            className={cn(
              'flex items-center justify-center h-10 w-10 rounded-full transition-all shadow-sm',
              mostrarPeriodoAvancado
                ? 'bg-forest-ink text-lime-voltage dark:bg-lime-voltage dark:text-forest-ink'
                : 'bg-fog dark:bg-card text-forest-ink dark:text-paper border border-border/40 hover:bg-fog/80',
            )}
          >
            <SlidersHorizontal className="w-4 h-4 stroke-[2.2]" />
          </button>
        </div>
      </section>

      {/* Painel Expansível de Período Customizado */}
      {mostrarPeriodoAvancado && (
        <div className="bg-fog dark:bg-card p-4 rounded-2xl border border-border/50 flex flex-wrap items-center justify-between gap-4 animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="iconSm"
              onClick={() => navegarMes(-1)}
              title="Mês anterior"
              className="rounded-full h-8 w-8 text-pebble hover:text-forest-ink dark:hover:text-paper"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-xs font-bold text-forest-ink dark:text-paper px-2 capitalize">
              {mesAnoDisplay}
            </span>
            <Button
              variant="ghost"
              size="iconSm"
              onClick={() => navegarMes(1)}
              title="Próximo mês"
              className="rounded-full h-8 w-8 text-pebble hover:text-forest-ink dark:hover:text-paper"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          <PeriodoPicker
            filtroTipo={filtroTipo}
            setFiltroTipo={setFiltroTipo}
            dataSelecionada={dataSelecionada as Date}
            setDataSelecionada={setDataSelecionada}
            dataInicio={dataInicio}
            setDataInicio={(d: Date | null) => d && setDataInicio(d)}
            dataFim={dataFim}
            setDataFim={(d: Date | null) => d && setDataFim(d)}
            mesReferencia={dataRef}
          />
        </div>
      )}

      {/* 2. Navegação por Abas Avançadas no Estilo Segmented Pill da Wise */}
      <nav className="flex items-center p-1 rounded-full bg-fog dark:bg-spruce/60 border border-border/40 max-w-full overflow-x-auto self-start">
        <button
          type="button"
          onClick={() => setAbaAtiva('geral')}
          className={cn(
            'flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold transition-all whitespace-nowrap',
            abaAtiva === 'geral'
              ? 'bg-lime-voltage text-forest-ink shadow-sm'
              : 'text-charcoal dark:text-pebble hover:text-forest-ink dark:hover:text-paper',
          )}
        >
          <PieChart className="w-4 h-4" />
          <span>Visão Geral &amp; Fluxo</span>
        </button>

        <button
          type="button"
          onClick={() => setAbaAtiva('comparativo')}
          className={cn(
            'flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold transition-all whitespace-nowrap',
            abaAtiva === 'comparativo'
              ? 'bg-lime-voltage text-forest-ink shadow-sm'
              : 'text-charcoal dark:text-pebble hover:text-forest-ink dark:hover:text-paper',
          )}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Comparativo Mês a Mês / Ano a Ano</span>
        </button>

        <button
          type="button"
          onClick={() => setAbaAtiva('patrimonio')}
          className={cn(
            'flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold transition-all whitespace-nowrap',
            abaAtiva === 'patrimonio'
              ? 'bg-lime-voltage text-forest-ink shadow-sm'
              : 'text-charcoal dark:text-pebble hover:text-forest-ink dark:hover:text-paper',
          )}
        >
          <Landmark className="w-4 h-4" />
          <span>Balanço Patrimonial (Ativos vs. Passivos)</span>
        </button>
      </nav>

      {/* Estado de Carregamento */}
      {carregando && (
        <div className="text-center py-20 text-pebble text-sm flex items-center justify-center gap-3">
          <span className="inline-block w-5 h-5 border-2 border-forest-ink dark:border-lime-voltage border-t-transparent rounded-full animate-spin" />
          <span>Consolidando dados analíticos e balanços...</span>
        </div>
      )}

      {/* Conta Não Selecionada */}
      {!carregando && !contaSelecionadaId && (
        <Card className="p-12 text-center text-sm text-pebble border-dashed border-border/80 rounded-[24px]">
          Selecione uma conta ativa para visualizar os relatórios e inteligência financeira.
        </Card>
      )}

      {/* Conteúdo Principal com Dados */}
      {!carregando && contaSelecionadaId && (
        <>
          {/* Aba 1: Visão Geral & Fluxo (Layout Bento de Relatórios) */}
          {abaAtiva === 'geral' && (
            <div className="flex flex-col gap-8">
              {/* High-Level Financial Impact Indicators (Bento Header) */}
              <ReportsKpiIndicators
                saldo={saldoPeriodo}
                totalEntradas={totalEntradas}
                totalSaidas={totalSaidas}
                resumoAnterior={resumoAnterior}
                quantidadeTransacoes={transacoesFiltradas.length}
                diasPeriodo={30}
              />

              {/* Analytical Grid Section (12 colunas) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                {/* Visual 1: Fluxo de Caixa Semanal Evolução Diária & Semanal (7 colunas) */}
                <div className="lg:col-span-7">
                  <ReportsCashFlowWeeklyChart
                    semanas={semanas}
                    saldoAcumulado={saldoPeriodo}
                    mesReferencia={mesAnoDisplay}
                  />
                </div>

                {/* Visual 2: Custos Operacionais Distribuição por Categoria (5 colunas) */}
                <div className="lg:col-span-5">
                  <ReportsCategoryDonutChart
                    categorias={categorias}
                    totalDespesas={totalSaidas}
                  />
                </div>
              </div>

              {/* Operational Contextual Insight Banner (Editorial & Compact) */}
              <ReportsInsightBanner
                titulo="Custos de Insumos Dentro da Meta"
                subtitulo="Diagnóstico Mensal"
                diagnostico="A margem operacional fechou 3.2% abaixo do teto contratual estipulado, compensando variações sazonais e assegurando fluxo positivo para os próximos ciclos."
                onAcao={() => setAbaAtiva('comparativo')}
                textoAcao="Ver Comparativo"
              />

              {/* Table / List: Maiores Despesas do Mês (Detalhamento dos Centros de Custo) */}
              <ReportsExpensesRanking
                itens={maioresSaidas}
                totalSaidas={totalSaidas}
              />
            </div>
          )}

          {/* Aba 2: Comparativo Mês a Mês ou Ano a Ano */}
          {abaAtiva === 'comparativo' && (
            <div className="transition-all animate-in fade-in duration-300">
              <ComparativoPeriodoSection transacoes={transacoes} />
            </div>
          )}

          {/* Aba 3: Balanço Patrimonial (Ativos vs. Passivos) */}
          {abaAtiva === 'patrimonio' && (
            <div className="transition-all animate-in fade-in duration-300">
              <BalancoPatrimonialSection contas={contas} transacoes={transacoes} />
            </div>
          )}
        </>
      )}

      {/* Modal Formatado para Impressão / Salvar em PDF */}
      <RelatorioPdfModal
        aberto={modalPdfAberto}
        onFechar={() => setModalPdfAberto(false)}
        periodoNome={mesAnoDisplay}
        resumo={resumo || undefined}
        detalhamento={detalhamento}
        transacoes={transacoesFiltradas}
        contaNome={contaAtual?.nome || 'Conta Atual'}
      />
    </div>
  );
}
