import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useOutletContext, useSearchParams } from 'react-router-dom';
import { ChevronDown, ChevronLeft, ChevronRight, Receipt, Tag, CheckCircle2 } from 'lucide-react';
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
import SummaryCard from '../components/common/SummaryCard';
import FloatingActions from '../components/common/FloatingActions';
import ResponsiveGrid from '../components/common/ResponsiveGrid';
import PeriodoPicker from '../components/common/PeriodoPicker';
import TransactionTable from '../components/transactions/TransactionTable';
import TransactionCard from '../components/transactions/TransactionCard';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';

export default function Extrato() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const outletCtx = useOutletContext();
  const contaSelecionadaId = outletCtx?.contaSelecionadaId;
  const categoriasContext = outletCtx?.categorias;
  const abrirModalNovaConta = outletCtx?.abrirModalNovaConta;

  const [categorias, setCategorias] = useState(() => categoriasContext || []);
  const [categoriaSelecionadaId, setCategoriaSelecionadaId] = useState('');
  const [statusSelecionado, setStatusSelecionado] = useState(
    () => searchParams.get('status') || '',
  );

  const hoje = useMemo(() => new Date(), []);
  const [filtroTipo, setFiltroTipo] = useState('mes');
  const [dataSelecionada, setDataSelecionada] = useState(() => new Date());
  const [dataInicio, setDataInicio] = useState(() => primeiroDiaMes(hoje));
  const [dataFim, setDataFim] = useState(() => new Date());

  const [transacoes, setTransacoes] = useState([]);
  const [resumo, setResumo] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [pagina, setPagina] = useState(1);
  const [paginaMeta, setPaginaMeta] = useState({ total: 0, totalPages: 1 });

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
    () => periodoEfetivoParaApi(filtroTipo, hoje, dataSelecionada, dataInicio, dataFim),
    [filtroTipo, hoje, dataSelecionada, dataInicio, dataFim],
  );

  const carregarDados = useCallback(
    async (pageNum) => {
      if (!contaSelecionadaId) {
        setTransacoes([]);
        setResumo(null);
        setCarregando(false);
        return;
      }
      try {
        const [txns, res] = await Promise.all([
          getTransacoesRange({
            contaId: contaSelecionadaId,
            dataInicio: periodoApi.dataInicio,
            dataFim: periodoApi.dataFim,
            page: pageNum,
            pageSize: 20,
            categoriaId: categoriaSelecionadaId ? Number(categoriaSelecionadaId) : null,
            status: statusSelecionado || null,
          }),
          getResumoPeriodo(contaSelecionadaId, periodoApi.dataInicio, periodoApi.dataFim),
        ]);
        setTransacoes(txns.data);
        setPaginaMeta({ total: txns.total, totalPages: txns.totalPages, pageSize: txns.pageSize });
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

  function irParaPagina(p) {
    if (p < 1 || p > paginaMeta.totalPages || p === pagina) return;
    setPagina(p);
    setCarregando(true);
    carregarDados(p);
  }

  const totalEntradas = resumo?.totalEntradas ?? 0;
  const totalSaidas = resumo?.totalSaidas ?? 0;
  const saldo = resumo?.saldo ?? 0;

  const transacoesDoPeriodo = useMemo(
    () =>
      transacoesFiltradasPorPeriodo(transacoes, filtroTipo, dataSelecionada, dataInicio, dataFim),
    [transacoes, filtroTipo, dataSelecionada, dataInicio, dataFim],
  );

  const labelPeriodo = formatPeriodoLabel(filtroTipo, dataSelecionada, dataInicio, dataFim, hoje);

  const mensagemVazia =
    filtroTipo === 'dia'
      ? `Nenhuma transação em ${labelPeriodo}.`
      : filtroTipo === 'periodo'
        ? `Nenhuma transação entre ${labelPeriodo}.`
        : 'Nenhuma movimentação neste período.';

  async function handleDelete(id) {
    try {
      await deleteTransacao(id);
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

  async function handleToggleStatus(transacao) {
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

  const picker = (
    <PeriodoPicker
      filtroTipo={filtroTipo}
      setFiltroTipo={setFiltroTipo}
      dataSelecionada={dataSelecionada}
      setDataSelecionada={setDataSelecionada}
      dataInicio={dataInicio}
      setDataInicio={setDataInicio}
      dataFim={dataFim}
      setDataFim={setDataFim}
      mesReferencia={hoje}
    />
  );

  const seletorStatus = (
    <div className="relative inline-flex items-center">
      <CheckCircle2 className="w-3.5 h-3.5 text-muted-foreground absolute left-3 pointer-events-none" />
      <select
        value={statusSelecionado}
        onChange={(e) => {
          setStatusSelecionado(e.target.value);
          setPagina(1);
        }}
        aria-label="Filtrar por status"
        className="h-10 pl-8 pr-8 py-1.5 rounded-xl border border-border bg-secondary text-xs font-medium text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary appearance-none cursor-pointer hover:bg-secondary/80 transition-colors"
      >
        <option value="">Todos os status</option>
        <option value={STATUS_TRANSACAO.PAGO}>Pagos</option>
        <option value={STATUS_TRANSACAO.PENDENTE}>Pendentes</option>
      </select>
      <ChevronDown className="w-3.5 h-3.5 text-muted-foreground absolute right-2.5 pointer-events-none" />
    </div>
  );

  const seletorCategoria = (
    <div className="relative inline-flex items-center">
      <Tag className="w-3.5 h-3.5 text-muted-foreground absolute left-3 pointer-events-none" />
      <select
        value={categoriaSelecionadaId}
        onChange={(e) => {
          setCategoriaSelecionadaId(e.target.value);
          setPagina(1);
        }}
        aria-label="Filtrar por categoria"
        className="h-10 pl-8 pr-8 py-1.5 rounded-xl border border-border bg-secondary text-xs font-medium text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary appearance-none cursor-pointer hover:bg-secondary/80 transition-colors"
      >
        <option value="">Todas as categorias</option>
        {categorias.map((cat) => (
          <option key={cat.id} value={cat.id}>
            {cat.nome}
          </option>
        ))}
      </select>
      <ChevronDown className="w-3.5 h-3.5 text-muted-foreground absolute right-2.5 pointer-events-none" />
    </div>
  );

  function Paginacao() {
    if (carregando || paginaMeta.totalPages <= 1) return null;
    const { total, totalPages, pageSize = 20 } = paginaMeta;
    const from = (pagina - 1) * pageSize + 1;
    const to = Math.min(pagina * pageSize, total);
    return (
      <div className="flex items-center justify-between gap-4 mt-6 px-5 py-3 rounded-2xl border border-border bg-card shadow-sm">
        <span className="text-xs numeric-mono text-muted-foreground font-medium">
          {from}&ndash;{to} de {total}
        </span>
        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            size="iconSm"
            onClick={() => irParaPagina(pagina - 1)}
            disabled={pagina <= 1}
            title="Página anterior"
            className="rounded-xl h-8 w-8"
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
                  'numeric-mono text-xs font-semibold rounded-xl h-8 w-8',
                  pageNum === pagina ? 'bg-primary text-primary-foreground' : '',
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
            className="rounded-xl h-8 w-8"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Desktop */}
      <div className="hidden md:flex flex-1 flex-col h-full overflow-hidden bg-background">
        <div className="flex-1 overflow-y-auto px-8 py-6 custom-scrollbar max-w-7xl w-full mx-auto">
          <div className="mb-6 flex items-center justify-end gap-3 flex-wrap">
            {seletorStatus}
            {seletorCategoria}
            {picker}
          </div>

          <ResponsiveGrid cols={3} gap={4}>
            <SummaryCard tipo="entrada" value={totalEntradas} />
            <SummaryCard tipo="saida" value={totalSaidas} />
            <SummaryCard tipo="saldo" value={saldo} />
          </ResponsiveGrid>

          <div className="mt-8">
            <TransactionTable
              transacoes={transacoesDoPeriodo}
              carregando={carregando}
              onDelete={handleDelete}
              onToggleStatus={handleToggleStatus}
              emptyMessage={mensagemVazia}
            />
          </div>

          <Paginacao />

          <FloatingActions
            onEntrada={handleNovaEntrada}
            onSaida={handleNovaSaida}
            empty={!carregando && transacoesDoPeriodo.length === 0}
          />
        </div>
      </div>

      {/* Mobile */}
      <div className="md:hidden px-4 pt-4 pb-32 bg-background min-h-screen">
        <div className="mb-4 flex items-center justify-end gap-2 flex-wrap">
          {seletorStatus}
          {seletorCategoria}
          {picker}
        </div>

        <ResponsiveGrid cols={1} gap={3}>
          <SummaryCard tipo="saldo" value={saldo} />
          <SummaryCard tipo="entrada" value={totalEntradas} />
          <SummaryCard tipo="saida" value={totalSaidas} />
        </ResponsiveGrid>

        <div className="mt-6">
          {!contaSelecionadaId && !carregando && (
            <Card className="p-8 text-center space-y-3">
              <p className="text-sm text-muted-foreground">Nenhuma conta selecionada ou cadastrada.</p>
              {abrirModalNovaConta && (
                <Button size="sm" onClick={abrirModalNovaConta} className="rounded-xl font-semibold">
                  Criar Conta
                </Button>
              )}
            </Card>
          )}

          {carregando && (
            <div className="text-center py-12 text-muted-foreground text-sm">
              <span className="inline-block w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin align-middle mr-2" />
              Carregando transações...
            </div>
          )}

          {!carregando && transacoesDoPeriodo.length === 0 && contaSelecionadaId && (
            <Card className="p-8 text-center flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center mb-3">
                <Receipt className="w-6 h-6 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground mb-4">{mensagemVazia}</p>
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
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Movimentações
                </span>
                <span className="text-xs font-mono text-muted-foreground">
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

        {!carregando && transacoesDoPeriodo.length > 0 && (
          <FloatingActions onEntrada={handleNovaEntrada} onSaida={handleNovaSaida} empty={false} />
        )}
      </div>
    </>
  );
}
