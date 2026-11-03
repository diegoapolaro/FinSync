import React, { useCallback, useEffect, useMemo, useState } from 'react';
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
import { formatCurrencyInput, parseCurrencyInput, converterParaBRL } from '../utils/formatters';
import usePreferencias from '../hooks/usePreferencias';
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
import LancamentosVelocitySidebar from '../components/lancamentos/LancamentosVelocitySidebar';
import DailyRecordsList from '../components/lancamentos/DailyRecordsList';
import DeleteLancamentoModal from '../components/lancamentos/DeleteLancamentoModal';
import type { ContaDto, CategoriaDto, TransacaoDto } from '@/types';

interface OutletContextType {
  contas?: ContaDto[];
  contaSelecionadaId?: number | string;
  abrirModalNovaConta?: () => void;
}

const formInicial: any = {
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

export default function LancamentosPage(): React.ReactElement {
  const { contas = [], contaSelecionadaId, abrirModalNovaConta } =
    useOutletContext<OutletContextType>() || {};
  const [searchParams] = useSearchParams();
  const tipoParam = searchParams.get('tipo');
  const { addToast } = useToast();
  const { prefs } = usePreferencias();
  const { tema = 'escuro' } = useTema() || {};

  const colorScheme = tema === 'escuro' ? 'dark' : 'light';

  const hojeStr = getHojeDateString();
  const ontemStr = getOntemDateString();

  const [transacoes, setTransacoes] = useState<TransacaoDto[]>([]);
  const [categorias, setCategorias] = useState<CategoriaDto[]>([]);
  const [form, setForm] = useState(() => ({
    ...formInicial,
    tipo: tipoParam === TIPO_TRANSACAO.SAIDA ? TIPO_TRANSACAO.SAIDA : TIPO_TRANSACAO.ENTRADA,
  }));
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [salvandoEdicao, setSalvandoEdicao] = useState<boolean>(false);
  const [dataSelecionada, setDataSelecionada] = useState<string>(() => formatDateOnly(new Date()));
  const [carregando, setCarregando] = useState<boolean>(true);
  const [enviando, setEnviando] = useState<boolean>(false);
  const [deleteModal, setDeleteModal] = useState<any>(null);

  useEffect(() => {
    if (tipoParam === TIPO_TRANSACAO.ENTRADA || tipoParam === TIPO_TRANSACAO.SAIDA) {
      setForm((prev: any) => ({ ...prev, tipo: tipoParam }));
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
      const todasTransacoes: TransacaoDto[] = [];
      let page = 1;
      while (true) {
        const dados = await getTransacoes({
          contaId: String(contaSelecionadaId),
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
    const map: Record<string, CategoriaDto[]> = { Entrada: [], Saida: [] };
    for (const cat of categorias) {
      if (map[cat.tipo]) map[cat.tipo].push(cat);
    }
    return map;
  }, [categorias]);

  const categoriasFiltradas = categoriasPorTipo[form.tipo] || [];

  function navegar(direcao: number) {
    const dt = new Date(dataSelecionada + 'T12:00:00');
    dt.setDate(dt.getDate() + direcao);
    setDataSelecionada(formatDateOnly(dt));
  }

  function resetForm() {
    setForm(formInicial);
  }

  function editar(t: TransacaoDto) {
    setEditandoId((prev) => (prev === t.id ? null : t.id));
  }

  async function handleSalvarEdicao(payload: any) {
    if (!editandoId || salvandoEdicao) return;
    setSalvandoEdicao(true);
    try {
      await updateTransacao(editandoId, payload);
      addToast('Lançamento atualizado!', 'success');
      setEditandoId(null);
      await carregarTransacoes();
    } catch (err: any) {
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

    const valorParcela = isModoParcela ? numVal : numVal > 0 ? numVal / n : 0;
    const valorTotal = isModoParcela ? numVal * n : numVal;

    const dInicio = new Date(dataSelecionada + 'T12:00:00');
    const dFim = new Date(dInicio);
    dFim.setMonth(dFim.getMonth() + n - 1);

    const fmtMes = (d: Date) => d.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });

    return {
      parcelas: n,
      valorParcela,
      valorTotal,
      periodo: `${fmtMes(dInicio)} a ${fmtMes(dFim)}`,
    };
  }, [form.modo, form.valor, form.totalParcelas, form.modoValorParcelamento, dataSelecionada]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const contaAlvoId = form.contaId || contaSelecionadaId;
    if (!contaAlvoId || enviando) return;

    setEnviando(true);
    try {
      const isParcelado = form.modo === MODO_LANCAMENTO.PARCELADO;
      const isRecorrente = form.modo === MODO_LANCAMENTO.RECORRENTE;
      const valorDigitado = parseCurrencyInput(form.valor);
      const valorEmBRL = converterParaBRL(valorDigitado, prefs?.moeda);

      const payload = {
        descricao: form.descricao.trim(),
        valor: valorEmBRL,
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

      await createTransacao(payload as any);
      if (isParcelado) {
        addToast(`Compra parcelada em ${form.totalParcelas}x criada com sucesso!`, 'success');
      } else if (isRecorrente) {
        addToast('Lançamento recorrente cadastrado e projetado!', 'success');
      } else {
        addToast('Lançamento registrado com sucesso!', 'success');
      }

      resetForm();
      await carregarTransacoes();
    } catch (err: any) {
      addToast(err.message, 'error');
    } finally {
      setEnviando(false);
    }
  }

  async function handleToggleStatus(transacao: TransacaoDto) {
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
    } catch (err: any) {
      addToast(err.message, 'error');
    }
  }

  function confirmarExclusao(transacao: TransacaoDto) {
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

  async function executarDelete(id: number, opcoes = {}) {
    try {
      await deleteTransacao(id, opcoes);
      setDeleteModal(null);
      await carregarTransacoes();
      addToast('Lançamento excluído com sucesso.', 'success');
    } catch (err: any) {
      addToast(err.message, 'error');
    }
  }

  // Métricas para a barra lateral de velocidade financeira
  const contaAtiva = useMemo(() => {
    return (
      contas.find((c) => String(c.id) === String(form.contaId || contaSelecionadaId)) ||
      contas[0]
    );
  }, [contas, form.contaId, contaSelecionadaId]);

  const totalEntradasDia = useMemo(() => {
    return transacoes
      .filter((t) => t.tipo === TIPO_TRANSACAO.ENTRADA)
      .reduce((acc, t) => acc + (Number(t.valor) || 0), 0);
  }, [transacoes]);

  const totalSaidasDia = useMemo(() => {
    return transacoes
      .filter((t) => t.tipo === TIPO_TRANSACAO.SAIDA)
      .reduce((acc, t) => acc + (Number(t.valor) || 0), 0);
  }, [transacoes]);

  const saldoProjetado = useMemo(() => {
    return totalEntradasDia - totalSaidasDia;
  }, [totalEntradasDia, totalSaidasDia]);

  function handleAplicarSugestao(descricao: string, valor: string, tipo: string) {
    setForm((prev: any) => ({
      ...prev,
      descricao,
      valor: formatCurrencyInput(valor),
      tipo,
    }));
    addToast('Sugestão aplicada no formulário!', 'success');
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-8 custom-scrollbar max-w-7xl w-full mx-auto space-y-7">
      {contas.length === 0 && (
        <Card className="p-8 text-center border-dashed border-pebble/30 bg-paper dark:bg-card mb-6 shadow-sm rounded-[20px]">
          <div className="w-12 h-12 rounded-full bg-linen-mist text-forest-ink dark:bg-spruce dark:text-lime-voltage flex items-center justify-center mx-auto mb-3">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-forest-ink dark:text-paper mb-1">
            Nenhuma conta ou livro de caixa cadastrado
          </h3>
          <p className="text-xs text-charcoal dark:text-pebble max-w-sm mx-auto mb-4">
            Para registrar suas receitas e despesas, crie sua primeira conta.
          </p>
          {abrirModalNovaConta && (
            <Button
              onClick={abrirModalNovaConta}
              className="rounded-full bg-lime-voltage text-forest-ink font-bold gap-1.5 shadow-sm hover:bg-lime-voltage/90"
            >
              <PlusCircle className="w-4 h-4 stroke-[2.5]" />
              <span>Criar Primeira Conta</span>
            </Button>
          )}
        </Card>
      )}

      {/* 1. Date Navigation & Context Header */}
      <LancamentosDateHeader
        dataSelecionada={dataSelecionada}
        setDataSelecionada={setDataSelecionada}
        navegar={navegar}
        hojeStr={hojeStr}
        colorScheme={colorScheme}
      />

      {/* 2. Main Entry Workspace Grid (12 Columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-start">
        {/* Primary Form Column (8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <LancamentoForm
            form={form}
            setForm={setForm as any}
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
            onLimpar={resetForm}
          />

          {/* Daily Records List */}
          <DailyRecordsList
            dataSelecionada={dataSelecionada}
            transacoes={transacoes}
            carregando={carregando}
            editandoId={editandoId}
            onToggleStatus={handleToggleStatus as any}
            onEditar={editar as any}
            onConfirmarExclusao={confirmarExclusao as any}
            categoriasPorTipo={categoriasPorTipo}
            contas={contas}
            onSalvarEdicao={handleSalvarEdicao}
            onCancelarEdicao={() => setEditandoId(null)}
            salvandoEdicao={salvandoEdicao}
          />
        </div>

        {/* Side Helper Column: Financial Velocity & Insights (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <LancamentosVelocitySidebar
            saldoProjetado={saldoProjetado}
            totalEntradasDia={totalEntradasDia}
            totalSaidasDia={totalSaidasDia}
            contaAtiva={contaAtiva}
            onAplicarSugestao={handleAplicarSugestao}
          />
        </div>
      </div>

      {/* Delete Modal para Parcelamento e Recorrência */}
      <DeleteLancamentoModal
        deleteModal={deleteModal}
        onConfirmDelete={executarDelete}
        onCancel={() => setDeleteModal(null)}
      />
    </div>
  );
}
