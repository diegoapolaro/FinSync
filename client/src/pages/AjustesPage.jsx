import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import usePreferencias from '../hooks/usePreferencias';
import { useTema } from '../contexts/ThemeContext';
import {
  createConta,
  updateConta,
  createCategoria,
} from '../services/api';
import { useToast } from '../contexts/ToastContext';

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
  const [novaCatCor, setNovaCatCor] = useState('#96d4b2');

  const [alterarSenhaAberto, setAlterarSenhaAberto] = useState(false);
  const [senhaAtual, setSenhaAtual] = useState('');
  const [senhaNova, setSenhaNova] = useState('');

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

  return (
    <div className="px-margin-mobile md:px-margin-desktop max-w-4xl mx-auto pt-4 md:pt-6 pb-32">
      <section className="mb-xl">
        <div className="flex flex-col md:flex-row items-center gap-md mb-lg p-md bg-white rounded-xl shadow-sm border border-outline-variant">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center border-4 border-primary/10">
              <span className="material-symbols-outlined text-4xl text-primary">person</span>
            </div>
            <button className="absolute bottom-0 right-0 bg-primary text-white p-1.5 rounded-full border-2 border-white shadow-md">
              <span className="material-symbols-outlined text-sm">edit</span>
            </button>
          </div>
          <div className="text-center md:text-left flex-1">
            <h1 className="font-headline-lg text-headline-lg text-on-background">{prefs.nome}</h1>
            <p className="font-body-md text-on-surface-variant">{prefs.email}</p>
            <div className="mt-2 flex flex-wrap justify-center md:justify-start gap-xs">
              <span className="px-3 py-1 rounded-full border border-primary/30 text-primary text-xs font-bold uppercase tracking-wider">Premium Plan</span>
              <span className="px-3 py-1 rounded-full border border-secondary/30 text-secondary text-xs font-bold uppercase tracking-wider">Membro desde 2022</span>
            </div>
          </div>
        </div>
      </section>

      <div className="space-y-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
          <div className="bg-white p-md rounded-xl shadow-sm border-l-4 border-primary-container">
            <div className="flex items-center gap-xs mb-md">
              <span className="material-symbols-outlined text-primary">person</span>
              <h2 className="font-headline-lg text-headline-lg uppercase tracking-tight text-lg">Perfil</h2>
            </div>
            <ul className="space-y-sm">
              <li className="flex justify-between items-center py-2 border-b border-outline-variant/30">
                <span className="text-on-surface-variant">Nome de exibição</span>
                <span className="font-bold">{prefs.nome}</span>
              </li>
              <li className="flex justify-between items-center py-2 border-b border-outline-variant/30">
                <span className="text-on-surface-variant">Idioma</span>
                <span className="font-bold">Português (BR)</span>
              </li>
              <li className="flex justify-between items-center py-2">
                <span className="text-on-surface-variant">Moeda Principal</span>
                <span className="font-data-md text-data-md">BRL (R$)</span>
              </li>
            </ul>
          </div>

          <div className="bg-white p-md rounded-xl shadow-sm border-l-4 border-tertiary">
            <div className="flex items-center gap-xs mb-md">
              <span className="material-symbols-outlined text-tertiary">tune</span>
              <h2 className="font-headline-lg text-headline-lg uppercase tracking-tight text-lg">Preferências</h2>
            </div>
            <div className="space-y-sm">
              <div className="flex justify-between items-center">
                <span className="text-on-surface-variant">Modo Escuro</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={tema === 'escuro'}
                    onChange={alternarTema}
                  />
                  <div className="w-11 h-6 bg-outline-variant rounded-full peer peer-checked:bg-primary peer-focus:ring-2 peer-focus:ring-primary/30 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
                </label>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-on-surface-variant">Notificações Push</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    defaultChecked
                  />
                  <div className="w-11 h-6 bg-outline-variant rounded-full peer peer-checked:bg-primary peer-focus:ring-2 peer-focus:ring-primary/30 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-md rounded-xl shadow-sm border-l-4 border-secondary">
          <div className="flex justify-between items-center mb-md">
            <div className="flex items-center gap-xs">
              <span className="material-symbols-outlined text-secondary">account_balance</span>
              <h2 className="font-headline-lg text-headline-lg uppercase tracking-tight text-lg">Contas &amp; Cartões</h2>
            </div>
            <button
              type="button"
              onClick={() => setMostrarNovaConta(true)}
              className="bg-secondary text-on-secondary px-4 py-1.5 rounded-lg text-sm font-bold flex items-center gap-xs hover:shadow-lg transition-shadow"
            >
              <span className="material-symbols-outlined text-sm">add</span>
              Nova Conta
            </button>
          </div>

          {mostrarNovaConta && (
            <div className="mb-4 p-4 bg-surface-container rounded-lg border border-outline-variant">
              <input
                className="w-full px-3 py-2 border border-outline-variant rounded-lg mb-2 bg-white font-body-md"
                placeholder="Nome da conta"
                value={novaContaNome}
                onChange={(e) => setNovaContaNome(e.target.value)}
              />
              <select
                className="w-full px-3 py-2 border border-outline-variant rounded-lg mb-2 bg-white font-body-md"
                value={novaContaTipo}
                onChange={(e) => setNovaContaTipo(e.target.value)}
              >
                <option value="Pessoal">Pessoal</option>
                <option value="Comercial">Comercial</option>
              </select>
              <div className="flex gap-2">
                <button type="button" onClick={handleCriarConta} className="px-4 py-2 bg-primary text-on-primary rounded-lg text-sm font-bold">Salvar</button>
                <button type="button" onClick={() => setMostrarNovaConta(false)} className="px-4 py-2 border border-outline-variant rounded-lg text-sm">Cancelar</button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-sm">
            {contas.map((conta) => {
              const editando = editandoContaNome[conta.id] !== undefined;
              return (
                <div key={conta.id} className="p-sm bg-surface-container rounded-lg border border-outline-variant/20 flex flex-col justify-between h-32 relative overflow-hidden group">
                  <div className="flex justify-between">
                    <span className="font-label-caps text-label-caps opacity-60">{conta.nome}</span>
                    <span className="material-symbols-outlined text-primary">account_balance_wallet</span>
                  </div>
                  {editando ? (
                    <div className="flex flex-col gap-1">
                      <input
                        className="text-xs px-2 py-1 border rounded bg-white"
                        value={editandoContaNome[conta.id]}
                        onChange={(e) => setEditandoContaNome((prev) => ({ ...prev, [conta.id]: e.target.value }))}
                      />
                      <div className="flex gap-1">
                        <button type="button" onClick={() => handleSalvarConta(conta.id)} className="text-xs text-primary font-bold">OK</button>
                        <button type="button" onClick={() => { setEditandoContaNome((prev) => { const n = { ...prev }; delete n[conta.id]; return n; }); }} className="text-xs text-error">X</button>
                      </div>
                    </div>
                  ) : (
                    <div className="font-data-md text-data-md text-primary">R$ 0,00</div>
                  )}
                  <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        setEditandoContaNome((prev) => ({ ...prev, [conta.id]: conta.nome }));
                        setEditandoContaTipo((prev) => ({ ...prev, [conta.id]: conta.tipo }));
                      }}
                      className="material-symbols-outlined text-xs text-on-surface-variant hover:text-primary"
                    >
                      edit
                    </button>
                  </div>
                </div>
              );
            })}
            <div className="p-sm border-2 border-dashed border-outline-variant rounded-lg flex flex-col items-center justify-center h-32 hover:bg-surface-container transition-colors cursor-pointer">
              <span className="material-symbols-outlined text-outline">add_circle</span>
              <span className="font-label-caps text-label-caps mt-1">Conectar Banco</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-md rounded-xl shadow-sm border-l-4 border-error">
          <div className="flex items-center gap-xs mb-md">
            <span className="material-symbols-outlined text-error">security</span>
            <h2 className="font-headline-lg text-headline-lg uppercase tracking-tight text-lg">Segurança</h2>
          </div>
          <div className="space-y-sm">
            <button
              type="button"
              onClick={() => setAlterarSenhaAberto(true)}
              className="w-full flex justify-between items-center p-sm bg-surface-container-low hover:bg-surface-container-high rounded-lg transition-colors group"
            >
              <div className="flex items-center gap-sm">
                <span className="material-symbols-outlined text-on-surface-variant">lock</span>
                <span className="font-body-md">Alterar senha de acesso</span>
              </div>
              <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">chevron_right</span>
            </button>

            {alterarSenhaAberto && (
              <form onSubmit={handleAlterarSenha} className="p-sm bg-surface-container-low rounded-lg space-y-2">
                <input
                  className="w-full px-3 py-2 border border-outline-variant rounded-lg bg-white font-body-md"
                  type="password"
                  placeholder="Senha atual"
                  value={senhaAtual}
                  onChange={(e) => setSenhaAtual(e.target.value)}
                />
                <input
                  className="w-full px-3 py-2 border border-outline-variant rounded-lg bg-white font-body-md"
                  type="password"
                  placeholder="Nova senha"
                  value={senhaNova}
                  onChange={(e) => setSenhaNova(e.target.value)}
                />
                <div className="flex gap-2">
                  <button type="submit" className="px-4 py-2 bg-primary text-on-primary rounded-lg text-sm font-bold">Salvar</button>
                  <button type="button" onClick={() => setAlterarSenhaAberto(false)} className="px-4 py-2 border border-outline-variant rounded-lg text-sm">Cancelar</button>
                </div>
              </form>
            )}

            <div className="flex justify-between items-center p-sm bg-surface-container-low hover:bg-surface-container-high rounded-lg transition-colors">
              <div className="flex items-center gap-sm">
                <span className="material-symbols-outlined text-on-surface-variant">fingerprint</span>
                <span className="font-body-md">Autenticação Biométrica</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-outline-variant rounded-full peer peer-checked:bg-primary peer-focus:ring-2 peer-focus:ring-primary/30 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
              </label>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-md pt-lg">
          <button className="flex-1 py-4 bg-primary text-on-primary font-bold rounded-lg shadow-lg hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-xs">
            <span className="material-symbols-outlined">download</span>
            Baixar Extrato (PDF)
          </button>
          <button className="flex-1 py-4 border-2 border-primary text-primary font-bold rounded-lg hover:bg-primary/5 transition-all flex items-center justify-center gap-xs">
            <span className="material-symbols-outlined">share</span>
            Compartilhar Dados
          </button>
        </div>
      </div>
    </div>
  );
}