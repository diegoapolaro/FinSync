import { useEffect, useState } from 'react';
import Modal from './Modal';
import usePreferencias from '../hooks/usePreferencias';
import {
  createConta,
  updateConta,
  createCategoria,
  updateCategoria,
  exportarTransacoes,
} from '../services/api';

const CORES = [
  '#96d4b2', '#ffb3b3', '#b3d9ff', '#b3ffb3',
  '#ffd9b3', '#d9b3ff', '#ffb3d9', '#b3fff0',
];

export default function Ajustes({ contas, onContasChange, categorias, onCategoriasChange }) {
  const { prefs, atualizar } = usePreferencias();

  const [perfilAberto, setPerfilAberto] = useState(false);
  const [contaEditando, setContaEditando] = useState(null);
  const [contaCriando, setContaCriando] = useState(false);
  const [catEditando, setCatEditando] = useState(null);
  const [catCriando, setCatCriando] = useState(false);
  const [senhaAberto, setSenhaAberto] = useState(false);

  return (
    <div className="torn-edge-top torn-edge-bottom px-gutter pt-margin-page pb-[100px] md:pb-gutter">
      <div className="md:hidden flex justify-between items-center mb-stack-loose pb-stack-base border-b border-dashed border-outline-variant">
        <h1 className="font-headline-md text-headline-md text-primary tracking-tighter uppercase">FINSYNC</h1>
        <span className="material-symbols-outlined text-[28px] text-on-surface">close</span>
      </div>

      <h2 className="font-headline-md text-headline-md uppercase mb-stack-loose text-center">AJUSTES</h2>

      <Perfil prefs={prefs} atualizar={atualizar} aberto={perfilAberto} setAberto={setPerfilAberto} />

      <ContasList
        contas={contas}
        onContasChange={onContasChange}
        editando={contaEditando}
        setEditando={setContaEditando}
        criando={contaCriando}
        setCriando={setContaCriando}
      />

      <Categorias
        categorias={categorias}
        onCategoriasChange={onCategoriasChange}
        editando={catEditando}
        setEditando={setCatEditando}
        criando={catCriando}
        setCriando={setCatCriando}
      />

      <Preferencias prefs={prefs} atualizar={atualizar} />
      <Notificacoes prefs={prefs} atualizar={atualizar} />
      <ExportarDados />
      <Seguranca aberto={senhaAberto} setAberto={setSenhaAberto} />
      <Sobre />
    </div>
  );
}

function Secao({ titulo, children }) {
  return (
    <section className="mb-stack-loose">
      <h3 className="font-headline-md text-[18px] uppercase tracking-wide mb-stack-base text-surface-tint">
        {titulo}
      </h3>
      <div className="pb-stack-base border-b border-dashed border-outline-variant">
        {children}
      </div>
    </section>
  );
}

function Campo({ label, children }) {
  return (
    <div className="flex justify-between items-center py-2">
      <span className="font-body-sm text-body-sm">{label}</span>
      {children}
    </div>
  );
}

function Toggle({ checked, onChange }) {
  return (
    <label className="relative inline-flex items-center cursor-pointer">
      <input type="checkbox" checked={checked} onChange={onChange} className="sr-only peer" />
      <div className="w-11 h-6 bg-surface-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary border-2 border-primary" />
    </label>
  );
}

/* ---- Item 1: Perfil ---- */
function Perfil({ prefs, atualizar, aberto, setAberto }) {
  const [nome, setNome] = useState(prefs.nome);
  const [email, setEmail] = useState(prefs.email);

  function abrir() {
    setNome(prefs.nome);
    setEmail(prefs.email);
    setAberto(true);
  }

  function salvar(e) {
    e.preventDefault();
    atualizar('nome', nome);
    atualizar('email', email);
    setAberto(false);
  }

  return (
    <Secao titulo="PERFIL">
      <div
        className="flex items-center justify-between pb-stack-base border-b border-dashed border-outline-variant hover:bg-surface-container-low transition-colors cursor-pointer group p-2 -mx-2"
        onClick={abrir}
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full border-2 border-primary bg-surface-variant flex items-center justify-center overflow-hidden grayscale">
            <span className="material-symbols-outlined text-primary text-2xl">person</span>
          </div>
          <div>
            <p className="font-body-lg text-body-lg font-bold text-primary">{prefs.nome}</p>
            <p className="font-value-sm text-value-sm text-on-surface-variant">{prefs.email}</p>
          </div>
        </div>
        <span className="material-symbols-outlined text-outline group-hover:text-primary transition-colors">chevron_right</span>
      </div>

      <Modal aberto={aberto} onClose={() => setAberto(false)} titulo="Editar Perfil">
        <form onSubmit={salvar} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1 font-label-caps text-label-caps text-outline">
            Nome
            <input
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
              className="bg-surface-container-lowest border border-outline-variant text-on-surface font-body-lg text-body-lg p-3 focus:border-primary focus:outline-2 focus:outline-primary/10"
            />
          </label>
          <label className="flex flex-col gap-1 font-label-caps text-label-caps text-outline">
            E-mail
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-surface-container-lowest border border-outline-variant text-on-surface font-body-lg text-body-lg p-3 focus:border-primary focus:outline-2 focus:outline-primary/10"
            />
          </label>
          <button
            type="submit"
            className="w-full border-2 border-primary bg-primary text-on-primary py-3 uppercase font-label-caps text-label-caps font-bold hover:bg-ink transition-colors"
          >
            Salvar
          </button>
        </form>
      </Modal>
    </Secao>
  );
}

