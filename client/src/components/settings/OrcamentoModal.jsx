import { useEffect, useState } from 'react';
import { Target, AlertCircle } from 'lucide-react';
import Modal from '../common/Modal';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

export default function OrcamentoModal({ open, onOpenChange, orcamento, categorias = [], onSave }) {
  const [categoriaId, setCategoriaId] = useState('');
  const [valorLimite, setValorLimite] = useState('');
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    if (open) {
      setCategoriaId(orcamento ? String(orcamento.categoriaId) : '');
      setValorLimite(orcamento ? String(orcamento.valorLimite) : '');
    }
  }, [open, orcamento]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!categoriaId || !valorLimite) return;

    const valor = parseFloat(valorLimite);
    if (isNaN(valor) || valor <= 0) return;

    setCarregando(true);
    try {
      await onSave({
        categoriaId: parseInt(categoriaId, 10),
        valorLimite: valor,
      });
    } finally {
      setCarregando(false);
    }
  }

  const categoriasSaida = (categorias || []).filter(
    (c) => c.tipo === 'Saida' || c.tipo === 1 || String(c.tipo).toLowerCase() === 'saida',
  );

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={orcamento ? 'Editar Orçamento' : 'Novo Orçamento'}
      description="Defina um teto de gastos para acompanhar mensalmente."
      icon={<Target className="w-5 h-5" />}
    >
      <form onSubmit={handleSubmit} className="space-y-4 py-2">
        {categoriasSaida.length === 0 && !orcamento ? (
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-medium">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <p>
              Nenhuma categoria de despesa encontrada. Cadastre uma categoria do tipo "Saída" para
              poder definir um orçamento.
            </p>
          </div>
        ) : null}

        <div className="space-y-2">
          <label htmlFor="orcamento-categoria" className="text-sm font-semibold text-foreground">
            Categoria
          </label>
          <select
            id="orcamento-categoria"
            value={categoriaId}
            onChange={(e) => setCategoriaId(e.target.value)}
            required
            disabled={!!orcamento || categoriasSaida.length === 0}
            className="flex h-11 w-full rounded-xl border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="" disabled>
              {categoriasSaida.length === 0
                ? 'Nenhuma categoria de despesa disponível'
                : 'Selecione uma categoria de despesa...'}
            </option>
            {categoriasSaida.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.nome}
              </option>
            ))}
          </select>
          {orcamento && (
            <p className="text-[11px] text-muted-foreground">
              A categoria não pode ser alterada na edição deste limite.
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="orcamento-valor" className="text-sm font-semibold text-foreground">
            Valor Limite (R$)
          </label>
          <Input
            id="orcamento-valor"
            type="number"
            step="0.01"
            min="0.01"
            required
            value={valorLimite}
            onChange={(e) => setValorLimite(e.target.value)}
            placeholder="Ex: 500.00"
            className="h-11 rounded-xl bg-background/50 numeric-mono font-semibold"
          />
        </div>

        <div className="pt-4 flex justify-end gap-3">
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="rounded-xl"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={carregando || (!orcamento && categoriasSaida.length === 0)}
            className="rounded-xl bg-purple-500 hover:bg-purple-600 text-white shadow-lg shadow-purple-500/20 px-6 font-semibold"
          >
            {carregando ? 'Salvando...' : 'Salvar Limite'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
