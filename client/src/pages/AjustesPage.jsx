import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import usePreferencias from '../hooks/usePreferencias';
import { useTema } from '../contexts/ThemeContext';
import {
  createConta,
  updateConta,
  deleteConta,
  createCategoria,
  exportarTransacoes,
} from '../services/api';
import { useToast } from '../contexts/ToastContext';
import SettingsSection from '../components/settings/SettingsSection';

const categoryColors = ['#fda958', '#2f6b4f', '#1a5052', '#ba1a1a', '#8d4f00', '#7c4dff', '#009688', '#e91e63'];

const navItems = [
  { id: 'perfil', label: 'Perfil', icon: 'person' },
  { id: 'contas', label: 'Contas', icon: 'account_balance' },
  { id: 'categorias', label: 'Categorias', icon: 'category' },
  { id: 'preferencias', label: 'Preferências', icon: 'tune' },
  { id: 'notificacoes', label: 'Notificações', icon: 'notifications' },
  { id: 'exportar', label: 'Exportar', icon: 'file_download' },
  { id: 'seguranca', label: 'Segurança', icon: 'security' },
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
  const [novaCatTipo, setNovaCatTipo] = useState('Saida');
  const [novaCatCor, setNovaCatCor] = useState(categoryColors[0]);

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
      addToast('Conta criada!', 'success');
    } catch (err) { addToast(err.message, 'error'); }
  }

  async function handleSalvarConta(id) {
    const nome = editandoContaNome[id];
    const tipo = editandoContaTipo[id];
    if (!nome?.trim()) return;
    try {
      await updateConta(id, { nome: nome.trim(), tipo });
      setContas((prev) => prev.map((c) => (c.id === id ? { ...c, nome: nome.trim(), tipo } : c)));
      setEditandoContaNome((prev) => { const n = { ...prev }; delete n[id]; return n; });
      setEditandoContaTipo((prev) => { const n = { ...prev }; delete n[id]; return n; });
      addToast('Conta atualizada!', 'success');
    } catch (err) { addToast(err.message, 'error'); }
  }

  async function handleDeletarConta() {
    if (!contaExcluir) return;
    try {
      await deleteConta(contaExcluir.id);
      setContas((prev) => prev.filter((c) => c.id !== contaExcluir.id));
      setContaExcluir(null);
      addToast(`Conta "${contaExcluir.nome}" excluída!`, 'success');
    } catch (err) { addToast(err.message, 'error'); }
  }

  async function handleCriarCategoria() {
    if (!novaCatNome.trim()) return;
    try {
      const nova = await createCategoria({ nome: novaCatNome.trim(), tipo: novaCatTipo, cor: novaCatCor });
      setCategorias((prev) => [...prev, nova]);
      setNovaCatNome('');
      setMostrarNovaCategoria(false);
      addToast('Categoria criada!', 'success');
    } catch (err) { addToast(err.message, 'error'); }
  }

  function handleAlterarSenha(e) {
    e.preventDefault();
    if (!senhaAtual || !senhaNova) { addToast('Preencha todos os campos.', 'error'); return; }
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
      a.download = 'exportacao.' + exportFormato;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      addToast('Arquivo exportado com sucesso!', 'success');
    } catch (err) { addToast(err.message, 'error'); }
  }

  function iniciarEdicaoConta(conta) {
    setEditandoContaNome((prev) => ({ ...prev, [conta.id]: conta.nome }));
    setEditandoContaTipo((prev) => ({ ...prev, [conta.id]: conta.tipo }));
  }

  return (
    <div className="px-4 md:px-8 max-w-7xl mx-auto pb-32 md:pb-12 pt-4 md:pt-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <aside className="lg:col-span-3">
          <div className="bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.08)] border border-[#C7C4B8] p-3 sticky top-24">
            <nav className="flex flex-col gap-0.5">
              {navItems.map((item) => (
                <a
                  key={item.id}
                  href={'#' + item.id}
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg hover:bg-[#F5F5F2] transition-all text-sm text-[#181D1A]"
                >
                  <span className="material-symbols-outlined text-[#2F6B4F] text-lg">{item.icon}</span>
                  <span className="font-semibold">{item.label}</span>
                </a>
              ))}
            </nav>
            <div className="border-t border-[#C7C4B8]/40 mt-3 pt-3 px-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#2F6B4F] text-lg">dark_mode</span>
                <span className="text-sm font-semibold">Modo Escuro</span>
              </div>
              <label className="inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={tema === 'escuro'} onChange={alternarTema} />
                <div className="toggle-switch peer"></div>
              </label>
            </div>
          </div>
        </aside>

        <div className="lg:col-span-9 space-y-8">
          <SettingsSection id="perfil" title="Perfil" icon="person" color="#2F6B4F">
            <div className="bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.08)] border border-[#C7C4B8] p-4 flex items-center justify-between group hover:bg-[#F5F5F2] transition-all cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[#2F6B4F] bg-[#2F6B4F]/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[#2F6B4F]">person</span>
                </div>
                <div>
                  <p className="font-semibold text-[#181D1A]">{prefs.nome}</p>
                  <p className="text-sm text-[#707972]">{prefs.email}</p>
                </div>
              </div>
              <span className="material-symbols-outlined text-[#C7C4B8] group-hover:text-[#2F6B4F] transition-colors">chevron_right</span>
            </div>
          </SettingsSection>

          <SettingsSection id="contas" title="Contas Bancárias" icon="account_balance" color="#2F6B4F">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold text-[#707972] uppercase tracking-wider">{contas.length} CONTA(S)</span>
              <button
                onClick={() => setMostrarNovaConta(true)}
                className="text-sm font-semibold text-[#2F6B4F] flex items-center gap-1 hover:underline"
              >
                <span className="material-symbols-outlined text-lg">add</span>
                NOVA CONTA
              </button>
            </div>

            {mostrarNovaConta && (
              <div className="mb-4 p-4 bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.08)] border border-[#C7C4B8] space-y-3">
                <input className="w-full px-3 py-2 border border-[#C7C4B8] rounded-lg text-sm" placeholder="Nome da conta" value={novaContaNome} onChange={(e) => setNovaContaNome(e.target.value)} />
                <select className="w-full px-3 py-2 border border-[#C7C4B8] rounded-lg text-sm bg-white" value={novaContaTipo} onChange={(e) => setNovaContaTipo(e.target.value)}>
                  <option value="Pessoal">Pessoal</option>
                  <option value="Comercial">Comercial</option>
                </select>
                <div className="flex gap-2">
                  <button onClick={handleCriarConta} className="px-4 py-2 bg-[#2F6B4F] text-white rounded-lg text-sm font-semibold">Salvar</button>
                  <button onClick={() => setMostrarNovaConta(false)} className="px-4 py-2 border border-[#C7C4B8] rounded-lg text-sm">Cancelar</button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {contas.map((conta) => {
                const editando = editandoContaNome[conta.id] !== undefined;
                return (
                  <div key={conta.id} className="bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.08)] border border-[#C7C4B8] p-4 border-l-4 border-l-[#2F6B4F] hover:bg-[#F5F5F2] transition-all">
                    <div className="flex justify-between items-start mb-2">
                      <div className="p-2 bg-[#F5F5F2] rounded-lg">
                        <span className="material-symbols-outlined text-[#2F6B4F]">{conta.tipo === 'Comercial' ? 'storefront' : 'person'}</span>
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => iniciarEdicaoConta(conta)} className="p-1 hover:bg-[#F5F5F2] rounded-lg"><span className="material-symbols-outlined text-[#707972]">edit</span></button>
                        <button onClick={() => setContaExcluir(conta)} className="p-1 hover:bg-red-50 rounded-lg"><span className="material-symbols-outlined text-[#B23A2E]">delete</span></button>
                      </div>
                    </div>
                    {editando ? (
                      <div className="flex flex-col gap-2 mt-2">
                        <input className="text-sm px-2 py-1 border rounded" value={editandoContaNome[conta.id]} onChange={(e) => setEditandoContaNome((prev) => ({ ...prev, [conta.id]: e.target.value }))} />
                        <select className="text-sm px-2 py-1 border rounded bg-white" value={editandoContaTipo[conta.id]} onChange={(e) => setEditandoContaTipo((prev) => ({ ...prev, [conta.id]: e.target.value }))}>
                          <option value="Pessoal">Pessoal</option>
                          <option value="Comercial">Comercial</option>
                        </select>
                        <div className="flex gap-1">
                          <button onClick={() => handleSalvarConta(conta.id)} className="text-xs text-[#2F6B4F] font-bold">OK</button>
                          <button onClick={() => { setEditandoContaNome((prev) => { const n = { ...prev }; delete n[conta.id]; return n; }); }} className="text-xs text-[#B23A2E]">X</button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <h3 className="font-semibold text-[#181D1A]">{conta.nome}</h3>
                        <span className={'text-[10px] font-bold px-2 py-0.5 rounded-full border mt-1 inline-block ' + (conta.arquivada ? 'bg-[#707972]/10 text-[#707972] border-[#707972]/20' : 'bg-[#2F6B4F]/10 text-[#2F6B4F] border-[#2F6B4F]/20')}>
                          {conta.arquivada ? 'ARQUIVADA' : 'ATIVA'}
                        </span>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </SettingsSection>

          <SettingsSection id="categorias" title="Categorias" icon="category" color="#2F6B4F">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold text-[#707972] uppercase tracking-wider">{categorias.length} CATEGORIA(S)</span>
              <button
                onClick={() => setMostrarNovaCategoria(true)}
                className="text-sm font-semibold text-[#2F6B4F] flex items-center gap-1 hover:underline"
              >
                <span className="material-symbols-outlined text-lg">add</span>
                NOVA CATEGORIA
              </button>
            </div>

            {mostrarNovaCategoria && (
              <div className="mb-4 p-4 bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.08)] border border-[#C7C4B8] space-y-3">
                <input className="w-full px-3 py-2 border border-[#C7C4B8] rounded-lg text-sm" placeholder="Nome da categoria" value={novaCatNome} onChange={(e) => setNovaCatNome(e.target.value)} />
                <select className="w-full px-3 py-2 border border-[#C7C4B8] rounded-lg text-sm bg-white" value={novaCatTipo} onChange={(e) => setNovaCatTipo(e.target.value)}>
                  <option value="Entrada">Entrada</option>
                  <option value="Saida">Saída</option>
                </select>
                <div className="flex gap-2 items-center">
                  <span className="text-xs font-semibold text-[#707972]">Cor:</span>
                  <div className="flex gap-1">
                    {categoryColors.map((cor) => (
                      <button key={cor} onClick={() => setNovaCatCor(cor)} className={'w-5 h-5 rounded-full border-2 ' + (novaCatCor === cor ? 'border-[#2F6B4F]' : 'border-transparent')} style={{ backgroundColor: cor }} />
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={handleCriarCategoria} className="px-4 py-2 bg-[#2F6B4F] text-white rounded-lg text-sm font-semibold">Salvar</button>
                  <button onClick={() => setMostrarNovaCategoria(false)} className="px-4 py-2 border border-[#C7C4B8] rounded-lg text-sm">Cancelar</button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {categorias.map((cat) => {
                const isEntrada = cat.tipo === 'Entrada';
                return (
                  <div key={cat.id} className="bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.08)] border border-[#C7C4B8] p-3 flex items-center gap-3 hover:bg-[#F5F5F2] transition-all cursor-pointer">
                    <div className="w-4 h-4 rounded-full shrink-0" style={{ backgroundColor: cat.cor || categoryColors[0] }}></div>
                    <div>
                      <p className="text-sm font-semibold text-[#181D1A]">{cat.nome}</p>
                      <p className={'text-[10px] font-bold uppercase ' + (isEntrada ? 'text-[#105137]' : 'text-[#B23A2E]')}>{isEntrada ? 'Entrada' : 'Saída'}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </SettingsSection>

          <SettingsSection id="preferencias" title="Preferências" icon="tune" color="#D98B3D">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.08)] border border-[#C7C4B8] p-4 space-y-1">
                <label className="text-[10px] font-semibold text-[#707972] uppercase tracking-wider">IDIOMA</label>
                <select className="w-full border border-[#C7C4B8] rounded-lg p-2.5 text-sm bg-white">
                  <option>Português (Brasil)</option>
                  <option>English (US)</option>
                  <option>Español</option>
                </select>
              </div>
              <div className="bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.08)] border border-[#C7C4B8] p-4 space-y-1">
                <label className="text-[10px] font-semibold text-[#707972] uppercase tracking-wider">MOEDA PADRÃO</label>
                <select className="w-full border border-[#C7C4B8] rounded-lg p-2.5 text-sm bg-white">
                  <option>Real Brasileiro (BRL)</option>
                  <option>Dollar (USD)</option>
                  <option>Euro (EUR)</option>
                </select>
              </div>
            </div>
          </SettingsSection>

          <SettingsSection id="notificacoes" title="Notificações" icon="notifications" color="#D98B3D">
            <div className="space-y-2">
              <div className="bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.08)] border border-[#C7C4B8] p-3.5 flex items-center justify-between hover:bg-[#F5F5F2] transition-all">
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-[#8d4f00]">notifications_active</span>
                  <span className="text-sm">Alertas de Gasto</span>
                </div>
                <label className="inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="toggle-switch peer"></div>
                </label>
              </div>
              <div className="bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.08)] border border-[#C7C4B8] p-3.5 flex items-center justify-between hover:bg-[#F5F5F2] transition-all">
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-[#2F6B4F]">mail</span>
                  <span className="text-sm">Relatórios Mensais</span>
                </div>
                <label className="inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="toggle-switch peer"></div>
                </label>
              </div>
            </div>
          </SettingsSection>

          <SettingsSection id="exportar" title="Exportar Dados" icon="file_download" color="#D98B3D">
            <div className="bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.08)] border border-[#C7C4B8] p-4 space-y-4 border-l-4 border-l-[#D98B3D]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-semibold text-[#707972] uppercase tracking-wider">PERÍODO</label>
                  <select className="w-full border border-[#C7C4B8] rounded-lg p-2.5 text-sm bg-white" value={exportPeriodo} onChange={(e) => setExportPeriodo(e.target.value)}>
                    <option value="30d">Últimos 30 dias</option>
                    <option value="ano">Este Ano</option>
                    <option value="todo">Todo o Histórico</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-semibold text-[#707972] uppercase tracking-wider">FORMATO</label>
                  <div className="flex gap-4 h-full items-center">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input type="radio" name="format" value="csv" checked={exportFormato === 'csv'} onChange={(e) => setExportFormato(e.target.value)} className="text-[#D98B3D]" />
                      <span className="text-sm">CSV</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input type="radio" name="format" value="pdf" checked={exportFormato === 'pdf'} onChange={(e) => setExportFormato(e.target.value)} className="text-[#D98B3D]" />
                      <span className="text-sm">PDF (Relatório)</span>
                    </label>
                  </div>
                </div>
              </div>
              <button
                onClick={handleExportar}
                className="w-full bg-[#D98B3D] hover:bg-[#C27A2F] text-white py-3 rounded-lg font-semibold text-sm shadow-md transition-all"
              >
                BAIXAR ARQUIVO
              </button>
            </div>
          </SettingsSection>

          <SettingsSection id="seguranca" title="Segurança" icon="security" color="#B23A2E">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <button
                onClick={() => setAlterarSenhaAberto(!alterarSenhaAberto)}
                className="bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.08)] border border-[#C7C4B8] p-4 flex items-center gap-4 hover:bg-[#F5F5F2] transition-all text-left"
              >
                <span className="material-symbols-outlined text-[#2F6B4F]" style={{ fontSize: 28 }}>lock_reset</span>
                <div>
                  <p className="font-semibold text-[#181D1A]">Alterar Senha</p>
                  <p className="text-xs text-[#707972]">Atualizado recentemente</p>
                </div>
              </button>

              <div className="bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.08)] border border-[#C7C4B8] p-4 flex items-center gap-4 hover:bg-[#F5F5F2] transition-all">
                <span className="material-symbols-outlined text-[#B23A2E]" style={{ fontSize: 28 }}>delete_forever</span>
                <div>
                  <p className="font-semibold text-[#B23A2E]">EXCLUIR CONTA</p>
                  <p className="text-xs text-[#B23A2E]/60">Esta ação é irreversível</p>
                </div>
              </div>
            </div>

            {alterarSenhaAberto && (
              <form onSubmit={handleAlterarSenha} className="mt-4 p-4 bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.08)] border border-[#B23A2E] space-y-3 border-l-4 border-l-[#B23A2E]">
                <input className="w-full px-3 py-2 border border-[#C7C4B8] rounded-lg text-sm" type="password" placeholder="Senha atual" value={senhaAtual} onChange={(e) => setSenhaAtual(e.target.value)} />
                <input className="w-full px-3 py-2 border border-[#C7C4B8] rounded-lg text-sm" type="password" placeholder="Nova senha" value={senhaNova} onChange={(e) => setSenhaNova(e.target.value)} />
                <div className="flex gap-2">
                  <button type="submit" className="px-4 py-2 bg-[#2F6B4F] text-white rounded-lg text-sm font-semibold">Salvar</button>
                  <button type="button" onClick={() => setAlterarSenhaAberto(false)} className="px-4 py-2 border border-[#C7C4B8] rounded-lg text-sm">Cancelar</button>
                </div>
              </form>
            )}
          </SettingsSection>
        </div>
      </div>

      {contaExcluir && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6 space-y-4 animate-fadeIn">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-3xl text-[#B23A2E]">warning</span>
              <h3 className="text-lg font-bold text-[#181D1A]">Excluir conta?</h3>
            </div>
            <p className="text-sm text-[#707972]">
              Todas as transações desta conta também serão excluídas. Esta ação é irreversível.
            </p>
            <div className="bg-[#FFF4F2] border border-[#B23A2E]/20 rounded-lg p-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#B23A2E] text-lg">account_balance</span>
              <div>
                <p className="text-sm font-semibold text-[#181D1A]">{contaExcluir.nome}</p>
                <p className="text-xs text-[#707972]">{contaExcluir.tipo === 'Comercial' ? 'Comercial' : 'Pessoal'}</p>
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={handleDeletarConta}
                className="flex-1 px-4 py-2.5 bg-[#B23A2E] text-white rounded-lg text-sm font-semibold hover:bg-[#962F24] transition-all"
              >
                SIM, EXCLUIR
              </button>
              <button
                onClick={() => setContaExcluir(null)}
                className="flex-1 px-4 py-2.5 border border-[#C7C4B8] rounded-lg text-sm font-semibold text-[#181D1A] hover:bg-[#F5F5F2] transition-all"
              >
                CANCELAR
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
