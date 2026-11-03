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
    <Card className="overflow-hidden border border-border/60 bg-card/80 backdrop-blur-sm shadow-sm rounded-2xl">
      <Table>
        <TableHeader className="bg-muted/30 border-b border-border/60">
          <TableRow className="hover:bg-transparent border-b border-border/60">
            <TableHead className="w-32 py-3 px-4 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground whitespace-nowrap">
              {t('tab_data_hora', 'Data / Hora')}
            </TableHead>
            <TableHead className="min-w-[220px] py-3 px-4 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              {t('tab_descricao_operacao', 'Descrição da Operação')}
            </TableHead>
            <TableHead className="w-36 py-3 px-4 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              {t('tab_categoria', 'Categoria')}
            </TableHead>
            <TableHead className="w-40 py-3 px-4 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              {t('tab_conta_origem', 'Conta / Origem')}
            </TableHead>
            <TableHead className="w-32 py-3 px-4 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              {t('tab_status', 'Status')}
            </TableHead>
            <TableHead className="w-36 py-3 px-4 text-right text-[11px] font-semibold uppercase tracking-wider text-muted-foreground whitespace-nowrap">
              {t('tab_valor_liquido', 'Valor Líquido')}
            </TableHead>
            <TableHead className="w-28 py-3 px-4 text-right text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              {t('tab_acoes', 'Ações')}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {carregando && (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-16 text-muted-foreground text-sm">
                <span className="inline-block w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin align-middle mr-2" />
                Carregando transações...
              </TableCell>
            </TableRow>
          )}
          {!carregando && transacoes.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-14 text-muted-foreground text-sm">
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
                  className="group hover:bg-muted/40 transition-colors border-b border-border/60"
                >
                  {/* Data / Hora */}
                  <TableCell className="py-3 px-4 numeric-mono text-xs text-muted-foreground whitespace-nowrap">
                    {formatDisplayDate(transacao.data)}
                  </TableCell>

                  {/* Descrição da Operação */}
                  <TableCell className="py-3 px-4 font-medium text-foreground tracking-tight">
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          'w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border transition-transform group-hover:scale-105',
                          isEntrada
                            ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400'
                            : 'bg-muted/60 text-muted-foreground border-border/60 dark:bg-muted/40',
                        )}
                      >
                        <DirectionIcon className="w-3.5 h-3.5 stroke-[2.25]" />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-foreground text-sm truncate max-w-[240px] md:max-w-[320px]">
                            {transacao.descricao}
                          </span>
                          {isParcelado && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md border bg-primary/10 text-primary border-primary/20 whitespace-nowrap">
                              <Layers className="w-2.5 h-2.5" />
                              {transacao.numeroParcela}/{transacao.totalParcelas}
                            </span>
                          )}
                          {isRecorrente && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md border bg-indigo-500/10 text-indigo-400 border-indigo-500/20 whitespace-nowrap">
                              <Repeat className="w-2.5 h-2.5" />
                              {transacao.frequenciaRecorrencia || 'Fixo'}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </TableCell>

                  {/* Categoria */}
                  <TableCell className="py-3 px-4 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-md border bg-secondary/50 text-muted-foreground border-border/60">
                      {transacao.categoriaCor ? (
                        <span
                          className="w-1.5 h-1.5 rounded-full shrink-0"
                          style={{ backgroundColor: transacao.categoriaCor }}
                        />
                      ) : (
                        <span className="w-1.5 h-1.5 rounded-full shrink-0 bg-muted-foreground/40" />
                      )}
                      <span className="truncate max-w-[120px]">{transacao.categoriaNome || 'Geral'}</span>
                    </span>
                  </TableCell>

                  {/* Conta / Origem */}
                  <TableCell className="py-3 px-4 text-xs text-muted-foreground whitespace-nowrap">
                    <div className="flex items-center gap-1.5 font-medium text-foreground/80">
                      <ContaIcon className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                      <span className="truncate max-w-[140px]">{transacao.contaNome || 'Conta Principal'}</span>
                    </div>
                  </TableCell>

                  {/* Status */}
                  <TableCell className="py-3 px-4 whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => onToggleStatus?.(transacao)}
                      disabled={!onToggleStatus}
                      title={isPendente ? 'Marcar como Pago' : 'Marcar como Pendente'}
                      aria-label={isPendente ? 'Marcar como Pago' : 'Marcar como Pendente'}
                      className={cn(
                        'inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border transition-all',
                        onToggleStatus ? 'cursor-pointer hover:scale-102 active:scale-98' : 'cursor-default',
                        isPendente
                          ? 'bg-amber-500/10 text-amber-500 border-amber-500/25 hover:bg-amber-500/20 dark:text-amber-400'
                          : 'bg-emerald-500/10 text-emerald-600 border-emerald-500/25 hover:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/20',
                      )}
                    >
                      {isPendente ? (
                        <Clock className="w-3 h-3 shrink-0" />
                      ) : (
                        <CheckCircle2 className="w-3 h-3 shrink-0" />
                      )}
                      <span>{transacao.status || STATUS_TRANSACAO.PAGO}</span>
                    </button>
                  </TableCell>

                  {/* Valor Líquido */}
                  <TableCell
                    className={cn(
                      'py-3 px-4 numeric-mono text-sm font-semibold text-right tracking-tight whitespace-nowrap',
                      isEntrada ? 'text-entrada dark:text-emerald-400' : 'text-saida dark:text-rose-400',
                    )}
                  >
                    {isEntrada ? '+ ' : '- '}
                    {formatCurrency(transacao.valor)}
                  </TableCell>

                  {/* Ações */}
                  <TableCell className="py-3 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={() => (onView ? onView(transacao) : onEdit ? onEdit(transacao) : undefined)}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
                        title="Visualizar detalhes"
                        aria-label="Visualizar detalhes"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>

                      {onToggleStatus && (
                        <button
                          type="button"
                          onClick={() => onToggleStatus(transacao)}
                          className={cn(
                            'p-1.5 rounded-lg transition-colors',
                            isPendente
                              ? 'text-amber-500 hover:text-emerald-600 hover:bg-emerald-500/15 dark:text-amber-400 dark:hover:text-emerald-400'
                              : 'text-muted-foreground hover:text-amber-500 hover:bg-amber-500/15 dark:hover:text-amber-400',
                          )}
                          title={isPendente ? 'Marcar como Pago' : 'Marcar como Pendente'}
                          aria-label={isPendente ? 'Marcar como Pago' : 'Marcar como Pendente'}
                        >
                          {isPendente ? (
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          ) : (
                            <Clock className="w-3.5 h-3.5" />
                          )}
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => onDelete(transacao.id)}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                        title="Excluir transação"
                        aria-label="Excluir transação"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
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
