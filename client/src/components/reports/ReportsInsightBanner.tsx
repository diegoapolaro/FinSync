import React from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '../ui/button';

interface ReportsInsightBannerProps {
  titulo?: string;
  subtitulo?: string;
  diagnostico?: string;
  onAcao?: () => void;
  textoAcao?: string;
}

export default function ReportsInsightBanner({
  titulo = 'Custos Operacionais Dentro da Meta',
  subtitulo = 'Diagnóstico Mensal',
  diagnostico = 'A margem operacional fechou favorável em relação ao teto contratual estipulado, mantendo o fluxo de caixa saudável e a reserva estratégica protegida.',
  onAcao,
  textoAcao = 'Otimizar Categorias',
}: ReportsInsightBannerProps): React.ReactElement {
  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center bg-fog dark:bg-card border border-transparent dark:border-spruce rounded-[24px] p-6 shadow-sm transition-all">
      {/* Lado Esquerdo: Ícone + Título */}
      <div className="md:col-span-4 flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-forest-ink text-lime-voltage flex items-center justify-center shrink-0 shadow-sm border border-lime-voltage/20">
          <Sparkles className="w-7 h-7 stroke-[2]" />
        </div>
        <div>
          <span className="text-[11px] uppercase font-bold text-forest-ink dark:text-lime-voltage tracking-wider block">
            {subtitulo}
          </span>
          <h4 className="text-base font-bold text-forest-ink dark:text-paper leading-tight mt-0.5">
            {titulo}
          </h4>
        </div>
      </div>

      {/* Centro: Análise Editorial */}
      <div className="md:col-span-5 text-xs text-charcoal dark:text-pebble leading-relaxed">
        {diagnostico}
      </div>

      {/* Lado Direito: Ação Pill */}
      <div className="md:col-span-3 flex justify-start md:justify-end">
        <Button
          type="button"
          onClick={onAcao}
          className="h-11 px-6 rounded-full bg-forest-ink text-lime-voltage hover:bg-forest-ink/90 dark:bg-lime-voltage dark:text-forest-ink text-xs font-bold transition-all shadow-sm gap-2"
        >
          <span>{textoAcao}</span>
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
