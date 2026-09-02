import { useCallback, useEffect, useMemo, useState } from 'react';
import { useOutletContext, useSearchParams } from 'react-router-dom';
import { Sparkles, PlusCircle } from 'lucide-react';
import {
  getTransacoes,
  createTransacao,
  updateTransacao,
  updateTransacaoStatus,
  deleteTransacao,
  getCategorias,
} from '../services/api';
import { formatCurrencyInput, parseCurrencyInput } from '../utils/formatters';
import {
  TIPO_TRANSACAO,
  STATUS_TRANSACAO,
  FREQUENCIA_RECORRENCIA,
  MODO_PARCELAMENTO,
  MODO_LANCAMENTO,
} from '../utils/constants';
import {
  formatDateOnly,
  getHojeDateString,
  getOntemDateString,
} from '../utils/dateHelpers';
import { useTema } from '../contexts/ThemeContext';
import { useToast } from '../contexts/ToastContext';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import LancamentosDateHeader from '../components/lancamentos/LancamentosDateHeader';
import LancamentoForm from '../components/lancamentos/LancamentoForm';
import DailyRecordsList from '../components/lancamentos/DailyRecordsList';
import DeleteLancamentoModal from '../components/lancamentos/DeleteLancamentoModal';

const formInicial = {
  descricao: '',
  valor: '',
  tipo: TIPO_TRANSACAO.ENTRADA,
  status: STATUS_TRANSACAO.PAGO,
  categoriaId: '',
  contaId: '',
  modo: MODO_LANCAMENTO.UNICO,
  totalParcelas: 2,
  modoValorParcelamento: MODO_PARCELAMENTO.TOTAL,
  frequenciaRecorrencia: FREQUENCIA_RECORRENCIA.MENSAL,
  temDataFim: false,
  dataFimRecorrencia: '',
};

