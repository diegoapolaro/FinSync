import React from 'react';
import { ArrowLeft, ArrowRight, Calendar } from 'lucide-react';
import { Button } from '../ui/button';

export default function LancamentosDateHeader({
  dataSelecionada,
  setDataSelecionada,
  navegar,
  hojeStr,
  colorScheme,
}) {
  return (
    <div className="flex items-center justify-between gap-2 mb-6 bg-card px-4 md:px-5 py-2.5 rounded-2xl md:rounded-full border border-border/80 shadow-sm flex-wrap sm:flex-nowrap">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => navegar(-1)}
        className="text-xs font-semibold rounded-full hover:bg-muted"
      >
        <ArrowLeft className="w-4 h-4 mr-1.5" />
        Ontem
      </Button>

      <div className="flex items-center gap-2">
        <label
          htmlFor="data-navegacao-header"
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-secondary/80 border border-border cursor-pointer hover:bg-secondary transition-colors"
          title="Escolha uma data no calendário ou digite"
        >
          <Calendar className="w-3.5 h-3.5 text-primary" />
          <input
            id="data-navegacao-header"
            type="date"
            value={dataSelecionada}
            onChange={(e) => e.target.value && setDataSelecionada(e.target.value)}
            className="bg-transparent text-xs font-mono font-bold text-foreground focus:outline-none cursor-pointer"
            style={{ colorScheme }}
            aria-label="Selecionar data do lançamento"
          />
        </label>

        {dataSelecionada !== hojeStr && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setDataSelecionada(hojeStr)}
            className="h-7 px-2.5 text-[11px] font-semibold rounded-full border-primary/40 text-primary hover:bg-primary/10 transition-colors"
            title="Voltar para Hoje"
          >
            Hoje
          </Button>
        )}
      </div>

      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => navegar(1)}
        className="text-xs font-semibold rounded-full hover:bg-muted"
      >
        Amanhã
        <ArrowRight className="w-4 h-4 ml-1.5" />
      </Button>
    </div>
  );
}
