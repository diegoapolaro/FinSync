import { Trash2 } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';
import { TIPO_TRANSACAO } from '../../utils/constants';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { cn } from '@/lib/utils';

function formatFullDate(dateStr) {
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
}

export default function TransactionCard({ transacao, onDelete }) {
  const isEntrada = transacao.tipo === TIPO_TRANSACAO.ENTRADA;

  return (
    <Card className="group relative flex items-center p-4 hover:shadow-md transition-shadow">
      <div
        className="w-1.5 self-stretch rounded-full mr-3.5 shrink-0"
        style={{
          backgroundColor: isEntrada ? '#2ead4b' : '#d03238',
        }}
      />
      <div className="flex-grow min-w-0 pr-2">
        <p className="font-semibold text-foreground truncate text-sm">
          {transacao.descricao}
        </p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs font-mono text-muted-foreground">
            {formatFullDate(transacao.data)}
          </span>
          {transacao.categoriaNome && (
            <Badge variant={isEntrada ? 'positive' : 'destructive'} className="text-[10px] py-0 px-2">
              {transacao.categoriaNome}
            </Badge>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span
          className={cn(
            'font-mono text-sm font-bold',
            isEntrada ? 'text-[#2ead4b] dark:text-[#3ec75f]' : 'text-[#d03238] dark:text-[#ff5c62]'
          )}
        >
          {isEntrada ? '+ ' : '- '}
          {formatCurrency(transacao.valor)}
        </span>
        <button
          onClick={() => onDelete(transacao.id)}
          className="p-2 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
          title="Excluir"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </Card>
  );
}
