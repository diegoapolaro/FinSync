import { useCallback, useEffect, useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  getTransacoes,
  createTransacao,
  updateTransacao,
  deleteTransacao,
  getCategorias,
} from '../services/api';
import { formatCurrency } from '../utils/formatters';
import { useToast } from '../contexts/ToastContext';

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

  const fmt = (d) =>
    d.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' });

  if (date.toDateString() === hoje.toDateString()) return `Hoje (${fmt(hoje)})`;
  if (date.toDateString() === amanha.toDateString()) return `Amanhã (${fmt(amanha)})`;
  if (date.toDateString() === ontem.toDateString()) return `Ontem (${fmt(ontem)})`;
  return fmt(date);
}

const formInicial = {
  descricao: '',
  valor: '',
  tipo: 'Entrada',
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
    getCategorias().then(setCategorias).catch(() => {});
  }, []);

  const carregarTransacoes = useCallback(async () => {
    if (!contaSelecionadaId) {
      setTransacoes([]);
      setCarregando(false);
      return;
    }
    try {
      const dados = await getTransacoes(contaSelecionadaId, dataSelecionada);
      setTransacoes(dados);
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

  return (
    <div className="px-gutter md:px-margin-page pt-stack-base md:pt-margin-page pb-[100px] md:pb-gutter">
      <div className="flex flex-col items-center justify-center border-b border-dashed border-outline-variant pb-stack-base">
        <h2 className="font-headline-md text-headline-md text-primary mb-4 uppercase text-center">
          {editandoId ? 'EDITAR LANÇAMENTO' : 'LANÇAMENTO'}
        </h2>

        <div className="flex items-center justify-between w-full font-value-sm text-value-sm text-primary">
          <button
            type="button"
            onClick={() => navegar(-1)}
            className="hover:underline flex items-center gap-1 opacity-60"
          >
            <span className="material-symbols-outlined text-sm">arrow_left</span>
            Ontem
          </button>
          <span className="font-bold underline decoration-2 underline-offset-4">
            {formatLabel(new Date(dataSelecionada + 'T12:00:00'))}
          </span>
          <button
            type="button"
            onClick={() => navegar(1)}
            className="hover:underline flex items-center gap-1 opacity-60"
          >
            Amanhã
            <span className="material-symbols-outlined text-sm">arrow_right</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-stack-base mt-stack-base">
        <div className="grid grid-cols-2 gap-4 mb-2">
          <button
            type="button"
            onClick={() => setForm((f) => ({ ...f, tipo: 'Entrada', categoriaId: '' }))}
            className={
              form.tipo === 'Entrada'
                ? 'border-2 border-primary p-3 flex flex-col items-center justify-center gap-1 bg-[#2F6B4F] text-white -rotate-2 scale-105 shadow-[2px_2px_0px_#090e0b] transition-colors relative overflow-hidden'
                : 'border-2 border-primary p-3 flex flex-col items-center justify-center gap-1 bg-[#fdf9ec] hover:bg-[#2F6B4F] hover:text-white hover:border-[#2F6B4F] transition-colors group'
            }
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
              add_circle
            </span>
            <span className="font-label-caps text-label-caps font-bold">ENTRADA</span>
          </button>
          <button
            type="button"
            onClick={() => setForm((f) => ({ ...f, tipo: 'Saida', categoriaId: '' }))}
            className={
              form.tipo === 'Saida'
                ? 'border-2 border-[#B23A2E] p-3 flex flex-col items-center justify-center gap-1 bg-[#B23A2E] text-white -rotate-2 scale-105 shadow-[2px_2px_0px_#090e0b] transition-colors relative overflow-hidden'
                : 'border-2 border-primary p-3 flex flex-col items-center justify-center gap-1 bg-[#fdf9ec] hover:bg-[#B23A2E] hover:text-white hover:border-[#B23A2E] transition-colors group'
            }
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
              remove_circle
            </span>
            <span className="font-label-caps text-label-caps font-bold">SAÍDA</span>
          </button>
        </div>

        <div className="flex flex-col gap-1 border-b border-primary pb-2 focus-within:border-dashed">
          <label className="font-label-caps text-label-caps text-outline">VALOR (R$)</label>
          <input
            className="w-full bg-transparent border-none p-0 font-headline-lg text-headline-lg text-primary text-right focus:ring-0 placeholder:text-outline-variant"
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

        <div className="flex flex-col gap-1 border-b border-primary pb-2 focus-within:border-dashed mt-2">
          <label className="font-label-caps text-label-caps text-outline">DESCRIÇÃO</label>
          <input
            className="w-full bg-transparent border-none p-0 font-body-lg text-body-lg text-primary uppercase focus:ring-0 placeholder:text-outline-variant"
            placeholder="MOTIVO DA TRANSAÇÃO"
            type="text"
            value={form.descricao}
            onChange={(e) => setForm((f) => ({ ...f, descricao: e.target.value }))}
            maxLength={120}
            required
          />
        </div>

        <div className="flex flex-col gap-1 border-b border-primary pb-2 focus-within:border-dashed mt-2 relative">
          <label className="font-label-caps text-label-caps text-outline">CATEGORIA</label>
          <select
            value={form.categoriaId}
            onChange={(e) => setForm((f) => ({ ...f, categoriaId: e.target.value }))}
            className="w-full bg-transparent border-none p-0 font-body-lg text-body-lg text-primary uppercase focus:ring-0 cursor-pointer appearance-none"
          >
            <option value="">SEM CATEGORIA</option>
            {categoriasFiltradas.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.nome}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-2 mt-stack-loose">
          {editandoId && (
            <button
              type="button"
              onClick={resetForm}
              className="flex-1 border-2 border-primary p-4 font-label-caps text-label-caps hover:bg-surface-variant transition-colors flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined">close</span>
              CANCELAR
            </button>
          )}
          <button
            type="submit"
            disabled={enviando}
            className={
              editandoId
                ? 'flex-1 border-2 border-primary bg-primary text-on-primary font-label-caps text-label-caps p-4 hover:bg-surface-container-lowest hover:text-primary transition-colors flex items-center justify-center gap-2 disabled:opacity-50'
                : 'w-full border-2 border-primary bg-primary text-on-primary font-label-caps text-label-caps p-4 hover:bg-surface-container-lowest hover:text-primary transition-colors flex items-center justify-center gap-2 disabled:opacity-50'
            }
          >
            <span className="material-symbols-outlined">ink_pen</span>
            {editandoId ? 'SALVAR ALTERAÇÕES' : 'REGISTRAR LANÇAMENTO'}
          </button>
        </div>
      </form>

      <div className="mt-stack-loose flex flex-col gap-2">
        <div className="border-b-2 border-double border-primary pb-2 mb-2 flex justify-between items-end">
          <span className="font-label-caps text-label-caps text-primary font-bold">REGISTROS DO DIA</span>
          <span className="font-value-sm text-value-sm text-outline">QTD: {transacoes.length.toString().padStart(2, '0')}</span>
        </div>

        {carregando && (
          <p className="font-body-lg text-body-lg text-on-surface-variant text-center py-8">
            Carregando...
          </p>
        )}

        {!carregando && transacoes.length === 0 && (
          <p className="font-body-lg text-body-lg text-on-surface-variant text-center py-8 opacity-60">
            Nenhum lançamento neste dia.
          </p>
        )}

        {!carregando && transacoes.length > 0 && (
          <ul className="flex flex-col gap-3">
            {transacoes.map((t) => {
              const cor = t.tipo === 'Entrada' ? '#2F6B4F' : '#B23A2E';
              return (
                <li
                  key={t.id}
                  className="flex items-center justify-between border-b border-dashed border-outline-variant pb-2 group cursor-pointer hover:bg-surface-variant transition-colors p-1 -mx-1"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-1 h-8 shrink-0" style={{ backgroundColor: cor }} />
                    <div className="min-w-0">
                      <div className="font-body-lg text-body-lg text-primary leading-tight truncate">
                        {t.descricao}
                      </div>
                      {t.categoriaNome && (
                        <div className="font-label-caps text-label-caps text-outline flex items-center gap-1 mt-1">
                          {t.categoriaCor && (
                            <span
                              className="w-2 h-2 rounded-full shrink-0"
                              style={{ backgroundColor: t.categoriaCor }}
                            />
                          )}
                          {t.categoriaNome}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    <span
                      className="font-value-lg text-value-lg"
                      style={{ color: cor }}
                    >
                      {t.tipo === 'Entrada' ? '+' : '-'}{formatCurrency(t.valor).replace('R$', '').trim()}
                    </span>
                    <button
                      type="button"
                      onClick={() => editar(t)}
                      className="text-outline opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <span className="material-symbols-outlined text-[18px]">edit</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(t.id)}
                      className="text-outline opacity-0 group-hover:opacity-100 transition-opacity hover:text-error"
                    >
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
