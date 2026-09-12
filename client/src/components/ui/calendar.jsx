import * as React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const MESES = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
];

const DIAS_SEMANA = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

function isSameDay(d1, d2) {
  if (!d1 || !d2) return false;
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

function normalizeDate(d) {
  if (!d) return null;
  const date = typeof d === 'string' ? new Date(d.includes('T') ? d : `${d}T12:00:00`) : new Date(d);
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0, 0);
}

export function Calendar({
  mode = 'single',
  selected,
  onSelect,
  month: controlledMonth,
  onMonthChange,
  minDate,
  maxDate,
  className,
}) {
  const initialDate = React.useMemo(() => {
    if (controlledMonth) return normalizeDate(controlledMonth);
    if (mode === 'single' && selected) return normalizeDate(selected);
    if (mode === 'range' && selected?.from) return normalizeDate(selected.from);
    return normalizeDate(new Date());
  }, [controlledMonth, mode, selected]);

  const [currentMonth, setCurrentMonth] = React.useState(
    () => new Date(initialDate.getFullYear(), initialDate.getMonth(), 1, 12, 0, 0),
  );

  const [hoveredDate, setHoveredDate] = React.useState(null);

  React.useEffect(() => {
    if (controlledMonth) {
      setCurrentMonth(new Date(controlledMonth.getFullYear(), controlledMonth.getMonth(), 1, 12, 0, 0));
    }
  }, [controlledMonth]);

  const changeMonth = (delta) => {
    const next = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + delta, 1, 12, 0, 0);
    setCurrentMonth(next);
    onMonthChange?.(next);
  };

  const hoje = React.useMemo(() => normalizeDate(new Date()), []);
  const min = minDate ? normalizeDate(minDate) : null;
  const max = maxDate ? normalizeDate(maxDate) : null;

  const normalizedSelected = React.useMemo(() => {
    if (mode === 'single') {
      return normalizeDate(selected);
    }
    if (mode === 'range') {
      return {
        from: normalizeDate(selected?.from),
        to: normalizeDate(selected?.to),
      };
    }
    return null;
  }, [mode, selected]);

  // Dias a exibir na grade do mês
  const calendarDays = React.useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const firstDayIndex = new Date(year, month, 1).getDay(); // 0 (Dom) a 6 (Sáb)
    const daysInCurrentMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const days = [];

    // Dias do mês anterior para preencher a primeira semana
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const d = new Date(year, month - 1, daysInPrevMonth - i, 12, 0, 0);
      days.push({ date: d, isCurrentMonth: false });
    }

    // Dias do mês atual
    for (let i = 1; i <= daysInCurrentMonth; i++) {
      const d = new Date(year, month, i, 12, 0, 0);
      days.push({ date: d, isCurrentMonth: true });
    }

    // Dias do próximo mês para completar 42 células (6 semanas x 7 dias)
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      const d = new Date(year, month + 1, i, 12, 0, 0);
      days.push({ date: d, isCurrentMonth: false });
    }

    return days;
  }, [currentMonth]);

  const handleDayClick = (dayDate) => {
    if (min && dayDate < min) return;
    if (max && dayDate > max) return;

    if (mode === 'single') {
      onSelect?.(dayDate);
      return;
    }

    if (mode === 'range') {
      const { from, to } = normalizedSelected || {};

      // 1. Se já tem 'from' selecionado e 'to' ainda não foi definido:
      if (from && !to) {
        // Se clicar novamente no mesmo dia: desmarca a seleção (evita ficar preso!)
        if (isSameDay(dayDate, from)) {
          onSelect?.({ from: null, to: null });
          return;
        }

        // Se clicar em uma data anterior a 'from': reinicia o início com a nova data
        if (dayDate < from) {
          onSelect?.({ from: dayDate, to: null });
          return;
        }

        // Se clicar em data posterior: define o fim do intervalo
        onSelect?.({ from, to: dayDate });
        return;
      }

      // 2. Se não há seleção, ou se o intervalo já estava completo:
      // Inicia novo intervalo
      onSelect?.({ from: dayDate, to: null });
    }
  };

  const anoAtual = currentMonth.getFullYear();
  const mesAtualNome = MESES[currentMonth.getMonth()];

  return (
    <div className={cn('p-3 select-none w-[280px] sm:w-[310px]', className)}>
      {/* Header com Mês, Ano e Navegação */}
      <div className="flex items-center justify-between gap-2 pb-3 mb-2 border-b border-border/60">
        <div className="flex flex-col">
          <span className="text-sm font-bold tracking-tight text-foreground capitalize">
            {mesAtualNome}
          </span>
          <span className="text-[11px] font-mono text-muted-foreground">{anoAtual}</span>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => changeMonth(-1)}
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-border/80 bg-secondary/50 text-foreground transition-all hover:bg-secondary hover:text-foreground hover:border-border active:scale-95"
            title="Mês anterior"
            aria-label="Mês anterior"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => changeMonth(1)}
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-border/80 bg-secondary/50 text-foreground transition-all hover:bg-secondary hover:text-foreground hover:border-border active:scale-95"
            title="Próximo mês"
            aria-label="Próximo mês"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Cabeçalho dos Dias da Semana */}
      <div className="grid grid-cols-7 gap-1 text-center mb-1.5">
        {DIAS_SEMANA.map((dia) => (
          <div
            key={dia}
            className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider h-6 flex items-center justify-center"
          >
            {dia}
          </div>
        ))}
      </div>

      {/* Grade de Dias */}
      <div className="grid grid-cols-7 gap-y-1 text-center">
        {calendarDays.map(({ date, isCurrentMonth }, idx) => {
          const isDisabled = (min && date < min) || (max && date > max);
          const isCurrentToday = isSameDay(date, hoje);

          let isSelected = false;
          let isRangeStart = false;
          let isRangeEnd = false;
          let isInRange = false;
          let isHoveredInRange = false;

          if (mode === 'single') {
            isSelected = isSameDay(date, normalizedSelected);
          } else if (mode === 'range') {
            const from = normalizedSelected?.from;
            const to = normalizedSelected?.to;

            isRangeStart = isSameDay(date, from);
            isRangeEnd = isSameDay(date, to);
            isSelected = isRangeStart || isRangeEnd;

            if (from && to) {
              isInRange = date > from && date < to;
            } else if (from && !to && hoveredDate) {
              const start = from < hoveredDate ? from : hoveredDate;
              const end = from < hoveredDate ? hoveredDate : from;
              isHoveredInRange = date >= start && date <= end && !isRangeStart;
            }
          }

          return (
            <div
              key={idx}
              className={cn(
                'relative flex items-center justify-center h-9 p-0',
                isInRange && 'bg-primary/15 dark:bg-primary/20',
                isHoveredInRange && 'bg-primary/10 dark:bg-primary/15',
                isRangeStart && normalizedSelected?.to && 'rounded-l-xl bg-primary/15 dark:bg-primary/20',
                isRangeEnd && 'rounded-r-xl bg-primary/15 dark:bg-primary/20',
              )}
            >
              <button
                type="button"
                disabled={isDisabled}
                onClick={() => handleDayClick(date)}
                onMouseEnter={() => mode === 'range' && setHoveredDate(date)}
                onMouseLeave={() => mode === 'range' && setHoveredDate(null)}
                className={cn(
                  'relative h-8 w-8 text-xs font-mono font-medium transition-all duration-150 flex items-center justify-center rounded-xl',
                  // Mês atual vs fora
                  isCurrentMonth ? 'text-foreground' : 'text-muted-foreground/40 font-normal',
                  // Hover comum
                  !isSelected && !isInRange && !isDisabled && 'hover:bg-muted hover:text-foreground',
                  // Selecionado
                  isSelected &&
                    'bg-primary text-primary-foreground font-bold shadow-glow-blue scale-105 z-10',
                  // Intervalo
                  isInRange && 'text-primary font-semibold',
                  // Hoje
                  isCurrentToday && !isSelected && 'ring-1.5 ring-primary/60 font-bold',
                  // Desabilitado
                  isDisabled && 'opacity-30 cursor-not-allowed',
                )}
                aria-label={date.toLocaleDateString('pt-BR')}
                aria-selected={isSelected || isInRange}
              >
                {date.getDate()}

                {/* Indicador sutil de hoje quando não selecionado */}
                {isCurrentToday && !isSelected && (
                  <span className="absolute bottom-1 w-1 h-1 rounded-full bg-primary" />
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
