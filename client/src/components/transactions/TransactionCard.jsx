import { Trash2, ArrowUpRight, ArrowDownRight, Clock, CheckCircle2, Layers, Repeat } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';
import { TIPO_TRANSACAO, STATUS_TRANSACAO } from '../../utils/constants';
import { Card } from '../ui/card';
import { cn } from '@/lib/utils';

function formatFullDate(dateStr) {
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
}

export default function TransactionCard({ transacao, onDelete, onToggleStatus }) {
  const isEntrada = transacao.tipo === TIPO_TRANSACAO.ENTRADA;
  const Icon = isEntrada ? ArrowUpRight : ArrowDownRight;
  const isPendente = transacao.status === STATUS_TRANSACAO.PENDENTE;
  const isParcelado = Boolean(transacao.parcelamentoId || transacao.numeroParcela);
  const isRecorrente = Boolean(transacao.recorrenciaId);

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
        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          <span className="text-[11px] numeric-mono text-muted-foreground">
            {formatFullDate(transacao.data)}
          </span>
          {transacao.categoriaNome && (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full border bg-transparent text-muted-foreground border-border">
              {transacao.categoriaNome}
            </span>
          )}
          {isParcelado && (
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border bg-primary/10 text-primary border-primary/20">
              <Layers className="w-2.5 h-2.5" />
              {transacao.numeroParcela}/{transacao.totalParcelas}
            </span>
          )}
          {isRecorrente && (
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border bg-indigo-500/10 text-indigo-400 border-indigo-500/20">
              <Repeat className="w-2.5 h-2.5" />
              {transacao.frequenciaRecorrencia || 'Fixo'}
            </span>
          )}
          <span
            className={cn(
              'inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border',
              isPendente
                ? 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
            )}
          >
            {isPendente && <Clock className="w-2.5 h-2.5" />}
            {transacao.status || STATUS_TRANSACAO.PAGO}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        <span
          className={cn(
            'numeric-mono text-sm sm:text-base font-bold tracking-tight mr-1',
            isEntrada ? 'text-entrada' : 'text-saida',
          )}
        >
          {isEntrada ? '+ ' : '- '}
          {formatCurrency(transacao.valor)}
        </span>
        {onToggleStatus && (
          <button
            onClick={() => onToggleStatus(transacao)}
            className={cn(
              'p-1.5 rounded-lg transition-colors',
              isPendente
                ? 'hover:bg-emerald-500/15 text-amber-500 hover:text-emerald-500'
                : 'hover:bg-amber-500/15 text-muted-foreground hover:text-amber-500',
            )}
            title={isPendente ? 'Marcar como Pago' : 'Marcar como Pendente'}
          >
            {isPendente ? (
              <CheckCircle2 className="w-4 h-4" />
            ) : (
              <Clock className="w-4 h-4" />
            )}
          </button>
        )}
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
