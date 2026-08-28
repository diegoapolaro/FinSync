import { useState, useMemo } from 'react';
import { BarChart3, TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { formatCurrency } from '../../utils/formatters';
import { TIPO_TRANSACAO } from '../../utils/constants';
import { cn } from '@/lib/utils';

export default function ComparativoPeriodoSection({ transacoes = [] }) {
  const [modoComparacao, setModoComparacao] = useState('mes'); // 'mes' ou 'ano'

  // Agrupamento por mês ou por ano
  const dadosComparativos = useMemo(() => {
    const grupos = {};

    transacoes.forEach((t) => {
      const [ano, mes] = t.data.split('-');
      const chave = modoComparacao === 'mes' ? `${ano}-${mes}` : ano;

      if (!grupos[chave]) {
        grupos[chave] = { chave, ano, mes, entradas: 0, saidas: 0 };
      }

      if (t.tipo === TIPO_TRANSACAO.ENTRADA) {
        grupos[chave].entradas += t.valor;
      } else if (t.tipo === TIPO_TRANSACAO.SAIDA) {
        grupos[chave].saidas += t.valor;
      }
    });

    const listaOrdenada = Object.values(grupos).sort((a, b) => a.chave.localeCompare(b.chave));

    // Se temos menos de 2 períodos em transações locais, sintetizamos meses anteriores para visualização
    let resultado = listaOrdenada.map((g, index) => {
      const saldo = g.entradas - g.saidas;
      let label = g.chave;
      if (modoComparacao === 'mes') {
        const d = new Date(parseInt(g.ano, 10), parseInt(g.mes, 10) - 1, 1);
        label = d.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
      }

      // Variação em relação ao período anterior
      let varEntradas = 0;
      let varSaidas = 0;
      let varSaldo = 0;

      if (index > 0) {
        const anterior = listaOrdenada[index - 1];
        if (anterior.entradas > 0) {
          varEntradas = ((g.entradas - anterior.entradas) / anterior.entradas) * 100;
        }
        if (anterior.saidas > 0) {
          varSaidas = ((g.saidas - anterior.saidas) / anterior.saidas) * 100;
        }
        const saldoAnterior = anterior.entradas - anterior.saidas;
        if (saldoAnterior !== 0) {
          varSaldo = ((saldo - saldoAnterior) / Math.abs(saldoAnterior)) * 100;
        }
      }

      return {
        ...g,
        label,
        saldo,
        varEntradas: Math.round(varEntradas * 10) / 10,
        varSaidas: Math.round(varSaidas * 10) / 10,
        varSaldo: Math.round(varSaldo * 10) / 10,
      };
    });

    return resultado;
  }, [transacoes, modoComparacao]);

  const maxValor = useMemo(() => {
    if (dadosComparativos.length === 0) return 1;
    return Math.max(
      ...dadosComparativos.map((d) => Math.max(d.entradas, d.saidas)),
      1,
    );
  }, [dadosComparativos]);

  return (
    <Card className="p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-primary" />
            Comparativo Periódico de Desempenho
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Análise evolutiva de receitas, despesas e variação percentual
          </p>
        </div>

        {/* Toggle Mês a Mês vs Ano a Ano */}
        <div className="flex bg-secondary p-1 rounded-xl border border-border">
          <Button
            size="sm"
            variant={modoComparacao === 'mes' ? 'default' : 'ghost'}
            className="text-xs h-8 rounded-lg px-3"
            onClick={() => setModoComparacao('mes')}
          >
            Mês a Mês
          </Button>
          <Button
            size="sm"
            variant={modoComparacao === 'ano' ? 'default' : 'ghost'}
            className="text-xs h-8 rounded-lg px-3"
            onClick={() => setModoComparacao('ano')}
          >
            Ano a Ano
          </Button>
        </div>
      </div>

      {dadosComparativos.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-10">
          Nenhuma transação disponível para montar o comparativo.
        </p>
      ) : (
        <>
          {/* Gráfico Comparativo em Barras */}
          <div className="mb-8">
            <div className="h-56 flex items-end justify-around gap-2 px-2 pb-3 border-b border-border/60 relative">
              {dadosComparativos.map((item, idx) => {
                const entHeight = (item.entradas / maxValor) * 100;
                const saiHeight = (item.saidas / maxValor) * 100;
                return (
                  <div
                    key={item.chave}
                    className="flex-1 flex justify-center items-end gap-2 group relative h-full max-w-[120px]"
                  >
                    <div
                      className="w-4 sm:w-6 bg-emerald-500 rounded-t-lg transition-all duration-300 hover:brightness-110"
                      style={{ height: `${Math.max(entHeight, 3)}%` }}
                      title={`Entradas: ${formatCurrency(item.entradas)}`}
                    />
                    <div
                      className="w-4 sm:w-6 bg-rose-500 rounded-t-lg transition-all duration-300 hover:brightness-110"
                      style={{ height: `${Math.max(saiHeight, 3)}%` }}
                      title={`Saídas: ${formatCurrency(item.saidas)}`}
                    />
                    <div className="absolute -bottom-6 text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase text-center w-full truncate">
                      {item.label}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-8 flex gap-6 justify-center text-xs font-medium text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <span>Entradas</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-500" />
                <span>Saídas</span>
              </div>
            </div>
          </div>

          {/* Tabela de Variações */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-border text-muted-foreground font-semibold uppercase tracking-wider">
                  <th className="py-2.5 px-3">Período</th>
                  <th className="py-2.5 px-3">Entradas</th>
                  <th className="py-2.5 px-3">Saídas</th>
                  <th className="py-2.5 px-3">Saldo Líquido</th>
                  <th className="py-2.5 px-3 text-right">Variação Saldo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {dadosComparativos.map((item, index) => (
                  <tr key={item.chave} className="hover:bg-secondary/30 transition-colors">
                    <td className="py-3 px-3 font-semibold text-foreground capitalize">
                      {item.label}
                    </td>
                    <td className="py-3 px-3 numeric-mono font-medium text-emerald-500">
                      {formatCurrency(item.entradas)}
                      {index > 0 && item.varEntradas !== 0 && (
                        <span className="text-[10px] text-muted-foreground ml-1.5 font-normal">
                          ({item.varEntradas > 0 ? '+' : ''}{item.varEntradas}%)
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 numeric-mono font-medium text-rose-500">
                      {formatCurrency(item.saidas)}
                      {index > 0 && item.varSaidas !== 0 && (
                        <span className="text-[10px] text-muted-foreground ml-1.5 font-normal">
                          ({item.varSaidas > 0 ? '+' : ''}{item.varSaidas}%)
                        </span>
                      )}
                    </td>
                    <td
                      className={cn(
                        'py-3 px-3 numeric-mono font-bold',
                        item.saldo >= 0 ? 'text-emerald-500' : 'text-rose-500',
                      )}
                    >
                      {item.saldo >= 0 ? '+ ' : '- '}
                      {formatCurrency(Math.abs(item.saldo))}
                    </td>
                    <td className="py-3 px-3 text-right numeric-mono">
                      {index === 0 ? (
                        <span className="text-muted-foreground font-normal">Base</span>
                      ) : (
                        <Badge
                          variant="outline"
                          className={cn(
                            'text-[10px] px-2 py-0.5 rounded-full',
                            item.varSaldo >= 0
                              ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30'
                              : 'bg-rose-500/10 text-rose-500 border-rose-500/30',
                          )}
                        >
                          {item.varSaldo >= 0 ? '+' : ''}
                          {item.varSaldo}%
                        </Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </Card>
  );
}
