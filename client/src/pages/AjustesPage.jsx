import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  User,
  Building,
  Tag,
  Sliders,
  Bell,
  Download,
  Shield,
  Moon,
  Plus,
  Edit2,
  Trash2,
  AlertTriangle,
  Lock,
} from 'lucide-react';
import usePreferencias from '../hooks/usePreferencias';
import { useTema } from '../contexts/ThemeContext';
import {
  createConta,
  updateConta,
  deleteConta,
  createCategoria,
  updateCategoria,
  exportarTransacoes,
} from '../services/api';
import { useToast } from '../contexts/ToastContext';
import SettingsSection from '../components/settings/SettingsSection';
import { TIPO_TRANSACAO } from '../utils/constants';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Switch } from '../components/ui/switch';
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../components/ui/dialog';
import { cn } from '@/lib/utils';

const categoryColors = [
  '#9fe870',
  '#ffc091',
  '#38c8ff',
  '#ffd11a',
  '#d03238',
  '#a78bfa',
  '#2ead4b',
  '#f472b6',
];

const navItems = [
  { id: 'perfil', label: 'Perfil', Icon: User },
  { id: 'contas', label: 'Contas', Icon: Building },
  { id: 'categorias', label: 'Categorias', Icon: Tag },
  { id: 'preferencias', label: 'Preferências', Icon: Sliders },
  { id: 'notificacoes', label: 'Notificações', Icon: Bell },
  { id: 'exportar', label: 'Exportar', Icon: Download },
  { id: 'seguranca', label: 'Segurança', Icon: Shield },
];

