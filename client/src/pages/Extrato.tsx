import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useOutletContext, useSearchParams } from 'react-router-dom';
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Receipt,
  Tag,
  CheckCircle2,
  Search,
  X,
  Download,
  ArrowUpRight,
  ArrowDownRight,
  Check,
} from 'lucide-react';
import {
  deleteTransacao,
  getCategorias,
  getResumoPeriodo,
  getTransacoesRange,
  updateTransacaoStatus,
} from '../services/api';
import { STATUS_TRANSACAO } from '../utils/constants';
import {
  primeiroDiaMes,
  periodoEfetivoParaApi,
  transacoesFiltradasPorPeriodo,
} from '../utils/filterTransacoes';
import { formatPeriodoLabel } from '../utils/formatters';
import FloatingActions from '../components/common/FloatingActions';
import PeriodoPicker from '../components/common/PeriodoPicker';
import TransactionTable from '../components/transactions/TransactionTable';
import TransactionCard from '../components/transactions/TransactionCard';
import AccountHeroBanner from '../components/transactions/AccountHeroBanner';
import ExtratoKpiMetrics from '../components/transactions/ExtratoKpiMetrics';
import ConciliationInsightBanner from '../components/transactions/ConciliationInsightBanner';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { cn } from '@/lib/utils';
import type { CategoriaDto, TransacaoDto, ResumoPeriodoDto, ContaDto } from '@/types';

interface OutletContextType {
  contas?: ContaDto[];
  contaSelecionadaId?: number | string;
  categorias?: CategoriaDto[];
  abrirModalNovaConta?: () => void;
}

