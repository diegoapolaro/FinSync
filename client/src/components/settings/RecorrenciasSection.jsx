import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Repeat,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Edit2,
  Trash2,
  CheckCircle2,
  X,
  Clock,
  Sparkles,
} from 'lucide-react';
import SettingsSection from './SettingsSection';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Switch } from '../ui/switch';
import { formatCurrency } from '../../utils/formatters';
import { TIPO_TRANSACAO, FREQUENCIA_RECORRENCIA, STATUS_TRANSACAO } from '../../utils/constants';
import {
  getRecorrencias,
  getResumoRecorrencias,
  createRecorrencia,
  updateRecorrencia,
  toggleRecorrenciaAtivo,
  deleteRecorrencia,
} from '../../services/api';
import { useToast } from '../../contexts/ToastContext';
import { cn } from '@/lib/utils';

function formatDateOnly(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

const formInicial = {
  descricao: '',
  valor: '',
  tipo: TIPO_TRANSACAO.SAIDA,
  frequencia: FREQUENCIA_RECORRENCIA.MENSAL,
  dataInicio: formatDateOnly(new Date()),
  temDataFim: false,
  dataFim: '',
  statusPadrao: STATUS_TRANSACAO.PENDENTE,
  contaId: '',
  categoriaId: '',
};

export default function RecorrenciasSection({ contas = [], categorias = [] }) {
  const { addToast } = useToast();
  const [recorrencias, setRecorrencias] = useState([]);
  const [resumo, setResumo] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [modalAberto, setModalAberto] = useState(false);
  const [editandoItem, setEditandoItem] = useState(null);
  const [form, setForm] = useState(formInicial);
  const [salvando, setSalvando] = useState(false);
  const [deleteModal, setDeleteModal] = useState(null);

  const carregarDados = useCallback(async () => {
    try {
      const [lista, res] = await Promise.all([getRecorrencias(), getResumoRecorrencias()]);
      setRecorrencias(lista || []);
      setResumo(res);
    } catch {
      setRecorrencias([]);
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  const categoriasFiltradas = useMemo(() => {
    return categorias.filter((c) => c.tipo === form.tipo);
  }, [categorias, form.tipo]);

  function abrirNovo() {
    setEditandoItem(null);
    setForm({
      ...formInicial,
      contaId: contas.length > 0 ? String(contas[0].id) : '',
    });
    setModalAberto(true);
  }

  function abrirEdicao(item) {
    setEditandoItem(item);
    setForm({
      descricao: item.descricao,
      valor: String(item.valor).replace('.', ','),
      tipo: item.tipo,
      frequencia: item.frequencia,
      dataInicio: item.dataInicio,
      temDataFim: Boolean(item.dataFim),
      dataFim: item.dataFim || '',
      statusPadrao: item.statusPadrao,
      contaId: String(item.contaId),
      categoriaId: item.categoriaId ? String(item.categoriaId) : '',
    });
    setModalAberto(true);
  }

  async function handleToggleAtivo(item) {
    try {
      await toggleRecorrenciaAtivo(item.id);
      setRecorrencias((prev) =>
        prev.map((r) => (r.id === item.id ? { ...r, ativo: !r.ativo } : r)),
      );
      addToast(
        item.ativo ? 'Recorrência pausada.' : 'Recorrência ativada com sucesso!',
        'success',
      );
      const novoResumo = await getResumoRecorrencias();
      setResumo(novoResumo);
    } catch (err) {
      addToast(err.message, 'error');
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (salvando) return;

    setSalvando(true);
    try {
      const payload = {
        descricao: form.descricao.trim(),
        valor: Number(form.valor.replace(',', '.')),
        tipo: form.tipo,
        frequencia: form.frequencia,
        dataInicio: form.dataInicio,
        dataFim: form.temDataFim && form.dataFim ? form.dataFim : null,
        statusPadrao: form.statusPadrao,
        contaId: Number(form.contaId || (contas[0] ? contas[0].id : 0)),
        categoriaId: form.categoriaId ? Number(form.categoriaId) : null,
      };

      if (editandoItem) {
        await updateRecorrencia(editandoItem.id, {
          ...payload,
          ativo: editandoItem.ativo,
          atualizarTransacoesFuturas: true,
        });
        addToast('Regra recorrente atualizada!', 'success');
      } else {
        await createRecorrencia(payload);
        addToast('Regra de recorrência criada e transações projetadas!', 'success');
      }

      setModalAberto(false);
      await carregarDados();
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setSalvando(false);
    }
  }

  async function handleConfirmDelete(id, excluirFuturas = true) {
    try {
      await deleteRecorrencia(id, excluirFuturas);
      setDeleteModal(null);
      await carregarDados();
      addToast('Recorrência excluída com sucesso.', 'success');
    } catch (err) {
      addToast(err.message, 'error');
    }
  }

  return (
    <SettingsSection
      id="recorrencias"
      title="Recorrências & Lançamentos Fixos"
      description="Gerencie salários, assinaturas, aluguéis e regras periódicas com projeção de faturas futuras."
      icon={Repeat}
    >
      {/* Metrics Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card className="p-4 bg-card border-border/80 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">
            Receitas Fixas / Mês
          </span>
          <span className="text-xl font-bold numeric-mono text-entrada">
            {formatCurrency(resumo?.totalReceitasFixas ?? 0)}
          </span>
        </Card>
        <Card className="p-4 bg-card border-border/80 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">
            Despesas Fixas / Mês
          </span>
          <span className="text-xl font-bold numeric-mono text-saida">
            {formatCurrency(resumo?.totalDespesasFixas ?? 0)}
          </span>
        </Card>
        <Card className="p-4 bg-card border-border/80 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">
            Saldo Fixo Líquido
          </span>
          <div className="flex items-center justify-between">
            <span
              className={cn(
                'text-xl font-bold numeric-mono',
                (resumo?.saldoFixo ?? 0) >= 0 ? 'text-foreground' : 'text-saida',
              )}
            >
              {formatCurrency(resumo?.saldoFixo ?? 0)}
            </span>
            <Badge variant="outline" className="text-[10px] font-semibold">
              {resumo?.totalAtivas ?? 0} ativas
            </Badge>
          </div>
        </Card>
      </div>

      {/* Header with CTA Button */}
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Assinaturas e Fixos Cadastrados ({recorrencias.length})
        </h4>
        <Button
          onClick={abrirNovo}
          size="sm"
          className="rounded-full bg-primary text-primary-foreground text-xs font-semibold"
        >
          <Plus className="w-3.5 h-3.5 mr-1" />
          Nova Recorrência
        </Button>
      </div>

      {/* List / Empty State */}
      {carregando && (
        <div className="text-center py-12 text-muted-foreground text-sm">
          <span className="inline-block w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin align-middle mr-2" />
          Carregando recorrências...
        </div>
      )}

      {!carregando && recorrencias.length === 0 && (
        <Card className="p-8 text-center border-dashed border-border flex flex-col items-center">
          <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center mb-3">
            <Repeat className="w-6 h-6 text-muted-foreground" />
          </div>
          <p className="text-sm font-semibold text-foreground mb-1">Nenhuma recorrência ativa</p>
          <p className="text-xs text-muted-foreground max-w-sm mb-4">
            Cadastre receitas e despesas periódicas (como Netflix, Salário ou Aluguel) para projetar os meses futuros automaticamente.
          </p>
          <Button onClick={abrirNovo} size="sm" className="rounded-full">
            <Plus className="w-3.5 h-3.5 mr-1" />
            Cadastrar Primeira Recorrência
          </Button>
        </Card>
      )}

      {!carregando && recorrencias.length > 0 && (
        <div className="space-y-3">
          {recorrencias.map((item) => {
            const isEntrada = item.tipo === TIPO_TRANSACAO.ENTRADA;
            const Icon = isEntrada ? ArrowUpRight : ArrowDownRight;

            return (
              <Card
                key={item.id}
                className={cn(
                  'p-4 flex items-center justify-between border-border/80 transition-all hover:shadow-card-hover group',
                  !item.ativo && 'opacity-60 bg-muted/20',
                )}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div
                    className={cn(
                      'w-10 h-10 rounded-full flex items-center justify-center shrink-0 border border-border bg-secondary',
                      isEntrada ? 'text-entrada' : 'text-saida',
                    )}
                  >
                    <Icon className="w-5 h-5 stroke-[2.5]" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-sm text-foreground tracking-tight truncate">
                        {item.descricao}
                      </span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full border bg-indigo-500/10 text-indigo-400 border-indigo-500/20">
                        {item.frequencia}
                      </span>
                      {item.categoriaNome && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full border bg-secondary text-muted-foreground border-border">
                          {item.categoriaNome}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-[11px] text-muted-foreground">
                      <span>Conta: {item.contaNome}</span>
                      {item.proximoVencimento && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-muted-foreground/70" />
                          Próximo:{' '}
                          {new Date(item.proximoVencimento + 'T12:00:00').toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: 'short',
                          })}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span
                    className={cn(
                      'numeric-mono text-sm sm:text-base font-bold tracking-tight',
                      isEntrada ? 'text-entrada' : 'text-saida',
                    )}
                  >
                    {isEntrada ? '+ ' : '- '}
                    {formatCurrency(item.valor)}
                  </span>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={item.ativo}
                      onCheckedChange={() => handleToggleAtivo(item)}
                      aria-label="Ativar/Pausar recorrência"
                    />
                    <Button
                      variant="ghost"
                      size="iconSm"
                      onClick={() => abrirEdicao(item)}
                      title="Editar regra"
                      className="rounded-xl hover:bg-muted"
                    >
                      <Edit2 className="w-4 h-4 text-muted-foreground" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="iconSm"
                      onClick={() => setDeleteModal(item)}
                      title="Excluir regra"
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

      {/* Modal Criar / Editar Recorrência */}
      {modalAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <Card className="w-full max-w-lg p-6 space-y-5 border border-border shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
                <Repeat className="w-4 h-4 text-primary" />
                {editandoItem ? 'Editar Recorrência' : 'Nova Recorrência Periódica'}
              </h3>
              <button
                type="button"
                onClick={() => setModalAberto(false)}
                className="p-1 rounded-lg text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Type Switcher */}
              <div className="grid grid-cols-2 gap-1.5 p-1 bg-secondary rounded-xl border border-border">
                <button
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, tipo: TIPO_TRANSACAO.ENTRADA, categoriaId: '' }))}
                  className={cn(
                    'py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all',
                    form.tipo === TIPO_TRANSACAO.ENTRADA
                      ? 'bg-entrada text-white shadow-sm'
                      : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  Receita Fixa
                </button>
                <button
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, tipo: TIPO_TRANSACAO.SAIDA, categoriaId: '' }))}
                  className={cn(
                    'py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all',
                    form.tipo === TIPO_TRANSACAO.SAIDA
                      ? 'bg-saida text-white shadow-sm'
                      : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  Despesa Fixa / Assinatura
                </button>
              </div>

              {/* Descrição */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Descrição
                </label>
                <Input
                  placeholder="Ex: Netflix, Salário, Aluguel..."
                  value={form.descricao}
                  onChange={(e) => setForm((f) => ({ ...f, descricao: e.target.value }))}
                  required
                  className="rounded-xl h-10 text-sm bg-secondary border-border"
                />
              </div>

              {/* Valor & Frequência */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Valor (R$)
                  </label>
                  <Input
                    placeholder="0,00"
                    value={form.valor}
                    onChange={(e) => {
                      const raw = e.target.value.replace(/[^0-9,]/g, '');
                      setForm((f) => ({ ...f, valor: raw }));
                    }}
                    required
                    className="rounded-xl h-10 text-sm bg-secondary border-border numeric-mono font-semibold"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Frequência
                  </label>
                  <select
                    value={form.frequencia}
                    onChange={(e) => setForm((f) => ({ ...f, frequencia: e.target.value }))}
                    className="flex h-10 w-full rounded-xl border border-border bg-secondary px-3 py-2 text-xs text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    {Object.values(FREQUENCIA_RECORRENCIA).map((freq) => (
                      <option key={freq} value={freq}>
                        {freq}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Conta & Categoria */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Conta
                  </label>
                  <select
                    value={form.contaId}
                    onChange={(e) => setForm((f) => ({ ...f, contaId: e.target.value }))}
                    className="flex h-10 w-full rounded-xl border border-border bg-secondary px-3 py-2 text-xs text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    {contas.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nome}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Categoria
                  </label>
                  <select
                    value={form.categoriaId}
                    onChange={(e) => setForm((f) => ({ ...f, categoriaId: e.target.value }))}
                    className="flex h-10 w-full rounded-xl border border-border bg-secondary px-3 py-2 text-xs text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Geral (Sem Categoria)</option>
                    {categoriasFiltradas.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nome}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Datas */}
              <div className="space-y-2 pt-1 border-t border-border">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Data Início
                    </label>
                    <Input
                      type="date"
                      value={form.dataInicio}
                      onChange={(e) => setForm((f) => ({ ...f, dataInicio: e.target.value }))}
                      required
                      className="rounded-xl h-10 text-xs bg-secondary border-border"
                    />
                  </div>
                  {form.temDataFim && (
                    <div className="space-y-1.5">
                      <label className="block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Data Término
                      </label>
                      <Input
                        type="date"
                        value={form.dataFim}
                        onChange={(e) => setForm((f) => ({ ...f, dataFim: e.target.value }))}
                        className="rounded-xl h-10 text-xs bg-secondary border-border"
                      />
                    </div>
                  )}
                </div>

                <label className="flex items-center gap-2 cursor-pointer text-xs text-muted-foreground pt-1">
                  <input
                    type="checkbox"
                    checked={form.temDataFim}
                    onChange={(e) => setForm((f) => ({ ...f, temDataFim: e.target.checked }))}
                    className="rounded border-border text-primary focus:ring-primary h-4 w-4"
                  />
                  <span>Definir data de término (opcional)</span>
                </label>
              </div>

              <div className="flex gap-3 pt-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setModalAberto(false)}
                  className="flex-1 rounded-xl"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={salvando}
                  className="flex-1 rounded-xl bg-primary text-primary-foreground font-semibold"
                >
                  {salvando ? 'Salvando...' : editandoItem ? 'Salvar Alterações' : 'Criar Recorrência'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <Card className="w-full max-w-md p-6 space-y-4 border border-border shadow-2xl">
            <h3 className="text-base font-semibold text-foreground">Excluir Regra de Recorrência</h3>
            <p className="text-xs text-muted-foreground">
              Você está prestes a excluir a regra de <strong>{deleteModal.descricao}</strong>. Deseja também excluir as ocorrências futuras pendentes já geradas no sistema?
            </p>

            <div className="flex flex-col gap-2 pt-2">
              <Button
                variant="destructive"
                onClick={() => handleConfirmDelete(deleteModal.id, true)}
                className="w-full rounded-xl text-xs font-semibold"
              >
                Excluir Regra e Transações Futuras Pendentes
              </Button>
              <Button
                variant="outline"
                onClick={() => handleConfirmDelete(deleteModal.id, false)}
                className="w-full rounded-xl text-xs font-semibold"
              >
                Excluir Apenas a Regra (Manter Lançamentos)
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
    </SettingsSection>
  );
}
