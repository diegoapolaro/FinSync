import { useState } from 'react';
import { Tag, Plus, Edit2 } from 'lucide-react';
import { createCategoria, updateCategoria } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';
import { TIPO_TRANSACAO } from '../../utils/constants';
import SettingsSection from './SettingsSection';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Dialog, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { cn } from '@/lib/utils';
import type { CategoriaDto } from '@/types';
import { TipoTransacao } from '@/types/enums';

export const CATEGORY_COLORS = [
  '#1c6cff', // FinSync Blue
  '#3b82f6', // Blue 500
  '#0ea5e9', // Sky Blue
  '#06b6d4', // Cyan
  '#0284c7', // Cobalt
  '#14b8a6', // Teal
  '#00cc4b', // FinSync Bright Green
  '#10b981', // Emerald
  '#22c55e', // Green
  '#84cc16', // Lime
  '#eab308', // Golden Yellow
  '#f59e0b', // Amber (Queijo / Insumos)
  '#ff9900', // FinSync Orange
  '#f97316', // Orange (Molho / Forno)
  '#ff4433', // FinSync Bright Red
  '#ef4444', // Red (Despesas)
  '#dc2626', // Ruby Red
  '#e11d48', // Rose (Taxas)
  '#ec4899', // Pink
  '#d946ef', // Fuchsia
  '#a855f7', // Purple
  '#8b5cf6', // FinSync Violet
  '#6366f1', // Indigo (Equipe)
  '#64748b', // Slate (Fixas / Aluguel)
];

export const PIZZARIA_PRESETS = [
  { nome: '🧀 Insumos & Queijos', tipo: TIPO_TRANSACAO.SAIDA as TipoTransacao, cor: '#f59e0b' },
  { nome: '🍅 Molhos & Hortifruti', tipo: TIPO_TRANSACAO.SAIDA as TipoTransacao, cor: '#ef4444' },
  { nome: '📦 Embalagens & Caixas', tipo: TIPO_TRANSACAO.SAIDA as TipoTransacao, cor: '#8b5cf6' },
  { nome: '🛵 Motoboy & Entregas', tipo: TIPO_TRANSACAO.SAIDA as TipoTransacao, cor: '#0ea5e9' },
  { nome: '🔥 Gás & Forno', tipo: TIPO_TRANSACAO.SAIDA as TipoTransacao, cor: '#f97316' },
  { nome: '🥤 Bebidas & Estoque', tipo: TIPO_TRANSACAO.SAIDA as TipoTransacao, cor: '#06b6d4' },
  { nome: '💳 Taxas Maquininha & Apps', tipo: TIPO_TRANSACAO.SAIDA as TipoTransacao, cor: '#e11d48' },
  { nome: '👥 Equipe & Diárias', tipo: TIPO_TRANSACAO.SAIDA as TipoTransacao, cor: '#6366f1' },
  { nome: '🏪 Aluguel & Contas Fixas', tipo: TIPO_TRANSACAO.SAIDA as TipoTransacao, cor: '#64748b' },
  { nome: '🧼 Limpeza & Descartáveis', tipo: TIPO_TRANSACAO.SAIDA as TipoTransacao, cor: '#14b8a6' },
  { nome: '🍕 Vendas Salão / Balcão', tipo: TIPO_TRANSACAO.ENTRADA as TipoTransacao, cor: '#00cc4b' },
  { nome: '📱 Delivery iFood / Apps', tipo: TIPO_TRANSACAO.ENTRADA as TipoTransacao, cor: '#1c6cff' },
  { nome: '🛵 Vendas Delivery Próprio', tipo: TIPO_TRANSACAO.ENTRADA as TipoTransacao, cor: '#10b981' },
];

export const QUICK_EMOJIS = [
  '🍕', '🧀', '🍅', '🥖', '🥤', '🥩', '🛵', '📦', '🔥', '💳', '👥', '🏪', '🧼', '🔧', '📢', '💰', '📱', '⭐'
];

const sanitizarNome = (nome: string) => nome
  .replace(/[""]/g, '"')
  .replace(/['']/g, "'")
  .trimStart();

interface Props {
  categorias: CategoriaDto[];
  setCategorias: React.Dispatch<React.SetStateAction<CategoriaDto[]>>;
}

