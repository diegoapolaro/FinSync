import React from 'react';
import { Wallet, TrendingUp, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

interface ExtratoKpiMetricsProps {
  saldo: number;
  totalEntradas: number;
  totalSaidas: number;
  metaFaturamento?: number;
  percentualMeta?: number;
}

export default function ExtratoKpiMetrics({
  saldo,
  totalEntradas,
  totalSaidas,
  metaFaturamento = 100000,
  percentualMeta,
}: ExtratoKpiMetricsProps): React.ReactElement {
  const percentualCalc = percentualMeta ?? (metaFaturamento > 0 ? Math.min(100, Math.round((totalEntradas / metaFaturamento) * 100)) : 82.4);

  return (
    <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* 1. Saldo Líquido Disponível */}
      <div className="bg-gradient-to-br from-card to-muted/30 border border-border/80 rounded-2xl p-5 shadow-sm flex flex-col justify-between relative overflow-hidden group hover:border-primary/40 transition-all">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Saldo Líquido Disponível
            </span>
            <h3 className="text-2xl lg:text-3xl font-extrabold text-foreground tracking-tight mt-1 numeric-mono">
              {formatCurrency(saldo)}
            </h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/20">
            <Wallet className="w-5 h-5 stroke-[2]" />
          </div>
        </div>

        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-border/50 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400">
            <TrendingUp className="w-3.5 h-3.5" /> +14,2%
          </span>
          <span>vs. mesmo período anterior</span>
        </div>
      </div>

      {/* 2. Entradas do Período */}
      <div className="bg-card border border-border/80 rounded-2xl p-5 shadow-sm flex flex-col justify-between group hover:border-emerald-500/40 transition-all">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Entradas de Outubro
              </span>
              <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/20">
                +12.3k semana
              </span>
            </div>
            <h3 className="text-2xl lg:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 tracking-tight mt-1 numeric-mono">
              {formatCurrency(totalEntradas)}
            </h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20">
            <ArrowDownLeft className="w-5 h-5 stroke-[2.5]" />
          </div>
        </div>

        <div className="mt-4 pt-2">
          <div className="flex justify-between items-center text-xs text-muted-foreground mb-1.5">
            <span>Meta de Faturamento</span>
            <span className="numeric-mono font-semibold text-foreground">
              {percentualCalc}% de {formatCurrency(metaFaturamento)}
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(0, percentualCalc))}%` }}
            />
          </div>
        </div>
      </div>

      {/* 3. Saídas & Custos Operacionais */}
      <div className="bg-card border border-border/80 rounded-2xl p-5 shadow-sm flex flex-col justify-between group hover:border-rose-500/40 transition-all">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Saídas &amp; Despesas
              </span>
              <span className="bg-rose-500/10 text-rose-600 dark:text-rose-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-rose-500/20">
                Operacional
              </span>
            </div>
            <h3 className="text-2xl lg:text-3xl font-extrabold text-rose-600 dark:text-rose-400 tracking-tight mt-1 numeric-mono">
              {formatCurrency(totalSaidas)}
            </h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 border border-rose-500/20">
            <ArrowUpRight className="w-5 h-5 stroke-[2.5]" />
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between pt-2 border-t border-border/50 text-[11px] text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-primary" />
            <span>Insumos (62%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Salários (25%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-muted-foreground" />
            <span>Outros (13%)</span>
          </div>
        </div>
      </div>
    </section>
  );
}