export default function LancamentosPage() {
  const { contas = [], contaSelecionadaId, abrirModalNovaConta } = useOutletContext() || {};
  const [searchParams] = useSearchParams();
  const tipoParam = searchParams.get('tipo');
  const { addToast } = useToast();
  const { tema = 'escuro' } = useTema() || {};
  const colorScheme = tema === 'escuro' ? 'dark' : 'light';

  const hojeStr = getHojeDateString();
  const ontemStr = getOntemDateString();

  const [transacoes, setTransacoes] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [form, setForm] = useState(() => ({
    ...formInicial,
    tipo: tipoParam === TIPO_TRANSACAO.SAIDA ? TIPO_TRANSACAO.SAIDA : TIPO_TRANSACAO.ENTRADA,
  }));
  const [editandoId, setEditandoId] = useState(null);
  const [salvandoEdicao, setSalvandoEdicao] = useState(false);
  const [dataSelecionada, setDataSelecionada] = useState(() => formatDateOnly(new Date()));
  const [carregando, setCarregando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [deleteModal, setDeleteModal] = useState(null);

  useEffect(() => {
    if (tipoParam === TIPO_TRANSACAO.ENTRADA || tipoParam === TIPO_TRANSACAO.SAIDA) {
      setForm((prev) => ({ ...prev, tipo: tipoParam }));
    }
  }, [tipoParam]);

  useEffect(() => {
    getCategorias()
      .then(setCategorias)
      .catch(() => {});
  }, []);

  const carregarTransacoes = useCallback(async () => {
    if (!contaSelecionadaId) {
      setTransacoes([]);
      setCarregando(false);
      return;
    }
    try {
      const todasTransacoes = [];
      let page = 1;
      while (true) {
        const dados = await getTransacoes({
          contaId: contaSelecionadaId,
          data: dataSelecionada,
          page,
          pageSize: 100,
        });
        const paginaAtual = dados?.data ?? [];
        todasTransacoes.push(...paginaAtual);
        if (paginaAtual.length < 100) break;
        page += 1;
      }
      setTransacoes(todasTransacoes);
    } catch {
      setTransacoes([]);
    } finally {
      setCarregando(false);
    }
  }, [contaSelecionadaId, dataSelecionada]);

  useEffect(() => {
    setCarregando(true);
    carregarTransacoes();
  }, [carregarTransacoes]);

  const categoriasPorTipo = useMemo(() => {
    const map = { Entrada: [], Saida: [] };
    for (const cat of categorias) {
      if (map[cat.tipo]) map[cat.tipo].push(cat);
    }
    return map;
  }, [categorias]);

  const categoriasFiltradas = categoriasPorTipo[form.tipo] || [];

  function navegar(direcao) {
    const dt = new Date(dataSelecionada + 'T12:00:00');
    dt.setDate(dt.getDate() + direcao);
    setDataSelecionada(formatDateOnly(dt));
  }

  function resetForm() {
    setForm(formInicial);
  }

  function editar(t) {
    setEditandoId((prev) => (prev === t.id ? null : t.id));
  }

  async function handleSalvarEdicao(payload) {
    if (!editandoId || salvandoEdicao) return;
    setSalvandoEdicao(true);
    try {
      await updateTransacao(editandoId, payload);
      addToast('Lançamento atualizado!', 'success');
      setEditandoId(null);
      await carregarTransacoes();
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setSalvandoEdicao(false);
    }
  }

  // Previsão de parcelamento
  const previewParcelamento = useMemo(() => {
    if (form.modo !== MODO_LANCAMENTO.PARCELADO) return null;
    const numVal = parseCurrencyInput(form.valor);
    const n = Math.max(2, Math.min(72, Number(form.totalParcelas) || 2));
    const isModoParcela = form.modoValorParcelamento === MODO_PARCELAMENTO.PARCELA;

    const valorParcela = isModoParcela ? numVal : (numVal > 0 ? numVal / n : 0);
    const valorTotal = isModoParcela ? numVal * n : numVal;

    const dInicio = new Date(dataSelecionada + 'T12:00:00');
    const dFim = new Date(dInicio);
    dFim.setMonth(dFim.getMonth() + n - 1);

    const fmtMes = (d) => d.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });

    return {
      parcelas: n,
      valorParcela,
      valorTotal,
      periodo: `${fmtMes(dInicio)} a ${fmtMes(dFim)}`,
    };
  }, [form.modo, form.valor, form.totalParcelas, form.modoValorParcelamento, dataSelecionada]);

  async function handleSubmit(e) {
    e.preventDefault();
    const contaAlvoId = form.contaId || contaSelecionadaId;
    if (!contaAlvoId || enviando) return;

    setEnviando(true);
    try {
      const isParcelado = form.modo === MODO_LANCAMENTO.PARCELADO;
      const isRecorrente = form.modo === MODO_LANCAMENTO.RECORRENTE;

      const payload = {
        descricao: form.descricao.trim(),
        valor: parseCurrencyInput(form.valor),
        tipo: form.tipo,
        status: form.status || STATUS_TRANSACAO.PAGO,
        data: dataSelecionada,
        contaId: Number(contaAlvoId),
        categoriaId: form.categoriaId ? Number(form.categoriaId) : null,
        parcelado: isParcelado,
        totalParcelas: isParcelado ? Number(form.totalParcelas) : null,
        modoValorParcelamento: isParcelado ? form.modoValorParcelamento : null,
        tornarRecorrente: isRecorrente,
        frequenciaRecorrencia: isRecorrente ? form.frequenciaRecorrencia : null,
        dataFimRecorrencia:
          isRecorrente && form.temDataFim && form.dataFimRecorrencia
            ? form.dataFimRecorrencia
            : null,
      };

      await createTransacao(payload);
      if (isParcelado) {
        addToast(`Compra parcelada em ${form.totalParcelas}x criada com sucesso!`, 'success');
      } else if (isRecorrente) {
        addToast('Lançamento recorrente cadastrado e projetado!', 'success');
      } else {
        addToast('Lançamento registrado com sucesso!', 'success');
      }

      resetForm();
      await carregarTransacoes();
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setEnviando(false);
    }
  }

  async function handleToggleStatus(transacao) {
    const novoStatus =
      transacao.status === STATUS_TRANSACAO.PENDENTE
        ? STATUS_TRANSACAO.PAGO
        : STATUS_TRANSACAO.PENDENTE;

    try {
      await updateTransacaoStatus(transacao.id, novoStatus);
      setTransacoes((prev) =>
        prev.map((item) => (item.id === transacao.id ? { ...item, status: novoStatus } : item)),
      );
      addToast(`Lançamento marcado como ${novoStatus}!`, 'success');
    } catch (err) {
      addToast(err.message, 'error');
    }
  }

  function confirmarExclusao(transacao) {
    if (transacao.parcelamentoId) {
      setDeleteModal({
        tipo: 'parcelamento',
        transacao,
      });
    } else if (transacao.recorrenciaId) {
      setDeleteModal({
        tipo: 'recorrencia',
        transacao,
      });
    } else {
      executarDelete(transacao.id);
    }
  }

  async function executarDelete(id, opcoes = {}) {
    try {
      await deleteTransacao(id, opcoes);
      setDeleteModal(null);
      await carregarTransacoes();
      addToast('Lançamento excluído com sucesso.', 'success');
    } catch (err) {
      addToast(err.message, 'error');
    }
  }

  return (
    <div className="px-4 md:px-8 max-w-3xl mx-auto pt-6 pb-32">
      {contas.length === 0 && (
        <Card className="p-8 text-center border-dashed border-border/80 bg-card mb-6 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-3">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-foreground mb-1">
            Nenhuma conta ou livro de caixa cadastrado
          </h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto mb-4">
            Para registrar suas receitas e despesas, crie sua primeira conta.
          </p>
          {abrirModalNovaConta && (
            <Button onClick={abrirModalNovaConta} className="rounded-xl font-semibold gap-1.5 shadow-sm">
              <PlusCircle className="w-4 h-4" />
              <span>Criar Primeira Conta</span>
            </Button>
          )}
        </Card>
      )}

      {/* Date Navigation Header */}
      <LancamentosDateHeader
        dataSelecionada={dataSelecionada}
        setDataSelecionada={setDataSelecionada}
        navegar={navegar}
        hojeStr={hojeStr}
        colorScheme={colorScheme}
      />

      {/* Main Interactive Form Card */}
      <LancamentoForm
        form={form}
        setForm={setForm}
        onSubmit={handleSubmit}
        enviando={enviando}
        dataSelecionada={dataSelecionada}
        setDataSelecionada={setDataSelecionada}
        hojeStr={hojeStr}
        ontemStr={ontemStr}
        colorScheme={colorScheme}
        contas={contas}
        contaSelecionadaId={contaSelecionadaId}
        categoriasFiltradas={categoriasFiltradas}
        previewParcelamento={previewParcelamento}
      />

      {/* Daily Records List */}
      <DailyRecordsList
        dataSelecionada={dataSelecionada}
        transacoes={transacoes}
        carregando={carregando}
        editandoId={editandoId}
        onToggleStatus={handleToggleStatus}
        onEditar={editar}
        onConfirmarExclusao={confirmarExclusao}
        categoriasPorTipo={categoriasPorTipo}
        contas={contas}
        onSalvarEdicao={handleSalvarEdicao}
        onCancelarEdicao={() => setEditandoId(null)}
        salvandoEdicao={salvandoEdicao}
      />

      {/* Delete Modal para Parcelamento e Recorrência */}
      <DeleteLancamentoModal
        deleteModal={deleteModal}
        onConfirmDelete={executarDelete}
        onCancel={() => setDeleteModal(null)}
      />
    </div>
  );
}
