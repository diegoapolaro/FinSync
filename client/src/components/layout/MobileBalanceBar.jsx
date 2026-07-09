import { formatCurrency } from '../../utils/formatters';

export default function MobileBalanceBar({ resumo }) {
  return (
    <div className="md:hidden fixed bottom-[72px] w-full bg-surface-variant flex justify-between items-center py-2 px-gutter border-t border-b border-dashed border-line z-40 max-w-receipt-width left-1/2 -translate-x-1/2">
      <span className="font-label-caps text-label-caps text-outline uppercase text-sm">
        Saldo do Mês
      </span>
      <span className="font-value-lg text-value-lg text-ink font-bold">
        {formatCurrency(resumo.saldoMensal)}
      </span>
    </div>
  );
}
