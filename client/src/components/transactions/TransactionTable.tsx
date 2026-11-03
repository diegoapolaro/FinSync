import {
  Trash2,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CheckCircle2,
  Building2,
  CreditCard,
  QrCode,
  Eye,
  Layers,
  Repeat,
} from 'lucide-react';
import { formatCurrency, formatDisplayDate } from '../../utils/formatters';
import { TIPO_TRANSACAO, STATUS_TRANSACAO } from '../../utils/constants';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../ui/table';
import { Card } from '../ui/card';
import { cn } from '@/lib/utils';
import useI18n from '../../hooks/useI18n';
import type { TransacaoDto } from '@/types';

interface Props {
  transacoes: TransacaoDto[];
  carregando?: boolean;
  onDelete: (id: number) => void;
  onToggleStatus?: (transacao: TransacaoDto) => void;
  emptyMessage?: string;
  onView?: (transacao: TransacaoDto) => void;
  onEdit?: (transacao: TransacaoDto) => void;
}

function getContaIcon(contaNome?: string) {
  if (!contaNome) return Building2;
  const lower = contaNome.toLowerCase();
  if (
    lower.includes('cartão') ||
    lower.includes('cartao') ||
    lower.includes('card') ||
    lower.includes('crédito') ||
    lower.includes('credito')
  ) {
    return CreditCard;
  }
  if (lower.includes('pix') || lower.includes('qr')) {
    return QrCode;
  }
  return Building2;
}

