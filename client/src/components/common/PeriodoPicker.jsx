import { useEffect, useRef, useState } from 'react';
import { Calendar, ChevronDown } from 'lucide-react';
import { useTema } from '../../contexts/ThemeContext';
import { formatDateOnly } from '../../utils/filterTransacoes';
import { formatPeriodoLabel } from '../../utils/formatters';
import { cn } from '@/lib/utils';

const MODOS = [
  { valor: 'mes', label: 'Este Mês' },
  { valor: 'dia', label: 'Dia' },
  { valor: 'periodo', label: 'Período' },
];

function parseInputDate(value) {
  if (!value) return null;
  return new Date(value + 'T12:00:00');
}

export default function PeriodoPicker({
  filtroTipo,
  setFiltroTipo,
  dataSelecionada,
  setDataSelecionada,
  dataInicio,
  setDataInicio,
  dataFim,
  setDataFim,
  mesReferencia,
}) {
  const { tema } = useTema();
  const [aberto, setAberto] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!aberto) return;
    function aoClicarFora(evento) {
      if (containerRef.current && !containerRef.current.contains(evento.target)) {
        setAberto(false);
      }
    }
    document.addEventListener('mousedown', aoClicarFora);
    return () => document.removeEventListener('mousedown', aoClicarFora);
  }, [aberto]);

  const label = formatPeriodoLabel(filtroTipo, dataSelecionada, dataInicio, dataFim, mesReferencia);
  const colorScheme = tema === 'escuro' ? 'dark' : 'light';

  const inputClass =
    'h-10 px-3 py-1.5 rounded-xl border border-input bg-background text-xs font-mono text-foreground focus:outline-none focus:ring-2 focus:ring-primary shadow-sm';

  function selecionarModo(modo) {
    setFiltroTipo(modo);
    if (modo === 'mes') setAberto(false);
  }

  function alterarInicio(valor) {
    const nova = parseInputDate(valor);
    if (!nova) return;
    setDataInicio(nova);
    if (nova > dataFim) setDataFim(nova);
  }

  function alterarFim(valor) {
    const nova = parseInputDate(valor);
    if (!nova) return;
    setDataFim(nova);
    if (nova < dataInicio) setDataInicio(nova);
  }

  function renderModos(stacked = false) {
    return (
      <div
        className={cn(
          'inline-flex p-1 rounded-full bg-surface-strong border border-border/80',
          stacked ? 'flex-col gap-1 w-full rounded-2xl' : 'gap-1',
        )}
      >
        {MODOS.map((modo) => {
          const active = filtroTipo === modo.valor;
          return (
            <button
              key={modo.valor}
              type="button"
              onClick={() => selecionarModo(modo.valor)}
              className={cn(
                'px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200',
                stacked ? 'text-left py-2 rounded-xl' : '',
                active
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/70',
              )}
            >
              {modo.label}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative flex flex-wrap items-center gap-2">
      {/* Mobile: trigger button */}
      <button
        type="button"
        onClick={() => setAberto(!aberto)}
        className="md:hidden flex items-center gap-2 px-3 py-2 rounded-xl border border-input bg-background shadow-sm text-xs font-medium text-foreground hover:bg-muted transition-colors"
      >
        <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
        <span className="font-mono font-semibold">{label}</span>
        <ChevronDown
          className={cn(
            'w-3.5 h-3.5 text-muted-foreground transition-transform',
            aberto && 'rotate-180',
          )}
        />
      </button>

      {/* Desktop: inline controls */}
      <div className="hidden md:flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-input bg-background shadow-sm text-xs h-10">
          <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="font-mono font-semibold text-foreground">{label}</span>
        </div>

        {renderModos()}

        {filtroTipo === 'dia' && (
          <input
            type="date"
            value={formatDateOnly(dataSelecionada)}
            onChange={(e) => setDataSelecionada(parseInputDate(e.target.value) ?? dataSelecionada)}
            className={inputClass}
            style={{ colorScheme }}
          />
        )}

        {filtroTipo === 'periodo' && (
          <div className="flex items-center gap-1.5">
            <input
              type="date"
              value={formatDateOnly(dataInicio)}
              max={formatDateOnly(dataFim)}
              onChange={(e) => alterarInicio(e.target.value)}
              className={inputClass}
              style={{ colorScheme }}
              aria-label="Data de início"
            />
            <span className="text-xs text-muted-foreground font-medium">até</span>
            <input
              type="date"
              value={formatDateOnly(dataFim)}
              min={formatDateOnly(dataInicio)}
              onChange={(e) => alterarFim(e.target.value)}
              className={inputClass}
              style={{ colorScheme }}
              aria-label="Data de fim"
            />
          </div>
        )}
      </div>

      {/* Mobile: popover */}
      {aberto && (
        <div className="md:hidden absolute right-0 top-full mt-2 z-40 w-72 p-4 rounded-2xl border bg-card shadow-card animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center gap-2 pb-3 mb-3 border-b border-border/50">
            <Calendar className="w-4 h-4 text-primary" />
            <span className="text-xs font-semibold text-foreground">
              Período: <span className="font-mono">{label}</span>
            </span>
          </div>

          {renderModos(true)}

          {filtroTipo === 'dia' && (
            <div className="mt-3">
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                Selecione o Dia
              </label>
              <input
                type="date"
                value={formatDateOnly(dataSelecionada)}
                onChange={(e) =>
                  setDataSelecionada(parseInputDate(e.target.value) ?? dataSelecionada)
                }
                className={inputClass + ' w-full'}
                style={{ colorScheme }}
              />
            </div>
          )}

          {filtroTipo === 'periodo' && (
            <div className="mt-3 space-y-2">
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                  De
                </label>
                <input
                  type="date"
                  value={formatDateOnly(dataInicio)}
                  max={formatDateOnly(dataFim)}
                  onChange={(e) => alterarInicio(e.target.value)}
                  className={inputClass + ' w-full'}
                  style={{ colorScheme }}
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                  Até
                </label>
                <input
                  type="date"
                  value={formatDateOnly(dataFim)}
                  min={formatDateOnly(dataInicio)}
                  onChange={(e) => alterarFim(e.target.value)}
                  className={inputClass + ' w-full'}
                  style={{ colorScheme }}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
