import { Trash2, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';
import { TIPO_TRANSACAO } from '../../utils/constants';
import { Card } from '../ui/card';
import { cn } from '@/lib/utils';

function formatFullDate(dateStr) {
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
}

export default function TransactionCard({ transacao, onDelete }) {
  const isEntrada = transacao.tipo === TIPO_TRANSACAO.ENTRADA;
  const Icon = isEntrada ? ArrowUpRight : ArrowDownRight;

  return (
    <Card className="group relative flex items-center p-3.5 hover:shadow-card-hover transition-all duration-200 border-border/80">
      {/* Category/Direction Avatar */}
      <div
        className={cn(
          'w-10 h-10 rounded-full flex items-center justify-center shrink-0 mr-3 transition-transform group-hover:scale-105',
          isEntrada
            ? 'bg-transparent text-entrada border border-border'
            : 'bg-transparent text-saida border border-border',
        )}
      >
        <Icon className="w-5 h-5 stroke-[2.5]" />
      </div>

      <div className="flex-grow min-w-0 pr-2">
        <p className="font-semibold text-foreground truncate text-sm tracking-tight">
          {transacao.descricao}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[11px] numeric-mono text-muted-foreground">
            {formatFullDate(transacao.data)}
          </span>
          {transacao.categoriaNome && (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full border bg-transparent text-muted-foreground border-border">
              {transacao.categoriaNome}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <span
          className={cn(
            'numeric-mono text-sm sm:text-base font-bold tracking-tight',
            isEntrada ? 'text-entrada' : 'text-saida',
          )}
        >
          {isEntrada ? '+ ' : '- '}
          {formatCurrency(transacao.valor)}
        </span>
        <button
          onClick={() => onDelete(transacao.id)}
          className="p-1.5 rounded-lg hover:bg-destructive/15 text-muted-foreground hover:text-destructive transition-colors"
          title="Excluir"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </Card>
  );
}
