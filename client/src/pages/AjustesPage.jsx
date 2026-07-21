import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import usePreferencias from '../hooks/usePreferencias';
import { useTema } from '../contexts/ThemeContext';
import {
  createConta,
  updateConta,
  createCategoria,
  exportarTransacoes,
} from '../services/api';
import { useToast } from '../contexts/ToastContext';

const navItems = [
  { id: 'perfil', label: 'Perfil', icon: 'person', cor: 'text-primary' },
  { id: 'contas', label: 'Contas', icon: 'account_balance', cor: 'text-primary' },
  { id: 'categorias', label: 'Categorias', icon: 'category', cor: 'text-primary' },
  { id: 'preferencias', label: 'Preferências', icon: 'tune', cor: 'text-primary' },
  { id: 'seguranca', label: 'Segurança', icon: 'security', cor: 'text-error' },
];

const categoryColors = ['#fda958', '#2f6b4f', '#1a5052', '#ba1a1a', '#8d4f00', '#7c4dff', '#009688', '#e91e63'];

export default function AjustesPage() {
  const { contas, setContas, categorias, setCategorias } = useOutletContext();
  const { prefs, atualizar } = usePreferencias();
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
      setEditandoContaNome((prev) => { const n = { ...prev }; delete n[id]; return n; });
      setEditandoContaTipo((prev) => { const n = { ...prev }; delete n[id]; return n; });
      addToast('Conta atualizada!', 'success');
    } catch (err) {
      addToast(err.message, 'error');
    }
  }

  async function handleCriarCategoria() {
    if (!novaCatNome.trim()) return;
    try {
      const nova = await createCategoria({ nome: novaCatNome.trim(), tipo: novaCatTipo, cor: novaCatCor });
      setCategorias((prev) => [...prev, nova]);
      setNovaCatNome('');
      setMostrarNovaCategoria(false);
      addToast('Categoria criada!', 'success');
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
      a.download = 'exportacao.' + exportFormato;
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
    <div className="bg-surface min-h-screen py-lg px-margin-mobile md:px-margin-desktop max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-lg">
        <aside className="lg:col-span-3 space-y-md">
          <div className="paper-card p-sm rounded-xl overflow-hidden">
            <div className="flex flex-col gap-base">
              {navItems.map((item) => (
                <a
                  key={item.id}
                  href={'#' + item.id}
                  className="flex items-center gap-sm p-sm rounded-lg hover:bg-surface-container transition-all group"
                >
                  <span className={'material-symbols-outlined ' + item.cor}>{item.icon}</span>
                  <span className={'font-label-caps text-label-caps uppercase ' + item.cor}>{item.label}</span>
                </a>
              ))}
            </div>
          </div>

          <div className="paper-card p-md rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-sm">
              <span className="material-symbols-outlined text-primary">dark_mode</span>
              <span className="font-body-sm font-bold">Modo Escuro</span>
            </div>
            <label className="inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={tema === 'escuro'}
                onChange={alternarTema}
              />
              <div className="toggle-switch peer"></div>
            </label>
          </div>
        </aside>

        <div className="lg:col-span-9 space-y-xl">
          <section className="scroll-mt-32" id="perfil">
            <h2 className="font-headline-lg text-headline-lg text-primary mb-md">Meu Perfil</h2>
            <div className="paper-card p-md rounded-xl flex items-center justify-between cursor-pointer group">
              <div className="flex items-center gap-md">
                <div className="w-[50px] h-[50px] rounded-full overflow-hidden border-2 border-primary group-hover:scale-105 transition-transform bg-primary/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-2xl text-primary">person</span>
                </div>
                <div>
                  <p className="font-body-md font-bold">{prefs.nome}</p>
                  <p className="font-body-sm text-on-surface-variant">{prefs.email}</p>
                </div>
              </div>
              <span className="material-symbols-outlined text-outline-variant group-hover:text-primary transition-colors">arrow_forward_ios</span>
            </div>
          </section>

          <section className="scroll-mt-32" id="contas">
            <div className="flex items-center justify-between mb-md">
              <h2 className="font-headline-lg text-headline-lg text-primary">Contas Bancárias</h2>
              <button
                type="button"
                onClick={() => setMostrarNovaConta(true)}
                className="btn-base bg-primary text-white px-md py-sm rounded-lg font-label-caps text-label-caps hover:bg-opacity-90 flex items-center gap-xs"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
                + NOVA CONTA
              </button>
            </div>

            {mostrarNovaConta && (
              <div className="mb-4 p-4 paper-card rounded-xl border border-outline-variant">
                <input
                  className="input-base w-full px-3 py-2 border border-outline-variant rounded-lg mb-2 bg-surface font-body-md"
                  placeholder="Nome da conta"
                  value={novaContaNome}
                  onChange={(e) => setNovaContaNome(e.target.value)}
                />
                <select
                  className="input-base w-full px-3 py-2 border border-outline-variant rounded-lg mb-2 bg-surface font-body-md"
                  value={novaContaTipo}
                  onChange={(e) => setNovaContaTipo(e.target.value)}
                >
                  <option value="Pessoal">Pessoal</option>
                  <option value="Comercial">Comercial</option>
                </select>
                <div className="flex gap-2">
                  <button type="button" onClick={handleCriarConta} className="btn-base px-4 py-2 bg-primary text-on-primary rounded-lg text-sm font-bold">Salvar</button>
                  <button type="button" onClick={() => setMostrarNovaConta(false)} className="btn-base px-4 py-2 border border-outline-variant rounded-lg text-sm">Cancelar</button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
              {contas.map((conta) => {
                const editando = editandoContaNome[conta.id] !== undefined;
                return (
                  <div key={conta.id} className="paper-card rounded-xl p-md border-l-4 border-primary relative overflow-hidden">
                    <div className="flex justify-between items-start mb-sm">
                      <div className="p-sm bg-surface-container rounded-lg">
                        <span className="material-symbols-outlined text-primary">
                          {conta.tipo === 'Comercial' ? 'storefront' : 'person'}
                        </span>
                      </div>
                      <div className="flex gap-xs">
                        <button
                          type="button"
                          onClick={() => iniciarEdicaoConta(conta)}
                          className="btn-base p-xs hover:bg-surface-container rounded-lg"
                        >
                          <span className="material-symbols-outlined text-[20px] text-outline">edit</span>
                        </button>
                        <button
                          type="button"
                          className="btn-base p-xs hover:bg-error-container rounded-lg"
                        >
                          <span className="material-symbols-outlined text-[20px] text-error">delete</span>
                        </button>
                      </div>
                    </div>
                    {editando ? (
                      <div className="flex flex-col gap-2 mt-2">
                        <input
                          className="input-base text-sm px-2 py-1 border rounded bg-white"
                          value={editandoContaNome[conta.id]}
                          onChange={(e) => setEditandoContaNome((prev) => ({ ...prev, [conta.id]: e.target.value }))}
                        />
                        <select
                          className="input-base text-sm px-2 py-1 border rounded bg-white"
                          value={editandoContaTipo[conta.id]}
                          onChange={(e) => setEditandoContaTipo((prev) => ({ ...prev, [conta.id]: e.target.value }))}
                        >
                          <option value="Pessoal">Pessoal</option>
                          <option value="Comercial">Comercial</option>
                        </select>
                        <div className="flex gap-1">
                          <button type="button" onClick={() => handleSalvarConta(conta.id)} className="btn-base text-xs text-primary font-bold">OK</button>
                          <button type="button" onClick={() => { setEditandoContaNome((prev) => { const n = { ...prev }; delete n[conta.id]; return n; }); }} className="btn-base text-xs text-error">X</button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <h3 className="font-headline-lg text-headline-lg-mobile text-primary">{conta.nome}</h3>
                        <div className="mt-sm">
                          <span className={'text-[10px] font-bold px-sm py-xs rounded-full border ' + (conta.arquivada
                            ? 'bg-outline/10 text-outline border-outline/20'
                            : 'bg-primary/10 text-primary border-primary/20'
                          )}>
                            {conta.arquivada ? 'ARQUIVADA' : 'ATIVA'}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          <section className="scroll-mt-32" id="categorias">
            <div className="flex items-center justify-between mb-md">
              <h2 className="font-headline-lg text-headline-lg text-primary">Categorias</h2>
              <button
                type="button"
                onClick={() => setMostrarNovaCategoria(true)}
                className="btn-base bg-primary text-white px-md py-sm rounded-lg font-label-caps text-label-caps hover:bg-opacity-90"
              >
                + NOVA CATEGORIA
              </button>
            </div>

            {mostrarNovaCategoria && (
              <div className="mb-4 p-4 paper-card rounded-xl border border-outline-variant">
                <input
                  className="input-base w-full px-3 py-2 border border-outline-variant rounded-lg mb-2 bg-surface font-body-md"
                  placeholder="Nome da categoria"
                  value={novaCatNome}
                  onChange={(e) => setNovaCatNome(e.target.value)}
                />
                <select
                  className="input-base w-full px-3 py-2 border border-outline-variant rounded-lg mb-2 bg-surface font-body-md"
                  value={novaCatTipo}
                  onChange={(e) => setNovaCatTipo(e.target.value)}
                >
                  <option value="Entrada">Entrada</option>
                  <option value="Saida">Saída</option>
                </select>
                <div className="flex gap-2 items-center mb-2">
                  <span className="font-label-caps text-label-caps">Cor:</span>
                  <div className="flex gap-1">
                    {categoryColors.map((cor) => (
                      <button
                        key={cor}
                        type="button"
                        onClick={() => setNovaCatCor(cor)}
                        className={'btn-base w-6 h-6 rounded-full border-2 ' + (novaCatCor === cor ? 'border-primary' : 'border-transparent')}
                        style={{ backgroundColor: cor }}
                      />
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={handleCriarCategoria} className="btn-base px-4 py-2 bg-primary text-on-primary rounded-lg text-sm font-bold">Salvar</button>
                  <button type="button" onClick={() => setMostrarNovaCategoria(false)} className="btn-base px-4 py-2 border border-outline-variant rounded-lg text-sm">Cancelar</button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-3 gap-sm">
              {categorias.map((cat) => {
                const isEntrada = cat.tipo === 'Entrada';
                return (
                  <div key={cat.id} className="paper-card p-sm rounded-xl flex items-center justify-between group cursor-pointer border border-transparent hover:border-primary/20">
                    <div className="flex items-center gap-sm">
                      <div className="w-5 h-5 rounded-full shadow-inner" style={{ backgroundColor: cat.cor || categoryColors[0] }}></div>
                      <div>
                        <p className="font-body-sm font-bold">{cat.nome}</p>
                        <p className={'text-[10px] uppercase font-bold ' + (isEntrada ? 'text-primary' : 'text-error')}>
                          {isEntrada ? 'Entrada' : 'Saída'}
                        </p>
                      </div>
                    </div>
                    <span className="material-symbols-outlined text-[18px] opacity-0 group-hover:opacity-100 transition-opacity">edit</span>
                  </div>
                );
              })}
            </div>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
            <section className="scroll-mt-32 space-y-md" id="preferencias">
              <h2 className="font-headline-lg text-headline-lg text-primary">Preferências</h2>
              <div className="space-y-sm">
                <div className="flex flex-col gap-base">
                  <label className="font-label-caps text-label-caps text-outline">IDIOMA DO SISTEMA</label>
                  <select className="custom-select w-full paper-card border border-outline-variant rounded-lg p-sm font-body-md focus:ring-2 focus:ring-primary focus:border-primary outline-none">
                    <option>Português (Brasil)</option>
                    <option>English (US)</option>
                    <option>Español</option>
                  </select>
                </div>
                <div className="flex flex-col gap-base">
                  <label className="font-label-caps text-label-caps text-outline">MOEDA PADRÃO</label>
                  <select className="custom-select w-full paper-card border border-outline-variant rounded-lg p-sm font-body-md focus:ring-2 focus:ring-primary focus:border-primary outline-none">
                    <option>Real Brasileiro (BRL)</option>
                    <option>Dollar (USD)</option>
                    <option>Euro (EUR)</option>
                  </select>
                </div>
              </div>
            </section>

            <section className="scroll-mt-32 space-y-md" id="notificacoes">
              <h2 className="font-headline-lg text-headline-lg text-primary">Notificações</h2>
              <div className="space-y-sm">
                <div className="paper-card p-sm rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-sm">
                    <span className="material-symbols-outlined text-secondary">notifications_active</span>
                    <span className="font-body-md">Alertas de Gasto</span>
                  </div>
                  <label className="inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="toggle-switch peer"></div>
                  </label>
                </div>
                <div className="paper-card p-sm rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-sm">
                    <span className="material-symbols-outlined text-primary">mail</span>
                    <span className="font-body-md">Relatórios Mensais</span>
                  </div>
                  <label className="inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="toggle-switch peer"></div>
                  </label>
                </div>
              </div>
            </section>
          </div>

          <section className="scroll-mt-32" id="exportar">
            <h2 className="font-headline-lg text-headline-lg text-primary mb-md">Exportar Dados</h2>
            <div className="paper-card p-md rounded-xl space-y-md border-l-4 border-secondary">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                <div className="flex flex-col gap-base">
                  <label className="font-label-caps text-label-caps text-outline">PERÍODO</label>
                  <select
                    className="custom-select w-full bg-surface-container rounded-lg p-sm font-body-md border-none focus:ring-2 focus:ring-secondary outline-none"
                    value={exportPeriodo}
                    onChange={(e) => setExportPeriodo(e.target.value)}
                  >
                    <option value="30d">Últimos 30 dias</option>
                    <option value="ano">Este Ano</option>
                    <option value="todo">Todo o Histórico</option>
                  </select>
                </div>
                <div className="flex flex-col gap-base">
                  <label className="font-label-caps text-label-caps text-outline">FORMATO</label>
                  <div className="flex gap-md h-full items-center">
                    <label className="flex items-center gap-xs cursor-pointer">
                      <input
                        type="radio"
                        name="format"
                        value="csv"
                        checked={exportFormato === 'csv'}
                        onChange={(e) => setExportFormato(e.target.value)}
                        className="text-secondary focus:ring-secondary"
                      />
                      <span className="font-body-md">CSV</span>
                    </label>
                    <label className="flex items-center gap-xs cursor-pointer">
                      <input
                        type="radio"
                        name="format"
                        value="pdf"
                        checked={exportFormato === 'pdf'}
                        onChange={(e) => setExportFormato(e.target.value)}
                        className="text-secondary focus:ring-secondary"
                      />
                      <span className="font-body-md">PDF (Relatório)</span>
                    </label>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={handleExportar}
                className="btn-base w-full bg-[#D98B3D] hover:bg-[#C27A2F] text-white py-md rounded-lg font-headline-lg-mobile shadow-md"
              >
                BAIXAR ARQUIVO
              </button>
            </div>
          </section>

          <section className="scroll-mt-32" id="seguranca">
            <h2 className="font-headline-lg text-headline-lg text-error mb-md">Segurança</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
              <button
                type="button"
                onClick={() => setAlterarSenhaAberto(!alterarSenhaAberto)}
                className="paper-card p-md rounded-xl flex items-center justify-between group hover:border-primary/20"
              >
                <div className="flex items-center gap-md">
                  <span className="material-symbols-outlined text-primary text-[32px]">lock_reset</span>
                  <div className="text-left">
                    <p className="font-body-md font-bold">Alterar Senha</p>
                    <p className="font-body-sm text-outline">Atualizado recentemente</p>
                  </div>
                </div>
                <span className="material-symbols-outlined text-outline-variant group-hover:text-primary">chevron_right</span>
              </button>

              <div className="paper-card p-md rounded-xl flex items-center justify-between border border-transparent hover:border-error/20">
                <div className="flex items-center gap-md">
                  <span className="material-symbols-outlined text-error text-[32px]">delete_forever</span>
                  <div className="text-left">
                    <p className="font-body-md font-bold text-error">EXCLUIR CONTA</p>
                    <p className="font-body-sm text-error/60">Esta ação é irreversível</p>
                  </div>
                </div>
                <span className="material-symbols-outlined text-error opacity-40">warning</span>
              </div>
            </div>

            {alterarSenhaAberto && (
              <form onSubmit={handleAlterarSenha} className="mt-md p-md paper-card rounded-xl space-y-2 border-l-4 border-error">
                <input
                  className="input-base w-full px-3 py-2 border border-outline-variant rounded-lg bg-surface font-body-md"
                  type="password"
                  placeholder="Senha atual"
                  value={senhaAtual}
                  onChange={(e) => setSenhaAtual(e.target.value)}
                />
                <input
                  className="input-base w-full px-3 py-2 border border-outline-variant rounded-lg bg-surface font-body-md"
                  type="password"
                  placeholder="Nova senha"
                  value={senhaNova}
                  onChange={(e) => setSenhaNova(e.target.value)}
                />
                <div className="flex gap-2">
                  <button type="submit" className="btn-base px-4 py-2 bg-primary text-on-primary rounded-lg text-sm font-bold">Salvar</button>
                  <button type="button" onClick={() => setAlterarSenhaAberto(false)} className="btn-base px-4 py-2 border border-outline-variant rounded-lg text-sm">Cancelar</button>
                </div>
              </form>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
