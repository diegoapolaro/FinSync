import React from 'react';
import {
  ArrowUpRight,
  ArrowDownRight,
  Edit2,
  Trash2,
  CheckCircle2,
  Clock,
  Layers,
  Repeat,
} from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import InlineTransactionEditor from '../transactions/InlineTransactionEditor';
import { formatCurrency } from '../../utils/formatters';
import { TIPO_TRANSACAO, STATUS_TRANSACAO } from '../../utils/constants';
import { cn } from '@/lib/utils';

export default function LancamentoItemCard({
  transacao,
  isEditingThis,
  onToggleStatus,
  onEditar,
  onConfirmarExclusao,
  categoriasPorTipo,
  contas,
  onSalvarEdicao,
  onCancelarEdicao,
  salvandoEdicao,
}) {
  const t = transacao;
  const tEntrada = t.tipo === TIPO_TRANSACAO.ENTRADA;
  const Icon = tEntrada ? ArrowUpRight : ArrowDownRight;
  const isPendente = t.status === STATUS_TRANSACAO.PENDENTE;
  const isParcelado = Boolean(t.parcelamentoId || t.numeroParcela);
  const isRecorrente = Boolean(t.recorrenciaId);

  return (
    <div className="space-y-1">
      <Card
        className={cn(
          'p-3.5 flex items-center justify-between hover:shadow-card-hover transition-all duration-200 group border-border',
          isEditingThis && 'border-primary/50 ring-1 ring-primary/20 bg-secondary/30',
        )}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={cn(
              'w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 border border-border bg-secondary',
              tEntrada ? 'text-entrada' : 'text-saida',
            )}
          >
            <Icon className="w-4 h-4 stroke-[2.5]" />
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-foreground truncate text-sm tracking-tight">
              {t.descricao}
            </p>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              {t.categoriaNome && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full border border-border bg-secondary text-muted-foreground">
                  {t.categoriaNome}
                </span>
              )}
              {isParcelado && (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border bg-primary/10 text-primary border-primary/20">
                  <Layers className="w-2.5 h-2.5" />
                  {t.numeroParcela}/{t.totalParcelas}
                </span>
              )}
              {isRecorrente && (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border bg-indigo-500/10 text-indigo-400 border-indigo-500/20">
                  <Repeat className="w-2.5 h-2.5" />
                  {t.frequenciaRecorrencia || 'Fixo'}
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
                {t.status || STATUS_TRANSACAO.PAGO}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-3 shrink-0">
          <span
            className={cn(
              'numeric-mono text-sm font-bold tracking-tight',
              tEntrada ? 'text-entrada' : 'text-saida',
            )}
          >
            {tEntrada ? '+ ' : '- '}
            {formatCurrency(t.valor)}
          </span>
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="iconSm"
              onClick={() => onToggleStatus(t)}
              title={isPendente ? 'Marcar como Pago' : 'Marcar como Pendente'}
              className={cn(
                'rounded-xl transition-colors',
                isPendente
                  ? 'hover:bg-emerald-500/15 text-amber-500 hover:text-emerald-500'
                  : 'hover:bg-amber-500/15 text-muted-foreground hover:text-amber-500',
              )}
            >
              {isPendente ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : (
                <Clock className="w-4 h-4" />
              )}
            </Button>
            <Button
              type="button"
              variant={isEditingThis ? 'secondary' : 'ghost'}
              size="iconSm"
              onClick={() => onEditar(t)}
              title={isEditingThis ? 'Fechar edição' : 'Editar'}
              className={cn(
                'rounded-xl transition-all',
                isEditingThis
                  ? 'bg-primary/10 text-primary opacity-100'
                  : 'hover:bg-muted opacity-0 group-hover:opacity-100',
              )}
            >
              <Edit2 className="w-4 h-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="iconSm"
              onClick={() => onConfirmarExclusao(t)}
              title="Excluir"
              className="rounded-xl hover:text-destructive hover:bg-destructive/15 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>

      {isEditingThis && (
        <InlineTransactionEditor
          transacao={t}
          categoriasPorTipo={categoriasPorTipo}
          contas={contas}
          onSalvar={onSalvarEdicao}
          onCancelar={onCancelarEdicao}
          salvando={salvandoEdicao}
        />
      )}
    </div>
  );
}
