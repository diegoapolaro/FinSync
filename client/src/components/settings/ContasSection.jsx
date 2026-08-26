import { useState } from 'react';
import { Building, Plus, Edit2, Trash2, AlertTriangle } from 'lucide-react';
import { createConta, updateConta, deleteConta } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';
import SettingsSection from './SettingsSection';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog';

export default function ContasSection({ contas, setContas }) {
  const { addToast } = useToast();

  const [mostrarNovaConta, setMostrarNovaConta] = useState(false);
  const [novaContaNome, setNovaContaNome] = useState('');
  const [novaContaTipo, setNovaContaTipo] = useState('Pessoal');
  const [editandoContaNome, setEditandoContaNome] = useState({});
  const [editandoContaTipo, setEditandoContaTipo] = useState({});
  const [contaExcluir, setContaExcluir] = useState(null);
  const [salvando, setSalvando] = useState(false);

  async function handleCriarConta() {
    if (!novaContaNome.trim()) return;
    try {
      setSalvando(true);
      const nova = await createConta({ nome: novaContaNome.trim(), tipo: novaContaTipo });
      setContas((prev) => [...prev, nova]);
      setNovaContaNome('');
      setMostrarNovaConta(false);
      addToast('Conta criada com sucesso!', 'success');
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setSalvando(false);
    }
  }

  function iniciarEdicaoConta(conta) {
    setEditandoContaNome((prev) => ({ ...prev, [conta.id]: conta.nome }));
    setEditandoContaTipo((prev) => ({ ...prev, [conta.id]: conta.tipo }));
  }

  function cancelarEdicaoConta(id) {
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

  async function handleSalvarConta(id) {
    const nome = editandoContaNome[id];
    const tipo = editandoContaTipo[id];
    if (!nome?.trim()) return;
    try {
      await updateConta(id, { nome: nome.trim(), tipo });
      setContas((prev) => prev.map((c) => (c.id === id ? { ...c, nome: nome.trim(), tipo } : c)));
      cancelarEdicaoConta(id);
      addToast('Conta atualizada!', 'success');
    } catch (err) {
      addToast(err.message, 'error');
    }
  }

  async function handleDeletarConta() {
    if (!contaExcluir) return;
    try {
      await deleteConta(contaExcluir.id);
      setContas((prev) => prev.filter((c) => c.id !== contaExcluir.id));
      const nomeExcluido = contaExcluir.nome;
      setContaExcluir(null);
      addToast(`Conta "${nomeExcluido}" excluída!`, 'success');
    } catch (err) {
      addToast(err.message, 'error');
    }
  }

  return (
    <>
      <SettingsSection id="contas" title="Contas e Livros" icon={Building}>
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            {contas.length} CONTA(S) ATIVA(S)
          </span>
          <Button variant="default" size="sm" onClick={() => setMostrarNovaConta(true)}>
            <Plus className="w-4 h-4 mr-1 stroke-[2.5]" />
            Nova Conta
          </Button>
        </div>

        {mostrarNovaConta && (
          <Card className="mb-6 p-6 space-y-4 border-2 border-primary">
            <h4 className="font-bold text-sm text-foreground uppercase tracking-wide">
              Cadastrar Nova Conta
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                placeholder="Nome da conta (ex: Caixa Principal, Pessoal...)"
                value={novaContaNome}
                onChange={(e) => setNovaContaNome(e.target.value)}
                disabled={salvando}
                className="bg-secondary border-border"
              />
              <select
                className="flex h-12 w-full rounded-xl border border-border bg-secondary px-4 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {contas.map((conta) => {
            const editando = editandoContaNome[conta.id] !== undefined;
            return (
              <Card
                key={conta.id}
                className="p-5 flex flex-col justify-between hover:shadow-md transition-all group border border-border"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                    <Building className="w-5 h-5 text-foreground" />
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="iconSm"
                      onClick={() => iniciarEdicaoConta(conta)}
                      title="Editar"
                    >
                      <Edit2 className="w-4 h-4 text-muted-foreground" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="iconSm"
                      onClick={() => setContaExcluir(conta)}
                      title="Excluir"
                      className="hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {editando ? (
                  <div className="space-y-3 mt-2">
                    <Input
                      value={editandoContaNome[conta.id]}
                      onChange={(e) =>
                        setEditandoContaNome((prev) => ({
                          ...prev,
                          [conta.id]: e.target.value,
                        }))
                      }
                      placeholder="Nome da conta"
                      className="bg-secondary border-border"
                    />
                    <select
                      className="flex h-11 w-full rounded-xl border border-border bg-secondary px-3 py-1 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
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
                ) : (
                  <div>
                    <h4 className="font-bold text-base text-foreground mb-2">{conta.nome}</h4>
                    <div className="flex items-center gap-2">
                      <Badge variant="sage">
                        {conta.tipo === 'Comercial' ? 'Comercial' : 'Pessoal'}
                      </Badge>
                      <Badge variant={conta.arquivada ? 'destructive' : 'positive'}>
                        {conta.arquivada ? 'Arquivada' : 'Ativa'}
                      </Badge>
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
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
