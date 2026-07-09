import { formatCurrency } from '../../utils/formatters';

export default function SummarySection({ resumo }) {
  return (
    <section className="px-gutter py-stack-base flex flex-col gap-stack-tight border-b border-dashed border-line">
      <div className="flex justify-between items-center py-2">
        <span className="font-body-lg text-body-lg text-on-surface">
          ENTRADAS
        </span>
        <span className="font-value-lg text-value-lg text-entrada">
          + {formatCurrency(resumo.totalEntradasMes)}
        </span>
      </div>
      <div className="flex justify-between items-center py-2">
        <span className="font-body-lg text-body-lg text-on-surface">
          SAÍDAS
        </span>
        <span className="font-value-lg text-value-lg text-saida">
          - {formatCurrency(resumo.totalSaidasMes)}
        </span>
      </div>
    </section>
  );
}
