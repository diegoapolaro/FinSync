import { useState, useMemo } from 'react';
import {
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  Clock,
  X,
  Layers,
  Repeat,
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { cn } from '@/lib/utils';
import { formatCurrencyInput, parseCurrencyInput } from '../../utils/formatters';
import { TIPO_TRANSACAO, STATUS_TRANSACAO } from '../../utils/constants';
import { useTema } from '../../contexts/ThemeContext';

export default function InlineTransactionEditor({
  transacao,
  categoriasPorTipo,
  contas = [],
  onSalvar,
  onCancelar,
  salvando = false,
}) {
  const { tema = 'escuro' } = useTema() || {};
  const colorScheme = tema === 'escuro' ? 'dark' : 'light';

  const [form, setForm] = useState(() => ({
    descricao: transacao.descricao || '',
    valor: formatCurrencyInput(transacao.valor || 0),
    tipo: transacao.tipo || TIPO_TRANSACAO.SAIDA,
    status: transacao.status || STATUS_TRANSACAO.PAGO,
    data: transacao.data || '',
    categoriaId: transacao.categoriaId ? String(transacao.categoriaId) : '',
    contaId: transacao.contaId ? String(transacao.contaId) : '',
  }));

  const isEntrada = form.tipo === TIPO_TRANSACAO.ENTRADA;
  const isParcelado = Boolean(transacao.parcelamentoId || transacao.numeroParcela);
  const isRecorrente = Boolean(transacao.recorrenciaId);

  const categoriasFiltradas = useMemo(() => {
    return (categoriasPorTipo && categoriasPorTipo[form.tipo]) || [];
  }, [categoriasPorTipo, form.tipo]);

  function handleSubmit(e) {
    e.preventDefault();
    if (salvando) return;

    const valorNumerico = parseCurrencyInput(form.valor);
    if (!form.descricao.trim()) return;

    onSalvar({
      descricao: form.descricao.trim(),
      valor: valorNumerico,
      tipo: form.tipo,
      status: form.status,
      data: form.data,
      categoriaId: form.categoriaId ? Number(form.categoriaId) : null,
      contaId: form.contaId ? Number(form.contaId) : transacao.contaId,
    });
  }

  function handleKeyDown(e) {
    if (e.key === 'Escape') {
      e.preventDefault();
      onCancelar();
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      onKeyDown={handleKeyDown}
      className="mt-2 p-4 md:p-5 rounded-2xl border border-primary/40 bg-secondary/70 dark:bg-card/95 shadow-lg backdrop-blur-sm animate-in fade-in slide-in-from-top-2 duration-200 space-y-4"
    >
      {/* Header com indicador de edição e tags de parcelamento/recorrência */}
      <div className="flex items-center justify-between pb-2 border-b border-border/60">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span className="text-xs font-bold uppercase tracking-wider text-foreground">
            Editar Lançamento
          </span>
          {isParcelado && (
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border bg-primary/10 text-primary border-primary/20">
              <Layers className="w-2.5 h-2.5" />
              Parcela {transacao.numeroParcela}/{transacao.totalParcelas}
            </span>
          )}
          {isRecorrente && (
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border bg-indigo-500/10 text-indigo-400 border-indigo-500/20">
              <Repeat className="w-2.5 h-2.5" />
              {transacao.frequenciaRecorrencia || 'Recorrente'}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={onCancelar}
          className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-muted/50 transition-colors"
          title="Fechar edição (Esc)"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Linha 1: Tipo (Receita / Despesa) e Valor */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
        <div className="sm:col-span-5">
          <label className="block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
            Tipo
          </label>
          <div className="grid grid-cols-2 gap-1 p-1 bg-background/80 rounded-xl border border-border">
            <button
              type="button"
              onClick={() =>
                setForm((f) => ({ ...f, tipo: TIPO_TRANSACAO.ENTRADA, categoriaId: '' }))
              }
              className={cn(
                'flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all',
                isEntrada
                  ? 'bg-entrada text-white shadow-sm'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
              Receita
            </button>
            <button
              type="button"
              onClick={() =>
                setForm((f) => ({ ...f, tipo: TIPO_TRANSACAO.SAIDA, categoriaId: '' }))
              }
              className={cn(
                'flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all',
                !isEntrada
                  ? 'bg-saida text-white shadow-sm'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              <ArrowDownRight className="w-3.5 h-3.5 stroke-[2.5]" />
              Despesa
            </button>
          </div>
        </div>

        <div className="sm:col-span-7">
          <label className="block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
            Valor
          </label>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-border bg-background/80 focus-within:border-primary transition-colors">
            <span
              className={cn(
                'text-base font-bold tracking-tight',
                isEntrada ? 'text-entrada' : 'text-saida',
              )}
            >
              R$
            </span>
            <input
              type="text"
              inputMode="decimal"
              value={form.valor}
              onChange={(e) => {
                const formatted = formatCurrencyInput(e.target.value);
                setForm((f) => ({ ...f, valor: formatted }));
              }}
              placeholder="0,00"
              required
              className={cn(
                'w-full bg-transparent border-none p-0 numeric-mono text-lg font-bold focus:outline-none placeholder:text-muted-foreground/40',
                isEntrada ? 'text-entrada' : 'text-saida',
              )}
            />
          </div>
        </div>
      </div>

      {/* Linha 2: Descrição */}
      <div>
        <label className="block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
          Descrição
        </label>
        <Input
          type="text"
          value={form.descricao}
          onChange={(e) => setForm((f) => ({ ...f, descricao: e.target.value }))}
          placeholder="Descrição do lançamento"
          maxLength={120}
          required
          className="h-10 rounded-xl bg-background/80 border-border text-xs sm:text-sm"
        />
      </div>

      {/* Linha 3: Data, Categoria, Status e Conta */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {/* Data */}
        <div>
          <label className="block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
            Data
          </label>
          <div className="relative">
            <Input
              type="date"
              value={form.data}
              onChange={(e) => e.target.value && setForm((f) => ({ ...f, data: e.target.value }))}
              style={{ colorScheme }}
              required
              className="h-10 rounded-xl bg-background/80 border-border text-xs font-mono cursor-pointer"
            />
          </div>
        </div>

        {/* Categoria */}
        <div>
          <label className="block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
            Categoria
          </label>
          <select
            value={form.categoriaId}
            onChange={(e) => setForm((f) => ({ ...f, categoriaId: e.target.value }))}
            className="flex h-10 w-full rounded-xl border border-border bg-background/80 px-3 py-1.5 text-xs text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer hover:bg-background transition-colors"
          >
            <option value="">Sem Categoria (Geral)</option>
            {categoriasFiltradas.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.nome}
              </option>
            ))}
          </select>
        </div>

        {/* Status */}
        <div className="sm:col-span-2 lg:col-span-1">
          <label className="block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
            Status
          </label>
          <div className="grid grid-cols-2 gap-1 p-1 bg-background/80 rounded-xl border border-border h-10 items-center">
            <button
              type="button"
              onClick={() => setForm((f) => ({ ...f, status: STATUS_TRANSACAO.PAGO }))}
              className={cn(
                'flex items-center justify-center gap-1 py-1 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all h-7',
                form.status === STATUS_TRANSACAO.PAGO
                  ? 'bg-emerald-500 text-white shadow-sm'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              <CheckCircle2 className="w-3 h-3" />
              Pago
            </button>
            <button
              type="button"
              onClick={() => setForm((f) => ({ ...f, status: STATUS_TRANSACAO.PENDENTE }))}
              className={cn(
                'flex items-center justify-center gap-1 py-1 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all h-7',
                form.status === STATUS_TRANSACAO.PENDENTE
                  ? 'bg-amber-500 text-white shadow-sm'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              <Clock className="w-3 h-3" />
              Pendente
            </button>
          </div>
        </div>

        {/* Conta (se houver múltiplas) */}
        {contas && contas.length > 1 && (
          <div className="sm:col-span-2 lg:col-span-3">
            <label className="block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
              Conta
            </label>
            <select
              value={form.contaId}
              onChange={(e) => setForm((f) => ({ ...f, contaId: e.target.value }))}
              className="flex h-10 w-full rounded-xl border border-border bg-background/80 px-3 py-1.5 text-xs text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer hover:bg-background transition-colors"
            >
              {contas.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nome} ({c.tipo})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Ações: Cancelar e Salvar */}
      <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/60">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onCancelar}
          className="rounded-xl text-xs font-semibold h-9 px-4 text-muted-foreground hover:text-foreground hover:bg-muted"
        >
          <X className="w-3.5 h-3.5 mr-1.5" />
          Cancelar
        </Button>
        <Button
          type="submit"
          variant="default"
          size="sm"
          disabled={salvando}
          className="rounded-xl text-xs font-semibold h-9 px-5 bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm gap-1.5"
        >
          {salvando ? (
            <span className="inline-block w-3.5 h-3.5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-1" />
          ) : (
            <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" />
          )}
          Salvar Alterações
        </Button>
      </div>
    </form>
  );
}