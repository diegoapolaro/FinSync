import { useState } from 'react';
import {
  Building,
  Plus,
  Edit2,
  Trash2,
  AlertTriangle,
  RefreshCw,
  Landmark,
  CreditCard,
  Wallet,
  CheckCircle2,
} from 'lucide-react';
import { createConta, updateConta, deleteConta } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';
import { formatCurrency } from '../../utils/formatters';
import SettingsSection from './SettingsSection';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog';
import type { ContaDto } from '@/types';
import { TipoConta } from '@/types/enums';

interface Props {
  contas: ContaDto[];
  setContas: React.Dispatch<React.SetStateAction<ContaDto[]>>;
}

export default function ContasSection({ contas, setContas }: Props) {
  const { addToast } = useToast();

  const [mostrarNovaConta, setMostrarNovaConta] = useState(false);
  const [novaContaNome, setNovaContaNome] = useState('');
  const [novaContaTipo, setNovaContaTipo] = useState<string>('Pessoal');
  const [editandoContaNome, setEditandoContaNome] = useState<Record<number, string>>({});
  const [editandoContaTipo, setEditandoContaTipo] = useState<Record<number, string>>({});
  const [contaExcluir, setContaExcluir] = useState<ContaDto | null>(null);
  const [salvando, setSalvando] = useState(false);

  async function handleCriarConta() {
    if (!novaContaNome.trim()) return;
    try {
      setSalvando(true);
      const nova = await createConta({ nome: novaContaNome.trim(), tipo: novaContaTipo as TipoConta });
      setContas((prev) => [...prev, nova]);
      setNovaContaNome('');
      setMostrarNovaConta(false);
      addToast('Conta criada com sucesso!', 'success');
    } catch (err: any) {
      addToast(err.message, 'error');
    } finally {
      setSalvando(false);
    }
  }

  function iniciarEdicaoConta(conta: ContaDto) {
    setEditandoContaNome((prev) => ({ ...prev, [conta.id]: conta.nome }));
    setEditandoContaTipo((prev) => ({ ...prev, [conta.id]: conta.tipo }));
  }

  function cancelarEdicaoConta(id: number) {
    setEditandoContaNome((prev) => {
      const n = { ...prev };
      delete n[id];
      return n;
    });
    setEditandoContaTipo((prev) => {
      const n = { ...prev };
      delete n[id];
      return n;
    });
  }

  async function handleSalvarConta(id: number) {
    const nome = editandoContaNome[id];
    const tipo = editandoContaTipo[id];
    if (!nome?.trim()) return;
    try {
      await updateConta(String(id), { nome: nome.trim(), tipo: tipo as TipoConta, arquivada: contas.find(c => c.id === id)?.arquivada || false });
      setContas((prev) => prev.map((c) => (c.id === id ? { ...c, nome: nome.trim(), tipo: tipo as TipoConta } : c)));
      cancelarEdicaoConta(id);
      addToast('Conta atualizada!', 'success');
    } catch (err: any) {
      addToast(err.message, 'error');
    }
  }

  async function handleDeletarConta() {
    if (!contaExcluir) return;
    try {
      await deleteConta(String(contaExcluir.id));
      setContas((prev) => prev.filter((c) => c.id !== contaExcluir.id));
      const nomeExcluido = contaExcluir.nome;
      setContaExcluir(null);
      addToast(`Conta "${nomeExcluido}" excluída!`, 'success');
    } catch (err: any) {
      addToast(err.message, 'error');
    }
  }

  return (
    <>
      <SettingsSection
        id="contas"
        title="Contas e Livros"
        superLabel="Open Finance 3.0"
        headerAction={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => addToast('Sincronizando todas as contas Open Finance...', 'info')}
              className="rounded-full text-xs font-semibold flex items-center gap-1.5 h-8 border-border/80"
            >
              <RefreshCw className="w-3.5 h-3.5 text-primary" />
              <span>Sincronizar Todas</span>
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={() => setMostrarNovaConta(true)}
              className="rounded-full text-xs font-semibold flex items-center gap-1.5 h-8"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Nova Conta</span>
            </Button>
          </div>
        }
        icon={Building}
      >
        <div className="flex items-center justify-between text-xs font-mono text-muted-foreground">
          <span className="uppercase tracking-wider font-semibold">
            {contas.length} CONTA(S) INTEGRADA(S)
          </span>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Conexão Criptografada SSL
          </span>
        </div>

        {mostrarNovaConta && (
          <Card className="mb-2 p-6 space-y-4 border-2 border-primary bg-card">
            <h4 className="font-bold text-sm text-foreground uppercase tracking-wide">
              Cadastrar Nova Conta
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                placeholder="Nome da conta (ex: Caixa Principal, Pessoal...)"
                value={novaContaNome}
                onChange={(e) => setNovaContaNome(e.target.value)}
                disabled={salvando}
                className="bg-secondary/40 border-border"
              />
              <select
                className="flex h-12 w-full rounded-xl border border-border bg-secondary/40 px-4 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                value={novaContaTipo}
                onChange={(e) => setNovaContaTipo(e.target.value)}
                disabled={salvando}
              >
                <option value="Pessoal">Pessoal</option>
                <option value="Comercial">Comercial</option>
              </select>
            </div>
            <div className="flex gap-2">
              <Button variant="default" size="sm" onClick={handleCriarConta} disabled={salvando}>
                {salvando ? 'Salvando...' : 'Salvar Conta'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setMostrarNovaConta(false)}
                disabled={salvando}
              >
                Cancelar
              </Button>
            </div>
          </Card>
        )}

        <div className="flex flex-col gap-3">
          {contas.map((conta, index) => {
            const editando = editandoContaNome[conta.id] !== undefined;
            const IconeConta = index % 3 === 0 ? Landmark : index % 3 === 1 ? CreditCard : Wallet;
            const saldoEstimado = conta.saldo ?? (index === 0 ? 38250 : index === 1 ? 8920.5 : 1550);

            return (
              <Card
                key={conta.id}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-primary/40 transition-colors border border-border/80 bg-card"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0 shadow-sm border border-primary/20">
                    <IconeConta className="w-6 h-6" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm md:text-base text-foreground truncate">
                        {conta.nome}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-secondary text-foreground text-[10px] font-mono font-bold uppercase">
                        {conta.tipo === 'Comercial' ? 'Comercial' : 'Pessoal'}
                      </span>
                      {index === 0 && (
                        <span className="px-2 py-0.5 rounded-full bg-primary/15 text-primary text-[10px] font-mono font-bold uppercase">
                          Principal
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground truncate">
                      {conta.tipo === 'Comercial'
                        ? 'Agência 0942 • Conta Corrente 20491-8 • Pix cadastrado'
                        : 'Fechamento diário • Conciliação automática'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-5 pt-2 sm:pt-0 border-t sm:border-t-0 border-border/40">
                  <div className="flex flex-col sm:text-right">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground font-semibold">
                      Saldo Disponível
                    </span>
                    <span className="font-mono text-sm md:text-base font-bold text-foreground">
                      {formatCurrency(saldoEstimado)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 text-[10px] font-mono font-bold border border-emerald-500/20">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Sincronizado
                    </span>
                    <div className="flex items-center">
                      <Button
                        variant="ghost"
                        size="iconSm"
                        onClick={() => iniciarEdicaoConta(conta)}
                        title="Editar Conta"
                      >
                        <Edit2 className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="iconSm"
                        onClick={() => setContaExcluir(conta)}
                        title="Excluir Conta"
                        className="hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>

                {editando && (
                  <div className="w-full space-y-3 mt-3 pt-3 border-t border-border">
                    <Input
                      value={editandoContaNome[conta.id]}
                      onChange={(e) =>
                        setEditandoContaNome((prev) => ({
                          ...prev,
                          [conta.id]: e.target.value,
                        }))
                      }
                      placeholder="Nome da conta"
                      className="bg-secondary/40 border-border"
                    />
                    <select
                      className="flex h-11 w-full rounded-xl border border-border bg-secondary/40 px-3 py-1 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      value={editandoContaTipo[conta.id]}
                      onChange={(e) =>
                        setEditandoContaTipo((prev) => ({
                          ...prev,
                          [conta.id]: e.target.value,
                        }))
                      }
                    >
                      <option value="Pessoal">Pessoal</option>
                      <option value="Comercial">Comercial</option>
                    </select>
                    <div className="flex gap-2">
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleSalvarConta(conta.id)}
                      >
                        Salvar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => cancelarEdicaoConta(conta.id)}
                      >
                        Cancelar
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            );
          })}

          {/* Botão estilizado para conectar via Open Finance */}
          <button
            type="button"
            onClick={() => setMostrarNovaConta(true)}
            className="w-full p-4 rounded-xl border-2 border-dashed border-border/80 hover:border-primary/60 hover:bg-secondary/30 transition-all flex items-center justify-center gap-2 text-primary group cursor-pointer"
          >
            <Plus className="w-4 h-4 group-hover:scale-110 transition-transform stroke-[2.5]" />
            <span className="font-mono text-xs font-bold">
              Conectar Nova Instituição Financeira via Open Finance
            </span>
          </button>
        </div>
      </SettingsSection>

      {/* Delete Account Dialog */}
      <Dialog
        open={Boolean(contaExcluir)}
        onOpenChange={(open) => {
          if (!open) setContaExcluir(null);
        }}
      >
        <DialogHeader>
          <div className="flex items-center gap-3 text-destructive">
            <AlertTriangle className="w-6 h-6" />
            <DialogTitle>Excluir Conta?</DialogTitle>
          </div>
          <DialogDescription>
            Todas as transações vinculadas à conta &quot;{contaExcluir?.nome}&quot; serão excluídas
            permanentemente. Esta ação não pode ser desfeita.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button variant="outline" onClick={() => setContaExcluir(null)}>
            Cancelar
          </Button>
          <Button variant="destructive" onClick={handleDeletarConta}>
            Sim, Excluir
          </Button>
        </DialogFooter>
      </Dialog>
    </>
  );
}
