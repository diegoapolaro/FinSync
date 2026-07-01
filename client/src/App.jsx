import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  createTransacao,
  deleteTransacao,
  getContas,
  getResumoConta,
  getTransacoes,
} from './services/api';
import './App.css';

const resumoInicial = {
  totalEntradas: 0,
  totalSaidas: 0,
  saldo: 0,
  totalEntradasHoje: 0,
  totalSaidasHoje: 0,
  saldoDiario: 0,
  totalEntradasMes: 0,
  totalSaidasMes: 0,
  saldoMensal: 0,
  quantidadeTransacoes: 0,
};

const formInicial = {
  descricao: '',
  valor: '',
  tipo: 'Entrada',
  data: new Date().toISOString().slice(0, 10),
};

function App() {
  const [contas, setContas] = useState([]);
  const [contaSelecionadaId, setContaSelecionadaId] = useState('');
  const [transacoes, setTransacoes] = useState([]);
  const [resumo, setResumo] = useState(resumoInicial);
  const [form, setForm] = useState(formInicial);
  const [formAberto, setFormAberto] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    async function carregarContas() {
      setCarregando(true);
      const contasDaApi = await getContas();
      setContas(contasDaApi);

      if (contasDaApi.length > 0) {
        setContaSelecionadaId(String(contasDaApi[0].id));
      }

      setCarregando(false);
    }

    carregarContas().catch((error) => {
      setErro(error.message);
      setCarregando(false);
    });
  }, []);

  const carregarDadosDaConta = useCallback(async () => {
    const [transacoesDaApi, resumoDaApi] = await Promise.all([
      getTransacoes(contaSelecionadaId),
      getResumoConta(contaSelecionadaId),
    ]);

    setTransacoes(transacoesDaApi);
    setResumo({ ...resumoInicial, ...resumoDaApi });
  }, [contaSelecionadaId]);

  useEffect(() => {
    if (!contaSelecionadaId) {
      setTransacoes([]);
      setResumo(resumoInicial);
      return;
    }

    carregarDadosDaConta().catch((error) => setErro(error.message));
  }, [contaSelecionadaId, carregarDadosDaConta]);

  async function handleSubmit(event) {
    event.preventDefault();
    setErro('');

    if (!contaSelecionadaId) {
      return;
    }

    const transacao = {
      descricao: form.descricao.trim(),
      valor: Number(form.valor),
      tipo: form.tipo,
      data: form.data ? new Date(`${form.data}T12:00:00`).toISOString() : new Date().toISOString(),
      contaId: Number(contaSelecionadaId),
    };

    await createTransacao(transacao);
    await carregarDadosDaConta();
    setForm({ ...formInicial, tipo: form.tipo });
    setFormAberto(false);
  }

  async function handleDelete(id) {
    setErro('');
    await deleteTransacao(id);
    await carregarDadosDaConta();
  }

  function abrirLancamento(tipo) {
    setForm((formAtual) => ({ ...formAtual, tipo }));
    setFormAberto(true);
  }

  const contaSelecionada = contas.find((conta) => String(conta.id) === contaSelecionadaId);

  const transacoesDeHoje = useMemo(() => {
    const hoje = new Date().toDateString();
    return transacoes.filter((transacao) => new Date(transacao.data).toDateString() === hoje);
  }, [transacoes]);

  const transacoesVisiveis = transacoesDeHoje.length > 0 ? transacoesDeHoje : transacoes.slice(0, 8);
  const tituloLista = transacoesDeHoje.length > 0 ? 'HOJE' : 'RECENTES';

  return (
    <div className="app-shell">
      <DesktopSidebar
        contas={contas}
        contaSelecionadaId={contaSelecionadaId}
        onSelectConta={setContaSelecionadaId}
      />

      <header className="top-app-bar">
        <div className="brand-row">
          <h1>FINSYNC</h1>
          <div className="header-actions" aria-label="atalhos">
            <span className="material-symbols-outlined">account_balance_wallet</span>
            <span className="material-symbols-outlined">receipt_long</span>
          </div>
        </div>
        <nav className="section-tabs" aria-label="secoes">
          <a className="active" href="#extrato">EXTRATO</a>
          <a href="#relatorios">RELATORIOS</a>
          <a href="#ajustes">AJUSTES</a>
        </nav>
      </header>

      <main className="main-canvas">
        <section className="receipt" id="extrato" aria-label="extrato financeiro">
          <MobileTapeHeader conta={contaSelecionada} />

          <div className="quick-actions">
            <button type="button" onClick={() => abrirLancamento('Entrada')}>
              <span className="material-symbols-outlined">add</span>
              Entrada
            </button>
            <button type="button" onClick={() => abrirLancamento('Saida')}>
              <span className="material-symbols-outlined">remove</span>
              Saida
            </button>
          </div>

          {formAberto && (
            <form className="transaction-form" onSubmit={handleSubmit}>
              <label>
                Descricao
                <input
                  placeholder="Ex: Venda de pizza"
                  value={form.descricao}
                  onChange={(event) => setForm({ ...form, descricao: event.target.value })}
                  required
                />
              </label>
              <label>
                Valor
                <input
                  min="0.01"
                  step="0.01"
                  type="number"
                  placeholder="0,00"
                  value={form.valor}
                  onChange={(event) => setForm({ ...form, valor: event.target.value })}
                  required
                />
              </label>
              <label>
                Data
                <input
                  type="date"
                  value={form.data}
                  onChange={(event) => setForm({ ...form, data: event.target.value })}
                />
              </label>
              <div className="form-actions">
                <button type="button" onClick={() => setFormAberto(false)}>
                  Cancelar
                </button>
                <button type="submit">Registrar {form.tipo.toLowerCase()}</button>
              </div>
            </form>
          )}

          <div className="list-header">
            <div>
              <h2>{tituloLista}</h2>
              <p>{formatDisplayDate(new Date())}</p>
            </div>
            <div className="daily-balance">
              <strong>{formatCurrency(resumo.saldoDiario)}</strong>
              <span>SALDO DIARIO</span>
            </div>
          </div>

          {erro && <p className="error-message">{erro}</p>}

          <div className="receipt-body">
            {carregando && <p className="empty-copy">Carregando lancamentos...</p>}

            {!carregando && contas.length === 0 && (
              <EmptyState message="Nenhuma conta cadastrada. Crie uma conta pela API para comecar." />
            )}

            {!carregando && contas.length > 0 && transacoes.length === 0 && (
              <EmptyState message="Nenhum lancamento ainda. Registre a primeira entrada ou saida acima." />
            )}

            {!carregando && transacoes.length > 0 && (
              <div className="transaction-list">
                {transacoesVisiveis.map((transacao) => (
                  <article className="transaction-row" key={transacao.id}>
                    <div className={`type-marker ${transacao.tipo.toLowerCase()}`}>
                      <span className="material-symbols-outlined">
                        {transacao.tipo === 'Entrada' ? 'south_west' : 'north_east'}
                      </span>
                    </div>
                    <div className="transaction-info">
                      <strong>{transacao.descricao}</strong>
                      <span>{formatDisplayDate(transacao.data)}</span>
                    </div>
                    <div className="transaction-value">
                      <strong className={transacao.tipo.toLowerCase()}>
                        {transacao.tipo === 'Entrada' ? '+' : '-'}
                        {formatCurrency(transacao.valor)}
                      </strong>
                      <button type="button" onClick={() => handleDelete(transacao.id)}>
                        Excluir
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>

          <footer className="tape-summary">
            <span>TOTAL MES</span>
            <strong>{formatCurrency(resumo.saldoMensal)}</strong>
          </footer>
        </section>
      </main>

      <nav className="bottom-nav" aria-label="navegacao principal">
        <a className="active" href="#extrato">
          <span className="material-symbols-outlined">list_alt</span>
          Extrato
        </a>
        <button type="button" onClick={() => abrirLancamento('Entrada')}>
          <span className="material-symbols-outlined">add_box</span>
          Novo
        </button>
        <a href="#relatorios">
          <span className="material-symbols-outlined">analytics</span>
          Relatorios
        </a>
        <a href="#ajustes">
          <span className="material-symbols-outlined">settings</span>
          Ajustes
        </a>
      </nav>
    </div>
  );
}

function DesktopSidebar({ contas, contaSelecionadaId, onSelectConta }) {
  return (
    <aside className="side-nav">
      <div className="side-title">
        <h2>CONTAS</h2>
        <p>SELECIONE O LIVRO</p>
      </div>

      {contas.length === 0 && <p className="sidebar-empty">Sem contas cadastradas</p>}

      {contas.map((conta) => {
        const selecionada = String(conta.id) === contaSelecionadaId;
        return (
          <button
            className={selecionada ? 'account-button active' : 'account-button'}
            key={conta.id}
            type="button"
            onClick={() => onSelectConta(String(conta.id))}
          >
            <span className="material-symbols-outlined">
              {conta.tipo === 'Comercial' ? 'storefront' : 'person'}
            </span>
            <span>{conta.nome}</span>
          </button>
        );
      })}
    </aside>
  );
}

function MobileTapeHeader({ conta }) {
  return (
    <div className="mobile-tape-header">
      <h1>FINSYNC</h1>
      <div>
        <span className="material-symbols-outlined">
          {conta?.tipo === 'Pessoal' ? 'person' : 'storefront'}
        </span>
        <span>{conta?.nome ?? 'Sem conta'}</span>
      </div>
    </div>
  );
}

function EmptyState({ message }) {
  return (
    <div className="empty-state">
      <div className="empty-stamp">
        <div className="stamp-circle">
          <span className="material-symbols-outlined">receipt_long</span>
        </div>
        <div className="question-stamp">?</div>
      </div>
      <p>{message}</p>
    </div>
  );
}

function formatCurrency(value) {
  return Number(value ?? 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

function formatDisplayDate(value) {
  const date = new Date(value);
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).toUpperCase();
}

export default App;
