import { Trash2, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';
import { TIPO_TRANSACAO } from '../../utils/constants';
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
            <TableHead className="w-44 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Categoria
            </TableHead>
            <TableHead className="w-36 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Data
            </TableHead>
            <TableHead className="w-40 text-right text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Valor
            </TableHead>
            <TableHead className="w-14" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {carregando && (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-16 text-muted-foreground text-sm">
                <span className="inline-block w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin align-middle mr-2" />
                Carregando transações...
              </TableCell>
            </TableRow>
          )}
          {!carregando && transacoes.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-16 text-muted-foreground text-sm">
                {emptyMessage}
              </TableCell>
            </TableRow>
          )}
          {!carregando &&
            transacoes.map((t) => {
              const isEntrada = t.tipo === TIPO_TRANSACAO.ENTRADA;
              const Icon = isEntrada ? ArrowUpRight : ArrowDownRight;
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
                    {t.descricao}
                  </TableCell>
                  <TableCell className="py-3.5">
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full border bg-transparent text-muted-foreground border-border">
                      {t.categoriaNome || 'Geral'}
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
                    <button
                      onClick={() => onDelete(t.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-lg hover:bg-destructive/15 text-muted-foreground hover:text-destructive"
                      title="Excluir transação"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </TableCell>
                </TableRow>
              );
            })}
        </TableBody>
      </Table>
    </Card>
  );
}
