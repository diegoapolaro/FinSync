import React from 'react';
import { Wallet, Sparkles, ArrowUpRight, ArrowDownRight, Building2, CheckCircle2 } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';
import type { ContaDto } from '@/types';

interface Props {
  saldoProjetado: number;
  totalEntradasDia: number;
  totalSaidasDia: number;
  contaAtiva?: ContaDto;
  onAplicarSugestao?: (descricao: string, valor: string, tipo: string) => void;
}

export default function LancamentosVelocitySidebar({
  saldoProjetado,
  totalEntradasDia,
  totalSaidasDia,
  contaAtiva,
  onAplicarSugestao,
}: Props): React.ReactElement {
  return (
    <div className="flex flex-col gap-5">
      {/* 1. Dark Inverted Card: Impacto no Saldo (Wise Forest Ink Authority) */}
      <div className="bg-forest-ink text-paper rounded-[28px] p-6 relative overflow-hidden shadow-md flex flex-col justify-between">
        {/* Glow de fundo sutil */}
        <div className="absolute -top-16 -right-16 w-44 h-44 rounded-full bg-lime-voltage/15 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-lime-voltage">
              Impacto no Saldo
            </span>
            <div className="w-8 h-8 rounded-full bg-spruce flex items-center justify-center text-lime-voltage">
              <Wallet className="w-4 h-4" />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-xs text-fog/80 font-medium">
              Saldo Projetado da Conta
            </span>
            <span className="numeric-mono text-3xl md:text-4xl font-extrabold text-paper tracking-tight leading-tight">
              {formatCurrency(saldoProjetado)}
            </span>
          </div>

          <div className="pt-4 mt-1 border-t border-spruce flex items-center justify-between gap-4">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold uppercase tracking-wider text-fog/70 flex items-center gap-1">
                <ArrowDownRight className="w-3 h-3 text-alarm-red" />
                Saídas do Dia
              </span>
              <span className="numeric-mono text-sm font-bold text-alarm-red mt-0.5">
                - {formatCurrency(totalSaidasDia)}
              </span>
            </div>

            <div className="flex flex-col text-right">
              <span className="text-[10px] font-bold uppercase tracking-wider text-fog/70 flex items-center justify-end gap-1">
                <ArrowUpRight className="w-3 h-3 text-lime-voltage" />
                Entradas do Dia
              </span>
              <span className="numeric-mono text-sm font-bold text-lime-voltage mt-0.5">
                + {formatCurrency(totalEntradasDia)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Card de Sugestão FinSync AI (Padrão Wise Fog) */}
      <div className="bg-fog dark:bg-card rounded-[20px] p-5 border border-pebble/20 shadow-sm flex flex-col gap-3">
        <div className="flex items-center gap-2 text-forest-ink dark:text-lime-voltage">
          <Sparkles className="w-4 h-4 text-forest-ink dark:text-lime-voltage fill-current" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-forest-ink dark:text-paper">
            Sugestão FinSync AI
          </h3>
        </div>
        <p className="text-xs text-charcoal dark:text-pebble leading-relaxed">
          Identificamos gastos regulares com fornecedores alimentícios nas últimas semanas. Deseja pré-carregar um lançamento rápido?
        </p>
        {onAplicarSugestao && (
          <div className="pt-1">
            <button
              type="button"
              onClick={() => onAplicarSugestao('Fornecedor de Alimentos & Hortifruti', '450,00', 'Saida')}
              className="w-full text-xs font-bold py-2 px-3 rounded-full bg-paper dark:bg-spruce border border-pebble/30 text-forest-ink dark:text-paper hover:bg-linen-mist/50 hover:border-forest-ink/30 transition-all text-center"
            >
              Preencher Fornecedor Frequente
            </button>
          </div>
        )}
      </div>

      {/* 3. Contexto Operacional / Centro de Custo */}
      <div className="bg-linen-mist/50 dark:bg-spruce/30 rounded-[20px] p-4 border border-forest-ink/10 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-paper dark:bg-spruce flex items-center justify-center text-forest-ink dark:text-lime-voltage shadow-xs">
            <Building2 className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold uppercase tracking-wider text-charcoal dark:text-pebble">
              Conta Vinculada
            </span>
            <span className="text-xs font-bold text-forest-ink dark:text-paper truncate max-w-[170px]">
              {contaAtiva?.nome || 'Conta Padrão'}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-paper dark:bg-spruce text-[11px] font-semibold text-forest-ink dark:text-lime-voltage border border-forest-ink/10 shadow-xs">
          <span className="w-2 h-2 rounded-full bg-lime-voltage animate-pulse" />
          <span>Ativa</span>
        </div>
      </div>
    </div>
  );
}
