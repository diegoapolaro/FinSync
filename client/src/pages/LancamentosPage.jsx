import { useCallback, useEffect, useMemo, useState } from 'react';
import { useOutletContext, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  ArrowDownRight,
  Edit2,
  Trash2,
  CheckCircle2,
  Clock,
  X,
  Calendar,
  Layers,
  Repeat,
  Sparkles,
  PlusCircle,
} from 'lucide-react';
import {
  getTransacoes,
  createTransacao,
  updateTransacao,
  updateTransacaoStatus,
  deleteTransacao,
  getCategorias,
} from '../services/api';
import { formatCurrency, formatCurrencyInput, parseCurrencyInput } from '../utils/formatters';
import {
  TIPO_TRANSACAO,
  STATUS_TRANSACAO,
  FREQUENCIA_RECORRENCIA,
  MODO_PARCELAMENTO,
  MODO_LANCAMENTO,
} from '../utils/constants';
import { useTema } from '../contexts/ThemeContext';
import { useToast } from '../contexts/ToastContext';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import InlineTransactionEditor from '../components/transactions/InlineTransactionEditor';
import { cn } from '@/lib/utils';

function formatDateOnly(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function getHojeDateString() {
  return formatDateOnly(new Date());
}

function getOntemDateString() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return formatDateOnly(d);
}

