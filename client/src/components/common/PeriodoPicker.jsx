import { useEffect, useRef, useState } from 'react';
import { useTema } from '../../contexts/ThemeContext';
import { formatDateOnly } from '../../utils/filterTransacoes';
import { formatPeriodoLabel } from '../../utils/formatters';

const MODOS = [
  { valor: 'mes', label: 'Este Mês' },
  { valor: 'dia', label: 'Dia Específico' },
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
    'px-3 py-2 rounded-lg border border-line bg-input-surface text-sm text-on-surface transition-colors focus:outline-none focus:border-primaria focus:ring-2 focus:ring-primaria/20';

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
      <div className={'flex gap-1.5 ' + (stacked ? 'flex-col' : '')}>
        {MODOS.map((modo) => (
          <button
            key={modo.valor}
            type="button"
            onClick={() => selecionarModo(modo.valor)}
            className={
              'px-3 py-1.5 rounded-lg text-xs uppercase tracking-wide transition-colors ' +
              (stacked ? 'text-left ' : '') +
              (filtroTipo === modo.valor
                ? 'bg-primaria text-white font-bold shadow'
                : 'bg-surface-variant text-on-surface-variant font-medium hover:text-primaria')
            }
          >
            {modo.label}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative flex flex-wrap items-center gap-2">
      {/* Mobile: botão que abre o popover */}
      <button
        type="button"
        onClick={() => setAberto(!aberto)}
        className="md:hidden flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-line shadow-card text-sm transition-colors"
        style={{ backgroundColor: 'var(--bg-card)' }}
      >
        <span className="text-on-surface-variant">Período:</span>
        <span className="font-mono font-semibold text-on-surface">{label}</span>
        <span
          className={
            'material-symbols-outlined text-base text-on-surface-variant transition-transform ' +
            (aberto ? 'rotate-180' : '')
          }
        >
          expand_more
        </span>
      </button>

      {/* Desktop: campo + controles inline */}
      <div className="hidden md:flex flex-wrap items-center gap-2">
        <span
          className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-line shadow-card text-sm"
          style={{ backgroundColor: 'var(--bg-card)' }}
        >
          <span className="text-on-surface-variant">Período:</span>
          <span className="font-mono font-semibold text-on-surface">{label}</span>
        </span>

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
          <>
            <input
              type="date"
              value={formatDateOnly(dataInicio)}
              max={formatDateOnly(dataFim)}
              onChange={(e) => alterarInicio(e.target.value)}
              className={inputClass}
              style={{ colorScheme }}
              aria-label="Data de início"
            />
            <span className="text-xs text-on-surface-variant">até</span>
            <input
              type="date"
              value={formatDateOnly(dataFim)}
              min={formatDateOnly(dataInicio)}
              onChange={(e) => alterarFim(e.target.value)}
              className={inputClass}
              style={{ colorScheme }}
              aria-label="Data de fim"
            />
          </>
        )}
      </div>

      {/* Mobile: popover */}
      {aberto && (
        <div
          className="md:hidden absolute right-0 top-full mt-2 z-40 w-72 p-4 rounded-xl border border-line shadow-card-hover"
          style={{ backgroundColor: 'var(--bg-card)' }}
        >
          <p className="flex items-center gap-2 mb-3 pb-3 border-b border-line/40">
            <span className="material-symbols-outlined text-base text-primaria">
              calendar_month
            </span>
            <span className="text-sm text-on-surface-variant">
              Período: <span className="font-mono font-semibold text-on-surface">{label}</span>
            </span>
          </p>

          {renderModos(true)}

          {filtroTipo === 'dia' && (
            <label className="block mt-3">
              <span className="block text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant mb-1.5">
                Dia
              </span>
              <input
                type="date"
                value={formatDateOnly(dataSelecionada)}
                onChange={(e) =>
                  setDataSelecionada(parseInputDate(e.target.value) ?? dataSelecionada)
                }
                className={inputClass + ' w-full'}
                style={{ colorScheme }}
              />
            </label>
          )}

          {filtroTipo === 'periodo' && (
            <div className="mt-3 flex flex-col gap-2.5">
              <label className="block">
                <span className="block text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant mb-1.5">
                  De
                </span>
                <input
                  type="date"
                  value={formatDateOnly(dataInicio)}
                  max={formatDateOnly(dataFim)}
                  onChange={(e) => alterarInicio(e.target.value)}
                  className={inputClass + ' w-full'}
                  style={{ colorScheme }}
                />
              </label>
              <label className="block">
                <span className="block text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant mb-1.5">
                  Até
                </span>
                <input
                  type="date"
                  value={formatDateOnly(dataFim)}
                  min={formatDateOnly(dataInicio)}
                  onChange={(e) => alterarFim(e.target.value)}
                  className={inputClass + ' w-full'}
                  style={{ colorScheme }}
                />
              </label>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