/* ---- Itens 2 e 3: Contas ---- */
function ContasList({ contas, onContasChange, editando, setEditando, criando, setCriando }) {
  return (
    <Secao titulo="CONTAS">
      <div className="flex flex-col gap-2">
        {contas.map((conta) => (
          <div
            key={conta.id}
            className="flex justify-between items-center p-2 hover:bg-surface-container-low transition-colors group cursor-pointer -mx-2 rounded"
            onClick={() => setEditando(conta)}
          >
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-outline">
                {conta.tipo === 'Comercial' ? 'storefront' : 'person'}
              </span>
              <span className="font-value-sm text-value-sm">{conta.nome}</span>
            </div>
            <span className="material-symbols-outlined text-outline group-hover:text-primary transition-colors text-sm">edit</span>
          </div>
        ))}

        <button
          type="button"
          onClick={() => setCriando(true)}
          className="mt-2 text-left font-label-caps text-label-caps text-primary border-2 border-primary p-2 uppercase hover:bg-primary hover:text-on-primary transition-colors inline-block w-max"
        >
          + NOVA CONTA
        </button>
      </div>

      <EditarContaModal conta={editando} onClose={() => setEditando(null)} onContasChange={onContasChange} />
      <NovaContaModal aberto={criando} onClose={() => setCriando(false)} onContasChange={onContasChange} />
    </Secao>
  );
}

function EditarContaModal({ conta, onClose, onContasChange }) {
  const [nome, setNome] = useState('');
  const [arquivar, setArquivar] = useState(false);

  useEffect(() => {
    if (conta) {
      setNome(conta.nome);
      setArquivar(false);
    }
  }, [conta]);

  if (!conta) return null;

  async function salvar(e) {
    e.preventDefault();
    await updateConta(conta.id, { id: conta.id, nome, tipo: conta.tipo, arquivada: arquivar });
    const res = await fetch('/api/contas');
    onContasChange(await res.json());
    onClose();
  }

  return (
    <Modal aberto={!!conta} onClose={onClose} titulo="Editar Conta">
      <form onSubmit={salvar} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1 font-label-caps text-label-caps text-outline">
          Nome
          <input
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            required
            className="bg-surface-container-lowest border border-outline-variant text-on-surface font-body-lg text-body-lg p-3 focus:border-primary focus:outline-2 focus:outline-primary/10"
          />
        </label>
        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" checked={arquivar} onChange={(e) => setArquivar(e.target.checked)} className="w-4 h-4 accent-primary" />
          <span className="font-body-sm text-body-sm">Arquivar conta (ocultar da lista principal)</span>
        </label>
        <button
          type="submit"
          className="w-full border-2 border-primary bg-primary text-on-primary py-3 uppercase font-label-caps text-label-caps font-bold hover:bg-ink transition-colors"
        >
          Salvar
        </button>
      </form>
    </Modal>
  );
}

