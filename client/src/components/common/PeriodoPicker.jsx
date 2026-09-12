import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  X,
  Check,
  RotateCcw,
} from 'lucide-react';
import { formatPeriodoLabel } from '../../utils/formatters';
import { Calendar } from '../ui/calendar';
import { Button } from '../ui/button';
import { cn } from '@/lib/utils';
import useI18n from '../../hooks/useI18n';

const NOMES_MESES = [
  'Jan',
  'Fev',
  'Mar',
  'Abr',
  'Mai',
  'Jun',
  'Jul',
  'Ago',
  'Set',
  'Out',
  'Nov',
  'Dez',
];

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
  const { t } = useI18n();
  const [aberto, setAberto] = useState(false);
  const containerRef = useRef(null);
  const popoverRef = useRef(null);

  // Ano para navegação na grade de meses
  const [anoNavegacao, setAnoNavegacao] = useState(() => {
    return (mesReferencia || new Date()).getFullYear();
  });

  // Estado local para rascunho de seleção de intervalo (evita travar quando o pai não limpa dataFim)
  const [rangeDraft, setRangeDraft] = useState(() => ({
    from: dataInicio || null,
    to: dataFim || null,
  }));

  // Sincronizar rascunho ao abrir o popover ou quando dataInicio/dataFim mudarem
  useEffect(() => {
    if (aberto) {
      setRangeDraft({
        from: dataInicio || null,
        to: dataFim || null,
      });
    }
  }, [aberto, dataInicio, dataFim]);

  const MODOS = useMemo(
    () => [
      { valor: 'mes', label: t('periodo_mes', 'Mês') },
      { valor: 'dia', label: t('periodo_dia', 'Dia') },
      { valor: 'periodo', label: t('periodo_periodo', 'Período') },
    ],
    [t],
  );

  // Fechar ao clicar fora ou pressionar ESC
  useEffect(() => {
    if (!aberto) return;

    function handleMouseDown(e) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target) &&
        popoverRef.current &&
        !popoverRef.current.contains(e.target)
      ) {
        setAberto(false);
      }
    }

    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        e.preventDefault();
        setAberto(false);
      }
    }

    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [aberto]);

  const label = formatPeriodoLabel(filtroTipo, dataSelecionada, dataInicio, dataFim, mesReferencia);

  // Presets Rápidos
  const aplicarPreset = (tipo) => {
    const hoje = new Date();
    hoje.setHours(12, 0, 0, 0);

    if (tipo === 'hoje') {
      setFiltroTipo('dia');
      setDataSelecionada(hoje);
      setAberto(false);
    } else if (tipo === 'ontem') {
      const ontem = new Date(hoje);
      ontem.setDate(ontem.getDate() - 1);
      setFiltroTipo('dia');
      setDataSelecionada(ontem);
      setAberto(false);
    } else if (tipo === '7dias') {
      const ini = new Date(hoje);
      ini.setDate(ini.getDate() - 6);
      setFiltroTipo('periodo');
      setDataInicio(ini);
      setDataFim(hoje);
      setRangeDraft({ from: ini, to: hoje });
      setAberto(false);
    } else if (tipo === '30dias') {
      const ini = new Date(hoje);
      ini.setDate(ini.getDate() - 29);
      setFiltroTipo('periodo');
      setDataInicio(ini);
      setDataFim(hoje);
      setRangeDraft({ from: ini, to: hoje });
      setAberto(false);
    } else if (tipo === 'esteMes') {
      setFiltroTipo('mes');
      setAberto(false);
    } else if (tipo === 'mesPassado') {
      const ini = new Date(hoje.getFullYear(), hoje.getMonth() - 1, 1, 12, 0, 0);
      const fim = new Date(hoje.getFullYear(), hoje.getMonth(), 0, 12, 0, 0);
      setFiltroTipo('periodo');
      setDataInicio(ini);
      setDataFim(fim);
      setRangeDraft({ from: ini, to: fim });
      setAberto(false);
    } else if (tipo === 'esteAno') {
      const ini = new Date(hoje.getFullYear(), 0, 1, 12, 0, 0);
      const fim = new Date(hoje.getFullYear(), 11, 31, 12, 0, 0);
      setFiltroTipo('periodo');
      setDataInicio(ini);
      setDataFim(fim);
      setRangeDraft({ from: ini, to: fim });
      setAberto(false);
    }
  };

  // Selecionar mês específico na grade de 12 meses
  const selecionarMes = (mesIndex) => {
    const ini = new Date(anoNavegacao, mesIndex, 1, 12, 0, 0);
    const fim = new Date(anoNavegacao, mesIndex + 1, 0, 12, 0, 0);

    const agora = new Date();
    const isMesAtual = agora.getFullYear() === anoNavegacao && agora.getMonth() === mesIndex;

    if (isMesAtual) {
      setFiltroTipo('mes');
    } else {
      setFiltroTipo('periodo');
      setDataInicio(ini);
      setDataFim(fim);
      setRangeDraft({ from: ini, to: fim });
    }
    setAberto(false);
  };

  // Tag do modo ativo
  const modoLabel = useMemo(() => {
    if (filtroTipo === 'dia') return 'Dia';
    if (filtroTipo === 'periodo') return 'Período';
    return 'Mês';
  }, [filtroTipo]);

  // Contagem de dias no modo período
  const diasPeriodo = useMemo(() => {
    if (filtroTipo !== 'periodo') return null;
    const from = rangeDraft.from || dataInicio;
    const to = rangeDraft.to || dataFim;
    if (!from || !to) return null;
    const diff = Math.round((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(1, diff + 1);
  }, [filtroTipo, rangeDraft.from, rangeDraft.to, dataInicio, dataFim]);

  const handleConcluir = () => {
    if (filtroTipo === 'periodo') {
      if (rangeDraft.from && rangeDraft.to) {
        setDataInicio(rangeDraft.from);
        setDataFim(rangeDraft.to);
      } else if (rangeDraft.from && !rangeDraft.to) {
        setDataInicio(rangeDraft.from);
        setDataFim(rangeDraft.from);
      }
    }
    setAberto(false);
  };

  return (
    <div ref={containerRef} className="relative inline-block text-left">
      {/* Botão Gatilho (Fintech Pill) */}
      <button
        type="button"
        onClick={() => setAberto(!aberto)}
        aria-haspopup="dialog"
        aria-expanded={aberto}
        aria-label={`Selecionar período. Atual: ${label}`}
        className={cn(
          'group flex items-center gap-2.5 h-10 px-3.5 rounded-full border transition-all duration-200 select-none shadow-sm',
          'bg-card hover:bg-muted/70 active:scale-[0.98]',
          aberto
            ? 'border-primary ring-2 ring-primary/20 shadow-glow-blue/20'
            : 'border-border/80 hover:border-primary/50',
        )}
      >
        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
          <CalendarIcon className="w-3.5 h-3.5" />
        </div>

        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-secondary text-muted-foreground border border-border/60">
          {modoLabel}
        </span>

        <span className="font-mono text-xs font-semibold text-foreground tracking-tight">
          {label}
        </span>

        <ChevronDown
          className={cn(
            'w-3.5 h-3.5 text-muted-foreground transition-transform duration-200 ml-0.5',
            aberto && 'rotate-180 text-primary',
          )}
        />
      </button>

      {/* Popover / Sheet Flutuante */}
      {aberto && (
        <>
          {/* Backdrop no mobile para foco visual e toque */}
          <div
            className="sm:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-xs animate-in fade-in-0 duration-150"
            onClick={() => setAberto(false)}
            aria-hidden="true"
          />

          <div
            ref={popoverRef}
            role="dialog"
            aria-modal="true"
            aria-label="Painel de seleção de datas"
            className={cn(
              'z-50 rounded-3xl border border-border/80 bg-card/95 backdrop-blur-xl p-4 shadow-2xl text-card-foreground',
              'animate-in fade-in-0 zoom-in-95 duration-150',
              // Mobile: centralizado na base da tela ou modal
              'fixed bottom-4 left-4 right-4 max-w-sm mx-auto sm:static sm:absolute sm:right-0 sm:left-auto sm:bottom-auto sm:top-full sm:mt-2 sm:max-w-none sm:w-[350px]',
            )}
          >
            {/* Header do Popover */}
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-border/60">
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary">
                  <CalendarIcon className="w-3.5 h-3.5" />
                </div>
                <h3 className="text-xs font-bold text-foreground tracking-tight">
                  Selecionar Período
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setAberto(false)}
                className="flex items-center justify-center h-7 w-7 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                title="Fechar"
                aria-label="Fechar selecionador"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Segmented Control de Modos (Mês / Dia / Período) */}
            <div className="grid grid-cols-3 gap-1 p-1 bg-secondary rounded-2xl border border-border/60 mb-3">
              {MODOS.map((modo) => {
                const ativo = filtroTipo === modo.valor;
                return (
                  <button
                    key={modo.valor}
                    type="button"
                    onClick={() => setFiltroTipo(modo.valor)}
                    className={cn(
                      'py-1.5 px-3 rounded-xl text-xs font-semibold transition-all duration-150 text-center',
                      ativo
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/50',
                    )}
                  >
                    {modo.label}
                  </button>
                );
              })}
            </div>

            {/* Atalhos Rápidos (Presets) */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-3 scrollbar-none text-[11px]">
              <span className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground uppercase tracking-wider mr-1 shrink-0">
                <Sparkles className="w-3 h-3 text-primary" />
                Atalhos:
              </span>
              <button
                type="button"
                onClick={() => aplicarPreset('hoje')}
                className="px-2.5 py-1 rounded-full bg-secondary hover:bg-primary/10 hover:text-primary border border-border/60 font-medium whitespace-nowrap transition-colors"
              >
                Hoje
              </button>
              <button
                type="button"
                onClick={() => aplicarPreset('ontem')}
                className="px-2.5 py-1 rounded-full bg-secondary hover:bg-primary/10 hover:text-primary border border-border/60 font-medium whitespace-nowrap transition-colors"
              >
                Ontem
              </button>
              <button
                type="button"
                onClick={() => aplicarPreset('7dias')}
                className="px-2.5 py-1 rounded-full bg-secondary hover:bg-primary/10 hover:text-primary border border-border/60 font-medium whitespace-nowrap transition-colors"
              >
                7 dias
              </button>
              <button
                type="button"
                onClick={() => aplicarPreset('30dias')}
                className="px-2.5 py-1 rounded-full bg-secondary hover:bg-primary/10 hover:text-primary border border-border/60 font-medium whitespace-nowrap transition-colors"
              >
                30 dias
              </button>
              <button
                type="button"
                onClick={() => aplicarPreset('esteMes')}
                className="px-2.5 py-1 rounded-full bg-secondary hover:bg-primary/10 hover:text-primary border border-border/60 font-medium whitespace-nowrap transition-colors"
              >
                Este Mês
              </button>
              <button
                type="button"
                onClick={() => aplicarPreset('mesPassado')}
                className="px-2.5 py-1 rounded-full bg-secondary hover:bg-primary/10 hover:text-primary border border-border/60 font-medium whitespace-nowrap transition-colors"
              >
                Mês Passado
              </button>
            </div>

            {/* Conteúdo Principal de Acordo com o Modo */}
            <div className="flex justify-center bg-background/50 rounded-2xl border border-border/40 p-1 mb-3">
              {/* MODO MÊS: Grade Visual de 12 Meses */}
              {filtroTipo === 'mes' && (
                <div className="w-full p-2">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-border/40">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Ano: <strong className="text-foreground font-mono">{anoNavegacao}</strong>
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setAnoNavegacao((a) => a - 1)}
                        className="h-7 w-7 flex items-center justify-center rounded-lg border border-border bg-secondary text-foreground hover:bg-muted transition-colors"
                        title="Ano anterior"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setAnoNavegacao((a) => a + 1)}
                        className="h-7 w-7 flex items-center justify-center rounded-lg border border-border bg-secondary text-foreground hover:bg-muted transition-colors"
                        title="Próximo ano"
                      >
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    {NOMES_MESES.map((nome, idx) => {
                      const agora = new Date();
                      const ehMesAtual =
                        agora.getFullYear() === anoNavegacao && agora.getMonth() === idx;
                      const ehReferencia =
                        (mesReferencia || agora).getFullYear() === anoNavegacao &&
                        (mesReferencia || agora).getMonth() === idx;

                      return (
                        <button
                          key={nome}
                          type="button"
                          onClick={() => selecionarMes(idx)}
                          className={cn(
                            'py-2 rounded-xl text-xs font-semibold transition-all duration-150 flex flex-col items-center justify-center gap-0.5',
                            ehReferencia
                              ? 'bg-primary text-primary-foreground font-bold shadow-glow-blue scale-[1.02]'
                              : 'bg-secondary/60 hover:bg-secondary text-foreground',
                            ehMesAtual && !ehReferencia && 'ring-1.5 ring-primary/60',
                          )}
                        >
                          <span>{nome}</span>
                          {ehMesAtual && (
                            <span className="text-[9px] uppercase tracking-tighter opacity-70">
                              Atual
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* MODO DIA: Calendário de Seleção Pontual */}
              {filtroTipo === 'dia' && (
                <Calendar
                  mode="single"
                  selected={dataSelecionada}
                  onSelect={(d) => {
                    setDataSelecionada(d);
                    setAberto(false);
                  }}
                  className="w-full"
                />
              )}

              {/* MODO PERÍODO: Calendário de Intervalo (Range) */}
              {filtroTipo === 'periodo' && (
                <div className="w-full flex flex-col items-center">
                  {/* Banner de status De e Até com ação de Limpar */}
                  <div className="w-full flex items-center justify-between gap-1.5 px-2.5 py-1.5 mb-2 bg-secondary/60 rounded-xl border border-border/50 text-[11px] font-mono">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span
                        className={cn(
                          'px-2 py-0.5 rounded-lg border text-[11px]',
                          rangeDraft.from
                            ? 'bg-primary/10 text-primary border-primary/30 font-bold'
                            : 'text-muted-foreground border-border/40',
                        )}
                      >
                        De: {rangeDraft.from ? rangeDraft.from.toLocaleDateString('pt-BR') : 'Selecione'}
                      </span>
                      <span className="text-muted-foreground">&rarr;</span>
                      <span
                        className={cn(
                          'px-2 py-0.5 rounded-lg border text-[11px]',
                          rangeDraft.to
                            ? 'bg-primary/10 text-primary border-primary/30 font-bold'
                            : 'text-muted-foreground border-border/40',
                        )}
                      >
                        Até: {rangeDraft.to ? rangeDraft.to.toLocaleDateString('pt-BR') : 'Selecione'}
                      </span>
                    </div>

                    {(rangeDraft.from || rangeDraft.to) && (
                      <button
                        type="button"
                        onClick={() => setRangeDraft({ from: null, to: null })}
                        aria-label="Limpar seleção atual"
                        className="flex items-center gap-1 text-[10px] font-semibold text-muted-foreground hover:text-destructive transition-colors px-1.5 py-0.5 rounded-md hover:bg-muted/80 ml-auto shrink-0"
                        title="Limpar seleção atual"
                      >
                        <RotateCcw className="w-2.5 h-2.5" />
                        Limpar
                      </button>
                    )}
                  </div>

                  <Calendar
                    mode="range"
                    selected={rangeDraft}
                    onSelect={({ from, to }) => {
                      setRangeDraft({ from, to });
                      if (from && to) {
                        setDataInicio(from);
                        setDataFim(to);
                      }
                    }}
                    className="w-full"
                  />

                  {/* Dica contextual de uso */}
                  <div className="text-[11px] text-center text-muted-foreground mt-1 mb-1 font-medium select-none">
                    {!rangeDraft.from && '👉 Clique em um dia para definir a data inicial'}
                    {rangeDraft.from && !rangeDraft.to && '👉 Clique na data final (ou clique no mesmo dia para desmarcar)'}
                    {rangeDraft.from && rangeDraft.to && '✅ Intervalo selecionado! Clique em Concluir para fechar'}
                  </div>
                </div>
              )}
            </div>

            {/* Rodapé Informativo e Ações */}
            <div className="flex items-center justify-between pt-2 border-t border-border/60 gap-2">
              <div className="flex flex-col text-[11px] font-mono text-muted-foreground truncate">
                <span className="truncate text-foreground font-semibold">
                  {label}
                </span>
                {diasPeriodo && (
                  <span className="text-[10px] text-primary font-medium">
                    {diasPeriodo} {diasPeriodo === 1 ? 'dia' : 'dias'} selecionados
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => aplicarPreset('hoje')}
                  className="h-8 px-2.5 text-[11px] font-semibold rounded-full text-muted-foreground hover:text-foreground"
                  title="Voltar para Hoje"
                >
                  <RotateCcw className="w-3 h-3 mr-1" />
                  Hoje
                </Button>

                <Button
                  type="button"
                  variant="default"
                  size="sm"
                  onClick={handleConcluir}
                  className="h-8 px-4 text-xs font-semibold rounded-full shadow-glow-blue"
                >
                  <Check className="w-3.5 h-3.5 mr-1" />
                  Concluir
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
