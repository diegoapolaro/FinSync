import { formatCurrency } from '../../utils/formatters';
import { TIPO_TRANSACAO } from '../../utils/constants';

function formatFullDate(dateStr) {
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
}

export default function TransactionCard({ transacao, onDelete }) {
  const isEntrada = transacao.tipo === TIPO_TRANSACAO.ENTRADA;

  return (
    <div
      className={
        'group relative flex items-center p-3.5 rounded-xl shadow-card hover:bg-surface-variant border-l-4 transition-all ' +
        (isEntrada ? 'border-entrada' : 'border-saida')
      }
      style={{ backgroundColor: 'var(--bg-card)' }}
    >
      <div className="flex-grow min-w-0">
        <p className="font-medium text-on-surface truncate">{transacao.descricao}</p>
        <p className="text-xs text-on-surface-variant mt-0.5">
          {formatFullDate(transacao.data)}
          {transacao.categoriaNome && <> &mdash; {transacao.categoriaNome}</>}
        </p>
      </div>
      <div className="flex items-center gap-2 shrink-0 ml-3">
        <span className={'font-mono text-sm font-semibold ' + (isEntrada ? 'text-entrada' : 'text-saida')}>
          {isEntrada ? '+ ' : '- '}{formatCurrency(transacao.valor)}
        </span>
        <button
          onClick={() => onDelete(transacao.id)}
          className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-saida/10 text-on-surface-variant hover:text-saida"
        >
          <span className="material-symbols-outlined text-lg">delete</span>
        </button>
      </div>
    </div>
  );
}
