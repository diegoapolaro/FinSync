import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Calendar as CalendarIcon, ChevronDown } from 'lucide-react';
import { Button } from '../ui/button';
import { Calendar } from '../ui/calendar';
import { formatDateOnly } from '../../utils/filterTransacoes';
import { formatDisplayDate } from '../../utils/formatters';
import { cn } from '@/lib/utils';

export default function LancamentosDateHeader({
  dataSelecionada,
  setDataSelecionada,
  navegar,
  hojeStr,
  colorScheme,
}) {
  const [aberto, setAberto] = useState(false);
  const containerRef = useRef(null);
  const popoverRef = useRef(null);

  useEffect(() => {
    if (!aberto) return;

    function handleOutside(e) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target) &&
        popoverRef.current &&
        !popoverRef.current.contains(e.target)
      ) {
        setAberto(false);
      }
    }

    function handleEsc(e) {
      if (e.key === 'Escape') setAberto(false);
    }

    document.addEventListener('mousedown', handleOutside);
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('keydown', handleEsc);
    };
  }, [aberto]);

  const dateObj = React.useMemo(() => {
    if (!dataSelecionada) return new Date();
    return new Date(`${dataSelecionada}T12:00:00`);
  }, [dataSelecionada]);

  const dataFormatada = formatDisplayDate(dataSelecionada);

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

      <div className="flex items-center gap-2 relative" ref={containerRef}>
        {/* Gatilho interativo do calendário Shadcn */}
        <button
          type="button"
          onClick={() => setAberto(!aberto)}
          className={cn(
            'flex items-center gap-2 px-3.5 py-1.5 rounded-xl border transition-all duration-200 select-none shadow-sm',
            'bg-secondary/80 hover:bg-secondary text-foreground',
            aberto
              ? 'border-primary ring-2 ring-primary/20 shadow-glow-blue/20'
              : 'border-border hover:border-primary/50',
          )}
          title="Escolha uma data no calendário"
        >
          <CalendarIcon className="w-3.5 h-3.5 text-primary" />
          <span className="text-xs font-mono font-bold tracking-tight">
            {dataFormatada}
          </span>
          <ChevronDown
            className={cn(
              'w-3.5 h-3.5 text-muted-foreground transition-transform duration-200',
              aberto && 'rotate-180 text-primary',
            )}
          />
        </button>

        {/* Input oculto acessível para compatibilidade com testes e automação */}
        <input
          id="data-navegacao-header"
          type="date"
          value={dataSelecionada}
          onChange={(e) => e.target.value && setDataSelecionada(e.target.value)}
          className="sr-only"
          style={{ colorScheme }}
          aria-label="Selecionar data do lançamento"
        />

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

        {/* Popover flutuante do Calendário Shadcn */}
        {aberto && (
          <>
            <div
              className="sm:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-xs animate-in fade-in-0 duration-150"
              onClick={() => setAberto(false)}
              aria-hidden="true"
            />

            <div
              ref={popoverRef}
              role="dialog"
              aria-modal="true"
              aria-label="Calendário de navegação"
              className={cn(
                'z-50 rounded-3xl border border-border/80 bg-card/95 backdrop-blur-xl p-3 shadow-2xl text-card-foreground',
                'animate-in fade-in-0 zoom-in-95 duration-150',
                'fixed bottom-4 left-4 right-4 max-w-xs mx-auto sm:static sm:absolute sm:left-1/2 sm:-translate-x-1/2 sm:top-full sm:mt-2 sm:max-w-none sm:w-[300px]',
              )}
            >
              <Calendar
                mode="single"
                selected={dateObj}
                onSelect={(d) => {
                  if (d) {
                    setDataSelecionada(formatDateOnly(d));
                    setAberto(false);
                  }
                }}
                className="w-full p-1"
              />
            </div>
          </>
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
