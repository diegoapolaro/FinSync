import React from 'react';
import { Repeat } from 'lucide-react';
import { Input } from '../ui/input';
import { FREQUENCIA_RECORRENCIA } from '../../utils/constants';
import { cn } from '@/lib/utils';

export default function RecorrenciaOptions({
  frequenciaRecorrencia,
  onSelectFrequencia,
  temDataFim,
  onToggleTemDataFim,
  dataFimRecorrencia,
  onChangeDataFim,
}) {
  return (
    <div className="p-4 rounded-2xl border border-indigo-500/30 bg-indigo-500/5 space-y-3">
      <div className="space-y-1.5">
        <label className="block text-[11px] font-semibold uppercase tracking-wider text-foreground flex items-center gap-1.5">
          <Repeat className="w-3.5 h-3.5 text-indigo-400" />
          Frequência Periódica
        </label>
        <div className="grid grid-cols-4 gap-1.5">
          {Object.values(FREQUENCIA_RECORRENCIA).map((freq) => (
            <button
              key={freq}
              type="button"
              onClick={() => onSelectFrequencia(freq)}
              className={cn(
                'text-xs font-semibold py-1.5 rounded-lg border transition-all',
                frequenciaRecorrencia === freq
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                  : 'bg-secondary text-muted-foreground border-border hover:text-foreground',
              )}
            >
              {freq}
            </button>
          ))}
        </div>
      </div>

      {/* Data Limite Opcional */}
      <div className="pt-2 border-t border-indigo-500/20 space-y-2">
        <label className="flex items-center gap-2 cursor-pointer text-xs text-muted-foreground select-none">
          <input
            type="checkbox"
            checked={temDataFim}
            onChange={(e) => onToggleTemDataFim(e.target.checked)}
            className="rounded border-border text-primary focus:ring-primary h-4 w-4"
          />
          <span>Definir data limite de término (opcional)</span>
        </label>
        {temDataFim && (
          <Input
            type="date"
            value={dataFimRecorrencia}
            onChange={(e) => onChangeDataFim(e.target.value)}
            className="h-10 rounded-xl bg-secondary border-border text-xs"
          />
        )}
        <p className="text-[11px] text-muted-foreground/80">
          💡 Projeta automaticamente as faturas e lançamentos dos próximos 12 meses.
        </p>
      </div>
    </div>
  );
}
