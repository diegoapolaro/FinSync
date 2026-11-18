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
  MoreVertical,
  Unplug,
  Loader2,
  ShieldCheck,
} from 'lucide-react';
import {
  createConta,
  updateConta,
  deleteConta,
  sincronizarConta,
  sincronizarTodasContas,
  desconectarOpenFinance,
} from '../../services/api';
import { useToast } from '../../contexts/ToastContext';
import { formatCurrency } from '../../utils/formatters';
import { formatarUltimaSincronizacao } from '../../utils/formatarSincronizacao';
import SettingsSection from './SettingsSection';
import OpenFinanceConnectModal from './OpenFinanceConnectModal';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog';
import { cn } from '@/lib/utils';
import type { ContaDto, ConectarContaOpenFinanceResponse } from '@/types';
import { ProvedorOpenFinance, StatusSincronizacao, TipoConta } from '@/types/enums';

interface Props {
  contas: ContaDto[];
  setContas: React.Dispatch<React.SetStateAction<ContaDto[]>>;
}

function ehContaManual(conta: ContaDto): boolean {
  return !conta.provedor || conta.provedor === ProvedorOpenFinance.Manual || !conta.instituicaoNome;
}

interface StatusBadgeProps {
  conta: ContaDto;
  aoTentarNovamente: (conta: ContaDto) => void;
  sincronizando: boolean;
}

