import { useState } from 'react';
import { Tag, Plus, Edit2 } from 'lucide-react';
import { createCategoria, updateCategoria } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';
import { TIPO_TRANSACAO } from '../../utils/constants';
import SettingsSection from './SettingsSection';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../ui/dialog';
import { cn } from '@/lib/utils';

export const CATEGORY_COLORS = [
  '#9fe870',
  '#ffc091',
  '#38c8ff',
  '#ffd11a',
  '#d03238',
  '#a78bfa',
  '#2ead4b',
  '#f472b6',
];

export default function CategoriasSection({ categorias, setCategorias }) {
  const { addToast } = useToast();

  const [mostrarNovaCategoria, setMostrarNovaCategoria] = useState(false);
  const [novaCatNome, setNovaCatNome] = useState('');
  const [novaCatTipo, setNovaCatTipo] = useState(TIPO_TRANSACAO.SAIDA);
  const [novaCatCor, setNovaCatCor] = useState(CATEGORY_COLORS[0]);
  const [salvandoNova, setSalvandoNova] = useState(false);

  const [editandoCategoria, setEditandoCategoria] = useState(null);
  const [editCatNome, setEditCatNome] = useState('');
  const [editCatTipo, setEditCatTipo] = useState(TIPO_TRANSACAO.SAIDA);
  const [editCatCor, setEditCatCor] = useState(CATEGORY_COLORS[0]);
  const [isSavingCategoria, setIsSavingCategoria] = useState(false);

  function iniciarEdicaoCategoria(cat) {
    setEditandoCategoria(cat);
    setEditCatNome(cat.nome);
    setEditCatTipo(cat.tipo === TIPO_TRANSACAO.ENTRADA ? TIPO_TRANSACAO.ENTRADA : TIPO_TRANSACAO.SAIDA);
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
      await updateCategoria(editandoCategoria.id, {
        nome: editCatNome.trim(),
        tipo: editCatTipo,
        cor: editCatCor,
      });
      setCategorias((prev) =>
        prev.map((c) =>
          c.id === editandoCategoria.id
            ? { ...c, nome: editCatNome.trim(), tipo: editCatTipo, cor: editCatCor }
            : c,
        ),
      );
      setEditandoCategoria(null);
      addToast('Categoria atualizada com sucesso!', 'success');
    } catch (err) {
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
        tipo: novaCatTipo,
        cor: novaCatCor,
      });
      setCategorias((prev) => [...prev, nova]);
      setNovaCatNome('');
      setMostrarNovaCategoria(false);
      addToast('Categoria criada com sucesso!', 'success');
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setSalvandoNova(false);
    }
  }

  return (
    <>
      <SettingsSection id="categorias" title="Categorias" icon={Tag}>
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            {categorias.length} CATEGORIA(S)
          </span>
          <Button
            variant="default"
            size="sm"
            onClick={() => setMostrarNovaCategoria(true)}
          >
            <Plus className="w-4 h-4 mr-1 stroke-[2.5]" />
            Nova Categoria
          </Button>
        </div>

        {mostrarNovaCategoria && (
          <Card className="mb-6 p-6 space-y-4 border-2 border-primary">
            <h4 className="font-bold text-sm text-foreground uppercase tracking-wide">
              Nova Categoria
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                placeholder="Nome da categoria (ex: Vendas, Alimentação...)"
                value={novaCatNome}
                onChange={(e) => setNovaCatNome(e.target.value)}
                disabled={salvandoNova}
              />
              <select
                className="flex h-12 w-full rounded-xl border border-input bg-card px-4 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                value={novaCatTipo}
                onChange={(e) => setNovaCatTipo(e.target.value)}
                disabled={salvandoNova}
              >
                <option value="Entrada">Entrada</option>
                <option value="Saida">Saída</option>
              </select>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-muted-foreground uppercase">
                Cor:
              </span>
              <div className="flex flex-wrap gap-2">
                {CATEGORY_COLORS.map((cor) => (
                  <button
                    key={cor}
                    type="button"
                    onClick={() => setNovaCatCor(cor)}
                    className={cn(
                      'w-6 h-6 rounded-full transition-transform',
                      novaCatCor === cor && 'ring-2 ring-foreground ring-offset-2 scale-110'
                    )}
                    style={{ backgroundColor: cor }}
                  />
                ))}
              </div>
            </div>
            <div className="flex gap-2">
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

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {categorias.map((cat) => {
            const isEntrada = cat.tipo === TIPO_TRANSACAO.ENTRADA;
            return (
              <Card
                key={cat.id}
                className="p-4 flex items-center justify-between hover:shadow-md transition-all cursor-pointer group"
                onClick={() => iniciarEdicaoCategoria(cat)}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className="w-3.5 h-3.5 rounded-full shrink-0"
                    style={{ backgroundColor: cat.cor || CATEGORY_COLORS[0] }}
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-foreground truncate">{cat.nome}</p>
                    <span
                      className={cn(
                        'text-[10px] font-semibold uppercase',
                        isEntrada ? 'text-[#2ead4b]' : 'text-[#d03238]'
                      )}
                    >
                      {isEntrada ? 'Entrada' : 'Saída'}
                    </span>
                  </div>
                </div>
                <Edit2 className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </Card>
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
            <div
              className="w-8 h-8 rounded-full"
              style={{ backgroundColor: editCatCor }}
            />
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
              onChange={(e) => setEditCatNome(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
              Tipo
            </label>
            <select
              disabled={isSavingCategoria}
              className="flex h-11 w-full rounded-xl border border-input bg-card px-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              value={editCatTipo}
              onChange={(e) => setEditCatTipo(e.target.value)}
            >
              <option value="Entrada">Entrada</option>
              <option value="Saida">Saída</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
              Cor do Marcador
            </label>
            <div className="flex flex-wrap gap-2">
              {CATEGORY_COLORS.map((cor) => (
                <button
                  key={cor}
                  type="button"
                  onClick={() => setEditCatCor(cor)}
                  className={cn(
                    'w-7 h-7 rounded-full transition-transform',
                    editCatCor === cor && 'ring-2 ring-foreground ring-offset-2 scale-110'
                  )}
                  style={{ backgroundColor: cor }}
                />
              ))}
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
          <Button
            variant="default"
            onClick={handleSalvarCategoria}
            disabled={isSavingCategoria}
          >
            {isSavingCategoria ? 'Salvando...' : 'Salvar'}
          </Button>
        </DialogFooter>
      </Dialog>
    </>
  );
}
