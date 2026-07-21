import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import {
  deleteTransacao,
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

function formatShortDate(dateStr) {
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: '2-digit' }).replace('.', '');
}

function formatFullDate(dateStr) {
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
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
  if (n.includes('fixo')) return 'receipt';
  return 'receipt_long';
}

const PAGE_SIZE = 10;

export default function Extrato() {
  const navigate = useNavigate();
  const { contaSelecionadaId } = useOutletContext();

  const hoje = useMemo(() => new Date(), []);
  const [dataInicio] = useState(() => formatDateOnly(primeiroDiaMes(hoje)));
  const [dataFim] = useState(() => formatDateOnly(ultimoDiaMes(hoje)));

  const [transacoes, setTransacoes] = useState([]);
  const [resumo, setResumo] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [pesquisa, setPesquisa] = useState('');
  const [pagina, setPagina] = useState(0);

  const carregarDados = useCallback(async () => {
    if (!contaSelecionadaId) {
      setTransacoes([]);
      setResumo(null);
      setCarregando(false);
      return;
    }

    try {
      const [txns, res] = await Promise.all([
        getTransacoesRange(contaSelecionadaId, dataInicio, dataFim),
        getResumoPeriodo(contaSelecionadaId, dataInicio, dataFim),
      ]);
      setTransacoes(txns);
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
    carregarDados();
  }, [carregarDados]);

  const filtradas = useMemo(() => {
    const q = pesquisa.toLowerCase().trim();
    if (!q) return transacoes;
    return transacoes.filter((t) =>
      t.descricao.toLowerCase().includes(q) ||
      (t.categoriaNome && t.categoriaNome.toLowerCase().includes(q))
    );
  }, [transacoes, pesquisa]);

  const totalPaginas = Math.max(1, Math.ceil(filtradas.length / PAGE_SIZE));
  const paginaSegura = Math.min(pagina, totalPaginas - 1);
  const paginadas = filtradas.slice(paginaSegura * PAGE_SIZE, (paginaSegura + 1) * PAGE_SIZE);

  const totalEntradas = resumo?.totalEntradas ?? 0;
  const totalSaidas = resumo?.totalSaidas ?? 0;
  const saldo = resumo?.saldo ?? 0;

  const mesAno = hoje.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }).toUpperCase();

  async function handleDelete(id) {
    try {
      await deleteTransacao(id);
      await carregarDados();
    } catch {}
  }

  function handleNovaEntrada() {
    navigate('/lancamentos');
  }

  function handleNovaSaida() {
    navigate('/lancamentos');
  }

  return (
    <>
      {/* Desktop: sidebar layout */}
      <div className="hidden md:flex flex-1 flex-col h-full overflow-hidden">
        <div className="flex-1 overflow-y-auto paper-texture px-margin-desktop py-md custom-scrollbar">
          <section className="grid grid-cols-1 md:grid-cols-3 gap-md mb-lg">
            <div className="bg-white/60 backdrop-blur-sm border-l-4 border-primary rounded-lg p-md shadow-sm flex items-center justify-between group hover:shadow-md transition-all">
              <div>
                <p className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest mb-1">Entradas</p>
                <h3 className="font-data-lg text-data-lg text-primary">{formatCurrency(totalEntradas)}</h3>
              </div>
              <div className="w-12 h-12 rounded-full flex items-center justify-center bg-[#105137]/10 text-primary">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>arrow_circle_up</span>
              </div>
            </div>

            <div className="bg-white/60 backdrop-blur-sm border-l-4 border-error rounded-lg p-md shadow-sm flex items-center justify-between group hover:shadow-md transition-all">
              <div>
                <p className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest mb-1">Saídas</p>
                <h3 className="font-data-lg text-data-lg text-error">{formatCurrency(totalSaidas)}</h3>
              </div>
              <div className="w-12 h-12 rounded-full flex items-center justify-center bg-[#B23A2E]/10 text-error">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>arrow_circle_down</span>
              </div>
            </div>

            <div className="bg-white/60 backdrop-blur-sm border-l-4 border-tertiary rounded-lg p-md shadow-sm flex items-center justify-between group hover:shadow-md transition-all">
              <div>
                <p className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest mb-1">Saldo Atual</p>
                <h3 className="font-data-lg text-data-lg text-tertiary">{formatCurrency(saldo)}</h3>
              </div>
              <div className="w-12 h-12 rounded-full flex items-center justify-center bg-[#4A7C7E]/10 text-tertiary">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>account_balance_wallet</span>
              </div>
            </div>
          </section>

          <div className="bg-white rounded-xl shadow-sm border border-outline-variant overflow-hidden">
            <table className="w-full border-collapse text-left">
              <thead className="bg-surface-container font-label-caps text-label-caps text-on-surface-variant border-b border-outline-variant">
                <tr>
                  <th className="py-4 px-md font-bold uppercase w-32">Data</th>
                  <th className="py-4 px-md font-bold uppercase">Descrição</th>
                  <th className="py-4 px-md font-bold uppercase w-48">Categoria</th>
                  <th className="py-4 px-md font-bold uppercase text-right w-48">Valor</th>
                  <th className="py-4 px-md font-bold uppercase w-16"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {carregando && (
                  <tr><td colSpan={5} className="text-center py-12 text-body-sm text-on-surface-variant">Carregando...</td></tr>
                )}
                {!carregando && paginadas.length === 0 && (
                  <tr><td colSpan={5} className="text-center py-12 text-body-sm text-on-surface-variant">Nenhuma movimentação neste período.</td></tr>
                )}
                {!carregando && paginadas.map((t) => {
                  const isEntrada = t.tipo === 'Entrada';
                  return (
                    <tr key={t.id} className="group hover:bg-surface-container-low transition-colors">
                      <td className={'py-4 px-md font-data-md text-data-md border-l-4 ' + (isEntrada ? 'border-primary' : 'border-error')}>
                        {formatShortDate(t.data)}
                      </td>
                      <td className="py-4 px-md">
                        <div className="flex flex-col">
                          <span className="font-body-md font-bold">{t.descricao}</span>
                          <span className="font-body-sm text-on-surface-variant">{t.categoriaNome || 'Sem categoria'}</span>
                        </div>
                      </td>
                      <td className="py-4 px-md">
                        <span className={'px-2 py-1 rounded border font-label-caps text-label-caps bg-opacity-5 ' + (isEntrada
                          ? 'border-primary/30 text-primary bg-primary'
                          : 'border-error/30 text-error bg-error'
                        )}>
                          {t.categoriaNome || 'GERAL'}
                        </span>
                      </td>
                      <td className={'py-4 px-md font-data-md text-data-md text-right ' + (isEntrada ? 'text-primary' : 'text-error')}>
                        {isEntrada ? '+ ' : '- '}{formatCurrency(t.valor)}
                      </td>
                      <td className="py-4 px-md text-right opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleDelete(t.id)}
                          className="material-symbols-outlined text-on-surface-variant hover:text-error"
                        >
                          delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {!carregando && filtradas.length > PAGE_SIZE && (
              <div className="p-md bg-surface-container border-t border-outline-variant flex justify-between items-center">
                <span className="font-body-sm text-on-surface-variant">
                  Exibindo {paginaSegura * PAGE_SIZE + 1}-{Math.min((paginaSegura + 1) * PAGE_SIZE, filtradas.length)} de {filtradas.length} transações
                </span>
                <div className="flex gap-xs">
                  <button
                    onClick={() => setPagina(Math.max(0, paginaSegura - 1))}
                    disabled={paginaSegura === 0}
                    className="w-8 h-8 flex items-center justify-center border border-outline-variant rounded hover:bg-white transition-colors disabled:opacity-30"
                  >
                    <span className="material-symbols-outlined text-sm">chevron_left</span>
                  </button>
                  {Array.from({ length: Math.min(totalPaginas, 5) }, (_, i) => {
                    const start = Math.max(0, Math.min(paginaSegura - 2, totalPaginas - 5));
                    const pageNum = start + i;
                    if (pageNum >= totalPaginas) return null;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPagina(pageNum)}
                        className={'w-8 h-8 flex items-center justify-center rounded font-data-md text-xs ' + (pageNum === paginaSegura ? 'bg-primary text-white' : 'border border-outline-variant hover:bg-white transition-colors')}
                      >
                        {pageNum + 1}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => setPagina(Math.min(totalPaginas - 1, paginaSegura + 1))}
                    disabled={paginaSegura >= totalPaginas - 1}
                    className="w-8 h-8 flex items-center justify-center border border-outline-variant rounded hover:bg-white transition-colors disabled:opacity-30"
                  >
                    <span className="material-symbols-outlined text-sm">chevron_right</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="fixed bottom-lg right-lg flex flex-col gap-sm z-50">
          <button
            onClick={handleNovaEntrada}
            className="floating-fab flex items-center gap-xs px-6 py-4 bg-primary text-white rounded-full shadow-lg hover:shadow-xl hover:brightness-110 transition-all group"
          >
            <span className="material-symbols-outlined group-hover:rotate-90 transition-transform">add</span>
            <span className="font-headline-lg text-headline-lg uppercase tracking-wider text-sm">+ ENTRADA</span>
          </button>
          <button
            onClick={handleNovaSaida}
            className="floating-fab flex items-center gap-xs px-6 py-4 bg-error text-white rounded-full shadow-lg hover:shadow-xl hover:brightness-110 transition-all group"
          >
            <span className="material-symbols-outlined group-hover:rotate-180 transition-transform">remove</span>
            <span className="font-headline-lg text-headline-lg uppercase tracking-wider text-sm">- SAÍDA</span>
          </button>
        </div>
      </div>

      {/* Mobile: card layout */}
      <div className="md:hidden px-margin-mobile pt-md pb-32">
        <div className="flex justify-center mb-lg overflow-visible">
          <div className="ink-stamp -rotate-3 border-4 border-primary-container px-6 py-2 inline-block">
            <span className="font-headline-lg text-primary-container font-extrabold tracking-widest uppercase">
              {contaSelecionadaId ? 'CONTA CORRENTE' : 'SELECIONE UMA CONTA'}
            </span>
          </div>
        </div>

        <section className="bg-surface-container-lowest rounded-xl receipt-shadow p-md mb-md border-b-4 border-tertiary">
          <div className="flex justify-between items-end mb-md">
            <div>
              <p className="font-label-caps text-label-caps text-on-surface-variant mb-xs">SALDO TOTAL</p>
              <p className="font-data-lg text-[28px] leading-none text-tertiary">{formatCurrency(saldo)}</p>
            </div>
            <span className="material-symbols-outlined text-tertiary-fixed-dim" style={{ fontSize: 32 }}>account_balance_wallet</span>
          </div>
          <div className="grid grid-cols-2 gap-md pt-md border-t border-outline-variant/30">
            <div className="flex flex-col">
              <div className="flex items-center gap-xs mb-1">
                <span className="material-symbols-outlined text-on-primary-fixed-variant text-sm">add_circle</span>
                <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">Entradas</span>
              </div>
              <p className="font-data-md text-data-md text-on-primary-fixed-variant">+ {formatCurrency(totalEntradas)}</p>
            </div>
            <div className="flex flex-col items-end">
              <div className="flex items-center gap-xs mb-1">
                <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">Saídas</span>
                <span className="material-symbols-outlined text-error text-sm">remove_circle</span>
              </div>
              <p className="font-data-md text-data-md text-error">- {formatCurrency(totalSaidas)}</p>
            </div>
          </div>
        </section>

        <div className="flex gap-sm mb-lg">
          <button
            onClick={handleNovaEntrada}
            className="w-1/2 bg-primary text-on-primary py-4 rounded-lg flex items-center justify-center gap-xs active:scale-95 transition-transform shadow-md"
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'wght' 700" }}>add</span>
            <span className="font-label-caps text-label-caps">ENTRADA</span>
          </button>
          <button
            onClick={handleNovaSaida}
            className="w-1/2 bg-error text-on-error py-4 rounded-lg flex items-center justify-center gap-xs active:scale-95 transition-transform shadow-md"
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'wght' 700" }}>remove</span>
            <span className="font-label-caps text-label-caps">SAÍDA</span>
          </button>
        </div>

        <div className="mb-xs flex justify-between items-center">
          <h2 className="font-label-caps text-label-caps text-on-surface-variant">RECENTES</h2>
          <span className="material-symbols-outlined text-on-surface-variant">filter_list</span>
        </div>

        {carregando && (
          <p className="text-body-sm text-on-surface-variant text-center py-8">Carregando...</p>
        )}

        {!carregando && filtradas.length === 0 && (
          <p className="text-body-sm text-on-surface-variant text-center py-8 opacity-60">Nenhuma movimentação neste período.</p>
        )}

        {!carregando && filtradas.length > 0 && (
          <div className="space-y-sm">
            {filtradas.map((t) => {
              const isEntrada = t.tipo === 'Entrada';
              const borderColor = isEntrada ? 'border-primary' : (t.tipo === 'Saida' || t.tipo === 'Saída' ? 'border-error' : 'border-tertiary');
              return (
                <div key={t.id} className={'group relative bg-surface-container-lowest flex items-center p-sm rounded-lg receipt-shadow transition-colors hover:bg-[#EEF0EC] border-l-4 ' + borderColor}>
                  <div className="flex-grow">
                    <p className="font-body-md font-bold text-on-surface">{t.descricao}</p>
                    <p className="font-body-sm text-on-surface-variant text-[12px]">
                      {formatFullDate(t.data)} — {t.categoriaNome || 'Sem categoria'}
                    </p>
                  </div>
                  <div className="flex items-center gap-sm">
                    <p className={'font-data-md ' + (isEntrada ? 'text-primary' : 'text-error')}>
                      {isEntrada ? '+ ' : '- '}{formatCurrency(t.valor)}
                    </p>
                    <button
                      onClick={() => handleDelete(t.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-on-surface-variant hover:text-error"
                    >
                      <span className="material-symbols-outlined">delete</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
