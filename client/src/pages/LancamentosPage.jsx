import { useCallback, useEffect, useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  ArrowDownRight,
  Edit2,
  Trash2,
  CheckCircle2,
  X,
  Calendar,
} from 'lucide-react';
import {
  getTransacoes,
  createTransacao,
  updateTransacao,
  deleteTransacao,
  getCategorias,
} from '../services/api';
import { formatCurrency } from '../utils/formatters';
import { TIPO_TRANSACAO } from '../utils/constants';
import { useToast } from '../contexts/ToastContext';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { cn } from '@/lib/utils';

function formatDateOnly(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
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
  categoriaId: '',
};

export default function LancamentosPage() {
  const { contaSelecionadaId } = useOutletContext();
  const { addToast } = useToast();

  const [transacoes, setTransacoes] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [form, setForm] = useState(formInicial);
  const [editandoId, setEditandoId] = useState(null);
  const [dataSelecionada, setDataSelecionada] = useState(() => formatDateOnly(new Date()));
  const [carregando, setCarregando] = useState(true);
  const [enviando, setEnviando] = useState(false);

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
        const dados = await getTransacoes(
          contaSelecionadaId,
          dataSelecionada,
          null,
          null,
          page,
          100,
        );
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
    setEditandoId(null);
  }

  function editar(t) {
    setForm({
      descricao: t.descricao,
      valor: String(t.valor).replace('.', ','),
      tipo: t.tipo,
      categoriaId: t.categoriaId || '',
    });
    setEditandoId(t.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!contaSelecionadaId || enviando) return;

    setEnviando(true);
    try {
      const payload = {
        descricao: form.descricao.trim(),
        valor: Number(form.valor.replace(',', '.')),
        tipo: form.tipo,
        data: dataSelecionada,
        contaId: Number(contaSelecionadaId),
        categoriaId: form.categoriaId ? Number(form.categoriaId) : null,
      };

      if (editandoId) {
        await updateTransacao(editandoId, payload);
        addToast('Lançamento atualizado!', 'success');
      } else {
        await createTransacao(payload);
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

  async function handleDelete(id) {
    try {
      await deleteTransacao(id);
      await carregarTransacoes();
      addToast('Lançamento excluído.', 'success');
    } catch (err) {
      addToast(err.message, 'error');
    }
  }

  const isEntrada = form.tipo === TIPO_TRANSACAO.ENTRADA;

  return (
    <div className="px-4 md:px-8 max-w-3xl mx-auto pt-6 pb-32">
      {/* Date Navigation Header */}
      <div className="flex items-center justify-between mb-6 bg-card px-5 py-2.5 rounded-full border border-border/80 shadow-sm">
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
          <Calendar className="w-3.5 h-3.5 text-primary" />
          <span className="font-bold text-sm text-foreground">
            {formatLabel(new Date(dataSelecionada + 'T12:00:00'))}
          </span>
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
              {editandoId ? 'Editar Lançamento' : 'Novo Lançamento'}
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Insira os detalhes do lançamento financeiro
            </p>
          </div>
          {editandoId && (
            <Badge variant="warning" className="text-xs font-semibold px-2.5 py-0.5 rounded-full">
              Modo Edição
            </Badge>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
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
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
              Valor
            </label>
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
                  const raw = e.target.value.replace(/[^0-9,]/g, '');
                  setForm((f) => ({ ...f, valor: raw }));
                }}
                required
              />
            </div>
          </div>

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
            {editandoId && (
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={resetForm}
                className="flex-1 rounded-full"
              >
                <X className="w-4 h-4 mr-1.5" />
                Cancelar
              </Button>
            )}
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
              {editandoId ? 'Salvar Alterações' : 'Confirmar Lançamento'}
            </Button>
          </div>
        </form>
      </Card>

      {/* Daily Records List */}
      <div className="mt-10">
        <div className="flex items-center justify-between mb-4 px-1">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Lançamentos do Dia ({dataSelecionada})
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
              return (
                <Card
                  key={t.id}
                  className="p-3.5 flex items-center justify-between hover:shadow-card-hover transition-all duration-200 group border-border"
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
                      <div className="flex items-center gap-2 mt-0.5">
                        {t.categoriaNome && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full border border-border bg-secondary text-muted-foreground">
                            {t.categoriaNome}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span
                      className={cn(
                        'numeric-mono text-sm font-bold tracking-tight',
                        tEntrada ? 'text-entrada' : 'text-saida',
                      )}
                    >
                      {tEntrada ? '+ ' : '- '}
                      {formatCurrency(t.valor)}
                    </span>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        type="button"
                        variant="ghost"
                        size="iconSm"
                        onClick={() => editar(t)}
                        title="Editar"
                        className="rounded-xl hover:bg-muted"
                      >
                        <Edit2 className="w-4 h-4 text-muted-foreground" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="iconSm"
                        onClick={() => handleDelete(t.id)}
                        title="Excluir"
                        className="rounded-xl hover:text-destructive hover:bg-destructive/15"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