export default function AjustesPage() {
  const { contas, setContas, categorias, setCategorias } = useOutletContext();
  const { prefs } = usePreferencias();
  const { tema, alternarTema } = useTema();
  const { addToast } = useToast();

  const [mostrarNovaConta, setMostrarNovaConta] = useState(false);
  const [novaContaNome, setNovaContaNome] = useState('');
  const [novaContaTipo, setNovaContaTipo] = useState('Pessoal');
  const [editandoContaNome, setEditandoContaNome] = useState({});
  const [editandoContaTipo, setEditandoContaTipo] = useState({});

  const [mostrarNovaCategoria, setMostrarNovaCategoria] = useState(false);
  const [novaCatNome, setNovaCatNome] = useState('');
  const [novaCatTipo, setNovaCatTipo] = useState(TIPO_TRANSACAO.SAIDA);
  const [novaCatCor, setNovaCatCor] = useState(categoryColors[0]);

  const [editandoCategoria, setEditandoCategoria] = useState(null);
  const [editCatNome, setEditCatNome] = useState('');
  const [editCatTipo, setEditCatTipo] = useState(TIPO_TRANSACAO.SAIDA);
  const [editCatCor, setEditCatCor] = useState(categoryColors[0]);
  const [isSavingCategoria, setIsSavingCategoria] = useState(false);

  const [contaExcluir, setContaExcluir] = useState(null);
  const [alterarSenhaAberto, setAlterarSenhaAberto] = useState(false);
  const [senhaAtual, setSenhaAtual] = useState('');
  const [senhaNova, setSenhaNova] = useState('');

  const [exportPeriodo, setExportPeriodo] = useState('30d');
  const [exportFormato, setExportFormato] = useState('csv');

  async function handleCriarConta() {
    if (!novaContaNome.trim()) return;
    try {
      const nova = await createConta({ nome: novaContaNome.trim(), tipo: novaContaTipo });
      setContas((prev) => [...prev, nova]);
      setNovaContaNome('');
      setMostrarNovaConta(false);
      addToast('Conta criada com sucesso!', 'success');
    } catch (err) {
      addToast(err.message, 'error');
    }
  }

  async function handleSalvarConta(id) {
    const nome = editandoContaNome[id];
    const tipo = editandoContaTipo[id];
    if (!nome?.trim()) return;
    try {
      await updateConta(id, { nome: nome.trim(), tipo });
      setContas((prev) => prev.map((c) => (c.id === id ? { ...c, nome: nome.trim(), tipo } : c)));
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
      setContaExcluir(null);
      addToast(`Conta "${contaExcluir.nome}" excluída!`, 'success');
    } catch (err) {
      addToast(err.message, 'error');
    }
  }

  function iniciarEdicaoCategoria(cat) {
    setEditandoCategoria(cat);
    setEditCatNome(cat.nome);
    setEditCatTipo(cat.tipo === TIPO_TRANSACAO.ENTRADA ? TIPO_TRANSACAO.ENTRADA : TIPO_TRANSACAO.SAIDA);
    setEditCatCor(cat.cor || categoryColors[0]);
  }

  async function handleSalvarCategoria() {
    if (!editandoCategoria) return;
    if (!editCatNome.trim()) {
      addToast('Nome da categoria não pode ficar em branco.', 'error');
      return;
    }
    if (isSavingCategoria) return;
    setIsSavingCategoria(true);
    try {
      await updateCategoria(editandoCategoria.id, {
        nome: editCatNome.trim(),
        tipo: editCatTipo,
        cor: editCatCor,
      });
      setCategorias((prev) =>
        prev.map((c) =>
          c.id === editandoCategoria.id
            ? { ...c, nome: editCatNome.trim(), tipo: editCatTipo, cor: editCatCor }
            : c,
        ),
      );
      setEditandoCategoria(null);
      addToast('Categoria atualizada com sucesso!', 'success');
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setIsSavingCategoria(false);
    }
  }

  async function handleCriarCategoria() {
    if (!novaCatNome.trim()) return;
    try {
      const nova = await createCategoria({
        nome: novaCatNome.trim(),
        tipo: novaCatTipo,
        cor: novaCatCor,
      });
      setCategorias((prev) => [...prev, nova]);
      setNovaCatNome('');
      setMostrarNovaCategoria(false);
      addToast('Categoria criada com sucesso!', 'success');
    } catch (err) {
      addToast(err.message, 'error');
    }
  }

  function handleAlterarSenha(e) {
    e.preventDefault();
    if (!senhaAtual || !senhaNova) {
      addToast('Preencha todos os campos.', 'error');
      return;
    }
    addToast('Senha alterada com sucesso!', 'success');
    setAlterarSenhaAberto(false);
    setSenhaAtual('');
    setSenhaNova('');
  }

  async function handleExportar() {
    try {
      const blob = await exportarTransacoes(null, exportPeriodo, exportFormato);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `exportacao_${exportPeriodo}.${exportFormato}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      addToast('Arquivo exportado com sucesso!', 'success');
    } catch (err) {
      addToast(err.message, 'error');
    }
  }

  function iniciarEdicaoConta(conta) {
    setEditandoContaNome((prev) => ({ ...prev, [conta.id]: conta.nome }));
    setEditandoContaTipo((prev) => ({ ...prev, [conta.id]: conta.tipo }));
  }

  return (
    <div className="px-4 md:px-8 max-w-7xl mx-auto pb-32 md:pb-12 pt-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Settings Navigation Sidebar */}
        <aside className="lg:col-span-3">
          <Card className="p-4 sticky top-24 shadow-sm border border-border/60">
            <nav className="flex flex-col gap-1">
              {navItems.map((item) => {
                const { Icon } = item;
                return (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    className="flex items-center gap-3 px-4 py-2.5 rounded-full hover:bg-secondary transition-all text-xs font-semibold uppercase tracking-wider text-foreground"
                  >
                    <Icon className="w-4 h-4 text-muted-foreground" />
                    <span>{item.label}</span>
                  </a>
                );
              })}
            </nav>

            <div className="border-t border-border/60 mt-4 pt-4 px-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Moon className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs font-semibold uppercase tracking-wider text-foreground">
                  Modo Escuro
                </span>
              </div>
              <Switch checked={tema === 'escuro'} onCheckedChange={alternarTema} />
            </div>
          </Card>
        </aside>

        {/* Main Content Settings */}
        <div className="lg:col-span-9 space-y-10">
          {/* Perfil */}
          <SettingsSection id="perfil" title="Perfil do Usuário" icon={User}>
            <Card className="p-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-[#9fe870] flex items-center justify-center font-black text-[#0e0f0c] text-xl">
                  {prefs.nome ? prefs.nome.charAt(0).toUpperCase() : 'U'}
                </div>
                <div>
                  <h3 className="font-bold text-lg text-foreground">{prefs.nome || 'Usuário'}</h3>
                  <p className="text-xs text-muted-foreground">{prefs.email || 'usuario@email.com'}</p>
                </div>
              </div>
            </Card>
          </SettingsSection>

          {/* Contas */}
          <SettingsSection id="contas" title="Contas e Livros" icon={Building}>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                {contas.length} CONTA(S) ATIVA(S)
              </span>
              <Button
                variant="default"
                size="sm"
                onClick={() => setMostrarNovaConta(true)}
              >
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
                  />
                  <select
                    className="flex h-12 w-full rounded-xl border border-input bg-card px-4 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    value={novaContaTipo}
                    onChange={(e) => setNovaContaTipo(e.target.value)}
                  >
                    <option value="Pessoal">Pessoal</option>
                    <option value="Comercial">Comercial</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <Button variant="default" size="sm" onClick={handleCriarConta}>
                    Salvar Conta
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setMostrarNovaConta(false)}
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
                    className="p-5 flex flex-col justify-between hover:shadow-md transition-all group border border-border/60"
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
                        />
                        <select
                          className="flex h-10 w-full rounded-xl border border-input bg-card px-3 py-1 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
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
                            onClick={() => {
                              setEditandoContaNome((prev) => {
                                const n = { ...prev };
                                delete n[conta.id];
                                return n;
                              });
                            }}
                          >
                            Cancelar
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <h4 className="font-bold text-base text-foreground mb-2">
                          {conta.nome}
                        </h4>
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

          {/* Categorias */}
          <SettingsSection id="categorias" title="Categorias" icon={Tag}>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                {categorias.length} CATEGORIA(S)
              </span>
              <Button
                variant="default"
                size="sm"
                onClick={() => setMostrarNovaCategoria(true)}
              >
                <Plus className="w-4 h-4 mr-1 stroke-[2.5]" />
                Nova Categoria
              </Button>
            </div>

            {mostrarNovaCategoria && (
              <Card className="mb-6 p-6 space-y-4 border-2 border-primary">
                <h4 className="font-bold text-sm text-foreground uppercase tracking-wide">
                  Nova Categoria
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    placeholder="Nome da categoria (ex: Vendas, Alimentação...)"
                    value={novaCatNome}
                    onChange={(e) => setNovaCatNome(e.target.value)}
                  />
                  <select
                    className="flex h-12 w-full rounded-xl border border-input bg-card px-4 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    value={novaCatTipo}
                    onChange={(e) => setNovaCatTipo(e.target.value)}
                  >
                    <option value="Entrada">Entrada</option>
                    <option value="Saida">Saída</option>
                  </select>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-muted-foreground uppercase">
                    Cor:
                  </span>
                  <div className="flex gap-2">
                    {categoryColors.map((cor) => (
                      <button
                        key={cor}
                        type="button"
                        onClick={() => setNovaCatCor(cor)}
                        className={cn(
                          'w-6 h-6 rounded-full transition-transform',
                          novaCatCor === cor && 'ring-2 ring-foreground ring-offset-2 scale-110'
                        )}
                        style={{ backgroundColor: cor }}
                      />
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="default" size="sm" onClick={handleCriarCategoria}>
                    Salvar Categoria
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setMostrarNovaCategoria(false)}
                  >
                    Cancelar
                  </Button>
                </div>
              </Card>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {categorias.map((cat) => {
                const isEntrada = cat.tipo === TIPO_TRANSACAO.ENTRADA;
                return (
                  <Card
                    key={cat.id}
                    className="p-4 flex items-center justify-between hover:shadow-md transition-all cursor-pointer group"
                    onClick={() => iniciarEdicaoCategoria(cat)}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className="w-3.5 h-3.5 rounded-full shrink-0"
                        style={{ backgroundColor: cat.cor || categoryColors[0] }}
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-foreground truncate">{cat.nome}</p>
                        <span
                          className={cn(
                            'text-[10px] font-semibold uppercase',
                            isEntrada ? 'text-[#2ead4b]' : 'text-[#d03238]'
                          )}
                        >
                          {isEntrada ? 'Entrada' : 'Saída'}
                        </span>
                      </div>
                    </div>
                    <Edit2 className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Card>
                );
              })}
            </div>
          </SettingsSection>

          {/* Preferências */}
          <SettingsSection id="preferencias" title="Preferências do Sistema" icon={Sliders}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="p-5 space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Idioma
                </label>
                <select className="flex h-11 w-full rounded-xl border border-input bg-card px-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary">
                  <option>Português (Brasil)</option>
                  <option>English (US)</option>
                  <option>Español</option>
                </select>
              </Card>

              <Card className="p-5 space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Moeda Padrão
                </label>
                <select className="flex h-11 w-full rounded-xl border border-input bg-card px-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary">
                  <option>Real Brasileiro (BRL - R$)</option>
                  <option>US Dollar (USD - $)</option>
                  <option>Euro (EUR - €)</option>
                </select>
              </Card>
            </div>
          </SettingsSection>

          {/* Notificações */}
          <SettingsSection id="notificacoes" title="Notificações e Alertas" icon={Bell}>
            <div className="space-y-3">
              <Card className="p-5 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-foreground">Alertas de Saldo Baixo</h4>
                  <p className="text-xs text-muted-foreground">
                    Avisar quando a conta atingir saldo crítico
                  </p>
                </div>
                <Switch defaultChecked />
              </Card>

              <Card className="p-5 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-foreground">Lembrete Diário de Lançamentos</h4>
                  <p className="text-xs text-muted-foreground">
                    Receba um lembrete para manter suas contas atualizadas
                  </p>
                </div>
                <Switch defaultChecked />
              </Card>
            </div>
          </SettingsSection>

          {/* Exportar */}
          <SettingsSection id="exportar" title="Exportação de Relatórios" icon={Download}>
            <Card className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Período do Relatório
                  </label>
                  <select
                    className="flex h-11 w-full rounded-xl border border-input bg-card px-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    value={exportPeriodo}
                    onChange={(e) => setExportPeriodo(e.target.value)}
                  >
                    <option value="30d">Últimos 30 dias</option>
                    <option value="ano">Este Ano (2026)</option>
                    <option value="todo">Todo o Histórico</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Formato de Exportação
                  </label>
                  <div className="flex gap-4 h-11 items-center">
                    <label className="flex items-center gap-2 cursor-pointer text-sm font-medium">
                      <input
                        type="radio"
                        name="format"
                        value="csv"
                        checked={exportFormato === 'csv'}
                        onChange={(e) => setExportFormato(e.target.value)}
                        className="accent-primary"
                      />
                      Planilha CSV
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-sm font-medium">
                      <input
                        type="radio"
                        name="format"
                        value="pdf"
                        checked={exportFormato === 'pdf'}
                        onChange={(e) => setExportFormato(e.target.value)}
                        className="accent-primary"
                      />
                      PDF
                    </label>
                  </div>
                </div>
              </div>

              <Button
                variant="default"
                size="lg"
                onClick={handleExportar}
                className="w-full"
              >
                <Download className="w-4 h-4 mr-2" />
                Baixar Arquivo
              </Button>
            </Card>
          </SettingsSection>

          {/* Segurança */}
          <SettingsSection id="seguranca" title="Segurança da Conta" icon={Shield}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card
                className="p-5 flex items-center justify-between hover:shadow-md transition-all cursor-pointer"
                onClick={() => setAlterarSenhaAberto(!alterarSenhaAberto)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                    <Lock className="w-5 h-5 text-foreground" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-foreground">Alterar Senha</h4>
                    <p className="text-xs text-muted-foreground">Atualizar credencial de login</p>
                  </div>
                </div>
              </Card>
            </div>

            {alterarSenhaAberto && (
              <Card className="mt-4 p-6 space-y-4 border border-border/60">
                <h4 className="font-bold text-sm text-foreground uppercase tracking-wide">
                  Alteração de Senha
                </h4>
                <form onSubmit={handleAlterarSenha} className="space-y-4">
                  <Input
                    type="password"
                    placeholder="Senha atual"
                    value={senhaAtual}
                    onChange={(e) => setSenhaAtual(e.target.value)}
                    required
                  />
                  <Input
                    type="password"
                    placeholder="Nova senha"
                    value={senhaNova}
                    onChange={(e) => setSenhaNova(e.target.value)}
                    required
                  />
                  <div className="flex gap-2">
                    <Button variant="default" size="sm" type="submit">
                      Salvar Nova Senha
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      type="button"
                      onClick={() => setAlterarSenhaAberto(false)}
                    >
                      Cancelar
                    </Button>
                  </div>
                </form>
              </Card>
            )}
          </SettingsSection>
        </div>
      </div>

      {/* Edit Category Dialog */}
      <Dialog
        open={Boolean(editandoCategoria)}
        onOpenChange={(open) => {
          if (!open) setEditandoCategoria(null);
        }}
      >
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-full"
              style={{ backgroundColor: editCatCor }}
            />
            <DialogTitle>Editar Categoria</DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-4 my-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
              Nome da Categoria
            </label>
            <Input
              disabled={isSavingCategoria}
              placeholder="Nome"
              value={editCatNome}
              onChange={(e) => setEditCatNome(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
              Tipo
            </label>
            <select
              disabled={isSavingCategoria}
              className="flex h-11 w-full rounded-xl border border-input bg-card px-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              value={editCatTipo}
              onChange={(e) => setEditCatTipo(e.target.value)}
            >
              <option value="Entrada">Entrada</option>
              <option value="Saida">Saída</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
              Cor do Marcador
            </label>
            <div className="flex gap-2">
              {categoryColors.map((cor) => (
                <button
                  key={cor}
                  type="button"
                  onClick={() => setEditCatCor(cor)}
                  className={cn(
                    'w-7 h-7 rounded-full transition-transform',
                    editCatCor === cor && 'ring-2 ring-foreground ring-offset-2 scale-110'
                  )}
                  style={{ backgroundColor: cor }}
                />
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setEditandoCategoria(null)}
            disabled={isSavingCategoria}
          >
            Cancelar
          </Button>
          <Button
            variant="default"
            onClick={handleSalvarCategoria}
            disabled={isSavingCategoria}
          >
            Salvar
          </Button>
        </DialogFooter>
      </Dialog>

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
            Todas as transações vinculadas à conta "{contaExcluir?.nome}" serão excluídas permanentemente. Esta ação não pode ser desfeita.
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
    </div>
  );
}
