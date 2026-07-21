import { formatCurrency } from '../../utils/formatters';

const variants = {
  entrada: {
    label: 'Entradas',
    icon: 'arrow_circle_up',
    iconBg: 'bg-entrada/10',
    textColor: 'text-entrada',
    borderColor: 'border-entrada',
  },
  saida: {
    label: 'Saídas',
    icon: 'arrow_circle_down',
    iconBg: 'bg-saida/10',
    textColor: 'text-saida',
    borderColor: 'border-saida',
  },
  saldo: {
    label: 'Saldo Atual',
    icon: 'account_balance_wallet',
    iconBg: 'bg-azul/10',
    textColor: 'text-azul',
    borderColor: 'border-azul',
  },
};

export default function SummaryCard({ tipo, value }) {
  const v = variants[tipo] || variants.entrada;
  return (
    <div
      className={
        'rounded-xl shadow-card border-l-4 ' +
        v.borderColor +
        ' p-5 flex items-center justify-between group hover:shadow-card-hover transition-all'
      }
      style={{ backgroundColor: 'var(--bg-card)' }}
    >
      <div>
        <p className="font-label-caps text-[11px] text-on-surface-variant uppercase tracking-[0.1em] mb-1.5">
          {v.label}
        </p>
        <h3
          className={
            'font-[IBM_Plex_Mono] text-[28px] leading-none font-semibold ' +
            v.textColor
          }
        >
          {formatCurrency(value)}
        </h3>
      </div>
      <div
        className={
          'w-11 h-11 rounded-full flex items-center justify-center ' + v.iconBg
        }
      >
        <span
          className={'material-symbols-outlined ' + v.textColor}
          style={{ fontVariationSettings: "'FILL' 1", fontSize: 24 }}
        >
          {v.icon}
        </span>
      </div>
    </div>
  );
}