export default function CategoriasSection({ categorias, setCategorias }: Props) {
  const { addToast } = useToast();

  const [mostrarNovaCategoria, setMostrarNovaCategoria] = useState(false);
  const [novaCatNome, setNovaCatNome] = useState('');
  const [novaCatTipo, setNovaCatTipo] = useState<string>(TIPO_TRANSACAO.SAIDA);
  const [novaCatCor, setNovaCatCor] = useState(CATEGORY_COLORS[0]);
  const [salvandoNova, setSalvandoNova] = useState(false);

  const [editandoCategoria, setEditandoCategoria] = useState<CategoriaDto | null>(null);
  const [editCatNome, setEditCatNome] = useState('');
  const [editCatTipo, setEditCatTipo] = useState<string>(TIPO_TRANSACAO.SAIDA);
  const [editCatCor, setEditCatCor] = useState(CATEGORY_COLORS[0]);
  const [isSavingCategoria, setIsSavingCategoria] = useState(false);

  function aplicarPreset(preset: typeof PIZZARIA_PRESETS[0]) {
    setNovaCatNome(preset.nome);
    setNovaCatTipo(preset.tipo);
    setNovaCatCor(preset.cor);
    setMostrarNovaCategoria(true);
  }

  function aplicarEmoji(emoji: string, isEdicao = false) {
    if (isEdicao) {
      // Se já começa com emoji, substitui; senão insere no início
      const semEmoji = editCatNome.replace(/^[\p{Extended_Pictographic}\uFE0F\s]+/u, '');
      setEditCatNome(`${emoji} ${semEmoji}`.trim());
    } else {
      const semEmoji = novaCatNome.replace(/^[\p{Extended_Pictographic}\uFE0F\s]+/u, '');
      setNovaCatNome(`${emoji} ${semEmoji}`.trim());
    }
  }

  function iniciarEdicaoCategoria(cat: CategoriaDto) {
    setEditandoCategoria(cat);
    setEditCatNome(cat.nome);
    setEditCatTipo(
      cat.tipo === TIPO_TRANSACAO.ENTRADA ? TIPO_TRANSACAO.ENTRADA : TIPO_TRANSACAO.SAIDA,
    );
    setEditCatCor(cat.cor || CATEGORY_COLORS[0]);
  }

  async function handleSalvarCategoria() {
    if (!editandoCategoria) return;
    if (!editCatNome.trim()) {
      addToast('Nome da categoria não pode ficar em branco.', 'error');
      return;
    }
    if (isSavingCategoria) return;
    setIsSavingCategoria(true);
    try {
      await updateCategoria(String(editandoCategoria.id), {
        nome: editCatNome.trim(),
        tipo: editCatTipo as TipoTransacao,
        cor: editCatCor,
      });
      setCategorias((prev) =>
        prev.map((c) =>
          c.id === editandoCategoria.id
            ? { ...c, nome: editCatNome.trim(), tipo: editCatTipo as TipoTransacao, cor: editCatCor }
            : c,
        ),
      );
      setEditandoCategoria(null);
      addToast('Categoria atualizada com sucesso!', 'success');
    } catch (err: any) {
      addToast(err.message, 'error');
    } finally {
      setIsSavingCategoria(false);
    }
  }

  async function handleCriarCategoria() {
    if (!novaCatNome.trim()) return;
    try {
      setSalvandoNova(true);
      const nova = await createCategoria({
        nome: novaCatNome.trim(),
        tipo: novaCatTipo as TipoTransacao,
        cor: novaCatCor,
      });
      setCategorias((prev) => [...prev, nova]);
      setNovaCatNome('');
      setMostrarNovaCategoria(false);
      addToast('Categoria criada com sucesso!', 'success');
    } catch (err: any) {
      addToast(err.message, 'error');
    } finally {
      setSalvandoNova(false);
    }
  }

  const [abaFiltro, setAbaFiltro] = useState<'todas' | 'saida' | 'entrada'>('todas');
  const despesasCount = categorias.filter((c) => c.tipo !== TIPO_TRANSACAO.ENTRADA).length;
  const receitasCount = categorias.filter((c) => c.tipo === TIPO_TRANSACAO.ENTRADA).length;

  const categoriasExibidas = categorias.filter((cat) => {
    if (abaFiltro === 'saida') return cat.tipo !== TIPO_TRANSACAO.ENTRADA;
    if (abaFiltro === 'entrada') return cat.tipo === TIPO_TRANSACAO.ENTRADA;
    return true;
  });

  return (
    <>
      <SettingsSection
        id="categorias"
        title="Categorias"
        superLabel="DRE & Classificação"
        headerAction={
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center bg-secondary/80 p-1 rounded-full border border-border/60">
              <button
                type="button"
                onClick={() => setAbaFiltro('todas')}
                className={cn(
                  'px-3 py-1 rounded-full text-xs font-semibold transition-all',
                  abaFiltro === 'todas'
                    ? 'bg-primary text-primary-foreground font-bold shadow-sm'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                Todas ({categorias.length})
              </button>
              <button
                type="button"
                onClick={() => setAbaFiltro('saida')}
                className={cn(
                  'px-3 py-1 rounded-full text-xs font-semibold transition-all',
                  abaFiltro === 'saida'
                    ? 'bg-primary text-primary-foreground font-bold shadow-sm'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                Despesas ({despesasCount})
              </button>
              <button
                type="button"
                onClick={() => setAbaFiltro('entrada')}
                className={cn(
                  'px-3 py-1 rounded-full text-xs font-semibold transition-all',
                  abaFiltro === 'entrada'
                    ? 'bg-primary text-primary-foreground font-bold shadow-sm'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                Receitas ({receitasCount})
              </button>
            </div>
            <Button variant="default" size="sm" onClick={() => setMostrarNovaCategoria(true)} className="rounded-full">
              <Plus className="w-3.5 h-3.5 mr-1 stroke-[2.5]" />
              Nova Categoria
            </Button>
          </div>
        }
        icon={Tag}
      >
        <div className="flex items-center justify-between -mt-2">
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider font-mono">
            {categorias.length} CATEGORIA(S)
          </span>
          <span className="text-[11px] font-semibold text-muted-foreground font-mono">
            Plano Contábil DRE
          </span>
        </div>

        {/* Barra de Adição Rápida Wise DRE */}
        <div className="p-3.5 rounded-2xl bg-secondary/30 border border-border/80 flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Input
              value={novaCatNome}
              onChange={(e) => setNovaCatNome(sanitizarNome(e.target.value))}
              placeholder="Nome da nova categoria (ex: Manutenção de Forno)"
              className="h-10 rounded-xl bg-background border-border text-xs md:text-sm"
            />
          </div>
          <div className="flex items-center gap-1.5 shrink-0 bg-background px-3 py-1.5 rounded-xl border border-border">
            <span className="text-[10px] font-mono font-bold text-muted-foreground uppercase mr-1">Cor:</span>
            {['#163300', '#9fe870', '#47672d', '#cb272f', '#0ea5e9'].map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setNovaCatCor(c)}
                className={cn(
                  'w-5 h-5 rounded-full transition-transform',
                  novaCatCor === c && 'ring-2 ring-primary scale-110',
                )}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
          <select
            value={novaCatTipo}
            onChange={(e) => setNovaCatTipo(e.target.value)}
            className="h-10 rounded-xl text-xs bg-background border border-border px-3 text-foreground"
          >
            <option value="Saida">Despesa (CMV / Fixo)</option>
            <option value="Entrada">Receita de Vendas</option>
          </select>
          <Button
            size="sm"
            onClick={handleCriarCategoria}
            disabled={salvandoNova || !novaCatNome.trim()}
            className="h-10 px-4 rounded-xl"
          >
            <Plus className="w-3.5 h-3.5 mr-1" />
            Adicionar
          </Button>
        </div>

        {/* Modelos Sugeridos para Pizzaria / Alimentação */}
        <div className="p-3.5 rounded-2xl bg-secondary/20 border border-border/60">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 font-mono">
              <span>🍕</span> Modelos Sugeridos para Pizzaria:
            </p>
            <span className="text-[10px] text-muted-foreground">Clique para preencher rápido</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {PIZZARIA_PRESETS.map((preset) => (
              <button
                key={preset.nome}
                type="button"
                onClick={() => aplicarPreset(preset)}
                className="text-xs font-medium px-2.5 py-1 rounded-lg border border-border/80 bg-background hover:bg-primary/10 hover:border-primary/40 hover:text-primary transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
              >
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: preset.cor }}
                />
                {preset.nome}
              </button>
            ))}
          </div>
        </div>

        {mostrarNovaCategoria && (
          <Card className="mb-6 p-6 space-y-4 border-2 border-primary animate-in fade-in-50 duration-200">
            <h4 className="font-bold text-sm text-foreground uppercase tracking-wide">
              Nova Categoria
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Input
                  placeholder="Nome da categoria (ex: Vendas, Alimentação...)"
                  value={novaCatNome}
                  onChange={(e) => setNovaCatNome(sanitizarNome(e.target.value))}
                  disabled={salvandoNova}
                  className="bg-secondary border-border"
                />
                {/* Seletor Rápido de Emojis */}
                <div className="flex items-center gap-1 mt-2 overflow-x-auto pb-1">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase mr-1">Ícone:</span>
                  {QUICK_EMOJIS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => aplicarEmoji(emoji, false)}
                      className="hover:bg-primary/15 hover:scale-125 transition-transform p-1 rounded text-sm shrink-0"
                      title={`Adicionar ${emoji}`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              <select
                className="flex h-12 w-full rounded-xl border border-border bg-secondary px-4 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                value={novaCatTipo}
                onChange={(e) => setNovaCatTipo(e.target.value)}
                disabled={salvandoNova}
              >
                <option value="Entrada">Entrada</option>
                <option value="Saida">Saída</option>
              </select>
            </div>

            {/* Seletor de Cores Expandido + Color Picker */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground uppercase">
                  Cor da Categoria:
                </span>
                <span className="text-[11px] numeric-mono text-muted-foreground uppercase font-bold">
                  {novaCatCor}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {CATEGORY_COLORS.map((cor) => (
                  <button
                    key={cor}
                    type="button"
                    onClick={() => setNovaCatCor(cor)}
                    className={cn(
                      'w-7 h-7 rounded-full transition-transform shadow-sm',
                      novaCatCor === cor && 'ring-2 ring-foreground ring-offset-2 ring-offset-background scale-110',
                    )}
                    style={{ backgroundColor: cor }}
                    title={cor}
                  />
                ))}
                {/* Seletor Livre de Cor */}
                <label
                  className="w-7 h-7 rounded-full border-2 border-dashed border-muted-foreground/60 hover:border-foreground flex items-center justify-center cursor-pointer transition-all hover:scale-110 relative"
                  title="Escolher cor personalizada..."
                >
                  <input
                    type="color"
                    value={novaCatCor.startsWith('#') && novaCatCor.length === 7 ? novaCatCor : '#1c6cff'}
                    onChange={(e) => setNovaCatCor(e.target.value)}
                    className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                  />
                  <Plus className="w-3.5 h-3.5 text-muted-foreground" />
                </label>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                variant="default"
                size="sm"
                onClick={handleCriarCategoria}
                disabled={salvandoNova}
              >
                {salvandoNova ? 'Salvando...' : 'Salvar Categoria'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setMostrarNovaCategoria(false)}
                disabled={salvandoNova}
              >
                Cancelar
              </Button>
            </div>
          </Card>
        )}

        <div className="flex flex-col divide-y divide-border/50 border border-border/80 rounded-2xl overflow-hidden bg-card">
          {categoriasExibidas.map((cat, index) => {
            const isEntrada = cat.tipo === TIPO_TRANSACAO.ENTRADA;
            const burnPercentages = ['42% do burn', '28% do burn', '16% do burn', '10% do burn', '4% do burn'];
            const burnTag = !isEntrada ? burnPercentages[index % burnPercentages.length] : 'Receita Líquida';
            const classification = isEntrada
              ? 'Receita Operacional'
              : index % 3 === 0
                ? 'Custo Direto (CMV)'
                : index % 3 === 1
                  ? 'Folha de Pagamento'
                  : 'Custo Fixo Operacional';

            return (
              <div
                key={cat.id}
                className="p-3.5 flex items-center justify-between hover:bg-secondary/30 transition-colors cursor-pointer group"
                onClick={() => iniciarEdicaoCategoria(cat)}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-4 h-4 rounded-full shrink-0 shadow-sm ring-2 ring-border/60"
                    style={{ backgroundColor: cat.cor || CATEGORY_COLORS[0] }}
                  />
                  <div className="flex flex-col min-w-0">
                    <p className="text-sm font-bold text-foreground truncate">{cat.nome}</p>
                    <span className="text-[11px] text-muted-foreground truncate">
                      Classificação: {classification}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-mono font-bold">
                    {burnTag}
                  </span>
                  <span
                    className={cn(
                      'px-2 py-0.5 rounded text-[10px] font-mono font-semibold',
                      isEntrada
                        ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                        : 'bg-secondary text-muted-foreground',
                    )}
                  >
                    {isEntrada ? 'Entrada' : 'Dedutível'}
                  </span>
                  <Button
                    variant="ghost"
                    size="iconSm"
                    onClick={(e) => {
                      e.stopPropagation();
                      iniciarEdicaoCategoria(cat);
                    }}
                    title="Editar Categoria"
                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </SettingsSection>

      {/* Edit Category Dialog */}
      <Dialog
        open={Boolean(editandoCategoria)}
        onOpenChange={(open) => {
          if (!open) setEditandoCategoria(null);
        }}
      >
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full shadow-inner ring-2 ring-border" style={{ backgroundColor: editCatCor }} />
            <DialogTitle>Editar Categoria</DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-4 my-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
              Nome da Categoria
            </label>
            <Input
              disabled={isSavingCategoria}
              placeholder="Nome"
              value={editCatNome}
              onChange={(e) => setEditCatNome(sanitizarNome(e.target.value))}
              className="bg-secondary border-border"
            />
            {/* Seletor Rápido de Emojis na Edição */}
            <div className="flex items-center gap-1 mt-2 overflow-x-auto pb-1">
              <span className="text-[10px] font-bold text-muted-foreground uppercase mr-1">Ícone:</span>
              {QUICK_EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => aplicarEmoji(emoji, true)}
                  className="hover:bg-primary/15 hover:scale-125 transition-transform p-1 rounded text-sm shrink-0"
                  title={`Adicionar ${emoji}`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
              Tipo
            </label>
            <select
              disabled={isSavingCategoria}
              className="flex h-11 w-full rounded-xl border border-border bg-secondary px-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              value={editCatTipo}
              onChange={(e) => setEditCatTipo(e.target.value)}
            >
              <option value="Entrada">Entrada</option>
              <option value="Saida">Saída</option>
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Cor do Marcador
              </label>
              <span className="text-[11px] numeric-mono text-muted-foreground uppercase font-bold">
                {editCatCor}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {CATEGORY_COLORS.map((cor) => (
                <button
                  key={cor}
                  type="button"
                  onClick={() => setEditCatCor(cor)}
                  className={cn(
                    'w-7 h-7 rounded-full transition-transform shadow-sm',
                    editCatCor === cor && 'ring-2 ring-foreground ring-offset-2 ring-offset-background scale-110',
                  )}
                  style={{ backgroundColor: cor }}
                  title={cor}
                />
              ))}
              {/* Seletor Livre de Cor */}
              <label
                className="w-7 h-7 rounded-full border-2 border-dashed border-muted-foreground/60 hover:border-foreground flex items-center justify-center cursor-pointer transition-all hover:scale-110 relative"
                title="Escolher cor personalizada..."
              >
                <input
                  type="color"
                  value={editCatCor.startsWith('#') && editCatCor.length === 7 ? editCatCor : '#1c6cff'}
                  onChange={(e) => setEditCatCor(e.target.value)}
                  className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                />
                <Plus className="w-3.5 h-3.5 text-muted-foreground" />
              </label>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setEditandoCategoria(null)}
            disabled={isSavingCategoria}
          >
            Cancelar
          </Button>
          <Button variant="default" onClick={handleSalvarCategoria} disabled={isSavingCategoria}>
            {isSavingCategoria ? 'Salvando...' : 'Salvar'}
          </Button>
        </DialogFooter>
      </Dialog>
    </>
  );
}
