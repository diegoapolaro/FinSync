import { useCallback, useEffect, useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  deleteTransacao,
  getResumoPeriodo,
  getTransacoesRange,
} from '../services/api';
import { formatCurrency, formatDisplayDate } from '../utils/formatters';

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

function formatDateGroup(dateStr) {
  const hoje = new Date();
  const ontem = new Date(hoje);
  ontem.setDate(ontem.getDate() - 1);
  const data = new Date(dateStr + 'T12:00:00');

  if (data.toDateString() === hoje.toDateString()) {
    return 'Hoje, ' + data.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' });
  }
  if (data.toDateString() === ontem.toDateString()) {
    return 'Ontem, ' + data.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' });
  }
  return data.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function Extrato() {
  const { contaSelecionadaId } = useOutletContext();

  const hoje = useMemo(() => new Date(), []);
  const [dataInicio] = useState(() => formatDateOnly(primeiroDiaMes(hoje)));
  const [dataFim] = useState(() => formatDateOnly(ultimoDiaMes(hoje)));

  const [transacoes, setTransacoes] = useState([]);
  const [resumo, setResumo] = useState(null);
  const [carregando, setCarregando] = useState(true);

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

  const transacoesAgrupadas = useMemo(() => {
    const grupos = {};
    for (const t of transacoes) {
      const chave = t.data;
      if (!grupos[chave]) grupos[chave] = [];
      grupos[chave].push(t);
    }
    return Object.entries(grupos).sort(([a], [b]) => b.localeCompare(a));
  }, [transacoes]);

  const totalEntradas = resumo?.totalEntradas ?? 0;
  const totalSaidas = resumo?.totalSaidas ?? 0;
  const saldo = resumo?.saldo ?? 0;

  const periodoLabel = `${dataInicio.slice(8, 10)}/${dataInicio.slice(5, 7)} - ${dataFim.slice(8, 10)}/${dataFim.slice(5, 7)}`;

  async function handleDelete(id) {
    try {
      await deleteTransacao(id);
      await carregarDados();
    } catch {}
  }

  return (
    <div className="px-margin-mobile md:px-margin-desktop max-w-7xl mx-auto space-y-md mt-md pt-4 md:pt-6">
      <section className="grid grid-cols-1 md:grid-cols-3 gap-md">
        <div className="bg-white p-5 border-l-4 border-primary rounded-lg flex flex-col justify-between h-40 shadow-sm">
          <div className="flex justify-between items-start">
            <p className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest">Total Entradas</p>
            <span className="material-symbols-outlined text-primary">trending_up</span>
          </div>
          <div>
            <p className="font-data-lg text-data-lg text-primary mono-data">{formatCurrency(totalEntradas)}</p>
            <p className="text-body-sm font-body-sm text-outline">Período atual</p>
          </div>
        </div>

        <div className="bg-white p-5 border-l-4 border-error rounded-lg flex flex-col justify-between h-40 shadow-sm">
          <div className="flex justify-between items-start">
            <p className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest">Total Saídas</p>
            <span className="material-symbols-outlined text-error">trending_down</span>
          </div>
          <div>
            <p className="font-data-lg text-data-lg text-error mono-data">{formatCurrency(totalSaidas)}</p>
            <p className="text-body-sm font-body-sm text-outline">Período atual</p>
          </div>
        </div>

        <div className="bg-surface-container-low p-5 border-l-4 border-tertiary rounded-lg flex flex-col justify-between h-40 shadow-sm">
          <div className="flex justify-between items-start">
            <p className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest">Saldo Disponível</p>
            <span className="material-symbols-outlined text-tertiary">account_balance_wallet</span>
          </div>
          <div>
            <p className="font-data-lg text-data-lg text-on-surface mono-data">{formatCurrency(saldo)}</p>
            <div className="flex items-center gap-1 mt-1">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
              <p className="text-body-sm font-body-sm text-primary font-bold">Atualizado agora</p>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-sm">
        <div className="flex justify-between items-end py-4">
          <div>
            <h3 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">EXTRATO RECENTE</h3>
            <p className="text-body-sm font-body-sm text-on-surface-variant">Movimentações de {periodoLabel}</p>
          </div>
        </div>

        {carregando && (
          <p className="text-body-sm font-body-sm text-on-surface-variant text-center py-12">Carregando...</p>
        )}

        {!carregando && transacoes.length === 0 && (
          <p className="text-body-sm font-body-sm text-on-surface-variant text-center py-12 opacity-60">
            Nenhuma movimentação neste período.
          </p>
        )}

        {!carregando && transacoes.length > 0 && (
          <div className="space-y-4">
            {transacoesAgrupadas.map(([data, txns]) => (
              <div key={data}>
                <div className="flex items-center gap-4 py-2">
                  <span className="text-label-caps font-label-caps text-outline uppercase">{formatDateGroup(data)}</span>
                  <hr className="flex-1 border-outline-variant" />
                </div>
                {txns.map((t) => {
                  const isEntrada = t.tipo === 'Entrada';
                  const borderColor = isEntrada ? 'border-primary' : 'border-error';
                  const amountColor = isEntrada ? 'text-primary' : 'text-error';
                  const icon = t.categoriaNome
                    ? t.categoriaNome.toLowerCase().includes('aliment')
                      ? 'restaurant'
                      : t.categoriaNome.toLowerCase().includes('transp')
                        ? 'local_shipping'
                        : t.categoriaNome.toLowerCase().includes('morad') || t.categoriaNome.toLowerCase().includes('habit')
                          ? 'home'
                          : t.categoriaNome.toLowerCase().includes('venda') || t.categoriaNome.toLowerCase().includes('sal')
                            ? 'payments'
                            : t.categoriaNome.toLowerCase().includes('invest')
                              ? 'trending_up'
                              : 'payments'
                    : 'receipt_long';

                  return (
                    <div key={t.id} className={'bg-white p-5 border-l-4 ' + borderColor + ' rounded-lg flex items-center justify-between group cursor-pointer shadow-sm'}>
                      <div className="flex items-center gap-md">
                        <div className="w-12 h-12 rounded-full bg-primary-container/20 flex items-center justify-center">
                          <span className="material-symbols-outlined text-primary">{icon}</span>
                        </div>
                        <div>
                          <h4 className="font-body-md font-bold text-on-surface">{t.descricao}</h4>
                          <p className="text-body-sm font-body-sm text-on-surface-variant">
                            {t.categoriaNome || 'Sem categoria'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right flex items-center gap-3">
                        <div>
                          <p className={'font-data-md text-data-md ' + amountColor + ' mono-data'}>
                            {isEntrada ? '+ ' : '- '}{formatCurrency(t.valor)}
                          </p>
                          <p className="text-[10px] font-label-caps text-primary/60 uppercase">Confirmado</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDelete(t.id)}
                          className="material-symbols-outlined text-on-surface-variant opacity-0 group-hover:opacity-100 transition-opacity hover:text-error text-lg"
                        >
                          delete
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        )}
      </section>

      <button className="fixed bottom-24 right-6 md:bottom-12 md:right-12 w-16 h-16 bg-primary text-on-primary rounded-full shadow-xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-40">
        <span className="material-symbols-outlined text-4xl">add</span>
      </button>
    </div>
  );
}