export default function TransactionTable({
  transacoes,
  carregando,
  onDelete,
  onToggleStatus,
  emptyMessage,
  onView,
  onEdit,
}: Props) {
  const { t } = useI18n();
  const mensagemVazia = emptyMessage || t('tab_sem_transacoes', 'Nenhuma movimentação neste período.');

  return (
    <Card className="overflow-hidden border border-fog dark:border-spruce bg-card shadow-sm rounded-[20px]">
      <Table>
        <TableHeader className="bg-fog/80 dark:bg-spruce/60 border-b border-fog dark:border-spruce">
          <TableRow className="hover:bg-transparent border-b border-fog dark:border-spruce">
            <TableHead className="w-32 py-3.5 px-4 text-[11px] font-bold uppercase tracking-wider text-charcoal dark:text-pebble whitespace-nowrap">
              {t('tab_data_hora', 'Data / Hora')}
            </TableHead>
            <TableHead className="min-w-[220px] py-3.5 px-4 text-[11px] font-bold uppercase tracking-wider text-charcoal dark:text-pebble">
              {t('tab_descricao_operacao', 'Descrição da Operação')}
            </TableHead>
            <TableHead className="w-36 py-3.5 px-4 text-[11px] font-bold uppercase tracking-wider text-charcoal dark:text-pebble">
              {t('tab_categoria', 'Categoria')}
            </TableHead>
            <TableHead className="w-40 py-3.5 px-4 text-[11px] font-bold uppercase tracking-wider text-charcoal dark:text-pebble">
              {t('tab_conta_origem', 'Conta / Origem')}
            </TableHead>
            <TableHead className="w-32 py-3.5 px-4 text-[11px] font-bold uppercase tracking-wider text-charcoal dark:text-pebble">
              {t('tab_status', 'Status')}
            </TableHead>
            <TableHead className="w-36 py-3.5 px-4 text-right text-[11px] font-bold uppercase tracking-wider text-charcoal dark:text-pebble whitespace-nowrap">
              {t('tab_valor_liquido', 'Valor Líquido')}
            </TableHead>
            <TableHead className="w-28 py-3.5 px-4 text-right text-[11px] font-bold uppercase tracking-wider text-charcoal dark:text-pebble">
              {t('tab_acoes', 'Ações')}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {carregando && (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-16 text-charcoal dark:text-pebble text-sm">
                <span className="inline-block w-5 h-5 border-2 border-forest-ink border-t-lime-voltage rounded-full animate-spin align-middle mr-2" />
                Carregando transações...
              </TableCell>
            </TableRow>
          )}
          {!carregando && transacoes.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-14 text-charcoal dark:text-pebble text-sm">
                {mensagemVazia}
              </TableCell>
            </TableRow>
          )}
          {!carregando &&
            transacoes.map((transacao) => {
              const isEntrada = transacao.tipo === TIPO_TRANSACAO.ENTRADA;
              const DirectionIcon = isEntrada ? ArrowUpRight : ArrowDownRight;
              const isPendente = transacao.status === STATUS_TRANSACAO.PENDENTE;
              const isParcelado = Boolean(transacao.parcelamentoId || transacao.numeroParcela);
              const isRecorrente = Boolean(transacao.recorrenciaId);
              const ContaIcon = getContaIcon(transacao.contaNome);

              return (
                <TableRow
                  key={transacao.id}
                  className="group hover:bg-fog/50 dark:hover:bg-spruce/30 transition-colors border-b border-fog dark:border-spruce"
                >
                  {/* Data / Hora */}
                  <TableCell className="py-3.5 px-4 numeric-mono text-xs text-charcoal dark:text-pebble whitespace-nowrap">
                    {formatDisplayDate(transacao.data)}
                  </TableCell>

                  {/* Descrição da Operação */}
                  <TableCell className="py-3.5 px-4 font-medium text-forest-ink dark:text-paper tracking-tight">
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          'w-8 h-8 rounded-full flex items-center justify-center shrink-0 border transition-transform group-hover:scale-105',
                          isEntrada
                            ? 'bg-linen-mist text-forest-ink border-lime-voltage/30 dark:bg-spruce dark:text-lime-voltage'
                            : 'bg-fog text-charcoal border-border/40 dark:bg-spruce/50 dark:text-pebble',
                        )}
                      >
                        <DirectionIcon className="w-4 h-4 stroke-[2.25]" />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-forest-ink dark:text-paper text-sm truncate max-w-[240px] md:max-w-[320px]">
                            {transacao.descricao}
                          </span>
                          {isParcelado && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border bg-fog text-forest-ink border-border/50 dark:bg-spruce dark:text-lime-voltage whitespace-nowrap">
                              <Layers className="w-2.5 h-2.5" />
                              {transacao.numeroParcela}/{transacao.totalParcelas}
                            </span>
                          )}
                          {isRecorrente && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border bg-linen-mist text-forest-ink border-forest-ink/10 dark:bg-spruce dark:text-lime-voltage whitespace-nowrap">
                              <Repeat className="w-2.5 h-2.5" />
                              {transacao.frequenciaRecorrencia || 'Fixo'}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </TableCell>

                  {/* Categoria */}
                  <TableCell className="py-3.5 px-4 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full border bg-fog dark:bg-spruce/50 text-charcoal dark:text-paper border-border/40">
                      {transacao.categoriaCor ? (
                        <span
                          className="w-1.5 h-1.5 rounded-full shrink-0"
                          style={{ backgroundColor: transacao.categoriaCor }}
                        />
                      ) : (
                        <span className="w-1.5 h-1.5 rounded-full shrink-0 bg-pebble" />
                      )}
                      <span className="truncate max-w-[120px]">{transacao.categoriaNome || 'Geral'}</span>
                    </span>
                  </TableCell>

                  {/* Conta / Origem */}
                  <TableCell className="py-3.5 px-4 text-xs text-charcoal dark:text-pebble whitespace-nowrap">
                    <div className="flex items-center gap-1.5 font-medium text-forest-ink/90 dark:text-paper">
                      <ContaIcon className="w-3.5 h-3.5 text-pebble shrink-0" />
                      <span className="truncate max-w-[140px]">{transacao.contaNome || 'Conta Principal'}</span>
                    </div>
                  </TableCell>

                  {/* Status */}
                  <TableCell className="py-3.5 px-4 whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => onToggleStatus?.(transacao)}
                      disabled={!onToggleStatus}
                      title={isPendente ? 'Marcar como Pago' : 'Marcar como Pendente'}
                      aria-label={isPendente ? 'Marcar como Pago' : 'Marcar como Pendente'}
                      className={cn(
                        'inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full border transition-all',
                        onToggleStatus ? 'cursor-pointer hover:scale-102 active:scale-98' : 'cursor-default',
                        isPendente
                          ? 'bg-amber-500/10 text-amber-600 border-amber-500/25 hover:bg-amber-500/20 dark:text-amber-400'
                          : 'bg-linen-mist text-forest-ink border-lime-voltage/30 hover:bg-linen-mist/80 dark:bg-spruce dark:text-lime-voltage dark:border-lime-voltage/20',
                      )}
                    >
                      {isPendente ? (
                        <Clock className="w-3.5 h-3.5 shrink-0" />
                      ) : (
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                      )}
                      <span>{transacao.status || STATUS_TRANSACAO.PAGO}</span>
                    </button>
                  </TableCell>

                  {/* Valor Líquido */}
                  <TableCell
                    className={cn(
                      'py-3.5 px-4 numeric-mono text-sm font-bold text-right tracking-tight whitespace-nowrap',
                      isEntrada ? 'text-forest-ink dark:text-lime-voltage' : 'text-alarm-red',
                    )}
                  >
                    {isEntrada ? '+ ' : '- '}
                    {formatCurrency(transacao.valor)}
                  </TableCell>

                  {/* Ações */}
                  <TableCell className="py-3.5 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={() => (onView ? onView(transacao) : onEdit ? onEdit(transacao) : undefined)}
                        className="p-1.5 rounded-full text-charcoal hover:text-forest-ink hover:bg-fog transition-colors dark:text-pebble dark:hover:text-paper"
                        title="Visualizar detalhes"
                        aria-label="Visualizar detalhes"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {onToggleStatus && (
                        <button
                          type="button"
                          onClick={() => onToggleStatus(transacao)}
                          className={cn(
                            'p-1.5 rounded-full transition-colors',
                            isPendente
                              ? 'text-amber-600 hover:text-forest-ink hover:bg-linen-mist'
                              : 'text-pebble hover:text-forest-ink hover:bg-fog dark:hover:text-lime-voltage',
                          )}
                          title={isPendente ? 'Marcar como Pago' : 'Marcar como Pendente'}
                          aria-label={isPendente ? 'Marcar como Pago' : 'Marcar como Pendente'}
                        >
                          {isPendente ? (
                            <CheckCircle2 className="w-4 h-4 text-forest-ink dark:text-lime-voltage" />
                          ) : (
                            <Clock className="w-4 h-4" />
                          )}
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => onDelete(transacao.id)}
                        className="p-1.5 rounded-full text-pebble hover:text-alarm-red hover:bg-alarm-red/10 transition-colors"
                        title="Excluir transação"
                        aria-label="Excluir transação"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
        </TableBody>
      </Table>
    </Card>
  );
}
