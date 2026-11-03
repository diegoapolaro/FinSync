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
    <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
      {/* 1. Saldo Líquido Disponível — Wise Signature Inverted Dark Card */}
      <div className="bg-forest-ink text-paper rounded-[28px] p-6 shadow-md flex flex-col justify-between relative overflow-hidden group">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-lime-voltage">
              Saldo Líquido Disponível
            </span>
            <h3 className="text-3xl lg:text-4xl font-black text-paper tracking-tight mt-1.5 numeric-mono">
              {formatCurrency(saldo)}
            </h3>
          </div>
          <div className="w-12 h-12 rounded-full bg-spruce text-lime-voltage flex items-center justify-center shrink-0 border border-lime-voltage/20">
            <Wallet className="w-6 h-6 stroke-[2]" />
          </div>
        </div>

        <div className="flex items-center gap-2 mt-6 pt-3 border-t border-spruce text-xs">
          <span className="inline-flex items-center gap-1 font-bold text-lime-voltage">
            <TrendingUp className="w-4 h-4" /> +14,2%
          </span>
          <span className="text-linen-mist/80">vs. mesmo período em Setembro</span>
        </div>
      </div>

      {/* 2. Entradas do Período — Fog Soft Card */}
      <div className="bg-fog dark:bg-card border border-transparent dark:border-spruce rounded-[24px] p-6 shadow-sm flex flex-col justify-between transition-all">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-charcoal dark:text-pebble">
                Entradas de Outubro
              </span>
              <span className="bg-linen-mist text-forest-ink text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-forest-ink/10">
                +12.3k semana
              </span>
            </div>
            <h3 className="text-3xl font-black text-forest-ink dark:text-lime-voltage tracking-tight mt-1.5 numeric-mono">
              {formatCurrency(totalEntradas)}
            </h3>
          </div>
          <div className="w-12 h-12 rounded-full bg-linen-mist dark:bg-spruce text-forest-ink dark:text-lime-voltage flex items-center justify-center shrink-0">
            <ArrowDownLeft className="w-6 h-6 stroke-[2.5]" />
          </div>
        </div>

        <div className="mt-5 pt-1">
          <div className="flex justify-between items-center text-xs text-charcoal dark:text-pebble mb-1.5">
            <span className="font-medium">Meta de Faturamento</span>
            <span className="numeric-mono font-bold text-forest-ink dark:text-paper">
              {percentualCalc}% de {formatCurrency(metaFaturamento)}
            </span>
          </div>
          <div className="w-full h-2.5 rounded-full bg-card dark:bg-spruce overflow-hidden">
            <div
              className="h-full bg-lime-voltage rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(0, percentualCalc))}%` }}
            />
          </div>
        </div>
      </div>

      {/* 3. Saídas & Custos Operacionais — Fog Soft Card */}
      <div className="bg-fog dark:bg-card border border-transparent dark:border-spruce rounded-[24px] p-6 shadow-sm flex flex-col justify-between transition-all">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-charcoal dark:text-pebble">
                Saídas &amp; Despesas
              </span>
              <span className="bg-alarm-red/10 text-alarm-red text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-alarm-red/20">
                Operacional
              </span>
            </div>
            <h3 className="text-3xl font-black text-alarm-red tracking-tight mt-1.5 numeric-mono">
              {formatCurrency(totalSaidas)}
            </h3>
          </div>
          <div className="w-12 h-12 rounded-full bg-alarm-red/10 text-alarm-red flex items-center justify-center shrink-0">
            <ArrowUpRight className="w-6 h-6 stroke-[2.5]" />
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between pt-2 border-t border-border/40 text-[11px] text-charcoal dark:text-pebble">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-forest-ink dark:bg-lime-voltage" />
            <span className="font-medium">Insumos (62%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-spruce" />
            <span className="font-medium">Salários (25%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-pebble" />
            <span className="font-medium">Outros (13%)</span>
          </div>
        </div>
      </div>
    </section>
  );
}
