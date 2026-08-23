import { ArrowUpRight, ArrowDownRight, Wallet } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';
import { Card } from '../ui/card';
import { cn } from '@/lib/utils';

const variants = {
  entrada: {
    label: 'Entradas',
    Icon: ArrowUpRight,
    iconBg: 'bg-[#e2f6d5] text-[#054d28] dark:bg-[#122b10] dark:text-[#9fe870]',
    textColor: 'text-[#2ead4b] dark:text-[#3ec75f]',
  },
  saida: {
    label: 'Saídas',
    Icon: ArrowDownRight,
    iconBg: 'bg-[#ffebee] text-[#d03238] dark:bg-[#320707] dark:text-[#ff8080]',
    textColor: 'text-[#d03238] dark:text-[#ff5c62]',
  },
  saldo: {
    label: 'Saldo Total',
    Icon: Wallet,
    iconBg: 'bg-[#e8ebe6] text-[#0e0f0c] dark:bg-[#1f241f] dark:text-[#9fe870]',
    textColor: 'text-foreground',
  },
};

export default function SummaryCard({ tipo, value }) {
  const v = variants[tipo] || variants.entrada;
  const { Icon } = v;

  return (
    <Card className="p-5 transition-shadow hover:shadow-md group">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">
          {v.label}
        </span>
        <div
          className={cn(
            'w-10 h-10 rounded-full flex items-center justify-center transition-transform group-hover:scale-105',
            v.iconBg
          )}
        >
          <Icon className="w-5 h-5 stroke-[2.5]" />
        </div>
      </div>
      <div className="mt-3">
        <h3
          className={cn(
            'font-mono text-2xl md:text-3xl font-bold tracking-tight',
            v.textColor
          )}
        >
          {formatCurrency(value)}
        </h3>
      </div>
    </Card>
  );
}