function NovaContaModal({ aberto, onClose, onContasChange }) {
  const [nome, setNome] = useState('');
  const [tipo, setTipo] = useState('Pessoal');

  async function salvar(e) {
    e.preventDefault();
    await createConta({ nome, tipo });
    const res = await fetch('/api/contas');
    onContasChange(await res.json());
    setNome('');
    setTipo('Pessoal');
    onClose();
  }

  return (
    <Modal aberto={aberto} onClose={onClose} titulo="Nova Conta">
      <form onSubmit={salvar} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1 font-label-caps text-label-caps text-outline">
          Nome
          <input
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            required
            className="bg-surface-container-lowest border border-outline-variant text-on-surface font-body-lg text-body-lg p-3 focus:border-primary focus:outline-2 focus:outline-primary/10"
          />
        </label>
        <label className="flex flex-col gap-1 font-label-caps text-label-caps text-outline">
          Tipo
          <select
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
            className="bg-surface-container-lowest border border-outline-variant text-on-surface font-body-lg text-body-lg p-3 focus:border-primary focus:outline-2 focus:outline-primary/10"
          >
            <option value="Pessoal">Pessoal</option>
            <option value="Comercial">Comercial</option>
          </select>
        </label>
        <button
          type="submit"
          className="w-full border-2 border-primary bg-primary text-on-primary py-3 uppercase font-label-caps text-label-caps font-bold hover:bg-ink transition-colors"
        >
          Criar Conta
        </button>
      </form>
    </Modal>
  );
}

/* ---- Itens 4 e 5: Categorias ---- */
function Categorias({ categorias, onCategoriasChange, editando, setEditando, criando, setCriando }) {
  return (
    <Secao titulo="CATEGORIAS">
      <div className="flex flex-col gap-2">
        {categorias.map((cat) => (
          <div
            key={cat.id}
            className="flex justify-between items-center p-2 hover:bg-surface-container-low transition-colors group cursor-pointer -mx-2 rounded"
            onClick={() => setEditando(cat)}
          >
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full border" style={{ backgroundColor: cat.cor, borderColor: cat.cor }} />
              <span className="font-value-sm text-value-sm">{cat.nome}</span>
            </div>
            <span className="font-label-caps text-label-caps text-outline">EDITAR</span>
          </div>
        ))}
        <button
          type="button"
          onClick={() => setCriando(true)}
          className="mt-2 text-left font-label-caps text-label-caps text-primary border-2 border-primary p-2 uppercase hover:bg-primary hover:text-on-primary transition-colors inline-block w-max"
        >
          + NOVA CATEGORIA
        </button>
      </div>

      <EditarCategoriaModal categoria={editando} onClose={() => setEditando(null)} onCategoriasChange={onCategoriasChange} />
      <NovaCategoriaModal aberto={criando} onClose={() => setCriando(false)} onCategoriasChange={onCategoriasChange} />
    </Secao>
  );
}

function SeletorCor({ cor, onChange }) {
  return (
    <div className="flex gap-2 flex-wrap">
      {CORES.map((c) => (
        <button
          key={c}
          type="button"
          onClick={() => onChange(c)}
          className={`w-8 h-8 rounded-full border-2 ${cor === c ? 'border-primary scale-110' : 'border-transparent'} transition-transform`}
          style={{ backgroundColor: c }}
        />
      ))}
    </div>
  );
}

function EditarCategoriaModal({ categoria, onClose, onCategoriasChange }) {
  const [nome, setNome] = useState('');
  const [cor, setCor] = useState('#96d4b2');

  useEffect(() => {
    if (categoria) {
      setNome(categoria.nome);
      setCor(categoria.cor);
    }
  }, [categoria]);

  if (!categoria) return null;

  async function salvar(e) {
    e.preventDefault();
    await updateCategoria(categoria.id, { id: categoria.id, nome, cor, tipo: categoria.tipo });
    const res = await fetch('/api/categorias');
    onCategoriasChange(await res.json());
    onClose();
  }

  return (
    <Modal aberto={!!categoria} onClose={onClose} titulo="Editar Categoria">
      <form onSubmit={salvar} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1 font-label-caps text-label-caps text-outline">
          Nome
          <input
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            required
            className="bg-surface-container-lowest border border-outline-variant text-on-surface font-body-lg text-body-lg p-3 focus:border-primary focus:outline-2 focus:outline-primary/10"
          />
        </label>
        <div className="flex flex-col gap-2">
          <span className="font-label-caps text-label-caps text-outline">Cor</span>
          <SeletorCor cor={cor} onChange={setCor} />
        </div>
        <button
          type="submit"
          className="w-full border-2 border-primary bg-primary text-on-primary py-3 uppercase font-label-caps text-label-caps font-bold hover:bg-ink transition-colors"
        >
          Salvar
        </button>
      </form>
    </Modal>
  );
}

