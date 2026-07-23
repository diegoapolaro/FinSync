import { formatCurrency, formatDisplayDate } from '../../utils/formatters';
import { TIPO_TRANSACAO } from '../../utils/constants';

export default function TransactionList({ titulo, transacoes, handleDelete }) {
  return (
    <section className="flex-grow mt-4">
      <div className="px-gutter pb-2 border-b border-dashed border-line">
        <h2 className="font-label-caps text-label-caps text-secondary uppercase">
          {titulo}
        </h2>
      </div>

      {transacoes.map((transacao) => {
        const tipo = transacao.tipo.toLowerCase();
        return (
          <div
            key={transacao.id}
            className="transaction-card flex items-center px-gutter py-stack-base border-b border-dashed border-line group hover:bg-surface-variant transition-colors duration-75"
          >
            <div
              className="w-1 h-12 mr-4 rounded-sm flex-shrink-0"
              style={{
                backgroundColor: tipo === 'entrada' ? 'var(--color-entrada)' : 'var(--color-saida)',
              }}
            />
            <div className="flex-grow flex flex-col min-w-0">
              <span className="font-body-lg text-body-lg text-ink truncate">
                {transacao.descricao}
              </span>
              <span className="font-label-caps text-label-caps text-secondary mt-1">
                {formatDisplayDate(transacao.data)}
              </span>
            </div>
            <div className="text-right flex flex-col items-end gap-1 ml-3">
              <span
                className={`font-value-lg text-value-lg whitespace-nowrap ${tipo === 'entrada' ? 'text-entrada' : 'text-saida'}`}
              >
                {transacao.tipo === TIPO_TRANSACAO.ENTRADA ? '+' : '-'}
                {formatCurrency(transacao.valor)}
              </span>
              <button
                type="button"
                onClick={() => handleDelete(transacao.id)}
                className="btn-base font-label-caps text-label-caps text-outline hover:text-error transition-colors opacity-0 group-hover:opacity-100"
              >
                Excluir
              </button>
            </div>
          </div>
        );
      })}
    </section>
  );
}
