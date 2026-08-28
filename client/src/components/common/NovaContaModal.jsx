import { useState } from 'react';
import { Building, User, Store, Plus, Loader2 } from 'lucide-react';
import { createConta } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { cn } from '@/lib/utils';

export default function NovaContaModal({ open, onOpenChange, onContaCriada }) {
  const { addToast } = useToast();
  const [nome, setNome] = useState('');
  const [tipo, setTipo] = useState('Pessoal');
  const [salvando, setSalvando] = useState(false);

  function fechar() {
    if (salvando) return;
    setNome('');
    setTipo('Pessoal');
    onOpenChange(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!nome.trim()) return;

    try {
      setSalvando(true);
      const novaConta = await createConta({
        nome: nome.trim(),
        tipo,
      });

      addToast(`Conta "${novaConta.nome}" criada com sucesso!`, 'success');
      onContaCriada?.(novaConta);
      fechar();
    } catch (err) {
      addToast(err.message || 'Erro ao criar conta', 'error');
    } finally {
      setSalvando(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={fechar}>
      <form onSubmit={handleSubmit} className="space-y-5">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle>Nova Conta ou Livro</DialogTitle>
              <DialogDescription>
                Crie um novo livro de caixa para separar suas finanças pessoais ou comerciais.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
              Nome da Conta / Livro
            </label>
            <Input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Pessoal, Pizzaria, Carteira, Freelancer..."
              className="w-full"
              autoFocus
              required
              disabled={salvando}
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
              Tipo de Gestão
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setTipo('Pessoal')}
                disabled={salvando}
                className={cn(
                  'flex items-center gap-3 p-3 rounded-xl border text-left transition-all',
                  tipo === 'Pessoal'
                    ? 'border-primary bg-primary/10 text-primary shadow-sm font-semibold'
                    : 'border-border/80 hover:bg-secondary text-muted-foreground',
                )}
              >
                <div
                  className={cn(
                    'w-8 h-8 rounded-lg flex items-center justify-center',
                    tipo === 'Pessoal' ? 'bg-primary text-primary-foreground' : 'bg-muted',
                  )}
                >
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <span className="block text-xs font-semibold">Pessoal</span>
                  <span className="block text-[10px] text-muted-foreground">Gastos do dia a dia</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setTipo('Comercial')}
                disabled={salvando}
                className={cn(
                  'flex items-center gap-3 p-3 rounded-xl border text-left transition-all',
                  tipo === 'Comercial'
                    ? 'border-primary bg-primary/10 text-primary shadow-sm font-semibold'
                    : 'border-border/80 hover:bg-secondary text-muted-foreground',
                )}
              >
                <div
                  className={cn(
                    'w-8 h-8 rounded-lg flex items-center justify-center',
                    tipo === 'Comercial' ? 'bg-primary text-primary-foreground' : 'bg-muted',
                  )}
                >
                  <Store className="w-4 h-4" />
                </div>
                <div>
                  <span className="block text-xs font-semibold">Comercial</span>
                  <span className="block text-[10px] text-muted-foreground">Empresa ou negócio</span>
                </div>
              </button>
            </div>
          </div>
        </div>

        <DialogFooter className="pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={fechar}
            disabled={salvando}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={salvando || !nome.trim()}
            className="flex items-center gap-1.5 font-semibold"
          >
            {salvando ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Criando...</span>
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Criar Conta</span>
              </>
            )}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}
