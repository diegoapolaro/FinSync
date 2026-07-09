import { useCallback, useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  getDetalhamento,
  getResumoPeriodo,
  getResumoConta,
} from '../services/api';
import { formatCurrency } from '../utils/formatters';

function formatDateOnly(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function formatLabel(date, periodo) {
  if (periodo === 'diario') {
    return date
      .toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', year: 'numeric' })
      .toUpperCase();
  }
  return date
    .toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
    .toUpperCase();
}

function primeiroDiaMes(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function ultimoDiaMes(date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

const periodos = [
  { id: 'diario', label: 'DIÁRIO' },
  { id: 'mensal', label: 'MENSAL' },
  { id: 'personalizado', label: 'PERSONALIZADO' },
];

export default function RelatoriosPage() {
  const { contaSelecionadaId } = useOutletContext();

  const [periodo, setPeriodo] = useState('diario');
  const [dataRef, setDataRef] = useState(() => new Date());
  const [resumo, setResumo] = useState(null);
  const [detalhamento, setDetalhamento] = useState([]);
  const [resumoMes, setResumoMes] = useState(null);
  const [carregando, setCarregando] = useState(true);

  const dataInicio =
    periodo === 'diario'
      ? formatDateOnly(dataRef)
      : formatDateOnly(primeiroDiaMes(dataRef));

  const dataFim =
    periodo === 'diario'
      ? formatDateOnly(dataRef)
      : formatDateOnly(ultimoDiaMes(dataRef));

  const carregarDados = useCallback(async () => {
    if (!contaSelecionadaId) {
      setCarregando(false);
      return;
    }

    try {
      const [res, det, resMes] = await Promise.all([
        getResumoPeriodo(contaSelecionadaId, dataInicio, dataFim),
        getDetalhamento(contaSelecionadaId, dataInicio, dataFim),
        getResumoConta(contaSelecionadaId),
      ]);
      setResumo(res);
      setDetalhamento(det);
      setResumoMes(resMes);
    } catch {
      setResumo(null);
      setDetalhamento([]);
      setResumoMes(null);
    } finally {
      setCarregando(false);
    }
  }, [contaSelecionadaId, dataInicio, dataFim]);

  useEffect(() => {
    setCarregando(true);
    carregarDados();
  }, [carregarDados]);

  function navegar(direcao) {
    const nova = new Date(dataRef);
    if (periodo === 'diario') {
      nova.setDate(nova.getDate() + direcao);
    } else {
      nova.setMonth(nova.getMonth() + direcao);
    }
    setDataRef(nova);
  }

  const totalEntradas = resumo?.totalEntradas ?? 0;
  const totalSaidas = resumo?.totalSaidas ?? 0;
  const saldoPeriodo = resumo?.saldo ?? 0;
  const saldoMesAtual = resumoMes?.saldoMensal ?? 0;

  return (
    <div className="px-gutter pt-stack-base md:pt-margin-page pb-[100px] md:pb-gutter flex flex-col flex-1">
      <div className="text-center mb-6 border-b-2 border-dashed border-outline pb-6">
        <div className="flex items-center justify-center gap-2 mb-2">
          <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
            analytics
          </span>
        </div>
        <h2 className="font-headline-lg text-headline-lg text-primary uppercase">
          Relatório<br />{periodo === 'diario' ? 'Diário' : periodo === 'mensal' ? 'Mensal' : 'Personalizado'}
        </h2>

        <div className="flex justify-center gap-2 mt-4">
          {periodos.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => { setPeriodo(p.id); setDataRef(new Date()); }}
              className={
                periodo === p.id
                  ? 'border-2 border-primary bg-primary-fixed-dim text-on-primary-fixed px-3 py-1 font-label-caps text-label-caps tracking-widest shadow-[2px_2px_0px_rgba(0,0,0,0.1)]'
                  : 'border border-outline-variant text-secondary px-3 py-1 font-label-caps text-label-caps tracking-widest hover:bg-surface-variant'
              }
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-8">
        <div className="flex justify-between items-center border border-primary p-3 bg-surface-bright">
          <button
            type="button"
            onClick={() => navegar(-1)}
            className="text-primary hover:bg-surface-variant p-1"
          >
            <span className="material-symbols-outlined">arrow_left</span>
          </button>
          <span className="font-label-caps text-label-caps text-primary tracking-widest">
            {formatLabel(dataRef, periodo)}
          </span>
          <button
            type="button"
            onClick={() => navegar(1)}
            className="text-primary hover:bg-surface-variant p-1"
          >
            <span className="material-symbols-outlined">arrow_right</span>
          </button>
        </div>

        {periodo === 'personalizado' && (
          <p className="mt-2 font-body-sm text-body-sm text-on-surface-variant text-center">
            Use as setas para navegar entre meses. Selecione DIÁRIO ou MENSAL para visualizações específicas.
          </p>
        )}
      </div>

      {carregando && (
        <p className="font-body-lg text-body-lg text-on-surface-variant text-center py-12">
          Carregando relatório...
        </p>
      )}

      {!carregando && !contaSelecionadaId && (
        <p className="font-body-lg text-body-lg text-on-surface-variant text-center py-12">
          Selecione uma conta para ver os relatórios.
        </p>
      )}

      {!carregando && contaSelecionadaId && (
        <>
          <section className="mb-10">
            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <span className="font-label-caps text-label-caps text-on-surface-variant">
                  ENTRADAS TOTAL (+)
                </span>
                <span className="font-value-lg text-value-lg text-primary">
                  {formatCurrency(totalEntradas).replace('R$', '').trim()}
                </span>
              </div>
              <div className="flex justify-between items-end">
                <span className="font-label-caps text-label-caps text-on-surface-variant">
                  SAÍDAS TOTAL (-)
                </span>
                <span className="font-value-lg text-value-lg text-primary">
                  {formatCurrency(totalSaidas).replace('R$', '').trim()}
                </span>
              </div>
              <div className="flex justify-between items-end pt-4 border-b-4 border-double border-primary pb-1 mt-2">
                <span className="font-headline-md text-headline-md text-primary uppercase">
                  Saldo do Período
                </span>
                <span className="font-value-lg text-value-lg text-primary font-bold">
                  {formatCurrency(Math.abs(saldoPeriodo)).replace('R$', '').trim()}
                </span>
              </div>
            </div>
          </section>

          <section className="flex-1">
            <h3 className="font-label-caps text-label-caps text-secondary border-b border-dashed border-outline pb-2 mb-4">
              DETALHAMENTO
            </h3>

            {detalhamento.length === 0 && (
              <p className="font-body-sm text-body-sm text-on-surface-variant text-center py-8">
                Nenhum lançamento neste período.
              </p>
            )}

            {detalhamento.length > 0 && (
              <ul className="space-y-4">
                {detalhamento.map((item) => {
                  const isEntrada = item.total >= 0;
                  return (
                    <li
                      key={item.categoriaId ?? 'sem-categoria'}
                      className="flex justify-between items-center border-b border-dashed border-outline-variant pb-2"
                    >
                      <span className="font-body-sm text-body-sm text-on-surface uppercase flex items-center gap-2">
                        {item.categoriaCor && (
                          <span
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{ backgroundColor: item.categoriaCor }}
                          />
                        )}
                        {item.categoriaNome}
                      </span>
                      <span
                        className={`font-value-sm text-value-sm ${isEntrada ? 'text-on-surface' : 'text-secondary'}`}
                      >
                        {isEntrada ? '' : '-'}{formatCurrency(Math.abs(item.total)).replace('R$', '').trim()}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </>
      )}

      <div className="bg-primary text-on-primary p-4 border-t-2 border-double border-surface flex justify-between items-center sticky bottom-24 md:static z-30 -mx-gutter md:-mx-margin-page mt-auto">
        <span className="font-label-caps text-label-caps tracking-widest">SALDO MÊS ATUAL</span>
        <span className="font-value-lg text-value-lg">
          R$ {formatCurrency(Math.abs(saldoMesAtual)).replace('R$', '').trim()}
        </span>
      </div>
    </div>
  );
}