export default function Extrato(): React.ReactElement {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const outletCtx = useOutletContext<OutletContextType>();
  const contaSelecionadaId = outletCtx?.contaSelecionadaId;
  const contas = outletCtx?.contas || [];
  const categoriasContext = outletCtx?.categorias;
  const abrirModalNovaConta = outletCtx?.abrirModalNovaConta;

  const contaAtiva = useMemo(() => {
    return contas.find((c) => String(c.id) === String(contaSelecionadaId));
  }, [contas, contaSelecionadaId]);

  const [categorias, setCategorias] = useState<CategoriaDto[]>(() => categoriasContext || []);
  const [categoriaSelecionadaId, setCategoriaSelecionadaId] = useState<string>('');
  const [statusSelecionado, setStatusSelecionado] = useState<string>(
    () => searchParams.get('status') || '',
  );
  const [termoBusca, setTermoBusca] = useState<string>(
    () => searchParams.get('search') || '',
  );
  const [tipoSelecionado, setTipoSelecionado] = useState<string>('todos');

  const hoje = useMemo(() => new Date(), []);
  const [filtroTipo, setFiltroTipo] = useState<string>('mes');
  const [dataSelecionada, setDataSelecionada] = useState<Date | null>(hoje);
  const [dataInicio, setDataInicio] = useState<Date | null>(primeiroDiaMes(hoje));
  const [dataFim, setDataFim] = useState<Date | null>(hoje);

  const [transacoes, setTransacoes] = useState<TransacaoDto[]>([]);
  const [resumo, setResumo] = useState<ResumoPeriodoDto | null>(null);
  const [carregando, setCarregando] = useState<boolean>(true);
  const [pagina, setPagina] = useState<number>(1);
  const [paginaMeta, setPaginaMeta] = useState({ total: 0, totalPages: 1, pageSize: 20 });

  // Microinteração para exportação
  const [exportando, setExportando] = useState<boolean>(false);
  const [exportadoSucesso, setExportadoSucesso] = useState<boolean>(false);

  useEffect(() => {
    if (categoriasContext && categoriasContext.length > 0) {
      setCategorias(categoriasContext);
    } else {
      getCategorias()
        .then((data) => setCategorias(data || []))
        .catch(() => {});
    }
  }, [categoriasContext]);

  const periodoApi = useMemo(
    () => periodoEfetivoParaApi(filtroTipo, hoje, dataSelecionada as Date, dataInicio as Date, dataFim as Date),
    [filtroTipo, hoje, dataSelecionada, dataInicio, dataFim],
  );

  const carregarDados = useCallback(
    async (pageNum: number) => {
      if (!contaSelecionadaId) {
        setTransacoes([]);
        setResumo(null);
        setCarregando(false);
        return;
      }
      try {
        const [txns, res] = await Promise.all([
          getTransacoesRange({
            contaId: String(contaSelecionadaId),
            dataInicio: periodoApi.dataInicio,
            dataFim: periodoApi.dataFim,
            page: pageNum,
            pageSize: 20,
            categoriaId: categoriaSelecionadaId ? Number(categoriaSelecionadaId) : null,
            status: statusSelecionado || null,
          }),
          getResumoPeriodo(String(contaSelecionadaId), periodoApi.dataInicio, periodoApi.dataFim),
        ]);
        setTransacoes(txns.data);
        setPaginaMeta({ total: txns.total, totalPages: txns.totalPages, pageSize: txns.pageSize || 20 });
        setResumo(res);
        return txns;
      } catch {
        setTransacoes([]);
        setResumo(null);
        return null;
      } finally {
        setCarregando(false);
      }
    },
    [contaSelecionadaId, periodoApi, categoriaSelecionadaId, statusSelecionado],
  );

  useEffect(() => {
    setCarregando(true);
    setPagina(1);
    carregarDados(1);
  }, [carregarDados]);

  function irParaPagina(p: number) {
    if (p < 1 || p > paginaMeta.totalPages || p === pagina) return;
    setPagina(p);
    setCarregando(true);
    carregarDados(p);
  }

  const totalEntradas = resumo?.totalEntradas ?? 0;
  const totalSaidas = resumo?.totalSaidas ?? 0;
  const saldo = resumo?.saldo ?? 0;

  const transacoesDoPeriodo = useMemo(() => {
    let list = transacoesFiltradasPorPeriodo(transacoes, filtroTipo, dataSelecionada || hoje, dataInicio || hoje, dataFim || hoje);

    if (tipoSelecionado !== 'todos') {
      list = list.filter((t: TransacaoDto) => t.tipo === tipoSelecionado);
    }

    if (termoBusca.trim()) {
      const q = termoBusca.toLowerCase().trim();
      list = list.filter(
        (t: TransacaoDto) =>
          t.descricao?.toLowerCase().includes(q) ||
          t.categoriaNome?.toLowerCase().includes(q) ||
          String(t.valor).includes(q),
      );
    }

    return list;
  }, [transacoes, filtroTipo, dataSelecionada, dataInicio, dataFim, tipoSelecionado, termoBusca]);

  const labelPeriodo = formatPeriodoLabel(filtroTipo, dataSelecionada as Date, dataInicio as Date, dataFim as Date, hoje);

  const mensagemVazia = useMemo(() => {
    if (termoBusca || tipoSelecionado !== 'todos') {
      return 'Nenhuma transação encontrada com os filtros aplicados.';
    }
    if (filtroTipo === 'dia') {
      return `Nenhuma transação em ${labelPeriodo}.`;
    }
    if (filtroTipo === 'periodo') {
      return `Nenhuma transação entre ${labelPeriodo}.`;
    }
    return 'Nenhuma movimentação neste período.';
  }, [termoBusca, tipoSelecionado, filtroTipo, labelPeriodo]);

  async function handleDelete(id: number) {
    try {
      await deleteTransacao(String(id));
      const response = await carregarDados(pagina);
      const nextPage =
        response && response.totalPages > 0 && pagina > response.totalPages
          ? response.totalPages
          : pagina;
      if (nextPage !== pagina) {
        setPagina(nextPage);
        await carregarDados(nextPage);
      }
    } catch {}
  }

  async function handleToggleStatus(transacao: TransacaoDto) {
    const novoStatus =
      transacao.status === STATUS_TRANSACAO.PENDENTE
        ? STATUS_TRANSACAO.PAGO
        : STATUS_TRANSACAO.PENDENTE;

    try {
      await updateTransacaoStatus(transacao.id, novoStatus);
      setTransacoes((prev) =>
        prev.map((item) => (item.id === transacao.id ? { ...item, status: novoStatus } : item)),
      );
    } catch {}
  }

  function handleNovaEntrada() {
    navigate('/lancamentos');
  }

  function handleNovaSaida() {
    navigate('/lancamentos');
  }

  function handleExportar() {
    if (exportando) return;
    setExportando(true);
    setTimeout(() => {
      setExportando(false);
      setExportadoSucesso(true);
      setTimeout(() => {
        setExportadoSucesso(false);
      }, 2500);
    }, 1000);
  }

  const picker = (
    <PeriodoPicker
      filtroTipo={filtroTipo}
      setFiltroTipo={setFiltroTipo}
      dataSelecionada={dataSelecionada as Date}
      setDataSelecionada={setDataSelecionada}
      dataInicio={dataInicio as Date}
      setDataInicio={(d: Date | null) => d && setDataInicio(d)}
      dataFim={dataFim as Date}
      setDataFim={(d: Date | null) => d && setDataFim(d)}
      mesReferencia={hoje}
    />
  );

  const barraBusca = (
    <div className="relative flex-1 min-w-[220px] max-w-sm">
      <Search className="w-4 h-4 text-pebble absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
      <input
        data-shortcut="search"
        type="text"
        value={termoBusca}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTermoBusca(e.target.value)}
        placeholder="Buscar por descrição ou valor (/)..."
        aria-label="Buscar transações"
        className="w-full h-11 pl-10 pr-8 rounded-full border border-pebble/30 bg-paper dark:bg-spruce/60 text-xs text-forest-ink dark:text-paper placeholder:text-pebble focus:outline-none focus:ring-2 focus:ring-lime-voltage transition-all"
      />
      {termoBusca && (
        <button
          type="button"
          onClick={() => setTermoBusca('')}
          aria-label="Limpar busca"
          className="absolute right-3 top-1/2 -translate-y-1/2 text-pebble hover:text-forest-ink p-0.5 rounded-full"
          title="Limpar busca"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );

  const seletorTipo = (
    <div className="inline-flex items-center p-1 rounded-full bg-paper dark:bg-spruce/80 border border-pebble/20">
      <button
        type="button"
        onClick={() => setTipoSelecionado('todos')}
        className={cn(
          'px-4 py-2 rounded-full text-xs font-bold transition-all',
          tipoSelecionado === 'todos'
            ? 'bg-lime-voltage text-forest-ink shadow-sm'
            : 'text-charcoal dark:text-pebble hover:text-forest-ink dark:hover:text-paper',
        )}
      >
        Todas
      </button>
      <button
        type="button"
        onClick={() => setTipoSelecionado('Entrada')}
        className={cn(
          'flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all',
          tipoSelecionado === 'Entrada'
            ? 'bg-lime-voltage text-forest-ink shadow-sm'
            : 'text-charcoal dark:text-pebble hover:text-forest-ink dark:hover:text-paper',
        )}
      >
        <span className="w-2 h-2 rounded-full bg-forest-ink" />
        Entradas
      </button>
      <button
        type="button"
        onClick={() => setTipoSelecionado('Saida')}
        className={cn(
          'flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all',
          tipoSelecionado === 'Saida'
            ? 'bg-alarm-red/15 text-alarm-red shadow-sm'
            : 'text-charcoal dark:text-pebble hover:text-alarm-red',
        )}
      >
        <span className="w-2 h-2 rounded-full bg-alarm-red" />
        Saídas
      </button>
    </div>
  );

  const seletorStatus = (
    <div className="relative inline-flex items-center">
      <CheckCircle2 className="w-4 h-4 text-pebble absolute left-3.5 pointer-events-none" />
      <select
        value={statusSelecionado}
        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
          setStatusSelecionado(e.target.value);
          setPagina(1);
        }}
        aria-label="Filtrar por status"
        className="h-11 pl-9 pr-8 py-2 rounded-full border border-pebble/30 bg-paper dark:bg-spruce/60 text-xs font-semibold text-forest-ink dark:text-paper focus:outline-none focus:ring-2 focus:ring-lime-voltage appearance-none cursor-pointer hover:bg-fog transition-colors"
      >
        <option value="">Todos os status</option>
        <option value={STATUS_TRANSACAO.PAGO}>Pagos</option>
        <option value={STATUS_TRANSACAO.PENDENTE}>Pendentes</option>
      </select>
      <ChevronDown className="w-3.5 h-3.5 text-pebble absolute right-3 pointer-events-none" />
    </div>
  );

  const seletorCategoria = (
    <div className="relative inline-flex items-center">
      <Tag className="w-4 h-4 text-pebble absolute left-3.5 pointer-events-none" />
      <select
        value={categoriaSelecionadaId}
        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
          setCategoriaSelecionadaId(e.target.value);
          setPagina(1);
        }}
        aria-label="Filtrar por categoria"
        className="h-11 pl-9 pr-8 py-2 rounded-full border border-pebble/30 bg-paper dark:bg-spruce/60 text-xs font-semibold text-forest-ink dark:text-paper focus:outline-none focus:ring-2 focus:ring-lime-voltage appearance-none cursor-pointer hover:bg-fog transition-colors"
      >
        <option value="">Todas as categorias</option>
        {categorias.map((cat) => (
          <option key={cat.id} value={cat.id}>
            {cat.nome}
          </option>
        ))}
      </select>
      <ChevronDown className="w-3.5 h-3.5 text-pebble absolute right-3 pointer-events-none" />
    </div>
  );

  function Paginacao() {
    if (carregando || paginaMeta.totalPages <= 1) return null;
    const { total, totalPages, pageSize = 20 } = paginaMeta;
    const from = (pagina - 1) * pageSize + 1;
    const to = Math.min(pagina * pageSize, total);
    return (
      <div className="flex items-center justify-between gap-4 mt-6 px-6 py-4 rounded-[20px] bg-fog dark:bg-card border border-transparent dark:border-spruce shadow-sm">
        <span className="text-xs numeric-mono text-charcoal dark:text-pebble font-bold">
          {from}&ndash;{to} de {total}
        </span>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="iconSm"
            onClick={() => irParaPagina(pagina - 1)}
            disabled={pagina <= 1}
            title="Página anterior"
            className="rounded-full h-9 w-9 bg-paper dark:bg-spruce border-pebble/30"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
            const start = Math.max(0, Math.min(pagina - 3, totalPages - 5));
            const pageNum = start + i + 1;
            if (pageNum > totalPages) return null;
            return (
              <Button
                key={pageNum}
                variant={pageNum === pagina ? 'default' : 'outline'}
                size="iconSm"
                onClick={() => irParaPagina(pageNum)}
                className={cn(
                  'numeric-mono text-xs font-bold rounded-full h-9 w-9 transition-all',
                  pageNum === pagina
                    ? 'bg-forest-ink text-lime-voltage dark:bg-lime-voltage dark:text-forest-ink shadow-sm'
                    : 'bg-paper dark:bg-spruce border-pebble/30 text-charcoal dark:text-paper hover:bg-fog',
                )}
              >
                {pageNum}
              </Button>
            );
          })}
          <Button
            variant="outline"
            size="iconSm"
            onClick={() => irParaPagina(pagina + 1)}
            disabled={pagina >= paginaMeta.totalPages}
            title="Próxima página"
            className="rounded-full h-9 w-9 bg-paper dark:bg-spruce border-pebble/30"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* ── Desktop View (Wise Design System) ───────────────────────── */}
      <div className="hidden md:flex flex-1 flex-col h-full overflow-hidden bg-background">
        <div className="flex-1 overflow-y-auto px-8 py-8 custom-scrollbar max-w-7xl w-full mx-auto space-y-7">
          {/* 1. TOP PAGE HEADER WITH WISE SIGNATURE ACTION BUTTONS */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl lg:text-4xl font-black tracking-tight text-forest-ink dark:text-paper font-sans">
                  Extrato Consolidado
                </h1>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-linen-mist text-forest-ink dark:bg-spruce dark:text-lime-voltage border border-forest-ink/10">
                  Pro Cashflow
                </span>
              </div>
              <p className="text-sm text-charcoal dark:text-pebble mt-1">
                Gestão de fluxo de caixa, auditoria contábil e conciliação bancária em tempo real.
              </p>
            </div>

            {/* Repositioned Wise Signature Action Pills */}
            <div className="flex items-center gap-3 shrink-0 flex-wrap">
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportar}
                disabled={exportando}
                className="h-11 px-5 rounded-full text-xs font-bold gap-2 border-forest-ink/30 dark:border-spruce text-forest-ink dark:text-paper hover:bg-fog dark:hover:bg-spruce transition-all shadow-sm"
              >
                {exportando ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-forest-ink border-t-lime-voltage rounded-full animate-spin" />
                    <span>Exportando...</span>
                  </>
                ) : exportadoSucesso ? (
                  <>
                    <Check className="w-4 h-4 text-forest-ink dark:text-lime-voltage" />
                    <span className="text-forest-ink dark:text-lime-voltage font-bold">OFX/CSV Gerado!</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 text-pebble" />
                    <span>Exportar OFX/CSV</span>
                  </>
                )}
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleNovaSaida}
                className="h-11 px-5 rounded-full text-xs font-bold gap-1.5 border-alarm-red/40 text-alarm-red hover:bg-alarm-red/10 transition-all shadow-sm"
              >
                <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
                <span>+ Saída</span>
              </Button>

              {/* Wise Signature Primary CTA: Lime Voltage Fill (#9fe870) with Forest Ink text (#163300) */}
              <Button
                size="sm"
                onClick={handleNovaEntrada}
                className="h-11 px-7 rounded-full text-xs font-black gap-2 bg-lime-voltage text-forest-ink hover:bg-lime-voltage/90 transition-all shadow-sm border-0"
              >
                <ArrowDownRight className="w-4 h-4 stroke-[2.5]" />
                <span>+ Entrada</span>
              </Button>
            </div>
          </div>

          {/* 2. ACCOUNT HERO & STATUS BANNER (Wise Linen Mist & Forest Ink) */}
          <AccountHeroBanner
            contaNome={contaAtiva?.nome || 'Pizzaria Bella Forneria'}
            tipoConta={contaAtiva?.tipo ? `Conta ${contaAtiva.tipo}` : 'Conta Jurídica Ativa'}
            documento="CNPJ 38.192.831/0001-44"
            bancoInfo="Banco Itaú Unibanco (341)"
            agenciaCc="Ag 0942 • CC 20491-8"
            sincronizado={true}
          />

          {/* 3. KEY FINANCIAL METRICS (WISE INVERTED DARK SECTION + FOG PANELS) */}
          <ExtratoKpiMetrics
            saldo={saldo}
            totalEntradas={totalEntradas}
            totalSaidas={totalSaidas}
          />

          {/* 4. UNIFIED COMMAND & FILTER TOOLBAR (Fog Surface Container) */}
          <div className="bg-fog dark:bg-card border border-transparent dark:border-spruce rounded-[20px] p-3.5 shadow-sm flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-3">
            <div className="flex items-center gap-3 flex-1 flex-wrap">
              {barraBusca}
              {seletorTipo}
            </div>
            <div className="flex items-center gap-2.5 flex-wrap justify-end">
              {seletorStatus}
              {seletorCategoria}
              {picker}
            </div>
          </div>

          {/* Active Search & Filter Indicator */}
          {(termoBusca || tipoSelecionado !== 'todos') && (
            <div className="flex items-center justify-between px-2 text-xs text-charcoal dark:text-pebble">
              <span>
                Filtro ativo: {transacoesDoPeriodo.length} movimentação(ões) encontrada(s)
              </span>
              <button
                type="button"
                onClick={() => {
                  setTermoBusca('');
                  setTipoSelecionado('todos');
                }}
                className="text-forest-ink dark:text-lime-voltage hover:underline font-bold"
              >
                Limpar filtros de busca
              </button>
            </div>
          )}

          {/* 5. TRANSACTION LEDGER TABLE (Wise High-Density Table) */}
          <TransactionTable
            transacoes={transacoesDoPeriodo}
            carregando={carregando}
            onDelete={handleDelete}
            onToggleStatus={handleToggleStatus}
            emptyMessage={mensagemVazia}
          />

          {/* 6. TABLE PAGINATION */}
          <Paginacao />

          {/* 7. QUICK CONCILIATION & DRE INSIGHTS */}
          <ConciliationInsightBanner />

          <FloatingActions
            onEntrada={handleNovaEntrada}
            onSaida={handleNovaSaida}
            empty={!carregando && transacoesDoPeriodo.length === 0}
          />
        </div>
      </div>

      {/* ── Mobile View ─────────────────────────────────────────────── */}
      <div className="md:hidden px-4 pt-4 pb-32 bg-background min-h-screen space-y-4">
        {/* Mobile Header Actions */}
        <div className="flex items-center justify-between gap-2 pb-1">
          <div>
            <h1 className="text-2xl font-black text-forest-ink dark:text-paper tracking-tight font-sans">
              Extrato
            </h1>
            <p className="text-xs text-charcoal dark:text-pebble font-medium">
              {contaAtiva?.nome || 'Pizzaria Bella Forneria'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="iconSm"
              onClick={handleExportar}
              title="Exportar"
              className="rounded-full h-10 w-10 border-pebble/30"
            >
              <Download className="w-4 h-4 text-charcoal dark:text-pebble" />
            </Button>
            <Button
              size="sm"
              onClick={handleNovaEntrada}
              className="h-10 px-4 rounded-full text-xs font-black bg-lime-voltage text-forest-ink border-0"
            >
              + Novo
            </Button>
          </div>
        </div>

        {/* Mobile Hero */}
        <AccountHeroBanner
          contaNome={contaAtiva?.nome || 'Pizzaria Bella Forneria'}
          tipoConta={contaAtiva?.tipo || 'PJ Ativa'}
          documento="CNPJ 38.192.831"
          bancoInfo="Itaú (341)"
          agenciaCc="CC 20491-8"
        />

        {/* Mobile Search & Filters */}
        <div className="space-y-2.5">
          {barraBusca}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            {seletorTipo}
            <div className="flex items-center gap-1.5 flex-wrap">
              {seletorStatus}
              {seletorCategoria}
            </div>
          </div>
          <div>{picker}</div>
        </div>

        {/* Mobile KPI Cards */}
        <ExtratoKpiMetrics
          saldo={saldo}
          totalEntradas={totalEntradas}
          totalSaidas={totalSaidas}
        />

        {/* Mobile Transaction List */}
        <div className="mt-4">
          {!contaSelecionadaId && !carregando && (
            <Card className="p-8 text-center space-y-3 rounded-[20px] bg-fog dark:bg-card border-transparent dark:border-spruce">
              <p className="text-sm text-charcoal dark:text-pebble">Nenhuma conta selecionada ou cadastrada.</p>
              {abrirModalNovaConta && (
                <Button size="sm" onClick={abrirModalNovaConta} className="rounded-full bg-forest-ink text-lime-voltage font-bold">
                  Criar Conta
                </Button>
              )}
            </Card>
          )}

          {transacoesDoPeriodo.length === 0 && !carregando && !!contaSelecionadaId && (
            <Card className="p-8 text-center flex flex-col items-center rounded-[20px] bg-fog dark:bg-card border-transparent dark:border-spruce">
              <div className="w-12 h-12 rounded-full bg-linen-mist dark:bg-spruce flex items-center justify-center mb-3">
                <Receipt className="w-6 h-6 text-forest-ink dark:text-lime-voltage" />
              </div>
              <p className="text-sm text-charcoal dark:text-pebble mb-4">{mensagemVazia}</p>
              <FloatingActions
                onEntrada={handleNovaEntrada}
                onSaida={handleNovaSaida}
                empty={true}
              />
            </Card>
          )}

          {!carregando && transacoesDoPeriodo.length > 0 && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between px-1 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-charcoal dark:text-pebble">
                  Movimentações
                </span>
                <span className="text-xs font-mono font-bold text-forest-ink dark:text-lime-voltage">
                  {transacoesDoPeriodo.length} registro(s)
                </span>
              </div>
              {transacoesDoPeriodo.map((t) => (
                <TransactionCard
                  key={t.id}
                  transacao={t}
                  onDelete={handleDelete}
                  onToggleStatus={handleToggleStatus}
                />
              ))}
            </div>
          )}
        </div>

        <Paginacao />

        {/* Mobile Insights */}
        <ConciliationInsightBanner />

        {!carregando && transacoesDoPeriodo.length > 0 && (
          <FloatingActions onEntrada={handleNovaEntrada} onSaida={handleNovaSaida} empty={false} />
        )}
      </div>
    </>
  );
}
