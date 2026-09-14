import { useEffect, useState } from 'react';
import { Target, PlusCircle, Pencil, Trash2 } from 'lucide-react';
import {
  getOrcamentosResumo,
  createOrcamento,
  updateOrcamento,
  deleteOrcamento,
  getCategorias,
} from '../../services/api';
import { formatCurrency } from '../../utils/formatters';
import { useToast } from '../../contexts/ToastContext';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { cn } from '@/lib/utils';
import OrcamentoModal from './OrcamentoModal';

export default function OrcamentosSection({ categorias: propCategorias = [] }) {
  const [orcamentos, setOrcamentos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [modalAberto, setModalAberto] = useState(false);
  const [orcamentoEdicao, setOrcamentoEdicao] = useState(null);
  const [categoriasLocais, setCategoriasLocais] = useState([]);
  const { addToast } = useToast();

  const dataAtual = new Date();
  const mesAtual = dataAtual.getMonth() + 1;
  const anoAtual = dataAtual.getFullYear();

  useEffect(() => {
    carregarOrcamentos();
  }, []);

  useEffect(() => {
    if ((!propCategorias || propCategorias.length === 0) && categoriasLocais.length === 0) {
      getCategorias()
        .then((dados) => {
          if (Array.isArray(dados)) setCategoriasLocais(dados);
        })
        .catch(() => {});
    }
  }, [propCategorias, categoriasLocais.length]);

  const categorias =
    propCategorias && propCategorias.length > 0 ? propCategorias : categoriasLocais;

  async function carregarOrcamentos() {
    setCarregando(true);
    try {
      const dados = await getOrcamentosResumo(mesAtual, anoAtual);
      setOrcamentos(dados || []);
    } catch (error) {
      addToast(error.message || 'Erro ao carregar orçamentos.', 'error');
    } finally {
      setCarregando(false);
    }
  }

  function handleNovo() {
    setOrcamentoEdicao(null);
    setModalAberto(true);
  }

  function handleEditar(orcamento) {
    setOrcamentoEdicao(orcamento);
    setModalAberto(true);
  }

  async function handleSalvar(dados) {
    try {
      if (!orcamentoEdicao) {
        await createOrcamento({
          categoriaId: dados.categoriaId,
          valorLimite: dados.valorLimite,
          mes: mesAtual,
          ano: anoAtual,
        });
        addToast('Orçamento definido com sucesso!', 'success');
      } else {
        await updateOrcamento(orcamentoEdicao.id, {
          valorLimite: dados.valorLimite,
        });
        addToast('Orçamento atualizado com sucesso!', 'success');
      }
      setModalAberto(false);
      carregarOrcamentos();
    } catch (err) {
      addToast(err.message || 'Erro ao salvar', 'error');
    }
  }

  async function handleExcluir(id) {
    if (!confirm('Deseja realmente excluir esta meta de orçamento?')) return;
    try {
      await deleteOrcamento(id);
      addToast('Orçamento excluído.', 'success');
      setOrcamentos((prev) => prev.filter((o) => o.id !== id));
    } catch (err) {
      addToast(err.message || 'Erro ao excluir.', 'error');
    }
  }

  return (
    <section id="orcamentos" className="scroll-mt-32">
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">Orçamentos (Budgets)</h2>
              <p className="text-sm text-muted-foreground font-medium">
                Defina limites mensais de gastos por categoria
              </p>
            </div>
          </div>
          <Button
            onClick={handleNovo}
            size="sm"
            className="rounded-xl h-10 gap-2 font-bold bg-purple-500 hover:bg-purple-600 text-white shadow-lg shadow-purple-500/20"
          >
            <PlusCircle className="w-4 h-4" />
            Novo Orçamento
          </Button>
        </div>

        {carregando ? (
          <div className="py-8 text-center text-muted-foreground animate-pulse text-sm font-medium">
            Carregando orçamentos...
          </div>
        ) : orcamentos.length === 0 ? (
          <div className="py-12 text-center bg-secondary/30 rounded-2xl border border-dashed border-border/70">
            <Target className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-50" />
            <p className="text-sm font-medium text-foreground">Nenhum limite definido neste mês.</p>
            <p className="text-xs text-muted-foreground mt-1 mb-4">
              Comece definindo um teto de gastos para categorias essenciais.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {orcamentos.map((orc) => {
              const categoria = categorias.find((c) => c.id === orc.categoriaId) || {};
              const bgCor = categoria.cor || '#8b5cf6';
              const percentual = Math.min(orc.percentualUso, 100);
              const estourou = orc.percentualUso > 100;

              return (
                <div
                  key={orc.id}
                  className="p-4 bg-background/40 border border-white/5 rounded-2xl hover:bg-background/80 transition-colors"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded-full" style={{ backgroundColor: bgCor }} />
                      <h4 className="font-bold text-foreground">
                        {categoria.nome || 'Desconhecida'}
                      </h4>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEditar(orc)}
                        className="p-1.5 text-muted-foreground hover:text-primary transition-colors"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleExcluir(orc.id)}
                        className="p-1.5 text-muted-foreground hover:text-rose-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-between text-xs font-semibold mb-2">
                    <span className="text-muted-foreground">
                      Gasto:{' '}
                      <span className="text-foreground numeric-mono">
                        {formatCurrency(orc.totalGasto)}
                      </span>
                    </span>
                    <span className="text-muted-foreground">
                      Limite:{' '}
                      <span className="text-foreground numeric-mono">
                        {formatCurrency(orc.valorLimite)}
                      </span>
                    </span>
                  </div>

                  <div className="h-2 w-full bg-secondary rounded-full overflow-hidden flex">
                    <div
                      className={cn(
                        'h-full transition-all duration-1000',
                        estourou ? 'bg-rose-500' : 'bg-primary',
                      )}
                      style={{ width: `${percentual}%` }}
                    />
                  </div>
                  <div className="mt-2 text-right">
                    <Badge
                      variant="outline"
                      className={cn(
                        'text-[10px] uppercase font-bold border-none',
                        estourou ? 'bg-rose-500/10 text-rose-500' : 'bg-primary/10 text-primary',
                      )}
                    >
                      {orc.percentualUso.toFixed(1)}% utilizado
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {modalAberto && (
        <OrcamentoModal
          open={modalAberto}
          onOpenChange={setModalAberto}
          orcamento={orcamentoEdicao}
          categorias={categorias}
          onSave={handleSalvar}
        />
      )}
    </section>
  );
}
