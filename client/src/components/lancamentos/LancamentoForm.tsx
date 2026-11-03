import React from 'react';
import {
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  Clock,
  Layers,
  Repeat,
  Sparkles,
  Receipt,
  FileText,
  UploadCloud,
  Check,
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import ParcelamentoOptions from './ParcelamentoOptions';
import RecorrenciaOptions from './RecorrenciaOptions';
import DescricaoAutocomplete from './DescricaoAutocomplete';
import {
  formatCurrencyInput,
  parseCurrencyInput,
  getCurrencyConfig,
  converterParaBRL,
  getCotacao,
} from '../../utils/formatters';
import usePreferencias from '../../hooks/usePreferencias';
import {
  TIPO_TRANSACAO,
  STATUS_TRANSACAO,
  MODO_PARCELAMENTO,
  MODO_LANCAMENTO,
} from '../../utils/constants';
import { cn } from '@/lib/utils';
import type { CategoriaDto, ContaDto } from '@/types';

export interface LancamentoFormState {
  descricao: string;
  valor: string;
  tipo: string;
  status: string;
  categoriaId: string;
  contaId: string;
  modo: string;
  totalParcelas: number;
  modoValorParcelamento: string;
  frequenciaRecorrencia: string;
  temDataFim: boolean;
  dataFimRecorrencia: string;
}

interface PreviewParcelamento {
  valorTotal: number;
  parcelas: number;
  valorParcela: number;
  periodo: string;
}

interface Props {
  form: LancamentoFormState;
  setForm: React.Dispatch<React.SetStateAction<LancamentoFormState>>;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  enviando: boolean;
  dataSelecionada: string;
  setDataSelecionada: (data: string) => void;
  hojeStr: string;
  ontemStr: string;
  colorScheme?: 'light' | 'dark';
  contas?: ContaDto[];
  contaSelecionadaId?: number | string;
  categoriasFiltradas: CategoriaDto[];
  previewParcelamento?: PreviewParcelamento | null;
  onLimpar?: () => void;
}

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
  onLimpar,
}: Props): React.ReactElement {
  const { prefs } = usePreferencias();
  const currencyConfig = getCurrencyConfig(prefs?.moeda);
  const isEntrada = form.tipo === TIPO_TRANSACAO.ENTRADA;
  const isEstrangeira = prefs?.moeda?.includes('USD') || prefs?.moeda?.includes('EUR');
  const valorNumerico = parseCurrencyInput(form.valor);
  const valorEmBRL = converterParaBRL(valorNumerico, prefs?.moeda);
  const taxaCambio = getCotacao(prefs?.moeda);

  return (
    <div className="bg-paper dark:bg-card rounded-[24px] p-6 md:p-8 border border-pebble/20 shadow-sm relative overflow-hidden flex flex-col gap-6">
      {/* Glow de ambientação no canto superior */}
      <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-linen-mist/50 dark:bg-spruce/20 blur-3xl pointer-events-none" />

      {/* Header do Formulário */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-forest-ink dark:text-paper font-sans">
            Novo Lançamento
          </h2>
          <p className="text-xs text-charcoal dark:text-pebble mt-0.5">
            Cadastre a movimentação financeira com validação contábil imediata
          </p>
        </div>

        {/* Tipo de Agendamento: Pílulas Único / Parcelado / Recorrente */}
        <div className="inline-flex items-center p-1 bg-fog dark:bg-spruce/50 rounded-full border border-pebble/20 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setForm((f) => ({ ...f, modo: MODO_LANCAMENTO.UNICO }))}
            className={cn(
              'flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all',
              form.modo === MODO_LANCAMENTO.UNICO
                ? 'bg-forest-ink text-paper dark:bg-lime-voltage dark:text-forest-ink shadow-xs'
                : 'text-charcoal dark:text-pebble hover:text-forest-ink dark:hover:text-paper',
            )}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Único</span>
          </button>

          <button
            type="button"
            onClick={() => setForm((f) => ({ ...f, modo: MODO_LANCAMENTO.PARCELADO }))}
            className={cn(
              'flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all',
              form.modo === MODO_LANCAMENTO.PARCELADO
                ? 'bg-forest-ink text-paper dark:bg-lime-voltage dark:text-forest-ink shadow-xs'
                : 'text-charcoal dark:text-pebble hover:text-forest-ink dark:hover:text-paper',
            )}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Parcelado</span>
          </button>

          <button
            type="button"
            onClick={() => setForm((f) => ({ ...f, modo: MODO_LANCAMENTO.RECORRENTE }))}
            className={cn(
              'flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all',
              form.modo === MODO_LANCAMENTO.RECORRENTE
                ? 'bg-forest-ink text-paper dark:bg-lime-voltage dark:text-forest-ink shadow-xs'
                : 'text-charcoal dark:text-pebble hover:text-forest-ink dark:hover:text-paper',
            )}
          >
            <Repeat className="w-3.5 h-3.5" />
            <span>Fixo / Recorrente</span>
          </button>
        </div>
      </div>

      <form onSubmit={onSubmit} className="space-y-6 relative z-10">
        {/* 1. Switch de Tipo de Movimentação (Pílulas Wise) */}
        <div className="flex flex-col gap-2">
          <label className="text-[11px] font-bold uppercase tracking-wider text-charcoal dark:text-pebble">
            Tipo de Movimentação
          </label>
          <div className="p-1 bg-fog dark:bg-spruce/50 rounded-full flex gap-1.5 max-w-md border border-pebble/20">
            <button
              type="button"
              onClick={() =>
                setForm((f) => ({ ...f, tipo: TIPO_TRANSACAO.SAIDA, categoriaId: '' }))
              }
              className={cn(
                'flex-1 py-2.5 px-5 rounded-full text-xs font-black transition-all flex items-center justify-center gap-2',
                !isEntrada
                  ? 'bg-alarm-red text-paper shadow-sm'
                  : 'text-charcoal dark:text-pebble hover:text-alarm-red hover:bg-paper dark:hover:bg-spruce',
              )}
            >
              <ArrowDownRight className="w-4 h-4 stroke-[2.5]" />
              <span>Saída (Despesa)</span>
            </button>

            <button
              type="button"
              onClick={() =>
                setForm((f) => ({ ...f, tipo: TIPO_TRANSACAO.ENTRADA, categoriaId: '' }))
              }
              className={cn(
                'flex-1 py-2.5 px-5 rounded-full text-xs font-black transition-all flex items-center justify-center gap-2',
                isEntrada
                  ? 'bg-lime-voltage text-forest-ink shadow-sm'
                  : 'text-charcoal dark:text-pebble hover:text-forest-ink dark:hover:text-paper hover:bg-paper dark:hover:bg-spruce',
              )}
            >
              <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
              <span>Entrada (Receita)</span>
            </button>
          </div>
        </div>

        {/* 2. Hero Value Input */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-bold uppercase tracking-wider text-charcoal dark:text-pebble">
              {form.modo === MODO_LANCAMENTO.PARCELADO &&
              form.modoValorParcelamento === MODO_PARCELAMENTO.PARCELA
                ? 'Valor por Parcela'
                : form.modo === MODO_LANCAMENTO.PARCELADO
                  ? 'Valor Total da Compra'
                  : 'Valor do Lançamento'}
            </label>

            <span
              className={cn(
                'text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border',
                !isEntrada
                  ? 'bg-alarm-red/10 text-alarm-red border-alarm-red/20'
                  : 'bg-linen-mist text-forest-ink border-forest-ink/15 dark:bg-spruce dark:text-lime-voltage',
              )}
            >
              {!isEntrada ? 'Débito Previsto' : 'Crédito a Receber'}
            </span>
          </div>

          <div
            className={cn(
              'relative flex items-center rounded-[14px] bg-fog dark:bg-spruce/30 border border-pebble/20 px-6 py-4 transition-all',
              'focus-within:bg-paper dark:focus-within:bg-spruce/60 focus-within:ring-2 focus-within:ring-lime-voltage focus-within:border-transparent',
            )}
          >
            <span className="numeric-mono text-2xl md:text-3xl font-black text-charcoal dark:text-pebble select-none mr-3">
              {currencyConfig.symbol}
            </span>

            <input
              className={cn(
                'w-full bg-transparent border-none p-0 numeric-mono text-3xl md:text-5xl font-black text-right focus:outline-none tracking-tight',
                !isEntrada ? 'text-alarm-red' : 'text-forest-ink dark:text-lime-voltage',
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

          {isEstrangeira && valorNumerico > 0 && (
            <div className="text-xs text-charcoal dark:text-pebble flex items-center gap-1.5 flex-wrap px-1">
              <span>≈</span>
              <span className="font-bold text-forest-ink dark:text-paper numeric-mono">
                {Number(valorEmBRL).toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                })}
              </span>
              <span className="text-[11px] text-pebble">
                (cotação: 1 {currencyConfig.code} = R$ {taxaCambio.toFixed(2)})
              </span>
            </div>
          )}
        </div>

        {/* 3. Seções Específicas: Parcelamento & Recorrência */}
        {form.modo === MODO_LANCAMENTO.PARCELADO && (
          <div className="bg-fog/60 dark:bg-spruce/30 rounded-[14px] p-4 border border-pebble/20">
            <ParcelamentoOptions
              totalParcelas={form.totalParcelas}
              onSelectParcelas={(num) => setForm((f) => ({ ...f, totalParcelas: num }))}
              previewParcelamento={previewParcelamento}
            />
          </div>
        )}

        {form.modo === MODO_LANCAMENTO.RECORRENTE && (
          <div className="bg-fog/60 dark:bg-spruce/30 rounded-[14px] p-4 border border-pebble/20">
            <RecorrenciaOptions
              frequenciaRecorrencia={form.frequenciaRecorrencia}
              onSelectFrequencia={(freq) => setForm((f) => ({ ...f, frequenciaRecorrencia: freq }))}
              temDataFim={form.temDataFim}
              onToggleTemDataFim={(checked) => setForm((f) => ({ ...f, temDataFim: checked }))}
              dataFimRecorrencia={form.dataFimRecorrencia}
              onChangeDataFim={(val) => setForm((f) => ({ ...f, dataFimRecorrencia: val }))}
            />
          </div>
        )}

        {/* 4. Grid de Parâmetros Detalhados (2 Colunas) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          {/* Descrição / Origem */}
          <div className="flex flex-col gap-1.5 md:col-span-2">
            <label
              htmlFor="form-descricao-input"
              className="text-[11px] font-bold uppercase tracking-wider text-charcoal dark:text-pebble"
            >
              Descrição / Fornecedor *
            </label>
            <DescricaoAutocomplete
              id="form-descricao-input"
              placeholder="Ex: Venda no balcão, Supermercado, Aluguel..."
              value={form.descricao}
              onChange={(e) =>
                setForm((f) => ({ ...f, descricao: (e.target as HTMLInputElement).value }))
              }
              onSelect={(sugestao) => {
                setForm((f) => {
                  const updates = { ...f, descricao: sugestao.descricao };
                  if (!f.categoriaId && sugestao.categoriaId && Array.isArray(categoriasFiltradas)) {
                    const categoriaExiste = categoriasFiltradas.some(
                      (c) => String(c.id) === String(sugestao.categoriaId),
                    );
                    if (categoriaExiste) {
                      updates.categoriaId = String(sugestao.categoriaId);
                    }
                  }
                  return updates;
                });
              }}
              tipo={form.tipo}
              contaId={contaSelecionadaId}
              maxLength={120}
              className="h-11 rounded-[10px] bg-fog dark:bg-spruce/30 border-pebble/30 text-xs font-semibold text-forest-ink dark:text-paper placeholder:text-pebble focus:ring-2 focus:ring-lime-voltage"
              required
            />
          </div>

          {/* Categoria */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-charcoal dark:text-pebble">
              Categoria Operacional *
            </label>
            <select
              value={form.categoriaId}
              onChange={(e) => setForm((f) => ({ ...f, categoriaId: e.target.value }))}
              aria-label="Categoria"
              className="h-11 w-full rounded-[10px] bg-fog dark:bg-spruce/30 border border-pebble/30 px-3.5 text-xs font-semibold text-forest-ink dark:text-paper focus:outline-none focus:ring-2 focus:ring-lime-voltage cursor-pointer hover:bg-fog/80 transition-colors"
            >
              <option value="">Sem Categoria (Geral)</option>
              {categoriasFiltradas.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.nome}
                </option>
              ))}
            </select>
          </div>

          {/* Conta / Carteira de Origem */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="contaId"
              className="text-[11px] font-bold uppercase tracking-wider text-charcoal dark:text-pebble"
            >
              Conta / Carteira de Origem *
            </label>
            <select
              id="contaId"
              aria-label="Conta"
              value={form.contaId || contaSelecionadaId}
              onChange={(e) => setForm((f) => ({ ...f, contaId: e.target.value }))}
              className="h-11 w-full rounded-[10px] bg-fog dark:bg-spruce/30 border border-pebble/30 px-3.5 text-xs font-semibold text-forest-ink dark:text-paper focus:outline-none focus:ring-2 focus:ring-lime-voltage cursor-pointer hover:bg-fog/80 transition-colors"
            >
              {contas && contas.length > 0 ? (
                contas.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nome} ({c.tipo})
                  </option>
                ))
              ) : (
                <option value="">Conta Principal</option>
              )}
            </select>
          </div>

          {/* Data do Lançamento */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label
                htmlFor="form-data-transacao"
                className="text-[11px] font-bold uppercase tracking-wider text-charcoal dark:text-pebble"
              >
                Data do Lançamento *
              </label>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setDataSelecionada(hojeStr)}
                  className={cn(
                    'text-[10px] font-bold px-2 py-0.5 rounded-full transition-all',
                    dataSelecionada === hojeStr
                      ? 'bg-forest-ink text-paper dark:bg-lime-voltage dark:text-forest-ink'
                      : 'text-pebble hover:text-forest-ink dark:hover:text-paper',
                  )}
                >
                  Hoje
                </button>
                <button
                  type="button"
                  onClick={() => setDataSelecionada(ontemStr)}
                  className={cn(
                    'text-[10px] font-bold px-2 py-0.5 rounded-full transition-all',
                    dataSelecionada === ontemStr
                      ? 'bg-forest-ink text-paper dark:bg-lime-voltage dark:text-forest-ink'
                      : 'text-pebble hover:text-forest-ink dark:hover:text-paper',
                  )}
                >
                  Ontem
                </button>
              </div>
            </div>
            <Input
              id="form-data-transacao"
              aria-label="Data do Lançamento"
              type="date"
              value={dataSelecionada}
              onChange={(e) => e.target.value && setDataSelecionada(e.target.value)}
              className="h-11 rounded-[10px] bg-fog dark:bg-spruce/30 border-pebble/30 text-xs font-mono font-bold text-forest-ink dark:text-paper focus:ring-2 focus:ring-lime-voltage"
              style={{ colorScheme } as React.CSSProperties}
              required
            />
          </div>

          {/* Status do Pagamento / Situação Financeira */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-charcoal dark:text-pebble">
              Situação Financeira
            </label>
            <div className="grid grid-cols-2 gap-1.5 p-1 bg-fog dark:bg-spruce/50 rounded-full border border-pebble/20">
              <button
                type="button"
                onClick={() => setForm((f) => ({ ...f, status: STATUS_TRANSACAO.PAGO }))}
                className={cn(
                  'h-9 rounded-full text-xs font-bold transition-all flex items-center justify-center gap-1.5',
                  form.status === STATUS_TRANSACAO.PAGO
                    ? 'bg-forest-ink text-lime-voltage dark:bg-lime-voltage dark:text-forest-ink shadow-xs'
                    : 'text-charcoal dark:text-pebble hover:text-forest-ink dark:hover:text-paper',
                )}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Pago</span>
              </button>
              <button
                type="button"
                onClick={() => setForm((f) => ({ ...f, status: STATUS_TRANSACAO.PENDENTE }))}
                className={cn(
                  'h-9 rounded-full text-xs font-bold transition-all flex items-center justify-center gap-1.5',
                  form.status === STATUS_TRANSACAO.PENDENTE
                    ? 'bg-alarm-red/15 text-alarm-red font-black shadow-xs'
                    : 'text-charcoal dark:text-pebble hover:text-alarm-red',
                )}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Pendente</span>
              </button>
            </div>
          </div>

          {/* Observações & Nota Fiscal / Anexo */}
          <div className="flex flex-col gap-1.5 md:col-span-2">
            <label className="text-[11px] font-bold uppercase tracking-wider text-charcoal dark:text-pebble">
              Observações & Documentação Fiscal
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <textarea
                rows={2}
                placeholder="Insira o número da NF-e, pedido de compra ou detalhes adicionais..."
                className="md:col-span-2 p-3 bg-fog dark:bg-spruce/30 rounded-[10px] border border-pebble/30 text-xs font-medium text-forest-ink dark:text-paper placeholder:text-pebble focus:outline-none focus:ring-2 focus:ring-lime-voltage resize-none"
              />
              <div className="rounded-[10px] bg-fog dark:bg-spruce/30 border border-dashed border-pebble/40 p-3 flex flex-col items-center justify-center text-center cursor-pointer hover:border-forest-ink/40 dark:hover:border-lime-voltage/50 transition-all group">
                <UploadCloud className="w-5 h-5 text-forest-ink dark:text-lime-voltage mb-1 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold text-forest-ink dark:text-paper">
                  Anexar Comprovante
                </span>
                <span className="text-[10px] text-pebble uppercase mt-0.5">PDF ou PNG</span>
              </div>
            </div>
          </div>
        </div>

        {/* 5. Ações Globais do Formulário (Wise Signature Pill CTA) */}
        <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3 pt-3 border-t border-pebble/20">
          <button
            type="button"
            onClick={onLimpar}
            className="w-full sm:w-auto px-5 py-2.5 rounded-full text-xs font-bold text-charcoal dark:text-pebble hover:text-alarm-red hover:bg-alarm-red/10 transition-colors"
          >
            Limpar Campos
          </button>

          <Button
            type="submit"
            size="lg"
            disabled={enviando}
            className="w-full sm:w-auto h-12 px-8 rounded-full bg-lime-voltage text-forest-ink hover:bg-lime-voltage/90 font-black text-sm tracking-tight shadow-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-all border-0"
          >
            {enviando ? (
              <span className="inline-block w-4 h-4 border-2 border-forest-ink border-t-transparent rounded-full animate-spin mr-1" />
            ) : (
              <Check className="w-4 h-4 stroke-[3]" />
            )}
            <span>
              {form.modo === MODO_LANCAMENTO.PARCELADO
                ? `Gerar ${form.totalParcelas}x Parcelas`
                : form.modo === MODO_LANCAMENTO.RECORRENTE
                  ? 'Confirmar Recorrência'
                  : 'Confirmar Lançamento'}
            </span>
          </Button>
        </div>
      </form>
    </div>
  );
}
