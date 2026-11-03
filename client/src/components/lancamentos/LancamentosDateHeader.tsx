import React, { useEffect, useRef, useState } from 'react';
import { Calendar as CalendarIcon, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../ui/button';
import { Calendar } from '../ui/calendar';
import { formatDateOnly } from '../../utils/filterTransacoes';
import { formatDisplayDate } from '../../utils/formatters';
import { cn } from '@/lib/utils';

interface Props {
  dataSelecionada: string;
  setDataSelecionada: (data: string) => void;
  navegar: (dias: number) => void;
  hojeStr: string;
  colorScheme?: 'light' | 'dark';
}

export default function LancamentosDateHeader({
  dataSelecionada,
  setDataSelecionada,
  navegar,
  hojeStr,
  colorScheme,
}: Props): React.ReactElement {
  const [aberto, setAberto] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!aberto) return;

    function handleOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node) &&
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node)
      ) {
        setAberto(false);
      }
    }

    function handleEsc(e: KeyboardEvent) {
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
  const isHoje = dataSelecionada === hojeStr;

  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 pb-2">
      {/* 1. Contexto & Título Wise */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-lime-voltage animate-pulse" />
          <span className="text-[11px] font-bold uppercase tracking-wider text-forest-ink dark:text-lime-voltage">
            Fluxo Operacional Diário
          </span>
          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-linen-mist text-forest-ink dark:bg-spruce dark:text-lime-voltage border border-forest-ink/10">
            {dataFormatada}
          </span>
        </div>
        <h1 className="text-3xl lg:text-4xl font-black tracking-tight text-forest-ink dark:text-paper font-sans">
          Novo Registro Financeiro
        </h1>
        <p className="text-sm text-charcoal dark:text-pebble max-w-xl">
          Cadastre entradas e saídas com categorização ágil, conciliação e comprovantes.
        </p>
      </div>

      {/* 2. Barra Pílula de Navegação Rápida (Wise Pill Switcher) */}
      <div className="flex items-center gap-1 p-1 bg-fog dark:bg-card border border-pebble/20 rounded-full self-start md:self-auto shadow-xs">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => navegar(-1)}
          className="h-9 px-4 rounded-full text-xs font-bold text-charcoal dark:text-pebble hover:text-forest-ink dark:hover:text-paper hover:bg-paper dark:hover:bg-spruce transition-all"
        >
          <ChevronLeft className="w-3.5 h-3.5 mr-1" />
          Ontem
        </Button>

        <button
          type="button"
          onClick={() => setDataSelecionada(hojeStr)}
          className={cn(
            'h-9 px-4 rounded-full text-xs font-bold transition-all flex items-center gap-1.5',
            isHoje
              ? 'bg-forest-ink text-lime-voltage dark:bg-lime-voltage dark:text-forest-ink shadow-sm'
              : 'text-charcoal dark:text-pebble hover:text-forest-ink dark:hover:text-paper hover:bg-paper dark:hover:bg-spruce',
          )}
        >
          <CalendarIcon className="w-3.5 h-3.5" />
          <span>Hoje</span>
        </button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => navegar(1)}
          className="h-9 px-4 rounded-full text-xs font-bold text-charcoal dark:text-pebble hover:text-forest-ink dark:hover:text-paper hover:bg-paper dark:hover:bg-spruce transition-all"
        >
          Amanhã
          <ChevronRight className="w-3.5 h-3.5 ml-1" />
        </Button>

        <div className="h-4 w-px bg-pebble/30 mx-0.5" />

        {/* Gatilho interativo do calendário */}
        <div className="relative" ref={containerRef}>
          <button
            type="button"
            onClick={() => setAberto(!aberto)}
            className={cn(
              'h-9 px-3 rounded-full text-xs font-bold transition-all flex items-center gap-1.5',
              aberto
                ? 'bg-forest-ink text-lime-voltage dark:bg-lime-voltage dark:text-forest-ink shadow-xs'
                : 'text-charcoal dark:text-pebble hover:bg-paper dark:hover:bg-spruce hover:text-forest-ink dark:hover:text-paper',
            )}
            title="Escolher data customizada"
          >
            <CalendarIcon className="w-3.5 h-3.5" />
            <ChevronDown
              className={cn(
                'w-3.5 h-3.5 transition-transform duration-200',
                aberto && 'rotate-180',
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
            style={{ colorScheme } as React.CSSProperties}
            aria-label="Selecionar data do lançamento"
          />

          {!isHoje && (
            <button
              type="button"
              onClick={() => setDataSelecionada(hojeStr)}
              className="sr-only"
              title="Voltar para Hoje"
            >
              Voltar para Hoje
            </button>
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
                  'z-50 rounded-[24px] border border-pebble/30 bg-paper dark:bg-spruce p-3 shadow-2xl text-forest-ink dark:text-paper',
                  'animate-in fade-in-0 zoom-in-95 duration-150',
                  'fixed bottom-4 left-4 right-4 max-w-xs mx-auto sm:static sm:absolute sm:right-0 sm:top-full sm:mt-2 sm:max-w-none sm:w-[300px]',
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
      </div>
    </div>
  );
}
