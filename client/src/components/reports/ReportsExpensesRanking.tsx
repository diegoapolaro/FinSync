import React, { useMemo } from 'react';
import {
  Utensils,
  Users,
  Building2,
  Zap,
  ArrowDownRight,
  ChevronRight,
  Receipt,
} from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

export interface ExpenseRankingItem {
  descricao: string;
  valor: number;
  count?: number;
  categoriaNome?: string;
  detalhe?: string;
  statusTag?: string;
}

interface ReportsExpensesRankingProps {
  itens?: ExpenseRankingItem[];
  totalSaidas?: number;
  onItemClick?: (item: ExpenseRankingItem) => void;
}

function getExpenseIcon(descricao: string, categoria?: string) {
  const d = (descricao + ' ' + (categoria || '')).toLowerCase();
  if (d.includes('queijo') || d.includes('farinha') || d.includes('alimento') || d.includes('insumo') || d.includes('restaurante')) {
    return <Utensils className="w-5 h-5 stroke-[2]" />;
  }
  if (d.includes('folha') || d.includes('equipe') || d.includes('salario') || d.includes('colaborador') || d.includes('pessoal')) {
    return <Users className="w-5 h-5 stroke-[2]" />;
  }
  if (d.includes('aluguel') || d.includes('imovel') || d.includes('predio') || d.includes('salao') || d.includes('forno')) {
    return <Building2 className="w-5 h-5 stroke-[2]" />;
  }
  if (d.includes('gas') || d.includes('energia') || d.includes('luz') || d.includes('enel') || d.includes('eletric')) {
    return <Zap className="w-5 h-5 stroke-[2]" />;
  }
  return <Receipt className="w-5 h-5 stroke-[2]" />;
}

export default function ReportsExpensesRanking({
  itens = [],
  totalSaidas = 33729.5,
  onItemClick,
}: ReportsExpensesRankingProps): React.ReactElement {
  // Lista com fallback realista caso ainda não haja saídas registradas
  const listaDespesas = useMemo(() => {
    if (itens && itens.length > 0) {
      return itens;
    }
    return [
      {
        descricao: 'Fornecedor de Queijo Mussarela & Farinha',
        valor: 14200,
        categoriaNome: 'Insumos Diários',
        detalhe: 'NF-e 009.281',
        statusTag: 'Liquidado via Pix',
      },
      {
        descricao: 'Folha de Pagamento Equipe Noite',
        valor: 9500,
        categoriaNome: 'Pessoal & Encargos',
        detalhe: '11 Colaboradores',
        statusTag: 'Transferência Lote',
      },
      {
        descricao: 'Aluguel Salão Principal & Forno a Lenha',
        valor: 5400,
        categoriaNome: 'Fixos Imobiliários',
        detalhe: 'Vencimento 10/10',
        statusTag: 'Boleto Bancário',
      },
      {
        descricao: 'Gás Industrial GLP & Energia Enel',
        valor: 3380,
        categoriaNome: 'Utilidades Básicas',
        detalhe: 'Débito Automático',
        statusTag: 'Conciliado',
      },
    ];
  }, [itens]);

  const totalSoma = useMemo(() => {
    return listaDespesas.reduce((acc, it) => acc + it.valor, 0);
  }, [listaDespesas]);

  const totalBase = totalSaidas > 0 ? totalSaidas : totalSoma || 1;
  const impactoTotalPct = Math.min(100, Math.round((totalSoma / totalBase) * 100));

  return (
    <div className="bg-fog dark:bg-card border border-transparent dark:border-spruce rounded-[24px] p-6 shadow-sm flex flex-col gap-6 transition-all">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div>
          <span className="text-[11px] font-bold uppercase text-pebble tracking-wider block">
            Detalhamento dos Centros de Custo
          </span>
          <h3 className="text-xl font-bold text-forest-ink dark:text-paper tracking-tight mt-0.5">
            Maiores Despesas do Mês
          </h3>
        </div>

        <div className="flex items-center gap-2 bg-paper dark:bg-spruce/60 px-3.5 py-1.5 rounded-full border border-border/40 text-xs">
          <span className="text-charcoal dark:text-pebble font-medium uppercase">Impacto Total:</span>
          <span className="numeric-mono font-bold text-alarm-red">
            {formatCurrency(totalSoma)} ({impactoTotalPct}%)
          </span>
        </div>
      </div>

      {/* Lista com Barras de Progresso Proporcionais */}
      <div className="flex flex-col gap-3">
        {listaDespesas.map((item, idx) => {
          const pct = Math.min(100, Math.round((item.valor / totalBase) * 100));

          return (
            <div
              key={idx}
              onClick={() => onItemClick?.(item)}
              className="bg-paper dark:bg-spruce/40 rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-border/40 hover:shadow-md hover:border-lime-voltage/40 transition-all cursor-pointer group"
            >
              {/* Identificação da Despesa */}
              <div className="flex items-center gap-3.5 min-w-0 md:w-1/3">
                <div className="w-10 h-10 rounded-full bg-forest-ink text-lime-voltage flex items-center justify-center shrink-0 border border-lime-voltage/20">
                  {getExpenseIcon(item.descricao, item.categoriaNome)}
                </div>
                <div className="truncate">
                  <h4 className="text-xs md:text-sm font-bold text-forest-ink dark:text-paper truncate">
                    {item.descricao}
                  </h4>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] uppercase font-bold text-pebble">
                      {item.categoriaNome || 'Despesa'}
                    </span>
                    <span className="w-1 h-1 rounded-full bg-pebble/60" />
                    <span className="text-[11px] text-charcoal dark:text-pebble">
                      {item.detalhe || (item.count ? `${item.count}x no período` : 'Registro contábil')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Visualizador de Barra Proporcional */}
              <div className="w-full md:w-1/3 flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[10px] font-bold text-pebble uppercase">
                    Participação no Burn
                  </span>
                  <span className="numeric-mono text-xs font-bold text-forest-ink dark:text-paper">
                    {pct}%
                  </span>
                </div>
                <div className="w-full h-2.5 bg-fog dark:bg-spruce rounded-full overflow-hidden">
                  <div
                    className="h-full bg-forest-ink dark:bg-lime-voltage rounded-full transition-all duration-500"
                    style={{ width: `${Math.max(pct, 4)}%` }}
                  />
                </div>
              </div>

              {/* Métrica de Valor e Badge */}
              <div className="flex items-center justify-between md:justify-end gap-5 w-full md:w-auto">
                <div className="text-right">
                  <div className="numeric-mono text-base md:text-lg font-black text-forest-ink dark:text-paper">
                    {formatCurrency(item.valor)}
                  </div>
                  <span className="text-[10px] uppercase font-bold text-forest-ink dark:text-lime-voltage block">
                    {item.statusTag || 'Liquidado'}
                  </span>
                </div>

                <div className="p-2 rounded-full hover:bg-fog dark:hover:bg-spruce text-pebble group-hover:text-forest-ink dark:group-hover:text-lime-voltage transition-colors">
                  <ChevronRight className="w-5 h-5 stroke-[2]" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
