import { useCallback, useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  createTransacao,
  deleteTransacao,
  getResumoConta,
  getTransacoes,
} from '../services/api';
import TransactionForm from '../components/transactions/TransactionForm';
import TransactionList from '../components/transactions/TransactionList';
import EmptyState from '../components/transactions/EmptyState';
import EmptyStateComAcoes from '../components/transactions/EmptyStateComAcoes';
import SummarySection from '../components/transactions/SummarySection';
import ActionArea from '../components/transactions/ActionArea';
import ErrorBanner from '../components/common/ErrorBanner';
import { useToast } from '../contexts/ToastContext';

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

export default function Extrato() {
  const { contaSelecionadaId, contas, setResumo, setTemTransacoes } = useOutletContext();
  const { addToast } = useToast();

  const [transacoes, setTransacoes] = useState([]);
  const [form, setForm] = useState(formInicial);
  const [formAberto, setFormAberto] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  const carregarDadosDaConta = useCallback(async () => {
    if (!contaSelecionadaId) {
      setTransacoes([]);
      setResumo(resumoInicial);
      setTemTransacoes(false);
      return;
    }
    const [transacoesDaApi, resumoDaApi] = await Promise.all([
      getTransacoes(contaSelecionadaId),
      getResumoConta(contaSelecionadaId),
    ]);
    setTransacoes(transacoesDaApi);
    const novoResumo = { ...resumoInicial, ...resumoDaApi };
    setResumo(novoResumo);
    setTemTransacoes(transacoesDaApi.length > 0);
  }, [contaSelecionadaId, setResumo, setTemTransacoes]);

  useEffect(() => {
    setCarregando(true);
    setErro('');
    carregarDadosDaConta()
      .catch((error) => setErro(error.message))
      .finally(() => setCarregando(false));
  }, [carregarDadosDaConta]);

  async function handleSubmit(event) {
    event.preventDefault();
    setErro('');

    if (!contaSelecionadaId) return;

    const transacao = {
      descricao: form.descricao.trim(),
      valor: Number(form.valor),
      tipo: form.tipo,
      data: form.data || new Date().toISOString().slice(0, 10),
      contaId: Number(contaSelecionadaId),
    };

    try {
      await createTransacao(transacao);
      await carregarDadosDaConta();
      setForm({ descricao: '', valor: '', data: new Date().toISOString().slice(0, 10), tipo: form.tipo });
      addToast('Lançamento registrado com sucesso!', 'success');
    } catch (error) {
      setErro(error.message);
      addToast(error.message, 'error');
    }
  }

  async function handleDelete(id) {
    setErro('');
    try {
      await deleteTransacao(id);
      await carregarDadosDaConta();
      addToast('Lançamento excluído.', 'success');
    } catch (error) {
      setErro(error.message);
      addToast(error.message, 'error');
    }
  }

  function abrirLancamento(tipo) {
    setForm((formAtual) => ({ ...formAtual, tipo }));
    setFormAberto(true);
  }

  const temTransacoes = transacoes.length > 0;

  return (
    <>
      {formAberto && (
        <TransactionForm
          form={form}
          setForm={setForm}
          handleSubmit={handleSubmit}
          setFormAberto={setFormAberto}
        />
      )}

      {carregando && (
        <p className="font-body-lg text-body-lg text-on-surface-variant text-center py-12">
          Carregando lançamentos...
        </p>
      )}

      <ErrorBanner erro={erro} />

      {!carregando && contas.length === 0 && (
        <EmptyState message="Nenhuma conta cadastrada. Crie uma conta pela API para começar." />
      )}

      {!carregando && contas.length > 0 && !temTransacoes && (
        <EmptyStateComAcoes
          resumo={{ saldoDiario: 0 }}
          abrirLancamento={abrirLancamento}
        />
      )}

      {!carregando && temTransacoes && (
        <>
          <SummarySection resumo={{ totalEntradasMes: 0, totalSaidasMes: 0 }} />

          <TransactionList
            titulo="RECENTES"
            transacoes={transacoes}
            handleDelete={handleDelete}
          />

          <ActionArea abrirLancamento={abrirLancamento} />
        </>
      )}
    </>
  );
}
