import { Trash2, ArrowUpRight, ArrowDownRight, Clock, CheckCircle2, Layers, Repeat } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';
import { TIPO_TRANSACAO, STATUS_TRANSACAO } from '../../utils/constants';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../ui/table';
import { Card } from '../ui/card';
import { cn } from '@/lib/utils';

function formatShortDate(dateStr) {
  const d = new Date(dateStr + 'T12:00:00');
  return d
    .toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
    .replace('.', '');
}

export default function TransactionTable({
  transacoes,
  carregando,
  onDelete,
  onToggleStatus,
  emptyMessage = 'Nenhuma movimentação neste período.',
}) {
  return (
    <Card className="overflow-hidden border border-border/80 shadow-sm">
      <Table>
        <TableHeader className="bg-muted/40">
          <TableRow className="hover:bg-transparent border-b border-border/70">
            <TableHead className="w-12 px-4" />
            <TableHead className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Descrição
            </TableHead>
            <TableHead className="w-36 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Categoria
            </TableHead>
            <TableHead className="w-28 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Status
            </TableHead>
            <TableHead className="w-32 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Data
            </TableHead>
            <TableHead className="w-36 text-right text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Valor
            </TableHead>
            <TableHead className="w-20" />
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
              <TableCell colSpan={7} className="text-center py-16 text-muted-foreground text-sm">
                {emptyMessage}
              </TableCell>
            </TableRow>
          )}
          {!carregando &&
            transacoes.map((t) => {
              const isEntrada = t.tipo === TIPO_TRANSACAO.ENTRADA;
              const Icon = isEntrada ? ArrowUpRight : ArrowDownRight;
              const isPendente = t.status === STATUS_TRANSACAO.PENDENTE;
              const isParcelado = Boolean(t.parcelamentoId || t.numeroParcela);
              const isRecorrente = Boolean(t.recorrenciaId);

              return (
                <TableRow
                  key={t.id}
                  className="group hover:bg-muted/50 transition-colors border-b border-border/50"
                >
                  <TableCell className="px-4 py-3.5">
                    <div
                      className={cn(
                        'w-8 h-8 rounded-full flex items-center justify-center transition-transform group-hover:scale-105',
                        isEntrada
                          ? 'bg-transparent text-entrada border border-border'
                          : 'bg-transparent text-saida border border-border',
                      )}
                    >
                      <Icon className="w-4 h-4 stroke-[2.5]" />
                    </div>
                  </TableCell>
                  <TableCell className="py-3.5 font-semibold text-foreground tracking-tight">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span>{t.descricao}</span>
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
                    </div>
                  </TableCell>
                  <TableCell className="py-3.5">
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full border bg-transparent text-muted-foreground border-border">
                      {t.categoriaNome || 'Geral'}
                    </span>
                  </TableCell>
                  <TableCell className="py-3.5">
                    <span
                      className={cn(
                        'inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border',
                        isPendente
                          ? 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                          : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
                      )}
                    >
                      {isPendente && <Clock className="w-3 h-3" />}
                      {t.status || STATUS_TRANSACAO.PAGO}
                    </span>
                  </TableCell>
                  <TableCell className="py-3.5 numeric-mono text-xs text-muted-foreground">
                    {formatShortDate(t.data)}
                  </TableCell>
                  <TableCell
                    className={cn(
                      'py-3.5 numeric-mono text-sm font-bold text-right tracking-tight',
                      isEntrada ? 'text-entrada' : 'text-saida',
                    )}
                  >
                    {isEntrada ? '+ ' : '- '}
                    {formatCurrency(t.valor)}
                  </TableCell>
                  <TableCell className="py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {onToggleStatus && (
                        <button
                          onClick={() => onToggleStatus(t)}
                          className={cn(
                            'p-2 rounded-lg transition-colors',
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
                        onClick={() => onDelete(t.id)}
                        className="p-2 rounded-lg hover:bg-destructive/15 text-muted-foreground hover:text-destructive transition-colors"
                        title="Excluir transação"
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