function NovaCategoriaModal({ aberto, onClose, onCategoriasChange }) {
  const [nome, setNome] = useState('');
  const [tipo, setTipo] = useState('Entrada');
  const [cor, setCor] = useState('#96d4b2');

  async function salvar(e) {
    e.preventDefault();
    await createCategoria({ nome, cor, tipo });
    const res = await fetch('/api/categorias');
    onCategoriasChange(await res.json());
    setNome('');
    setTipo('Entrada');
    setCor('#96d4b2');
    onClose();
  }

  return (
    <Modal aberto={aberto} onClose={onClose} titulo="Nova Categoria">
      <form onSubmit={salvar} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1 font-label-caps text-label-caps text-outline">
          Nome
          <input
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            required
            className="bg-surface-container-lowest border border-outline-variant text-on-surface font-body-lg text-body-lg p-3 focus:border-primary focus:outline-2 focus:outline-primary/10"
          />
        </label>
        <label className="flex flex-col gap-1 font-label-caps text-label-caps text-outline">
          Tipo
          <select
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
            className="bg-surface-container-lowest border border-outline-variant text-on-surface font-body-lg text-body-lg p-3 focus:border-primary focus:outline-2 focus:outline-primary/10"
          >
            <option value="Entrada">Entrada</option>
            <option value="Saida">Saída</option>
          </select>
        </label>
        <div className="flex flex-col gap-2">
          <span className="font-label-caps text-label-caps text-outline">Cor</span>
          <SeletorCor cor={cor} onChange={setCor} />
        </div>
        <button
          type="submit"
          className="w-full border-2 border-primary bg-primary text-on-primary py-3 uppercase font-label-caps text-label-caps font-bold hover:bg-ink transition-colors"
        >
          Criar Categoria
        </button>
      </form>
    </Modal>
  );
}

/* ---- Itens 6, 7, 8: Preferências ---- */
function Preferencias({ prefs, atualizar }) {
  return (
    <Secao titulo="PREFERÊNCIAS">
      <Campo label="Formato de Data">
        <select
          value={prefs.formatoData}
          onChange={(e) => atualizar('formatoData', e.target.value)}
          className="bg-transparent border-0 border-b border-primary font-value-sm text-value-sm focus:ring-0 p-1 pr-6 cursor-pointer"
        >
          <option value="dd/mm/aaaa">dd/mm/aaaa</option>
          <option value="mm/dd/aaaa">mm/dd/aaaa</option>
          <option value="aaaa-mm-dd">aaaa-mm-dd</option>
        </select>
      </Campo>
      <Campo label="Moeda">
        <select
          value={prefs.moeda}
          onChange={(e) => atualizar('moeda', e.target.value)}
          className="bg-transparent border-0 border-b border-primary font-value-sm text-value-sm focus:ring-0 p-1 pr-6 cursor-pointer"
        >
          <option value="R$ (BRL)">R$ (BRL)</option>
          <option value="$ (USD)">$ (USD)</option>
          <option value="€ (EUR)">€ (EUR)</option>
        </select>
      </Campo>
      <Campo label="Tema (Claro/Escuro)">
        <Toggle
          checked={prefs.tema === 'escuro'}
          onChange={() => atualizar('tema', prefs.tema === 'escuro' ? 'claro' : 'escuro')}
        />
      </Campo>
    </Secao>
  );
}

/* ---- Item 9: Notificações ---- */
function Notificacoes({ prefs, atualizar }) {
  return (
    <Secao titulo="NOTIFICAÇÕES">
      <Campo label="Lembrete diário">
        <Toggle
          checked={prefs.lembreteDiario}
          onChange={() => atualizar('lembreteDiario', !prefs.lembreteDiario)}
        />
      </Campo>
      <Campo label="Alerta de saldo baixo">
        <Toggle
          checked={prefs.alertaSaldoBaixo}
          onChange={() => atualizar('alertaSaldoBaixo', !prefs.alertaSaldoBaixo)}
        />
      </Campo>
    </Secao>
  );
}

