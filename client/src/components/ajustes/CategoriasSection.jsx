import { useEffect, useState } from 'react';
import Modal from '../Modal';
import { createCategoria, updateCategoria } from '../../services/api';

const CORES = [
  '#96d4b2', '#ffb3b3', '#b3d9ff', '#b3ffb3',
  '#ffd9b3', '#d9b3ff', '#ffb3d9', '#b3fff0',
];

function SeletorCor({ cor, onChange }) {
  return (
    <div className="flex gap-2 flex-wrap">
      {CORES.map((c) => (
        <button
          key={c}
          type="button"
          onClick={() => onChange(c)}
          className={`w-8 h-8 rounded-full border-2 ${cor === c ? 'border-primary scale-110' : 'border-transparent'} transition-transform`}
          style={{ backgroundColor: c }}
        />
      ))}
    </div>
  );
}

function EditarCategoriaModal({ categoria, onClose, onCategoriasChange }) {
  const [nome, setNome] = useState('');
  const [cor, setCor] = useState('#96d4b2');

  useEffect(() => {
    if (categoria) {
      setNome(categoria.nome);
      setCor(categoria.cor);
    }
  }, [categoria]);

  if (!categoria) return null;

  async function salvar(e) {
    e.preventDefault();
    await updateCategoria(categoria.id, { id: categoria.id, nome, cor, tipo: categoria.tipo });
    const res = await fetch('/api/categorias');
    onCategoriasChange(await res.json());
    onClose();
  }

  return (
    <Modal aberto={!!categoria} onClose={onClose} titulo="Editar Categoria">
      <form onSubmit={salvar} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1 font-label-caps text-label-caps text-outline">
          Nome
          <input
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            required
            className="bg-surface-container-lowest border border-outline-variant text-on-surface font-body-lg text-body-lg p-3 focus:border-primary focus:outline-2 focus:outline-primary/10"
          />
        </label>
        <div className="flex flex-col gap-2">
          <span className="font-label-caps text-label-caps text-outline">Cor</span>
          <SeletorCor cor={cor} onChange={setCor} />
        </div>
        <button
          type="submit"
          className="w-full border-2 border-primary bg-primary text-on-primary py-3 uppercase font-label-caps text-label-caps font-bold hover:bg-ink transition-colors"
        >
          Salvar
        </button>
      </form>
    </Modal>
  );
}

function NovaCategoriaModal({ aberto, onClose, onCategoriasChange }) {
  const [nome, setNome] = useState('');
  const [tipo, setTipo] = useState('Entrada');
  const [cor, setCor] = useState('#96d4b2');

  async function salvar(e) {
    e.preventDefault();
    await createCategoria({ nome, cor, tipo });
    const res = await fetch('/api/categorias');
    onCategoriasChange(await res.json());
    setNome('');
    setTipo('Entrada');
    setCor('#96d4b2');
    onClose();
  }

  return (
    <Modal aberto={aberto} onClose={onClose} titulo="Nova Categoria">
      <form onSubmit={salvar} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1 font-label-caps text-label-caps text-outline">
          Nome
          <input
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            required
            className="bg-surface-container-lowest border border-outline-variant text-on-surface font-body-lg text-body-lg p-3 focus:border-primary focus:outline-2 focus:outline-primary/10"
          />
        </label>
        <label className="flex flex-col gap-1 font-label-caps text-label-caps text-outline">
          Tipo
          <select
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
            className="bg-surface-container-lowest border border-outline-variant text-on-surface font-body-lg text-body-lg p-3 focus:border-primary focus:outline-2 focus:outline-primary/10"
          >
            <option value="Entrada">Entrada</option>
            <option value="Saida">Saída</option>
          </select>
        </label>
        <div className="flex flex-col gap-2">
          <span className="font-label-caps text-label-caps text-outline">Cor</span>
          <SeletorCor cor={cor} onChange={setCor} />
        </div>
        <button
          type="submit"
          className="w-full border-2 border-primary bg-primary text-on-primary py-3 uppercase font-label-caps text-label-caps font-bold hover:bg-ink transition-colors"
        >
          Criar Categoria
        </button>
      </form>
    </Modal>
  );
}

export default function CategoriasSection({ categorias, onCategoriasChange, editando, setEditando, criando, setCriando }) {
  return (
    <section className="mb-stack-loose">
      <h3 className="font-headline-md text-[18px] uppercase tracking-wide mb-stack-base text-surface-tint">
        CATEGORIAS
      </h3>
      <div className="pb-stack-base border-b border-dashed border-outline-variant">
        <div className="flex flex-col gap-2">
          {categorias.map((cat) => (
            <div
              key={cat.id}
              className="flex justify-between items-center p-2 hover:bg-surface-container-low transition-colors group cursor-pointer -mx-2 rounded"
              onClick={() => setEditando(cat)}
            >
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full border" style={{ backgroundColor: cat.cor, borderColor: cat.cor }} />
                <span className="font-value-sm text-value-sm">{cat.nome}</span>
              </div>
              <span className="font-label-caps text-label-caps text-outline">EDITAR</span>
            </div>
          ))}
          <button
            type="button"
            onClick={() => setCriando(true)}
            className="mt-2 text-left font-label-caps text-label-caps text-primary border-2 border-primary p-2 uppercase hover:bg-primary hover:text-on-primary transition-colors inline-block w-max"
          >
            + NOVA CATEGORIA
          </button>
        </div>

        <EditarCategoriaModal categoria={editando} onClose={() => setEditando(null)} onCategoriasChange={onCategoriasChange} />
        <NovaCategoriaModal aberto={criando} onClose={() => setCriando(false)} onCategoriasChange={onCategoriasChange} />
      </div>
    </section>
  );
}
