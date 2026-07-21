import { formatCurrency } from '../../utils/formatters';

const variants = {
  entrada: {
    label: 'Entradas',
    icon: 'arrow_circle_up',
    iconBg: 'bg-[#105137]/10',
    textColor: 'text-[#105137]',
    borderColor: 'border-[#105137]',
    gradient: 'from-[#10513708]',
  },
  saida: {
    label: 'Saídas',
    icon: 'arrow_circle_down',
    iconBg: 'bg-[#B23A2E]/10',
    textColor: 'text-[#B23A2E]',
    borderColor: 'border-[#B23A2E]',
    gradient: 'from-[#B23A2E08]',
  },
  saldo: {
    label: 'Saldo Atual',
    icon: 'account_balance_wallet',
    iconBg: 'bg-[#4A7C7E]/10',
    textColor: 'text-[#4A7C7E]',
    borderColor: 'border-[#4A7C7E]',
    gradient: 'from-[#4A7C7E08]',
  },
};

export default function SummaryCard({ tipo, value }) {
  const v = variants[tipo] || variants.entrada;
  return (
    <div
      className={
        'bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.08)] border-l-4 ' +
        v.borderColor +
        ' p-5 flex items-center justify-between group hover:shadow-[0_4px_12px_rgba(0,0,0,0.12)] transition-all bg-gradient-to-br ' +
        v.gradient +
        ' to-white'
      }
    >
      <div>
        <p className="font-label-caps text-[11px] text-[#707972] uppercase tracking-[0.1em] mb-1.5">
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
