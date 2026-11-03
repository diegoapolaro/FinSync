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
    <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* 1. Conciliação Automática */}
      <div className="p-5 bg-card border border-border/80 rounded-2xl shadow-sm flex items-center gap-4 hover:border-emerald-500/30 transition-all">
        <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20">
          <ShieldCheck className="w-6 h-6 stroke-[2]" />
        </div>
        <div className="flex flex-col min-w-0">
          <h4 className="text-sm font-bold text-foreground">
            Conciliação Automática Ativa
          </h4>
          <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">{taxaConciliacao}</span> das transações deste mês foram pareadas automaticamente com as notas fiscais emitidas no SEFAZ.
          </p>
        </div>
      </div>

      {/* 2. Projeção de Fechamento & Link DRE */}
      <div className="p-5 bg-card border border-border/80 rounded-2xl shadow-sm flex items-center justify-between gap-4 hover:border-primary/30 transition-all">
        <div className="flex items-center gap-4 min-w-0">
          <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/20">
            <PieChart className="w-6 h-6 stroke-[2]" />
          </div>
          <div className="flex flex-col min-w-0">
            <h4 className="text-sm font-bold text-foreground">
              Projeção Fechamento do Mês
            </h4>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5 numeric-mono">
              Lucro Projetado: {lucroProjetado}
            </span>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/relatorios')}
          className="rounded-xl shrink-0 gap-1 text-xs font-semibold hover:bg-primary hover:text-primary-foreground transition-all"
        >
          <span>Ver DRE</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Button>
      </div>
    </section>
  );
}
