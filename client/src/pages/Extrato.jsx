import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import {
  deleteTransacao,
  getResumoPeriodo,
  getTransacoesRange,
} from '../services/api';
import SummaryCard from '../components/common/SummaryCard';
import FloatingActions from '../components/common/FloatingActions';
import ResponsiveGrid from '../components/common/ResponsiveGrid';
import TransactionTable from '../components/transactions/TransactionTable';
import TransactionCard from '../components/transactions/TransactionCard';

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

export default function Extrato() {
  const navigate = useNavigate();
  const { contaSelecionadaId } = useOutletContext();

  const hoje = useMemo(() => new Date(), []);
  const [dataInicio] = useState(() => formatDateOnly(primeiroDiaMes(hoje)));
  const [dataFim] = useState(() => formatDateOnly(ultimoDiaMes(hoje)));

  const [transacoes, setTransacoes] = useState([]);
  const [resumo, setResumo] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [pagina, setPagina] = useState(1);
  const [paginaMeta, setPaginaMeta] = useState({ total: 0, totalPages: 1 });

  const carregarDados = useCallback(async (pageNum) => {
    if (!contaSelecionadaId) {
      setTransacoes([]);
      setResumo(null);
      setCarregando(false);
      return;
    }
    try {
      const [txns, res] = await Promise.all([
        getTransacoesRange(contaSelecionadaId, dataInicio, dataFim, pageNum),
        getResumoPeriodo(contaSelecionadaId, dataInicio, dataFim),
      ]);
      setTransacoes(txns.data);
      setPaginaMeta({ total: txns.total, totalPages: txns.totalPages });
      setResumo(res);
    } catch {
      setTransacoes([]);
      setResumo(null);
    } finally {
      setCarregando(false);
    }
  }, [contaSelecionadaId, dataInicio, dataFim]);

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

  async function handleDelete(id) {
    try {
      await deleteTransacao(id);
      await carregarDados(pagina);
    } catch {}
  }

  function handleNovaEntrada() {
    navigate('/lancamentos');
  }

  function handleNovaSaida() {
    navigate('/lancamentos');
  }

  function Paginacao() {
    if (carregando || paginaMeta.totalPages <= 1) return null;
    const { total, totalPages } = paginaMeta;
    const from = (pagina - 1) * 20 + 1;
    const to = Math.min(pagina * 20, total);
    return (
      <div className="flex items-center justify-between gap-4 mt-4 px-4 py-3 rounded-xl border border-line" style={{ backgroundColor: 'var(--bg-card)' }}>
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
                  (pageNum === pagina
                    ? 'bg-entrada text-white'
                    : 'border border-line')
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
          <ResponsiveGrid cols={3} gap={4}>
            <SummaryCard tipo="entrada" value={totalEntradas} />
            <SummaryCard tipo="saida" value={totalSaidas} />
            <SummaryCard tipo="saldo" value={saldo} />
          </ResponsiveGrid>

          <div className="mt-6">
            <TransactionTable
              transacoes={transacoes}
              carregando={carregando}
              onDelete={handleDelete}
            />
          </div>

          <Paginacao />

          <FloatingActions
            onEntrada={handleNovaEntrada}
            onSaida={handleNovaSaida}
            empty={!carregando && transacoes.length === 0}
          />
        </div>
      </div>

      {/* Mobile */}
      <div className="md:hidden px-4 pt-4 pb-28">
        <ResponsiveGrid cols={1} gap={3}>
          <SummaryCard tipo="saldo" value={saldo} />
          <SummaryCard tipo="entrada" value={totalEntradas} />
          <SummaryCard tipo="saida" value={totalSaidas} />
        </ResponsiveGrid>

        <div className="mt-1">
          {!contaSelecionadaId && !carregando && (
            <p className="text-sm text-on-surface-variant text-center py-8">Selecione uma conta para começar.</p>
          )}

          {carregando && (
            <p className="text-sm text-on-surface-variant text-center py-8">
              <span className="spinner inline-block align-middle mr-2" />Carregando...
            </p>
          )}

          {!carregando && transacoes.length === 0 && contaSelecionadaId && (
            <div className="text-center py-8">
              <span className="material-symbols-outlined text-line text-4xl mb-3">receipt_long</span>
              <p className="text-sm text-on-surface-variant mb-4">Nenhuma movimentação neste período.</p>
              <FloatingActions
                onEntrada={handleNovaEntrada}
                onSaida={handleNovaSaida}
                empty={true}
              />
            </div>
          )}

          {!carregando && transacoes.length > 0 && (
            <div className="space-y-2.5 mt-4">
              <p className="font-label-caps text-[11px] text-on-surface-variant uppercase tracking-[0.1em]">
                MOVIMENTAÇÕES
              </p>
              {transacoes.map((t) => (
                <TransactionCard key={t.id} transacao={t} onDelete={handleDelete} />
              ))}
            </div>
          )}
        </div>

        <Paginacao />

        {!carregando && transacoes.length > 0 && (
          <FloatingActions
            onEntrada={handleNovaEntrada}
            onSaida={handleNovaSaida}
            empty={false}
          />
        )}
      </div>
    </>
  );
}
