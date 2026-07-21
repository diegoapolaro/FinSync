import { formatCurrency } from '../../utils/formatters';

function formatFullDate(dateStr) {
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
}

export default function TransactionCard({ transacao, onDelete }) {
  const isEntrada = transacao.tipo === 'Entrada';

  return (
    <div
      className={
        'group relative bg-white flex items-center p-3.5 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.08)] hover:bg-[#F5F5F2] border-l-4 transition-all ' +
        (isEntrada ? 'border-[#105137]' : 'border-[#B23A2E]')
      }
    >
      <div className="flex-grow min-w-0">
        <p className="font-medium text-[#181D1A] truncate">{transacao.descricao}</p>
        <p className="text-xs text-[#707972] mt-0.5">
          {formatFullDate(transacao.data)}
          {transacao.categoriaNome && <> &mdash; {transacao.categoriaNome}</>}
        </p>
      </div>
      <div className="flex items-center gap-2 shrink-0 ml-3">
        <span className={'font-mono text-sm font-semibold ' + (isEntrada ? 'text-[#105137]' : 'text-[#B23A2E]')}>
          {isEntrada ? '+ ' : '- '}{formatCurrency(transacao.valor)}
        </span>
        <button
          onClick={() => onDelete(transacao.id)}
          className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-[#B23A2E]/10 text-[#707972] hover:text-[#B23A2E]"
        >
          <span className="material-symbols-outlined text-lg">delete</span>
        </button>
      </div>
    </div>
  );
}
