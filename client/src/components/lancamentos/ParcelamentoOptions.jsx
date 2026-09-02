import React from 'react';
import { Layers } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';
import { cn } from '@/lib/utils';

export default function ParcelamentoOptions({ totalParcelas, onSelectParcelas, previewParcelamento }) {
  return (
    <div className="p-4 rounded-2xl border border-primary/30 bg-primary/5 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-foreground flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-primary" />
          Número de Parcelas
        </span>
        <span className="text-xs numeric-mono font-bold text-primary">
          {totalParcelas}x
        </span>
      </div>

      {/* Atalhos de parcelas comuns */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {[2, 3, 4, 5, 6, 10, 12, 18, 24].map((num) => (
          <button
            key={num}
            type="button"
            onClick={() => onSelectParcelas(num)}
            className={cn(
              'numeric-mono text-xs font-semibold px-2.5 py-1 rounded-lg border transition-all',
              totalParcelas === num
                ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                : 'bg-secondary text-muted-foreground border-border hover:text-foreground',
            )}
          >
            {num}x
          </button>
        ))}
      </div>

      {/* Preview Resumo */}
      {previewParcelamento && previewParcelamento.valorTotal > 0 && (
        <div className="mt-2 pt-2.5 border-t border-primary/20 flex items-center justify-between text-xs">
          <span className="text-muted-foreground">
            {previewParcelamento.parcelas}x de{' '}
            <strong className="text-foreground numeric-mono">
              {formatCurrency(previewParcelamento.valorParcela)}
            </strong>
          </span>
          <span className="text-muted-foreground">
            Total:{' '}
            <strong className="text-foreground numeric-mono">
              {formatCurrency(previewParcelamento.valorTotal)}
            </strong>{' '}
            ({previewParcelamento.periodo})
          </span>
        </div>
      )}
    </div>
  );
}