/* ---- Item 10: Exportar Dados ---- */
function ExportarDados() {
  const [periodo, setPeriodo] = useState('mes_atual');
  const [exportando, setExportando] = useState(false);

  async function baixar() {
    setExportando(true);
    try {
      const blob = await exportarTransacoes(null, periodo, 'csv');
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `extrato_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      alert('Erro ao exportar transações.');
    }
    setExportando(false);
  }

  return (
    <Secao titulo="EXPORTAR DADOS">
      <Campo label="Período">
        <select
          value={periodo}
          onChange={(e) => setPeriodo(e.target.value)}
          className="bg-transparent border-0 border-b border-primary font-value-sm text-value-sm focus:ring-0 p-1 pr-6 cursor-pointer"
        >
          <option value="mes_atual">Este Mês</option>
          <option value="mes_passado">Mês Passado</option>
          <option value="ultimos_90">Últimos 90 dias</option>
          <option value="todos">Todos</option>
        </select>
      </Campo>
      <button
        type="button"
        onClick={baixar}
        disabled={exportando}
        className="w-full font-label-caps text-label-caps text-primary border-2 border-primary p-3 uppercase hover:bg-primary hover:text-on-primary transition-colors flex justify-center items-center gap-2 mt-4 disabled:opacity-50"
      >
        <span className="material-symbols-outlined">download</span>
        {exportando ? 'EXPORTANDO...' : 'BAIXAR EXTRATO (CSV)'}
      </button>
    </Secao>
  );
}

/* ---- Item 11: Segurança ---- */
function Seguranca({ aberto, setAberto }) {
  return (
    <>
      <Secao titulo="SEGURANÇA">
        <button
          type="button"
          onClick={() => setAberto(true)}
          className="text-left font-body-sm text-body-sm text-primary hover:underline underline-offset-4 decoration-primary decoration-dashed w-max"
        >
          Alterar Senha
        </button>
      </Secao>
      <div className="text-center mt-8 mb-stack-loose">
        <button
          type="button"
          className="font-label-caps text-label-caps text-error hover:underline underline-offset-4 decoration-error decoration-dashed"
        >
          EXCLUIR CONTA PERMANENTEMENTE
        </button>
      </div>

      <AlterarSenhaModal aberto={aberto} onClose={() => setAberto(false)} />
    </>
  );
}

function AlterarSenhaModal({ aberto, onClose }) {
  const [atual, setAtual] = useState('');
  const [nova, setNova] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [erro, setErro] = useState('');

  const coincidem = nova.length > 0 && nova === confirmar;

  function salvar(e) {
    e.preventDefault();
    if (nova !== confirmar) {
      setErro('As senhas não coincidem.');
      return;
    }
    if (nova.length < 6) {
      setErro('A senha deve ter no mínimo 6 caracteres.');
      return;
    }
    localStorage.setItem('finsync_senha', nova);
    setAtual('');
    setNova('');
    setConfirmar('');
    setErro('');
    onClose();
    alert('Senha alterada com sucesso!');
  }

  return (
    <Modal aberto={aberto} onClose={onClose} titulo="Alterar Senha">
      <form onSubmit={salvar} className="flex flex-col gap-4">
        {erro && <p className="font-body-sm text-body-sm text-error bg-error-container p-2">{erro}</p>}
        <label className="flex flex-col gap-1 font-label-caps text-label-caps text-outline">
          Senha Atual
          <input
            type="password"
            value={atual}
            onChange={(e) => setAtual(e.target.value)}
            required
            className="bg-surface-container-lowest border border-outline-variant text-on-surface font-body-lg text-body-lg p-3 focus:border-primary focus:outline-2 focus:outline-primary/10"
          />
        </label>
        <label className="flex flex-col gap-1 font-label-caps text-label-caps text-outline">
          Nova Senha
          <input
            type="password"
            value={nova}
            onChange={(e) => setNova(e.target.value)}
            required
            minLength={6}
            className="bg-surface-container-lowest border border-outline-variant text-on-surface font-body-lg text-body-lg p-3 focus:border-primary focus:outline-2 focus:outline-primary/10"
          />
        </label>
        <label className="flex flex-col gap-1 font-label-caps text-label-caps text-outline">
          Confirmar Nova Senha
          <input
            type="password"
            value={confirmar}
            onChange={(e) => setConfirmar(e.target.value)}
            required
            className={`bg-surface-container-lowest border ${confirmar && !coincidem ? 'border-error' : 'border-outline-variant'} text-on-surface font-body-lg text-body-lg p-3 focus:border-primary focus:outline-2 focus:outline-primary/10`}
          />
          {confirmar && !coincidem && (
            <span className="font-label-caps text-label-caps text-error mt-1">Senhas não coincidem</span>
          )}
        </label>
        <button
          type="submit"
          disabled={!coincidem || nova.length < 6}
          className="w-full border-2 border-primary bg-primary text-on-primary py-3 uppercase font-label-caps text-label-caps font-bold hover:bg-ink transition-colors disabled:opacity-40"
        >
          Alterar Senha
        </button>
      </form>
    </Modal>
  );
}

function Sobre() {
  return (
    <footer className="text-center pt-stack-base">
      <div className="border-b border-dashed border-outline-variant border-t border-dashed border-outline-variant h-[3px] mb-4" />
      <p className="font-value-sm text-value-sm text-outline">Versão 1.2.4</p>
    </footer>
  );
}
