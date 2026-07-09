import { useEffect, useState } from 'react';
import Modal from '../Modal';
import { createConta, updateConta } from '../../services/api';

function EditarContaModal({ conta, onClose, onContasChange }) {
  const [nome, setNome] = useState('');
  const [arquivar, setArquivar] = useState(false);

  useEffect(() => {
    if (conta) {
      setNome(conta.nome);
      setArquivar(false);
    }
  }, [conta]);

  if (!conta) return null;

  async function salvar(e) {
    e.preventDefault();
    await updateConta(conta.id, { id: conta.id, nome, tipo: conta.tipo, arquivada: arquivar });
    const res = await fetch('/api/contas');
    onContasChange(await res.json());
    onClose();
  }

  return (
    <Modal aberto={!!conta} onClose={onClose} titulo="Editar Conta">
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
        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" checked={arquivar} onChange={(e) => setArquivar(e.target.checked)} className="w-4 h-4 accent-primary" />
          <span className="font-body-sm text-body-sm">Arquivar conta (ocultar da lista principal)</span>
        </label>
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

function NovaContaModal({ aberto, onClose, onContasChange }) {
  const [nome, setNome] = useState('');
  const [tipo, setTipo] = useState('Pessoal');

  async function salvar(e) {
    e.preventDefault();
    await createConta({ nome, tipo });
    const res = await fetch('/api/contas');
    onContasChange(await res.json());
    setNome('');
    setTipo('Pessoal');
    onClose();
  }

  return (
    <Modal aberto={aberto} onClose={onClose} titulo="Nova Conta">
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
            <option value="Pessoal">Pessoal</option>
            <option value="Comercial">Comercial</option>
          </select>
        </label>
        <button
          type="submit"
          className="w-full border-2 border-primary bg-primary text-on-primary py-3 uppercase font-label-caps text-label-caps font-bold hover:bg-ink transition-colors"
        >
          Criar Conta
        </button>
      </form>
    </Modal>
  );
}

export default function ContasSection({ contas, onContasChange, editando, setEditando, criando, setCriando }) {
  return (
    <section className="mb-stack-loose">
      <h3 className="font-headline-md text-[18px] uppercase tracking-wide mb-stack-base text-surface-tint">
        CONTAS
      </h3>
      <div className="pb-stack-base border-b border-dashed border-outline-variant">
        <div className="flex flex-col gap-2">
          {contas.map((conta) => (
            <div
              key={conta.id}
              className="flex justify-between items-center p-2 hover:bg-surface-container-low transition-colors group cursor-pointer -mx-2 rounded"
              onClick={() => setEditando(conta)}
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-outline">
                  {conta.tipo === 'Comercial' ? 'storefront' : 'person'}
                </span>
                <span className="font-value-sm text-value-sm">{conta.nome}</span>
              </div>
              <span className="material-symbols-outlined text-outline group-hover:text-primary transition-colors text-sm">edit</span>
            </div>
          ))}

          <button
            type="button"
            onClick={() => setCriando(true)}
            className="mt-2 text-left font-label-caps text-label-caps text-primary border-2 border-primary p-2 uppercase hover:bg-primary hover:text-on-primary transition-colors inline-block w-max"
          >
            + NOVA CONTA
          </button>
        </div>

        <EditarContaModal conta={editando} onClose={() => setEditando(null)} onContasChange={onContasChange} />
        <NovaContaModal aberto={criando} onClose={() => setCriando(false)} onContasChange={onContasChange} />
      </div>
    </section>
  );
}
