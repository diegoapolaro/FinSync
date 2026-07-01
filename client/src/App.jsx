import { useState, useEffect } from 'react';
import { getTransacoes, createTransacao, deleteTransacao } from './services/api';
import './App.css';

function App() {
  const [transacoes, setTransacoes] = useState([]);
  const [form, setForm] = useState({ descricao: '', valor: '', tipo: 'Entrada', data: '' });

  useEffect(() => {
    getTransacoes().then(setTransacoes).catch(console.error);
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    const nova = {
      descricao: form.descricao,
      valor: parseFloat(form.valor),
      tipo: form.tipo,
      data: form.data || new Date().toISOString(),
    };
    const criada = await createTransacao(nova);
    setTransacoes((prev) => [criada, ...prev]);
    setForm({ descricao: '', valor: '', tipo: 'Entrada', data: '' });
  }

  async function handleDelete(id) {
    await deleteTransacao(id);
    setTransacoes((prev) => prev.filter((t) => t.id !== id));
  }

  function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('pt-BR');
  }

  function formatCurrency(value) {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  const saldo = transacoes.reduce((acc, t) => {
    return t.tipo === 'Entrada' ? acc + t.valor : acc - t.valor;
  }, 0);

  return (
    <div className="app">
      <header>
        <h1>FinSync</h1>
        <p className={`saldo ${saldo >= 0 ? 'positivo' : 'negativo'}`}>
          Saldo: {formatCurrency(saldo)}
        </p>
      </header>

      <form onSubmit={handleSubmit} className="form">
        <input
          placeholder="Descrição"
          value={form.descricao}
          onChange={(e) => setForm({ ...form, descricao: e.target.value })}
          required
        />
        <input
          type="number"
          step="0.01"
          min="0.01"
          placeholder="Valor"
          value={form.valor}
          onChange={(e) => setForm({ ...form, valor: e.target.value })}
          required
        />
        <select
          value={form.tipo}
          onChange={(e) => setForm({ ...form, tipo: e.target.value })}
        >
          <option value="Entrada">Entrada</option>
          <option value="Saida">Saída</option>
        </select>
        <input
          type="date"
          value={form.data}
          onChange={(e) => setForm({ ...form, data: e.target.value })}
        />
        <button type="submit">Adicionar</button>
      </form>

      <div className="lista">
        {transacoes.length === 0 && <p className="vazio">Nenhuma transação ainda.</p>}
        {transacoes.map((t) => (
          <div key={t.id} className={`card ${t.tipo === 'Entrada' ? 'entrada' : 'saida'}`}>
            <div className="info">
              <strong>{t.descricao}</strong>
              <span className="data">{formatDate(t.data)}</span>
            </div>
            <div className="acoes">
              <span className="valor">{t.tipo === 'Entrada' ? '+' : '-'}{formatCurrency(t.valor)}</span>
              <button className="deletar" onClick={() => handleDelete(t.id)}>✕</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
