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
import { Button } from '../ui/button';
import InlineTransactionEditor from '../transactions/InlineTransactionEditor';
import { formatCurrency } from '../../utils/formatters';
import { TIPO_TRANSACAO, STATUS_TRANSACAO } from '../../utils/constants';
import { cn } from '@/lib/utils';
import type { TransacaoDto, CategoriaDto, ContaDto } from '@/types';

interface Props {
  transacao: TransacaoDto;
  isEditingThis: boolean;
  onToggleStatus: (transacao: TransacaoDto) => void;
  onEditar: (transacao: TransacaoDto) => void;
  onConfirmarExclusao: (transacao: TransacaoDto) => void;
  categoriasPorTipo: Record<string, CategoriaDto[]>;
  contas: ContaDto[];
  onSalvarEdicao: (transacao: Partial<TransacaoDto>) => void;
  onCancelarEdicao: () => void;
  salvandoEdicao: boolean;
}

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
}: Props): React.ReactElement {
  const t = transacao;
  const tEntrada = t.tipo === TIPO_TRANSACAO.ENTRADA;
  const Icon = tEntrada ? ArrowUpRight : ArrowDownRight;
  const isPendente = t.status === STATUS_TRANSACAO.PENDENTE;
  const isParcelado = Boolean(t.parcelamentoId || t.numeroParcela);
  const isRecorrente = Boolean(t.recorrenciaId);

  return (
    <div className="space-y-2">
      <div
        className={cn(
          'p-4 rounded-[16px] border border-pebble/20 bg-paper dark:bg-card flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs hover:border-pebble/40 transition-all',
          isEditingThis && 'border-forest-ink/50 dark:border-lime-voltage ring-1 ring-lime-voltage/30 bg-fog dark:bg-spruce/30',
        )}
      >
        {/* Lado Esquerdo: Ícone + Descrição + Badges */}
        <div className="flex items-center gap-3.5 min-w-0">
          <div
            className={cn(
              'w-10 h-10 rounded-full flex items-center justify-center shrink-0 border transition-transform shadow-xs',
              tEntrada
                ? 'bg-linen-mist text-forest-ink border-forest-ink/15 dark:bg-spruce dark:text-lime-voltage'
                : 'bg-alarm-red/10 text-alarm-red border-alarm-red/20',
            )}
          >
            <Icon className="w-4 h-4 stroke-[2.5]" />
          </div>

          <div className="min-w-0 flex flex-col gap-1">
            <span className="font-bold text-forest-ink dark:text-paper truncate text-sm tracking-tight">
              {t.descricao}
            </span>

            <div className="flex items-center gap-1.5 flex-wrap">
              {t.categoriaNome && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-fog dark:bg-spruce/60 text-charcoal dark:text-pebble border border-pebble/20">
                  {t.categoriaNome}
                </span>
              )}

              {isParcelado && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-linen-mist text-forest-ink dark:bg-spruce dark:text-lime-voltage border border-forest-ink/10">
                  <Layers className="w-2.5 h-2.5" />
                  {t.numeroParcela}/{t.totalParcelas}
                </span>
              )}

              {isRecorrente && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-fog dark:bg-spruce text-forest-ink dark:text-lime-voltage border border-pebble/30">
                  <Repeat className="w-2.5 h-2.5" />
                  {t.frequenciaRecorrencia || 'Fixo'}
                </span>
              )}

              {/* Status Badge Pílula */}
              <span
                className={cn(
                  'inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full border',
                  isPendente
                    ? 'bg-alarm-red/10 text-alarm-red border-alarm-red/20'
                    : 'bg-linen-mist text-forest-ink border-forest-ink/15 dark:bg-spruce dark:text-lime-voltage',
                )}
              >
                {isPendente ? <Clock className="w-2.5 h-2.5" /> : <CheckCircle2 className="w-2.5 h-2.5" />}
                <span>{t.status || STATUS_TRANSACAO.PAGO}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Lado Direito: Valor Monetário + Ações 100% Visíveis (Anti-Vibecode) */}
        <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-pebble/10">
          <span
            className={cn(
              'numeric-mono text-sm md:text-base font-extrabold tracking-tight',
              tEntrada ? 'text-forest-ink dark:text-lime-voltage' : 'text-alarm-red',
            )}
          >
            {tEntrada ? '+ ' : '- '}
            {formatCurrency(t.valor)}
          </span>

          <div className="flex items-center gap-1">
            {/* Toggle Status Icon */}
            <Button
              type="button"
              variant="ghost"
              size="iconSm"
              onClick={() => onToggleStatus(t)}
              title={isPendente ? 'Marcar como Pago' : 'Marcar como Pendente'}
              className={cn(
                'rounded-full h-8 w-8 transition-colors border border-transparent hover:border-pebble/30',
                isPendente
                  ? 'text-alarm-red hover:bg-alarm-red/10'
                  : 'text-charcoal dark:text-pebble hover:text-forest-ink hover:bg-fog',
              )}
            >
              {isPendente ? (
                <Clock className="w-4 h-4 text-alarm-red" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-forest-ink dark:text-lime-voltage" />
              )}
            </Button>

            {/* Editar (Sempre Visível) */}
            <Button
              type="button"
              variant={isEditingThis ? 'secondary' : 'ghost'}
              size="iconSm"
              onClick={() => onEditar(t)}
              title={isEditingThis ? 'Fechar edição' : 'Editar'}
              className={cn(
                'rounded-full h-8 w-8 transition-all border border-transparent hover:border-pebble/30 text-charcoal dark:text-pebble hover:text-forest-ink hover:bg-fog',
                isEditingThis && 'bg-forest-ink text-paper dark:bg-lime-voltage dark:text-forest-ink shadow-xs',
              )}
            >
              <Edit2 className="w-3.5 h-3.5" />
            </Button>

            {/* Excluir (Sempre Visível) */}
            <Button
              type="button"
              variant="ghost"
              size="iconSm"
              onClick={() => onConfirmarExclusao(t)}
              title="Excluir"
              className="rounded-full h-8 w-8 text-pebble hover:text-alarm-red hover:bg-alarm-red/10 hover:border-alarm-red/20 border border-transparent transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </div>

      {isEditingThis && (
        <div className="p-4 bg-fog dark:bg-spruce/30 rounded-[16px] border border-pebble/30">
          <InlineTransactionEditor
            transacao={t}
            categoriasPorTipo={categoriasPorTipo}
            contas={contas}
            onSalvar={onSalvarEdicao}
            onCancelar={onCancelarEdicao}
            salvando={salvandoEdicao}
          />
        </div>
      )}
    </div>
  );
}
