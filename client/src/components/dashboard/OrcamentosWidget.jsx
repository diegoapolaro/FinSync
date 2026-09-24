import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Target, ArrowRight, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { getOrcamentosResumo } from '../../services/api';
import { formatCurrency } from '../../utils/formatters';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { cn } from '@/lib/utils';

export default function OrcamentosWidget({ mes, ano, categorias = [] }) {
  const navigate = useNavigate();
  const [orcamentos, setOrcamentos] = useState([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    let ativo = true;

    async function carregar() {
      setCarregando(true);
      try {
        const dados = await getOrcamentosResumo(mes, ano);
        if (ativo) {
          setOrcamentos(dados || []);
        }
      } catch {
        if (ativo) setOrcamentos([]);
      } finally {
        if (ativo) setCarregando(false);
      }
    }

    carregar();

    return () => {
      ativo = false;
    };
  }, [mes, ano]);

  return (
    <Card className="p-6 border-white/5 bg-card/60 backdrop-blur-md rounded-3xl h-full shadow-lg flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-500/10 text-purple-500 rounded-2xl flex items-center justify-center">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">Orçamentos do Mês</h3>
              <p className="text-sm text-muted-foreground font-medium">
                Controle de tetos de gastos
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/ajustes#orcamentos')}
            className="text-xs text-muted-foreground hover:text-foreground gap-1 px-2.5 rounded-xl"
          >
            Gerenciar <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </div>

        {carregando ? (
          <div className="py-12 text-center text-muted-foreground text-sm animate-pulse">
            Carregando orçamentos...
          </div>
        ) : orcamentos.length === 0 ? (
          <div className="py-12 text-center flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-3">
              <Target className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-foreground">Nenhum orçamento ativo</h4>
            <p className="text-xs text-muted-foreground mt-1 max-w-xs leading-relaxed">
              Defina tetos mensais para suas despesas e acompanhe alertas em tempo real.
            </p>
            <Button
              size="sm"
              onClick={() => navigate('/ajustes#orcamentos')}
              className="mt-4 rounded-xl text-xs font-semibold bg-purple-600 hover:bg-purple-700 text-white"
            >
              Definir Orçamentos
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {orcamentos.slice(0, 4).map((orc) => {
              const categoria = categorias.find((c) => c.id === orc.categoriaId) || {};
              const cor = categoria.cor || '#8b5cf6';
              const percentualReal = orc.percentualUso ?? 0;
              const percentualBarra = Math.min(Math.max(percentualReal, 0), 100);
              const estourado = percentualReal > 100;
              const emAlerta = percentualReal >= 80 && !estourado;

              let statusBadge = (
                <Badge className="text-[10px] font-bold bg-emerald-500/15 text-emerald-500 border-none">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  {percentualReal.toFixed(0)}%
                </Badge>
              );

              if (estourado) {
                statusBadge = (
                  <Badge className="text-[10px] font-bold bg-rose-500/15 text-rose-500 border-none">
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    Estourado ({percentualReal.toFixed(0)}%)
                  </Badge>
                );
              } else if (emAlerta) {
                statusBadge = (
                  <Badge className="text-[10px] font-bold bg-amber-500/15 text-amber-500 border-none">
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    Atenção ({percentualReal.toFixed(0)}%)
                  </Badge>
                );
              }

              return (
                <div
                  key={orc.id}
                  className="p-3.5 bg-background/40 border border-white/5 rounded-2xl hover:bg-background/80 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2.5">
                      <span
                        className="w-3 h-3 rounded-full shrink-0 shadow-sm"
                        style={{ backgroundColor: cor }}
                      />
                      <span className="text-xs font-bold text-foreground">
                        {categoria.nome || 'Categoria'}
                      </span>
                    </div>
                    {statusBadge}
                  </div>

                  <div className="h-2 w-full bg-secondary rounded-full overflow-hidden flex my-2">
                    <div
                      className={cn(
                        'h-full transition-all duration-700 rounded-full',
                        estourado
                          ? 'bg-rose-500'
                          : emAlerta
                            ? 'bg-amber-500'
                            : 'bg-primary',
                      )}
                      style={{ width: `${percentualBarra}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-medium text-muted-foreground mt-1">
                    <span>
                      Gasto: <strong className="numeric-mono text-foreground font-semibold">{formatCurrency(orc.totalGasto)}</strong>
                    </span>
                    <span>
                      Teto: <strong className="numeric-mono text-foreground font-semibold">{formatCurrency(orc.valorLimite)}</strong>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {orcamentos.length > 4 && (
        <div className="pt-3 mt-3 border-t border-white/5 text-center">
          <button
            type="button"
            onClick={() => navigate('/ajustes#orcamentos')}
            className="text-xs text-primary hover:underline font-semibold"
          >
            + {orcamentos.length - 4} outros orçamentos em Ajustes
          </button>
        </div>
      )}
    </Card>
  );
}