function StatusBadge({ conta, aoTentarNovamente, sincronizando }: StatusBadgeProps) {
  const status = conta.statusSincronizacao;

  if (status === StatusSincronizacao.Sincronizando || sincronizando) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-signal-blue/10 text-signal-blue dark:text-sky-300 text-[10px] font-mono font-bold border border-signal-blue/20">
        <span className="w-1.5 h-1.5 rounded-full bg-signal-blue dark:bg-sky-300 animate-pulse" />
        Sincronizando...
      </span>
    );
  }

  if (status === StatusSincronizacao.Falha) {
    return (
      <span
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-alarm-red/10 text-alarm-red text-[10px] font-mono font-bold border border-alarm-red/25"
        title={conta.mensagemErroSincronizacao || 'Falha ao sincronizar com a instituição'}
      >
        <AlertTriangle className="w-3 h-3" />
        Falha na sincronização
        <button
          type="button"
          title="Tentar novamente"
          aria-label="Tentar novamente"
          onClick={() => aoTentarNovamente(conta)}
          className="ml-0.5 p-0.5 rounded-full hover:bg-alarm-red/15 transition-colors"
        >
          <RefreshCw className="w-3 h-3" />
        </button>
      </span>
    );
  }

  if (status === StatusSincronizacao.Sincronizado) {
    const relativo = formatarUltimaSincronizacao(conta.ultimaSincronizacaoEm);
    return (
      <span
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 text-[10px] font-mono font-bold border border-emerald-500/20"
        title={conta.ultimaSincronizacaoEm || undefined}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        {`Sincronizado${relativo ? ` ${relativo}` : ''}`}
      </span>
    );
  }

  if (status === StatusSincronizacao.Pendente) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-laranja/10 text-laranja text-[10px] font-mono font-bold border border-laranja/20">
        Aguardando sincronização
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted text-muted-foreground text-[10px] font-mono font-bold border border-border/60">
      {status === StatusSincronizacao.Desconectado ? 'Desconectado' : 'Manual'}
    </span>
  );
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

  const [sincronizandoTodas, setSincronizandoTodas] = useState(false);
  const [sincronizandoContaId, setSincronizandoContaId] = useState<number | null>(null);
  const [mostrarModalOpenFinance, setMostrarModalOpenFinance] = useState(false);
  const [menuAbertaId, setMenuAbertaId] = useState<number | null>(null);
  const [contaDesconectar, setContaDesconectar] = useState<ContaDto | null>(null);
  const [desconectando, setDesconectando] = useState(false);

  function atualizarContaLocal(id: number, patch: Partial<ContaDto>) {
    setContas((prev) => prev.map((conta) => (conta.id === id ? { ...conta, ...patch } : conta)));
  }

  async function handleCriarConta() {
    if (!novaContaNome.trim()) return;
    try {
      setSalvando(true);
      const nova = await createConta({
        nome: novaContaNome.trim(),
        tipo: novaContaTipo as TipoConta,
      });
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
      await updateConta(String(id), {
        nome: nome.trim(),
        tipo: tipo as TipoConta,
        arquivada: contas.find((c) => c.id === id)?.arquivada || false,
      });
      setContas((prev) =>
        prev.map((c) => (c.id === id ? { ...c, nome: nome.trim(), tipo: tipo as TipoConta } : c)),
      );
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

  async function handleSincronizarTodas() {
    if (sincronizandoTodas) return;
    setSincronizandoTodas(true);
    try {
      const relatorio = await sincronizarTodasContas();
      const porId = new Map(
        (relatorio.resultados || []).map((resultado) => [Number(resultado.contaId), resultado]),
      );
      setContas((prev) =>
        prev.map((conta) => {
          const resultado = porId.get(Number(conta.id));
          if (!resultado) return conta;
          return {
            ...conta,
            statusSincronizacao: resultado.sucesso
              ? StatusSincronizacao.Sincronizado
              : StatusSincronizacao.Falha,
            ultimaSincronizacaoEm: resultado.sincronizadoEm || conta.ultimaSincronizacaoEm,
            mensagemErroSincronizacao: resultado.mensagemErro || null,
            saldo: resultado.saldoConsolidado ?? conta.saldo,
          };
        }),
      );
      addToast(
        `Sincronização concluída! ${relatorio.totalContas} conta(s) sincronizada(s) e ${relatorio.totalNovasTransacoes} novos lançamentos importados.`,
        'success',
      );
    } catch (err: any) {
      addToast(err?.message || 'Erro ao sincronizar as contas.', 'error');
    } finally {
      setSincronizandoTodas(false);
    }
  }

  async function handleSincronizarConta(conta: ContaDto) {
    if (sincronizandoContaId !== null) return;
    setMenuAbertaId(null);
    setSincronizandoContaId(conta.id);
    atualizarContaLocal(conta.id, { statusSincronizacao: StatusSincronizacao.Sincronizando });
    try {
      const resultado = await sincronizarConta(conta.id);
      atualizarContaLocal(conta.id, {
        statusSincronizacao: resultado.sucesso
          ? StatusSincronizacao.Sincronizado
          : StatusSincronizacao.Falha,
        ultimaSincronizacaoEm: resultado.sincronizadoEm || conta.ultimaSincronizacaoEm,
        mensagemErroSincronizacao: resultado.mensagemErro || null,
        saldo: resultado.saldoConsolidado ?? conta.saldo,
      });
      if (resultado.sucesso) {
        addToast(
          `${conta.nome}: ${resultado.novasTransacoes} novo(s) lançamento(s) importado(s).`,
          'success',
        );
      } else {
        addToast(resultado.mensagemErro || `Falha ao sincronizar ${conta.nome}.`, 'error');
      }
    } catch (err: any) {
      atualizarContaLocal(conta.id, {
        statusSincronizacao: StatusSincronizacao.Falha,
        mensagemErroSincronizacao: err?.message,
      });
      addToast(err?.message || 'Erro ao sincronizar a conta.', 'error');
    } finally {
      setSincronizandoContaId(null);
    }
  }

  function handleContaConectada(response: ConectarContaOpenFinanceResponse) {
    if (response?.conta) {
      setContas((prev) => [...prev, response.conta]);
    }
  }

  async function handleDesconectarOpenFinance() {
    if (!contaDesconectar) return;
    const id = contaDesconectar.id;
    setDesconectando(true);
    try {
      const atualizada = await desconectarOpenFinance(id);
      setContas((prev) =>
        prev.map((conta) =>
          conta.id === id
            ? {
                ...conta,
                ...atualizada,
                provedor: ProvedorOpenFinance.Manual,
                statusSincronizacao: StatusSincronizacao.Manual,
              }
            : conta,
        ),
      );
      addToast('Open Finance desconectado. Seus lançamentos foram preservados.', 'success');
      setContaDesconectar(null);
    } catch (err: any) {
      addToast(err?.message || 'Erro ao desconectar o Open Finance.', 'error');
    } finally {
      setDesconectando(false);
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
              onClick={handleSincronizarTodas}
              disabled={sincronizandoTodas}
              className="rounded-full text-xs font-semibold flex items-center gap-1.5 h-8 border-border/80"
            >
              <RefreshCw
                className={cn('w-3.5 h-3.5 text-primary', sincronizandoTodas && 'animate-spin')}
              />
              <span>{sincronizandoTodas ? 'Sincronizando...' : 'Sincronizar Todas'}</span>
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
            const manual = ehContaManual(conta);
            const sincronizando = sincronizandoContaId === conta.id;

            const dadosBancarios = [
              conta.instituicaoNome
                ? `${conta.instituicaoNome}${conta.instituicaoCodigo ? ` (${conta.instituicaoCodigo})` : ''}`
                : null,
              conta.agencia ? `Ag ${conta.agencia}` : null,
              conta.numeroConta ? `CC ${conta.numeroConta}` : null,
              conta.chavePix ? `Pix ${conta.chavePix}` : null,
            ]
              .filter(Boolean)
              .join(' • ');

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
                      {!manual && (
                        <span
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-lime-voltage/15 text-forest-ink dark:text-lime-voltage text-[10px] font-mono font-bold"
                          title="Conexão Open Finance ativa"
                        >
                          <ShieldCheck className="w-3 h-3" />
                          OF
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground truncate">
                      {manual
                        ? 'Registro manual sem Open Finance'
                        : dadosBancarios || 'Registro manual sem Open Finance'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-5 pt-2 sm:pt-0 border-t sm:border-t-0 border-border/40">
                  <div className="flex flex-col sm:text-right">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground font-semibold">
                      Saldo Disponível
                    </span>
                    <span className="font-mono text-sm md:text-base font-bold text-foreground">
                      {formatCurrency(conta.saldo ?? 0)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <StatusBadge
                      conta={conta}
                      aoTentarNovamente={handleSincronizarConta}
                      sincronizando={sincronizando}
                    />
                    <div className="flex items-center">
                      {!manual && (
                        <Button
                          variant="ghost"
                          size="iconSm"
                          onClick={() => handleSincronizarConta(conta)}
                          disabled={sincronizando || sincronizandoTodas}
                          title="Sincronizar conta"
                          aria-label="Sincronizar conta"
                        >
                          {sincronizando ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <RefreshCw className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground" />
                          )}
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="iconSm"
                        onClick={() => iniciarEdicaoConta(conta)}
                        title="Editar Conta"
                      >
                        <Edit2 className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground" />
                      </Button>

                      {!manual && (
                        <div className="relative">
                          <Button
                            variant="ghost"
                            size="iconSm"
                            onClick={() =>
                              setMenuAbertaId(menuAbertaId === conta.id ? null : conta.id)
                            }
                            title="Mais ações"
                            aria-label="Mais ações"
                          >
                            <MoreVertical className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground" />
                          </Button>
                          {menuAbertaId === conta.id && (
                            <div className="absolute right-0 top-8 z-20 w-56 rounded-2xl border border-border bg-card p-1.5 shadow-elevation">
                              <button
                                type="button"
                                onClick={() => {
                                  setContaDesconectar(conta);
                                  setMenuAbertaId(null);
                                }}
                                className="w-full flex items-center gap-2 rounded-xl px-3 py-2 text-left text-xs font-semibold text-foreground hover:bg-alarm-red/10 hover:text-alarm-red transition-colors"
                              >
                                <Unplug className="w-3.5 h-3.5" />
                                Desconectar Open Finance
                              </button>
                            </div>
                          )}
                        </div>
                      )}

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
            onClick={() => setMostrarModalOpenFinance(true)}
            className="w-full p-4 rounded-2xl border-2 border-dashed border-border/80 hover:border-lime-voltage hover:bg-linen-mist/40 dark:hover:bg-spruce/20 transition-all flex items-center justify-center gap-2 text-primary dark:text-lime-voltage group cursor-pointer"
          >
            <Plus className="w-4 h-4 group-hover:scale-110 transition-transform stroke-[2.5]" />
            <span className="font-mono text-xs font-bold">
              Conectar Nova Instituição Financeira via Open Finance
            </span>
          </button>
        </div>
      </SettingsSection>

      <OpenFinanceConnectModal
        open={mostrarModalOpenFinance}
        onOpenChange={setMostrarModalOpenFinance}
        onContaConectada={handleContaConectada}
      />

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

      {/* Disconnect Open Finance Dialog */}
      <Dialog
        open={Boolean(contaDesconectar)}
        onOpenChange={(open) => {
          if (!open) setContaDesconectar(null);
        }}
      >
        <DialogHeader>
          <div className="flex items-center gap-3 text-forest-ink dark:text-lime-voltage">
            <Unplug className="w-6 h-6" />
            <DialogTitle>Desconectar Open Finance?</DialogTitle>
          </div>
          <DialogDescription>
            A conexão com &quot;{contaDesconectar?.instituicaoNome || contaDesconectar?.nome}&quot;
            será encerrada. Os lançamentos já importados serão preservados e continuarão disponíveis
            no extrato. Você poderá reconectar a qualquer momento.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setContaDesconectar(null)}
            disabled={desconectando}
          >
            Cancelar
          </Button>
          <Button onClick={handleDesconectarOpenFinance} disabled={desconectando}>
            {desconectando ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Desconectando...
              </>
            ) : (
              'Desconectar'
            )}
          </Button>
        </DialogFooter>
      </Dialog>
    </>
  );
}
