import { ArrowUpRight, ArrowDownRight, Wallet } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { cn } from '@/lib/utils';

const variants = {
  entrada: {
    label: 'Entradas',
    sublabel: 'Receitas no período',
    Icon: ArrowUpRight,
    iconBg: 'bg-transparent text-entrada border border-border',
    textColor: 'text-foreground',
    pillBg: 'bg-transparent text-entrada border border-border',
  },
  saida: {
    label: 'Saídas',
    sublabel: 'Despesas no período',
    Icon: ArrowDownRight,
    iconBg: 'bg-transparent text-saida border border-border',
    textColor: 'text-foreground',
    pillBg: 'bg-transparent text-saida border border-border',
  },
  saldo: {
    label: 'Saldo Total',
    sublabel: 'Balanço da conta',
    Icon: Wallet,
    iconBg: 'bg-transparent text-primary border border-border',
    textColor: 'text-foreground',
    pillBg: 'bg-transparent text-primary border border-border',
  },
};

export default function SummaryCard({ tipo, value, variacao }) {
  const v = variants[tipo] || variants.entrada;
  const { Icon } = v;

  return (
    <Card className="p-5 relative overflow-hidden transition-all duration-300 hover:shadow-card-hover border-border/80 group">
      {/* Top subtle glow bar */}
      <div
        className={cn(
          'absolute top-0 left-0 right-0 h-[2px] opacity-70 transition-opacity group-hover:opacity-100',
          tipo === 'entrada' ? 'bg-[#00cc4b]' : tipo === 'saida' ? 'bg-[#ff4433]' : 'bg-primary',
        )}
      />

      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {v.label}
          </span>
          <span className="text-[11px] text-muted-foreground/80 hidden sm:inline">
            {v.sublabel}
          </span>
        </div>
        <div
          className={cn(
            'w-9 h-9 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110',
            v.iconBg,
          )}
        >
          <Icon className="w-4 h-4 stroke-[2.5]" />
        </div>
      </div>

      <div className="mt-4 flex items-baseline justify-between">
        <h3
          className={cn('numeric-mono text-2xl sm:text-3xl font-bold tracking-tight', v.textColor)}
        >
          {formatCurrency(value)}
        </h3>
        {variacao !== null && variacao !== undefined && (
          <Badge 
            variant="outline"
            className={cn(
              'text-[10px] px-1.5 py-0.5 rounded-full ml-2 align-middle',
              (tipo === 'saida' ? variacao <= 0 : variacao >= 0)
                ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30'
                : 'bg-rose-500/10 text-rose-500 border-rose-500/30',
            )}
          >
            {variacao >= 0 ? '↑' : '↓'} {Math.abs(variacao).toFixed(1)}%
          </Badge>
        )}
      </div>
    </Card>
  );
}
