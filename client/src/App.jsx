import { useState, useEffect } from 'react';
import {
  getContas,
  getResumoConta,
  getTransacoes,
  createTransacao,
  deleteTransacao,
} from './services/api';
import './App.css';

const resumoInicial = {
  totalEntradas: 0,
  totalSaidas: 0,
  saldo: 0,
};

function App() {
  const [contas, setContas] = useState([]);
  const [contaSelecionadaId, setContaSelecionadaId] = useState('');
  const [transacoes, setTransacoes] = useState([]);
  const [resumo, setResumo] = useState(resumoInicial);
  const [form, setForm] = useState({ descricao: '', valor: '', tipo: 'Entrada', data: '' });

  useEffect(() => {
    async function carregarContas() {
      const contasDaApi = await getContas();
      setContas(contasDaApi);

      if (contasDaApi.length > 0) {
        setContaSelecionadaId(String(contasDaApi[0].id));
      }
    }

    carregarContas().catch(console.error);
  }, []);

  useEffect(() => {
    if (!contaSelecionadaId) {
      setTransacoes([]);
      setResumo(resumoInicial);
      return;
    }

    async function carregarDadosDaConta() {
      const [transacoesDaApi, resumoDaApi] = await Promise.all([
        getTransacoes(contaSelecionadaId),
        getResumoConta(contaSelecionadaId),
      ]);

      setTransacoes(transacoesDaApi);
      setResumo(resumoDaApi);
    }

    carregarDadosDaConta().catch(console.error);
  }, [contaSelecionadaId]);

  async function atualizarDadosDaConta() {
    const [transacoesDaApi, resumoDaApi] = await Promise.all([
      getTransacoes(contaSelecionadaId),
      getResumoConta(contaSelecionadaId),
    ]);

    setTransacoes(transacoesDaApi);
    setResumo(resumoDaApi);
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!contaSelecionadaId) {
      return;
    }

    const nova = {
      descricao: form.descricao,
      valor: parseFloat(form.valor),
      tipo: form.tipo,
      data: form.data || new Date().toISOString(),
      contaId: Number(contaSelecionadaId),
    };

    await createTransacao(nova);
    await atualizarDadosDaConta();
    setForm({ descricao: '', valor: '', tipo: 'Entrada', data: '' });
  }

  async function handleDelete(id) {
    await deleteTransacao(id);
    await atualizarDadosDaConta();
  }

  function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('pt-BR');
  }

  function formatCurrency(value) {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  const contaSelecionada = contas.find((conta) => String(conta.id) === contaSelecionadaId);

  return (
    <div className="app">
      <header className="topo">
        <div>
          <h1>FinSync</h1>
          <p>Controle financeiro por conta</p>
        </div>

        <label className="seletor-conta">
          Conta
          <select
            value={contaSelecionadaId}
            onChange={(e) => setContaSelecionadaId(e.target.value)}
          >
            {contas.map((conta) => (
              <option key={conta.id} value={conta.id}>
                {conta.nome}
              </option>
            ))}
          </select>
        </label>
      </header>

      {contas.length === 0 ? (
        <section className="estado-vazio">
          <h2>Nenhuma conta cadastrada</h2>
          <p>Crie uma conta pela API para comecar a registrar transacoes.</p>
        </section>
      ) : (
        <>
          <section className="resumo">
            <div>
              <span>Entradas</span>
              <strong className="positivo">{formatCurrency(resumo.totalEntradas)}</strong>
            </div>
            <div>
              <span>Saidas</span>
              <strong className="negativo">{formatCurrency(resumo.totalSaidas)}</strong>
            </div>
            <div>
              <span>Saldo</span>
              <strong className={resumo.saldo >= 0 ? 'positivo' : 'negativo'}>
                {formatCurrency(resumo.saldo)}
              </strong>
            </div>
          </section>

          <section className="painel-form">
            <div className="secao-titulo">
              <h2>Nova transacao</h2>
              <span>{contaSelecionada?.nome}</span>
            </div>

            <form onSubmit={handleSubmit} className="form">
              <label>
                Descricao
                <input
                  placeholder="Ex: Venda de pizza"
                  value={form.descricao}
                  onChange={(e) => setForm({ ...form, descricao: e.target.value })}
                  required
                />
              </label>

              <label>
                Valor
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="0,00"
                  value={form.valor}
                  onChange={(e) => setForm({ ...form, valor: e.target.value })}
                  required
                />
              </label>

              <label>
                Tipo
                <select
                  value={form.tipo}
                  onChange={(e) => setForm({ ...form, tipo: e.target.value })}
                >
                  <option value="Entrada">Entrada</option>
                  <option value="Saida">Saida</option>
                </select>
              </label>

              <label>
                Data
                <input
                  type="date"
                  value={form.data}
                  onChange={(e) => setForm({ ...form, data: e.target.value })}
                />
              </label>

              <button type="submit">Adicionar transacao</button>
            </form>
          </section>

          <section className="lista">
            <div className="secao-titulo">
              <h2>Transacoes</h2>
              <span>{transacoes.length} registro(s)</span>
            </div>

            {transacoes.length === 0 && (
              <p className="vazio">Nenhuma transacao nesta conta.</p>
            )}

            {transacoes.map((transacao) => (
              <article
                key={transacao.id}
                className={`transacao-card ${transacao.tipo === 'Entrada' ? 'entrada' : 'saida'}`}
              >
                <div className="transacao-info">
                  <strong>{transacao.descricao}</strong>
                  <span>{formatDate(transacao.data)}</span>
                </div>

                <div className="transacao-acoes">
                  <span className="tipo">{transacao.tipo}</span>
                  <span className="valor">
                    {transacao.tipo === 'Entrada' ? '+' : '-'}
                    {formatCurrency(transacao.valor)}
                  </span>
                  <button type="button" onClick={() => handleDelete(transacao.id)}>
                    Excluir
                  </button>
                </div>
              </article>
            ))}
          </section>
        </>
      )}
    </div>
  );
}

export default App;
