import { useEffect, useState, useMemo } from 'react';
import { Landmark, ShieldCheck, AlertCircle, ArrowUpRight, ArrowDownRight, Building2, User } from 'lucide-react';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { formatCurrency } from '../../utils/formatters';
import { getResumoConta } from '../../services/api';
import { TIPO_TRANSACAO, STATUS_TRANSACAO } from '../../utils/constants';
import { cn } from '@/lib/utils';

export default function BalancoPatrimonialSection({ contas = [], transacoes = [] }) {
  const [resumosContas, setResumosContas] = useState({});
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    async function carregarSaldos() {
      if (!contas || contas.length === 0) return;
      setCarregando(true);
      try {
        const promises = contas.map(async (c) => {
          try {
            const r = await getResumoConta(c.id);
            return { id: c.id, resumo: r };
          } catch {
            return { id: c.id, resumo: null };
          }
        });
        const resultados = await Promise.all(promises);
        const mapa = {};
        resultados.forEach((item) => {
          mapa[item.id] = item.resumo;
        });
        setResumosContas(mapa);
      } finally {
        setCarregando(false);
      }
    }
    carregarSaldos();
  }, [contas]);

  // Cálculo de Ativos
  const saldosContas = useMemo(() => {
    return contas.map((c) => {
      const res = resumosContas[c.id];
      const saldo = res?.saldo ?? 0;
      return {
        id: c.id,
        nome: c.nome,
        tipo: c.tipo,
        saldo,
      };
    });
  }, [contas, resumosContas]);

  const totalSaldosContas = useMemo(() => {
    return saldosContas.reduce((acc, c) => acc + c.saldo, 0);
  }, [saldosContas]);

  // Contas a receber (entradas pendentes)
  const aReceber = useMemo(() => {
    return transacoes
      .filter((t) => t.tipo === TIPO_TRANSACAO.ENTRADA && t.status === STATUS_TRANSACAO.PENDENTE)
      .reduce((acc, t) => acc + t.valor, 0);
  }, [transacoes]);

  const totalAtivos = totalSaldosContas + aReceber;

  // Cálculo de Passivos (obrigações / saídas pendentes)
  const aPagar = useMemo(() => {
    return transacoes
      .filter((t) => t.tipo === TIPO_TRANSACAO.SAIDA && t.status === STATUS_TRANSACAO.PENDENTE)
      .reduce((acc, t) => acc + t.valor, 0);
  }, [transacoes]);

  const totalPassivos = aPagar;

  // Patrimônio Líquido
  const patrimonioLiquido = totalAtivos - totalPassivos;

  return (
    <div className="space-y-6">
      {/* Cards Principais do Balanço */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total de Ativos */}
        <Card className="p-5 relative overflow-hidden bg-card border-border">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Total de Ativos & Bens
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-2xl sm:text-3xl font-bold tracking-tight numeric-mono text-emerald-500">
              {formatCurrency(totalAtivos)}
            </span>
            <div className="text-[11px] text-muted-foreground mt-1 flex gap-2">
              <span>Saldos: {formatCurrency(totalSaldosContas)}</span>
              <span>•</span>
              <span>A Receber: {formatCurrency(aReceber)}</span>
            </div>
          </div>
        </Card>

        {/* Total de Passivos */}
        <Card className="p-5 relative overflow-hidden bg-card border-border">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Dívidas & Passivos
            </span>
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-500 flex items-center justify-center">
              <ArrowDownRight className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-2xl sm:text-3xl font-bold tracking-tight numeric-mono text-rose-500">
              {formatCurrency(totalPassivos)}
            </span>
            <p className="text-[11px] text-muted-foreground mt-1">
              Contas a pagar e compromissos pendentes
            </p>
          </div>
        </Card>

        {/* Patrimônio Líquido */}
        <Card className="p-5 relative overflow-hidden bg-card border-border">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Patrimônio Líquido
            </span>
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <span
              className={cn(
                'text-2xl sm:text-3xl font-bold tracking-tight numeric-mono',
                patrimonioLiquido >= 0 ? 'text-primary' : 'text-rose-500',
              )}
            >
              {patrimonioLiquido >= 0 ? '+ ' : '- '}
              {formatCurrency(Math.abs(patrimonioLiquido))}
            </span>
            <p className="text-[11px] text-muted-foreground mt-1">
              Ativos totais menos compromissos e passivos
            </p>
          </div>
        </Card>
      </div>

      {/* Detalhamento por Contas & Composição */}
      <Card className="p-6">
        <h4 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
          <Landmark className="w-4 h-4 text-primary" />
          Composição Patrimonial por Conta
        </h4>

        {contas.length === 0 ? (
          <p className="text-xs text-muted-foreground py-4 text-center">Nenhuma conta cadastrada.</p>
        ) : (
          <div className="space-y-4">
            {saldosContas.map((conta) => {
              const Icon = conta.tipo === 'Comercial' ? Building2 : User;
              const proporcao = totalAtivos > 0 ? (Math.max(0, conta.saldo) / totalAtivos) * 100 : 0;
              return (
                <div key={conta.id} className="space-y-1.5 bg-secondary/30 p-3.5 rounded-xl border border-border/50">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-secondary text-primary flex items-center justify-center">
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <span className="text-xs font-semibold text-foreground">{conta.nome}</span>
                        <span className="text-[10px] text-muted-foreground ml-2">({conta.tipo})</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span
                        className={cn(
                          'numeric-mono text-xs font-bold',
                          conta.saldo >= 0 ? 'text-emerald-500' : 'text-rose-500',
                        )}
                      >
                        {formatCurrency(conta.saldo)}
                      </span>
                      <span className="text-[10px] text-muted-foreground ml-2">
                        {proporcao.toFixed(1)}% dos ativos
                      </span>
                    </div>
                  </div>
                  <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, Math.max(0, proporcao))}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
