import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { getResumoConta, getTransacoes } from '../services/api';
import { formatCurrency } from '../utils/formatters';

function formatDate(value) {
  if (!value) return '';
  const date =
    typeof value === 'string'
      ? value.includes('T')
        ? new Date(value)
        : new Date(`${value}T12:00:00`)
      : new Date(value);
  if (isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
  });
}

function getSemana(dia) {
  if (dia <= 7) return 0;
  if (dia <= 14) return 1;
  if (dia <= 21) return 2;
  return 3;
}

function agruparPorSemana(transacoes, mes, ano) {
  const semanas = [
    { entradas: 0, saidas: 0 },
    { entradas: 0, saidas: 0 },
    { entradas: 0, saidas: 0 },
    { entradas: 0, saidas: 0 },
  ];

  transacoes.forEach((t) => {
    const data = new Date(t.data + 'T12:00:00');
    if (data.getMonth() === mes && data.getFullYear() === ano) {
      const semana = getSemana(data.getDate());
      if (t.tipo === 'Entrada') {
        semanas[semana].entradas += Number(t.valor);
      } else {
        semanas[semana].saidas += Number(t.valor);
      }
    }
  });

  return semanas;
}

export default function RelatoriosPage() {
  const { contaSelecionadaId, contas } = useOutletContext();
  const [resumo, setResumo] = useState(null);
  const [transacoes, setTransacoes] = useState([]);
  const [carregando, setCarregando] = useState(true);

  const contaNome =
    contas.find((c) => c.id === Number(contaSelecionadaId))?.nome ?? '';

  const hoje = new Date();
  const mesAtual = hoje.getMonth();
  const anoAtual = hoje.getFullYear();
  const mesLabel = hoje
    .toLocaleDateString('pt-BR', { month: 'long' })
    .toUpperCase();

  useEffect(() => {
    if (!contaSelecionadaId) {
      setCarregando(false);
      return;
    }

    let cancelado = false;
    setCarregando(true);

    Promise.all([getResumoConta(contaSelecionadaId), getTransacoes(contaSelecionadaId)])
      .then(([res, trans]) => {
        if (!cancelado) {
          setResumo(res);
          setTransacoes(trans);
          setCarregando(false);
        }
      })
      .catch(() => {
        if (!cancelado) setCarregando(false);
      });

    return () => {
      cancelado = true;
    };
  }, [contaSelecionadaId]);

  const transacoesMes = transacoes.filter((t) => {
    const data = new Date(t.data + 'T12:00:00');
    return data.getMonth() === mesAtual && data.getFullYear() === anoAtual;
  });

  const maioresSaidas = transacoesMes
    .filter((t) => t.tipo === 'Saida')
    .sort((a, b) => Number(b.valor) - Number(a.valor))
    .slice(0, 5);

  const semanas = agruparPorSemana(transacoes, mesAtual, anoAtual);
  const maxSemana = Math.max(
    ...semanas.flatMap((s) => [s.entradas, s.saidas]),
    1
  );

  const temTransacoesMes = transacoesMes.length > 0;

  const saldoMes = resumo?.saldoMensal ?? 0;
  const saldoHoje = resumo?.saldoDiario ?? 0;
  const entradasMes = resumo?.totalEntradasMes ?? 0;
  const saidasMes = resumo?.totalSaidasMes ?? 0;

  if (!contaSelecionadaId) {
    return (
      <div className="px-gutter pt-margin-page">
        <h2 className="font-headline-md text-headline-md uppercase text-center text-primary mb-stack-loose">
          RELATÓRIOS
        </h2>
        <p className="font-body-lg text-body-lg text-on-surface-variant text-center py-12">
          Selecione uma conta para ver os relatórios.
        </p>
      </div>
    );
  }

  if (carregando) {
    return (
      <p className="font-body-lg text-body-lg text-on-surface-variant text-center py-12">
        Carregando relatórios...
      </p>
    );
  }

  return (
    <div className="px-gutter pt-margin-page pb-[100px] md:pb-gutter">
      <div className="text-center mb-stack-loose pb-stack-base border-b border-dashed border-outline-variant">
        <h2 className="font-headline-md text-headline-md uppercase text-primary">
          RELATÓRIOS
        </h2>
        <p className="font-value-sm text-value-sm text-on-surface-variant mt-1">
          {contaNome} — {mesLabel} {anoAtual}
        </p>
      </div>

      <section className="pb-stack-base border-b border-dashed border-outline-variant mb-stack-base">
        <h3 className="font-label-caps text-label-caps text-secondary uppercase mb-3">
          RESUMO DO MÊS
        </h3>
        <div className="grid grid-cols-3 gap-3">
          <div className="border-2 border-entrada p-4 text-center">
            <span className="material-symbols-outlined text-entrada text-2xl mb-1 block">add</span>
            <p className="font-value-sm text-value-sm text-entrada font-bold">
              {formatCurrency(entradasMes)}
            </p>
            <p className="font-label-caps text-label-caps text-outline uppercase text-xs mt-1">Entradas</p>
          </div>
          <div className="border-2 border-saida p-4 text-center">
            <span className="material-symbols-outlined text-saida text-2xl mb-1 block">remove</span>
            <p className="font-value-sm text-value-sm text-saida font-bold">
              {formatCurrency(saidasMes)}
            </p>
            <p className="font-label-caps text-label-caps text-outline uppercase text-xs mt-1">Saídas</p>
          </div>
          <div className={`border-2 p-4 text-center ${saldoMes >= 0 ? 'border-entrada' : 'border-saida'}`}>
            <span className={`material-symbols-outlined text-2xl mb-1 block ${saldoMes >= 0 ? 'text-entrada' : 'text-saida'}`}>
              account_balance
            </span>
            <p className={`font-value-sm text-value-sm font-bold ${saldoMes >= 0 ? 'text-entrada' : 'text-saida'}`}>
              {formatCurrency(saldoMes)}
            </p>
            <p className="font-label-caps text-label-caps text-outline uppercase text-xs mt-1">Saldo</p>
          </div>
        </div>
      </section>

      {temTransacoesMes && (
        <>
          <section className="pb-stack-base border-b border-dashed border-outline-variant mb-stack-base">
            <h3 className="font-label-caps text-label-caps text-secondary uppercase mb-3">
              ENTRADAS x SAÍDAS POR SEMANA
            </h3>
            <div className="flex items-end gap-4 h-40">
              {semanas.map((semana, i) => (
                <div key={i} className="flex-1 flex flex-col items-center justify-end h-full">
                  <div className="flex gap-1 items-end w-full justify-center h-full">
                    <div
                      className="w-3 bg-entrada rounded-t-sm"
                      style={{
                        height: `${(semana.entradas / maxSemana) * 100}%`,
                        minHeight: semana.entradas > 0 ? '4px' : '0',
                      }}
                    />
                    <div
                      className="w-3 bg-saida rounded-t-sm"
                      style={{
                        height: `${(semana.saidas / maxSemana) * 100}%`,
                        minHeight: semana.saidas > 0 ? '4px' : '0',
                      }}
                    />
                  </div>
                  <span className="font-label-caps text-label-caps text-outline uppercase text-xs mt-2">S{i + 1}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="pb-stack-base border-b border-dashed border-outline-variant mb-stack-base">
            <h3 className="font-label-caps text-label-caps text-secondary uppercase mb-3">MAIORES SAÍDAS</h3>
            {maioresSaidas.length === 0 ? (
              <p className="font-body-sm text-body-sm text-on-surface-variant">Nenhuma saída registrada neste mês.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {maioresSaidas.map((t) => (
                  <div key={t.id} className="flex justify-between items-center py-2 border-b border-dashed border-outline-variant last:border-0">
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="font-body-sm text-body-sm text-ink truncate">{t.descricao}</span>
                      <span className="font-label-caps text-label-caps text-secondary text-xs mt-0.5">{formatDate(t.data)}</span>
                    </div>
                    <span className="font-value-sm text-value-sm text-saida whitespace-nowrap ml-3">-{formatCurrency(t.valor)}</span>
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      )}

      <section className="pb-stack-base mb-stack-base">
        <h3 className="font-label-caps text-label-caps text-secondary uppercase mb-3">COMPARATIVO</h3>
        <div className="flex gap-4">
          <div className="flex-1 border-2 border-outline-variant p-4 text-center">
            <p className="font-label-caps text-label-caps text-outline uppercase text-xs mb-1">HOJE</p>
            <p className={`font-value-lg text-value-lg font-bold ${saldoHoje >= 0 ? 'text-entrada' : 'text-saida'}`}>
              {formatCurrency(saldoHoje)}
            </p>
          </div>
          <div className="flex-1 border-2 border-outline-variant p-4 text-center">
            <p className="font-label-caps text-label-caps text-outline uppercase text-xs mb-1">MÊS</p>
            <p className={`font-value-lg text-value-lg font-bold ${saldoMes >= 0 ? 'text-entrada' : 'text-saida'}`}>
              {formatCurrency(saldoMes)}
            </p>
          </div>
        </div>
      </section>

      {!temTransacoesMes && (
        <p className="font-body-lg text-body-lg text-on-surface-variant text-center py-12 border-t border-dashed border-outline-variant">
          Nenhum lançamento registrado neste mês.
        </p>
      )}
    </div>
  );
}
