import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { deleteTransacao, getResumoPeriodo, getTransacoesRange } from '../services/api';
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

export default function Extrato() {
  const navigate = useNavigate();
  const { contaSelecionadaId } = useOutletContext();

  const hoje = useMemo(() => new Date(), []);
  const [filtroTipo, setFiltroTipo] = useState('mes'); // 'mes' | 'dia' | 'periodo'
  const [dataSelecionada, setDataSelecionada] = useState(() => new Date());
  const [dataInicio, setDataInicio] = useState(() => primeiroDiaMes(hoje));
  const [dataFim, setDataFim] = useState(() => new Date());

  const [transacoes, setTransacoes] = useState([]);
  const [resumo, setResumo] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [pagina, setPagina] = useState(1);
  const [paginaMeta, setPaginaMeta] = useState({ total: 0, totalPages: 1 });

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
          getTransacoesRange(
            contaSelecionadaId,
            periodoApi.dataInicio,
            periodoApi.dataFim,
            pageNum,
          ),
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
    [contaSelecionadaId, periodoApi],
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

  function Paginacao() {
    if (carregando || paginaMeta.totalPages <= 1) return null;
    const { total, totalPages, pageSize = 20 } = paginaMeta;
    const from = (pagina - 1) * pageSize + 1;
    const to = Math.min(pagina * pageSize, total);
    return (
      <div
        className="flex items-center justify-between gap-4 mt-4 px-4 py-3 rounded-xl border border-line"
        style={{ backgroundColor: 'var(--bg-card)' }}
      >
        <span className="text-xs text-on-surface-variant">
          {from}&ndash;{to} de {total}
        </span>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => irParaPagina(pagina - 1)}
            disabled={pagina <= 1}
            className="w-7 h-7 flex items-center justify-center rounded border border-line disabled:opacity-30 text-sm"
            style={{ backgroundColor: 'var(--bg-card)' }}
          >
            <span className="material-symbols-outlined text-sm">chevron_left</span>
          </button>
          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
            const start = Math.max(0, Math.min(pagina - 3, totalPages - 5));
            const pageNum = start + i + 1;
            if (pageNum > totalPages) return null;
            return (
              <button
                key={pageNum}
                onClick={() => irParaPagina(pageNum)}
                className={
                  'w-7 h-7 flex items-center justify-center rounded text-xs font-mono ' +
                  (pageNum === pagina ? 'bg-entrada text-white' : 'border border-line')
                }
                style={pageNum !== pagina ? { backgroundColor: 'var(--bg-card)' } : undefined}
              >
                {pageNum}
              </button>
            );
          })}
          <button
            onClick={() => irParaPagina(pagina + 1)}
            disabled={pagina >= paginaMeta.totalPages}
            className="w-7 h-7 flex items-center justify-center rounded border border-line disabled:opacity-30 text-sm"
            style={{ backgroundColor: 'var(--bg-card)' }}
          >
            <span className="material-symbols-outlined text-sm">chevron_right</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Desktop */}
      <div className="hidden md:flex flex-1 flex-col h-full overflow-hidden">
        <div className="flex-1 overflow-y-auto px-8 py-6 custom-scrollbar">
          <div className="mb-5 flex justify-end">{picker}</div>

          <ResponsiveGrid cols={3} gap={4}>
            <SummaryCard tipo="entrada" value={totalEntradas} />
            <SummaryCard tipo="saida" value={totalSaidas} />
            <SummaryCard tipo="saldo" value={saldo} />
          </ResponsiveGrid>

          <div className="mt-6">
            <TransactionTable
              transacoes={transacoesDoPeriodo}
              carregando={carregando}
              onDelete={handleDelete}
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
      <div className="md:hidden px-4 pt-4 pb-28">
        <div className="mb-4 flex justify-end">{picker}</div>

        <ResponsiveGrid cols={1} gap={3}>
          <SummaryCard tipo="saldo" value={saldo} />
          <SummaryCard tipo="entrada" value={totalEntradas} />
          <SummaryCard tipo="saida" value={totalSaidas} />
        </ResponsiveGrid>

        <div className="mt-1">
          {!contaSelecionadaId && !carregando && (
            <p className="text-sm text-on-surface-variant text-center py-8">
              Selecione uma conta para começar.
            </p>
          )}

          {carregando && (
            <p className="text-sm text-on-surface-variant text-center py-8">
              <span className="spinner inline-block align-middle mr-2" />
              Carregando...
            </p>
          )}

          {!carregando && transacoesDoPeriodo.length === 0 && contaSelecionadaId && (
            <div className="text-center py-8">
              <span className="material-symbols-outlined text-line text-4xl mb-3">
                receipt_long
              </span>
              <p className="text-sm text-on-surface-variant mb-4">{mensagemVazia}</p>
              <FloatingActions
                onEntrada={handleNovaEntrada}
                onSaida={handleNovaSaida}
                empty={true}
              />
            </div>
          )}

          {!carregando && transacoesDoPeriodo.length > 0 && (
            <div className="space-y-2.5 mt-4">
              <p className="font-label-caps text-[11px] text-on-surface-variant uppercase tracking-[0.1em]">
                MOVIMENTAÇÕES
              </p>
              {transacoesDoPeriodo.map((t) => (
                <TransactionCard key={t.id} transacao={t} onDelete={handleDelete} />
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
