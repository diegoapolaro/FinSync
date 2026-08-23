import { Trash2 } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';
import { TIPO_TRANSACAO } from '../../utils/constants';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '../ui/table';
import { Badge } from '../ui/badge';
import { Card } from '../ui/card';

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
    <Card className="overflow-hidden border border-border/60">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-4 px-4" />
            <TableHead className="text-xs font-semibold uppercase tracking-wider">Descrição</TableHead>
            <TableHead className="w-44 text-xs font-semibold uppercase tracking-wider">Categoria</TableHead>
            <TableHead className="w-36 text-xs font-semibold uppercase tracking-wider">Data</TableHead>
            <TableHead className="w-40 text-right text-xs font-semibold uppercase tracking-wider">Valor</TableHead>
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
              return (
                <TableRow key={t.id} className="group hover:bg-muted/40 transition-colors">
                  <TableCell className="px-4 py-4">
                    <div
                      className="w-1.5 h-8 rounded-full"
                      style={{
                        backgroundColor: isEntrada ? '#2ead4b' : '#d03238',
                      }}
                    />
                  </TableCell>
                  <TableCell className="py-4 font-semibold text-foreground">
                    {t.descricao}
                  </TableCell>
                  <TableCell className="py-4">
                    <Badge
                      variant={isEntrada ? 'positive' : 'destructive'}
                      className="font-medium"
                    >
                      {t.categoriaNome || 'Geral'}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-4 font-mono text-xs text-muted-foreground">
                    {formatShortDate(t.data)}
                  </TableCell>
                  <TableCell
                    className={
                      'py-4 font-mono text-sm font-bold text-right ' +
                      (isEntrada ? 'text-[#2ead4b] dark:text-[#3ec75f]' : 'text-[#d03238] dark:text-[#ff5c62]')
                    }
                  >
                    {isEntrada ? '+ ' : '- '}
                    {formatCurrency(t.valor)}
                  </TableCell>
                  <TableCell className="py-4 text-right">
                    <button
                      onClick={() => onDelete(t.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-full hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
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