function formatLabel(date) {
  const hoje = new Date();
  const amanha = new Date(hoje);
  amanha.setDate(amanha.getDate() + 1);
  const ontem = new Date(hoje);
  ontem.setDate(ontem.getDate() - 1);

  const fmt = (d) => d.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' });

  if (date.toDateString() === hoje.toDateString()) return `Hoje, ${fmt(hoje)}`;
  if (date.toDateString() === amanha.toDateString()) return `Amanhã, ${fmt(amanha)}`;
  if (date.toDateString() === ontem.toDateString()) return `Ontem, ${fmt(ontem)}`;
  return fmt(date);
}

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

  const isEntrada = form.tipo === TIPO_TRANSACAO.ENTRADA;

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
      <div className="flex items-center justify-between gap-2 mb-6 bg-card px-4 md:px-5 py-2.5 rounded-2xl md:rounded-full border border-border/80 shadow-sm flex-wrap sm:flex-nowrap">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => navegar(-1)}
          className="text-xs font-semibold rounded-full hover:bg-muted"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          Ontem
        </Button>

        <div className="flex items-center gap-2">
          <label
            htmlFor="data-navegacao-header"
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-secondary/80 border border-border cursor-pointer hover:bg-secondary transition-colors"
            title="Escolha uma data no calendário ou digite"
          >
            <Calendar className="w-3.5 h-3.5 text-primary" />
            <input
              id="data-navegacao-header"
              type="date"
              value={dataSelecionada}
              onChange={(e) => e.target.value && setDataSelecionada(e.target.value)}
              className="bg-transparent text-xs font-mono font-bold text-foreground focus:outline-none cursor-pointer"
              style={{ colorScheme }}
              aria-label="Selecionar data do lançamento"
            />
          </label>

          {dataSelecionada !== hojeStr && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setDataSelecionada(hojeStr)}
              className="h-7 px-2.5 text-[11px] font-semibold rounded-full border-primary/40 text-primary hover:bg-primary/10 transition-colors"
              title="Voltar para Hoje"
            >
              Hoje
            </Button>
          )}
        </div>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => navegar(1)}
          className="text-xs font-semibold rounded-full hover:bg-muted"
        >
          Amanhã
          <ArrowRight className="w-4 h-4 ml-1.5" />
        </Button>
      </div>

      {/* Main Interactive Form Card */}
      <Card className="p-6 md:p-8 border border-border">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-normal text-xl tracking-[-0.03em] text-foreground">
              Novo Lançamento
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Insira os detalhes do lançamento financeiro
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Mode Switcher: Único / Parcelado / Recorrente */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Tipo de Agendamento
            </label>
              <div className="grid grid-cols-3 gap-1.5 p-1 bg-secondary rounded-xl border border-border">
                <button
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, modo: MODO_LANCAMENTO.UNICO }))}
                  className={cn(
                    'flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all',
                    form.modo === MODO_LANCAMENTO.UNICO
                      ? 'bg-card text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Único
                </button>
                <button
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, modo: MODO_LANCAMENTO.PARCELADO }))}
                  className={cn(
                    'flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all',
                    form.modo === MODO_LANCAMENTO.PARCELADO
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  <Layers className="w-3.5 h-3.5" />
                  Parcelado
                </button>
                <button
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, modo: MODO_LANCAMENTO.RECORRENTE }))}
                  className={cn(
                    'flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all',
                    form.modo === MODO_LANCAMENTO.RECORRENTE
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  <Repeat className="w-3.5 h-3.5" />
                  Fixo / Recorrente
                </button>
              </div>
            </div>

          {/* Type Switcher */}
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-secondary rounded-xl border border-border">
            <button
              type="button"
              onClick={() =>
                setForm((f) => ({ ...f, tipo: TIPO_TRANSACAO.ENTRADA, categoriaId: '' }))
              }
              className={cn(
                'flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all',
                isEntrada
                  ? 'bg-entrada text-white shadow-sm'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
              Receita
            </button>
            <button
              type="button"
              onClick={() =>
                setForm((f) => ({ ...f, tipo: TIPO_TRANSACAO.SAIDA, categoriaId: '' }))
              }
              className={cn(
                'flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all',
                !isEntrada
                  ? 'bg-saida text-white shadow-sm'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              <ArrowDownRight className="w-4 h-4 stroke-[2.5]" />
              Despesa
            </button>
          </div>

          {/* Amount Input */}
          <div
            className={cn(
              'rounded-2xl p-5 border border-border bg-secondary transition-colors focus-within:border-primary',
            )}
          >
            <div className="flex items-center justify-between mb-1">
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                {form.modo === MODO_LANCAMENTO.PARCELADO &&
                form.modoValorParcelamento === MODO_PARCELAMENTO.PARCELA
                  ? 'Valor por Parcela'
                  : form.modo === MODO_LANCAMENTO.PARCELADO
                    ? 'Valor Total da Compra'
                    : 'Valor'}
              </label>
              {form.modo === MODO_LANCAMENTO.PARCELADO && (
                <div className="flex items-center gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() =>
                      setForm((f) => ({ ...f, modoValorParcelamento: MODO_PARCELAMENTO.TOTAL }))
                    }
                    className={cn(
                      'text-[10px] uppercase font-semibold px-2 py-0.5 rounded-md transition-colors',
                      form.modoValorParcelamento === MODO_PARCELAMENTO.TOTAL
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:text-foreground',
                    )}
                  >
                    Valor Total
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setForm((f) => ({ ...f, modoValorParcelamento: MODO_PARCELAMENTO.PARCELA }))
                    }
                    className={cn(
                      'text-[10px] uppercase font-semibold px-2 py-0.5 rounded-md transition-colors',
                      form.modoValorParcelamento === MODO_PARCELAMENTO.PARCELA
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:text-foreground',
                    )}
                  >
                    Por Parcela
                  </button>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  'text-2xl font-bold tracking-tight',
                  isEntrada ? 'text-entrada' : 'text-saida',
                )}
              >
                R$
              </span>
              <input
                className={cn(
                  'w-full bg-transparent border-none p-0 numeric-mono text-3xl md:text-4xl font-bold focus:outline-none placeholder:text-muted-foreground/40',
                  isEntrada ? 'text-entrada' : 'text-saida',
                )}
                placeholder="0,00"
                type="text"
                inputMode="decimal"
                value={form.valor}
                onChange={(e) => {
                  const formatted = formatCurrencyInput(e.target.value);
                  setForm((f) => ({ ...f, valor: formatted }));
                }}
                required
              />
            </div>
          </div>

          {/* Seção Específica: Parcelamento */}
          {form.modo === MODO_LANCAMENTO.PARCELADO && (
            <div className="p-4 rounded-2xl border border-primary/30 bg-primary/5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-primary" />
                  Número de Parcelas
                </span>
                <span className="text-xs numeric-mono font-bold text-primary">
                  {form.totalParcelas}x
                </span>
              </div>

              {/* Atalhos de parcelas comuns */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {[2, 3, 4, 5, 6, 10, 12, 18, 24].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, totalParcelas: num }))}
                    className={cn(
                      'numeric-mono text-xs font-semibold px-2.5 py-1 rounded-lg border transition-all',
                      form.totalParcelas === num
                        ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                        : 'bg-secondary text-muted-foreground border-border hover:text-foreground',
                    )}
                  >
                    {num}x
                  </button>
                ))}
              </div>

              {/* Preview Resumo */}
              {previewParcelamento && previewParcelamento.valorTotal > 0 && (
                <div className="mt-2 pt-2.5 border-t border-primary/20 flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">
                    {previewParcelamento.parcelas}x de{' '}
                    <strong className="text-foreground numeric-mono">
                      {formatCurrency(previewParcelamento.valorParcela)}
                    </strong>
                  </span>
                  <span className="text-muted-foreground">
                    Total:{' '}
                    <strong className="text-foreground numeric-mono">
                      {formatCurrency(previewParcelamento.valorTotal)}
                    </strong>{' '}
                    ({previewParcelamento.periodo})
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Seção Específica: Recorrência */}
          {form.modo === MODO_LANCAMENTO.RECORRENTE && (
            <div className="p-4 rounded-2xl border border-indigo-500/30 bg-indigo-500/5 space-y-3">
              <div className="space-y-1.5">
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                  <Repeat className="w-3.5 h-3.5 text-indigo-400" />
                  Frequência Periódica
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {Object.values(FREQUENCIA_RECORRENCIA).map((freq) => (
                    <button
                      key={freq}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, frequenciaRecorrencia: freq }))}
                      className={cn(
                        'text-xs font-semibold py-1.5 rounded-lg border transition-all',
                        form.frequenciaRecorrencia === freq
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                          : 'bg-secondary text-muted-foreground border-border hover:text-foreground',
                      )}
                    >
                      {freq}
                    </button>
                  ))}
                </div>
              </div>

              {/* Data Limite Opcional */}
              <div className="pt-2 border-t border-indigo-500/20 space-y-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-muted-foreground select-none">
                  <input
                    type="checkbox"
                    checked={form.temDataFim}
                    onChange={(e) => setForm((f) => ({ ...f, temDataFim: e.target.checked }))}
                    className="rounded border-border text-primary focus:ring-primary h-4 w-4"
                  />
                  <span>Definir data limite de término (opcional)</span>
                </label>
                {form.temDataFim && (
                  <Input
                    type="date"
                    value={form.dataFimRecorrencia}
                    onChange={(e) => setForm((f) => ({ ...f, dataFimRecorrencia: e.target.value }))}
                    className="h-10 rounded-xl bg-secondary border-border text-xs"
                  />
                )}
                <p className="text-[11px] text-muted-foreground/80">
                  💡 Projeta automaticamente as faturas e lançamentos dos próximos 12 meses.
                </p>
              </div>
            </div>
          )}

          {/* Description Input */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Descrição / Origem
            </label>
            <Input
              placeholder="Ex: Venda no balcão, Supermercado, Aluguel..."
              type="text"
              value={form.descricao}
              onChange={(e) => setForm((f) => ({ ...f, descricao: e.target.value }))}
              maxLength={120}
              className="rounded-xl h-11 text-sm bg-secondary border-border"
              required
            />
          </div>

          {/* Date Selector */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label
                htmlFor="form-data-transacao"
                className="block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground"
              >
                Data do Lançamento
              </label>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setDataSelecionada(hojeStr)}
                  className={cn(
                    'text-[10px] uppercase font-semibold px-2 py-0.5 rounded-md transition-colors',
                    dataSelecionada === hojeStr
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary',
                  )}
                >
                  Hoje
                </button>
                <button
                  type="button"
                  onClick={() => setDataSelecionada(ontemStr)}
                  className={cn(
                    'text-[10px] uppercase font-semibold px-2 py-0.5 rounded-md transition-colors',
                    dataSelecionada === ontemStr
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary',
                  )}
                >
                  Ontem
                </button>
              </div>
            </div>
            <div className="relative">
              <Input
                id="form-data-transacao"
                type="date"
                value={dataSelecionada}
                onChange={(e) => e.target.value && setDataSelecionada(e.target.value)}
                className="rounded-xl h-11 text-sm bg-secondary border-border font-mono cursor-pointer"
                style={{ colorScheme }}
                required
              />
            </div>
          </div>

          {/* Status Selector */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              {form.modo === MODO_LANCAMENTO.PARCELADO
                ? 'Status da 1ª Parcela'
                : form.modo === MODO_LANCAMENTO.RECORRENTE
                  ? 'Status do Primeiro Lançamento'
                  : 'Status do Pagamento'}
            </label>
            <div className="grid grid-cols-2 gap-1.5 p-1 bg-secondary rounded-xl border border-border">
              <button
                type="button"
                onClick={() => setForm((f) => ({ ...f, status: STATUS_TRANSACAO.PAGO }))}
                className={cn(
                  'flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all',
                  form.status === STATUS_TRANSACAO.PAGO
                    ? 'bg-emerald-500 text-white shadow-sm'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Pago
              </button>
              <button
                type="button"
                onClick={() => setForm((f) => ({ ...f, status: STATUS_TRANSACAO.PENDENTE }))}
                className={cn(
                  'flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all',
                  form.status === STATUS_TRANSACAO.PENDENTE
                    ? 'bg-amber-500 text-white shadow-sm'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                <Clock className="w-3.5 h-3.5" />
                Pendente
              </button>
            </div>
          </div>

          {/* Account Selector (if multiple accounts exist) */}
          {contas && contas.length > 1 && (
            <div className="space-y-1.5">
              <label
                htmlFor="contaId"
                className="block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground"
              >
                Conta
              </label>
              <select
                id="contaId"
                aria-label="Conta"
                value={form.contaId || contaSelecionadaId}
                onChange={(e) => setForm((f) => ({ ...f, contaId: e.target.value }))}
                className="flex h-11 w-full rounded-xl border border-border bg-secondary px-4 py-2 text-sm text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer hover:bg-secondary/80 transition-colors"
              >
                {contas.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nome} ({c.tipo})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Category Selector */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Categoria
            </label>
            <select
              value={form.categoriaId}
              onChange={(e) => setForm((f) => ({ ...f, categoriaId: e.target.value }))}
              className="flex h-11 w-full rounded-xl border border-border bg-secondary px-4 py-2 text-sm text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer hover:bg-secondary/80 transition-colors"
            >
              <option value="">Sem Categoria (Geral)</option>
              {categoriasFiltradas.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.nome}
                </option>
              ))}
            </select>
          </div>

          {/* CTA Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              type="submit"
              variant="default"
              size="lg"
              disabled={enviando}
              className="flex-1 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold tracking-tight"
            >
              {enviando ? (
                <span className="inline-block w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2" />
              ) : (
                <CheckCircle2 className="w-5 h-5 mr-1.5 stroke-[2.5]" />
              )}
              {form.modo === MODO_LANCAMENTO.PARCELADO
                ? `Gerar ${form.totalParcelas}x Parcelas`
                : form.modo === MODO_LANCAMENTO.RECORRENTE
                  ? 'Confirmar Recorrência'
                  : 'Confirmar Lançamento'}
            </Button>
          </div>
        </form>
      </Card>

      {/* Daily Records List */}
      <div className="mt-10">
        <div className="flex items-center justify-between mb-4 px-1">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Lançamentos de {formatLabel(new Date(dataSelecionada + 'T12:00:00'))} ({dataSelecionada})
          </h3>
          <span className="text-xs numeric-mono text-muted-foreground font-medium">
            Total: {transacoes.length}
          </span>
        </div>

        {carregando && (
          <div className="text-center py-10 text-muted-foreground text-sm">
            <span className="inline-block w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin align-middle mr-2" />
            Carregando registros...
          </div>
        )}

        {!carregando && transacoes.length === 0 && (
          <Card className="p-8 text-center text-sm text-muted-foreground border-dashed border-border">
            Nenhum lançamento registrado nesta data.
          </Card>
        )}

        {!carregando && transacoes.length > 0 && (
          <div className="space-y-2.5">
            {transacoes.map((t) => {
              const tEntrada = t.tipo === TIPO_TRANSACAO.ENTRADA;
              const Icon = tEntrada ? ArrowUpRight : ArrowDownRight;
              const isPendente = t.status === STATUS_TRANSACAO.PENDENTE;
              const isParcelado = Boolean(t.parcelamentoId || t.numeroParcela);
              const isRecorrente = Boolean(t.recorrenciaId);
              const isEditingThis = editandoId === t.id;

              return (
                <div key={t.id} className="space-y-1">
                  <Card
                    className={cn(
                      'p-3.5 flex items-center justify-between hover:shadow-card-hover transition-all duration-200 group border-border',
                      isEditingThis && 'border-primary/50 ring-1 ring-primary/20 bg-secondary/30',
                    )}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={cn(
                          'w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 border border-border bg-secondary',
                          tEntrada ? 'text-entrada' : 'text-saida',
                        )}
                      >
                        <Icon className="w-4 h-4 stroke-[2.5]" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-foreground truncate text-sm tracking-tight">
                          {t.descricao}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                          {t.categoriaNome && (
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full border border-border bg-secondary text-muted-foreground">
                              {t.categoriaNome}
                            </span>
                          )}
                          {isParcelado && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border bg-primary/10 text-primary border-primary/20">
                              <Layers className="w-2.5 h-2.5" />
                              {t.numeroParcela}/{t.totalParcelas}
                            </span>
                          )}
                          {isRecorrente && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border bg-indigo-500/10 text-indigo-400 border-indigo-500/20">
                              <Repeat className="w-2.5 h-2.5" />
                              {t.frequenciaRecorrencia || 'Fixo'}
                            </span>
                          )}
                          <span
                            className={cn(
                              'inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border',
                              isPendente
                                ? 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                                : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
                            )}
                          >
                            {isPendente && <Clock className="w-2.5 h-2.5" />}
                            {t.status || STATUS_TRANSACAO.PAGO}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 md:gap-3 shrink-0">
                      <span
                        className={cn(
                          'numeric-mono text-sm font-bold tracking-tight',
                          tEntrada ? 'text-entrada' : 'text-saida',
                        )}
                      >
                        {tEntrada ? '+ ' : '- '}
                        {formatCurrency(t.valor)}
                      </span>
                      <div className="flex items-center gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="iconSm"
                          onClick={() => handleToggleStatus(t)}
                          title={isPendente ? 'Marcar como Pago' : 'Marcar como Pendente'}
                          className={cn(
                            'rounded-xl transition-colors',
                            isPendente
                              ? 'hover:bg-emerald-500/15 text-amber-500 hover:text-emerald-500'
                              : 'hover:bg-amber-500/15 text-muted-foreground hover:text-amber-500',
                          )}
                        >
                          {isPendente ? (
                            <CheckCircle2 className="w-4 h-4" />
                          ) : (
                            <Clock className="w-4 h-4" />
                          )}
                        </Button>
                        <Button
                          type="button"
                          variant={isEditingThis ? 'secondary' : 'ghost'}
                          size="iconSm"
                          onClick={() => editar(t)}
                          title={isEditingThis ? 'Fechar edição' : 'Editar'}
                          className={cn(
                            'rounded-xl transition-all',
                            isEditingThis
                              ? 'bg-primary/10 text-primary opacity-100'
                              : 'hover:bg-muted opacity-0 group-hover:opacity-100',
                          )}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="iconSm"
                          onClick={() => confirmarExclusao(t)}
                          title="Excluir"
                          className="rounded-xl hover:text-destructive hover:bg-destructive/15 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>

                  {isEditingThis && (
                    <InlineTransactionEditor
                      transacao={t}
                      categoriasPorTipo={categoriasPorTipo}
                      contas={contas}
                      onSalvar={handleSalvarEdicao}
                      onCancelar={() => setEditandoId(null)}
                      salvando={salvandoEdicao}
                    />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Delete Modal para Parcelamento e Recorrência */}
      {deleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <Card className="w-full max-w-md p-6 space-y-4 border border-border shadow-2xl">
            <h3 className="text-base font-semibold text-foreground">
              {deleteModal.tipo === 'parcelamento'
                ? 'Excluir Compra Parcelada'
                : 'Excluir Lançamento Recorrente'}
            </h3>
            <p className="text-xs text-muted-foreground">
              {deleteModal.tipo === 'parcelamento'
                ? `Esta transação faz parte de um parcelamento em ${deleteModal.transacao.totalParcelas}x. Deseja excluir apenas esta parcela ou todas as parcelas deste parcelamento?`
                : 'Esta transação é originada de uma regra recorrente periódica. Deseja excluir apenas este lançamento ou todas as ocorrências futuras pendentes?'}
            </p>

            <div className="flex flex-col gap-2 pt-2">
              <Button
                variant="destructive"
                onClick={() =>
                  executarDelete(deleteModal.transacao.id, {
                    excluirTodasParcelas: deleteModal.tipo === 'parcelamento',
                    excluirFuturas: deleteModal.tipo === 'recorrencia',
                  })
                }
                className="w-full rounded-xl text-xs font-semibold"
              >
                {deleteModal.tipo === 'parcelamento'
                  ? 'Excluir Todas as Parcelas'
                  : 'Excluir Esta e Todas as Futuras'}
              </Button>
              <Button
                variant="outline"
                onClick={() =>
                  executarDelete(deleteModal.transacao.id, {
                    excluirTodasParcelas: false,
                    excluirFuturas: false,
                  })
                }
                className="w-full rounded-xl text-xs font-semibold"
              >
                Excluir Apenas Este Registro
              </Button>
              <Button
                variant="ghost"
                onClick={() => setDeleteModal(null)}
                className="w-full rounded-xl text-xs text-muted-foreground"
              >
                Cancelar
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
