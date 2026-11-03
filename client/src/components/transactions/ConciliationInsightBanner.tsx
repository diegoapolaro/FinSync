import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, PieChart, ArrowRight } from 'lucide-react';
import { Button } from '../ui/button';

interface ConciliationInsightBannerProps {
  taxaConciliacao?: string;
  lucroProjetado?: string;
}

export default function ConciliationInsightBanner({
  taxaConciliacao = '98.4%',
  lucroProjetado = '+R$ 22.450,00',
}: ConciliationInsightBannerProps): React.ReactElement {
  const navigate = useNavigate();

  return (
    <section className="grid grid-cols-1 md:grid-cols-2 gap-5">
      {/* 1. Conciliação Automática */}
      <div className="p-5 bg-fog dark:bg-card border border-transparent dark:border-spruce rounded-[20px] shadow-sm flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-forest-ink text-lime-voltage flex items-center justify-center shrink-0">
          <ShieldCheck className="w-6 h-6 stroke-[2.25]" />
        </div>
        <div className="flex flex-col min-w-0">
          <h4 className="text-sm font-bold text-forest-ink dark:text-paper">
            Conciliação Automática Ativa
          </h4>
          <p className="text-xs text-charcoal dark:text-pebble mt-0.5 leading-relaxed">
            <span className="font-bold text-forest-ink dark:text-lime-voltage">{taxaConciliacao}</span> das transações deste mês foram pareadas automaticamente com as notas fiscais emitidas no SEFAZ.
          </p>
        </div>
      </div>

      {/* 2. Projeção de Fechamento & Link DRE */}
      <div className="p-5 bg-fog dark:bg-card border border-transparent dark:border-spruce rounded-[20px] shadow-sm flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 min-w-0">
          <div className="w-12 h-12 rounded-full bg-forest-ink text-lime-voltage flex items-center justify-center shrink-0">
            <PieChart className="w-6 h-6 stroke-[2.25]" />
          </div>
          <div className="flex flex-col min-w-0">
            <h4 className="text-sm font-bold text-forest-ink dark:text-paper">
              Projeção Fechamento do Mês
            </h4>
            <span className="text-xs font-bold text-forest-ink dark:text-lime-voltage mt-0.5 numeric-mono">
              Lucro Projetado: {lucroProjetado}
            </span>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/relatorios')}
          className="rounded-full bg-forest-ink text-lime-voltage hover:bg-forest-ink/90 border-transparent shrink-0 gap-1.5 text-xs font-bold px-5 h-10 transition-all"
        >
          <span>Ver DRE</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Button>
      </div>
    </section>
  );
}
