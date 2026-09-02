import React from 'react';
import {
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  Clock,
  Layers,
  Repeat,
  Sparkles,
} from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import ParcelamentoOptions from './ParcelamentoOptions';
import RecorrenciaOptions from './RecorrenciaOptions';
import { formatCurrencyInput } from '../../utils/formatters';
import {
  TIPO_TRANSACAO,
  STATUS_TRANSACAO,
  MODO_PARCELAMENTO,
  MODO_LANCAMENTO,
} from '../../utils/constants';
import { cn } from '@/lib/utils';

export default function LancamentoForm({
  form,
  setForm,
  onSubmit,
  enviando,
  dataSelecionada,
  setDataSelecionada,
  hojeStr,
  ontemStr,
  colorScheme,
  contas,
  contaSelecionadaId,
  categoriasFiltradas,
  previewParcelamento,
}) {
  const isEntrada = form.tipo === TIPO_TRANSACAO.ENTRADA;

  return (
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

      <form onSubmit={onSubmit} className="space-y-5">
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
          <ParcelamentoOptions
            totalParcelas={form.totalParcelas}
            onSelectParcelas={(num) => setForm((f) => ({ ...f, totalParcelas: num }))}
            previewParcelamento={previewParcelamento}
          />
        )}

        {/* Seção Específica: Recorrência */}
        {form.modo === MODO_LANCAMENTO.RECORRENTE && (
          <RecorrenciaOptions
            frequenciaRecorrencia={form.frequenciaRecorrencia}
            onSelectFrequencia={(freq) => setForm((f) => ({ ...f, frequenciaRecorrencia: freq }))}
            temDataFim={form.temDataFim}
            onToggleTemDataFim={(checked) => setForm((f) => ({ ...f, temDataFim: checked }))}
            dataFimRecorrencia={form.dataFimRecorrencia}
            onChangeDataFim={(val) => setForm((f) => ({ ...f, dataFimRecorrencia: val }))}
          />
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
  );
}
