import { useState } from 'react';
import Modal from '../Modal';

export default function PerfilSection({ prefs, atualizar, aberto, setAberto }) {
  const [nome, setNome] = useState(prefs.nome);
  const [email, setEmail] = useState(prefs.email);

  function abrir() {
    setNome(prefs.nome);
    setEmail(prefs.email);
    setAberto(true);
  }

  function salvar(e) {
    e.preventDefault();
    atualizar('nome', nome);
    atualizar('email', email);
    setAberto(false);
  }

  return (
    <section className="mb-stack-loose">
      <h3 className="font-headline-md text-[18px] uppercase tracking-wide mb-stack-base text-surface-tint">
        PERFIL
      </h3>
      <div className="pb-stack-base border-b border-dashed border-outline-variant">
        <div
          className="flex items-center justify-between pb-stack-base border-b border-dashed border-outline-variant hover:bg-surface-container-low transition-colors cursor-pointer group p-2 -mx-2"
          onClick={abrir}
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full border-2 border-primary bg-surface-variant flex items-center justify-center overflow-hidden grayscale">
              <span className="material-symbols-outlined text-primary text-2xl">person</span>
            </div>
            <div>
              <p className="font-body-lg text-body-lg font-bold text-primary">{prefs.nome}</p>
              <p className="font-value-sm text-value-sm text-on-surface-variant">{prefs.email}</p>
            </div>
          </div>
          <span className="material-symbols-outlined text-outline group-hover:text-primary transition-colors">chevron_right</span>
        </div>

        <Modal aberto={aberto} onClose={() => setAberto(false)} titulo="Editar Perfil">
          <form onSubmit={salvar} className="flex flex-col gap-4">
            <label className="flex flex-col gap-1 font-label-caps text-label-caps text-outline">
              Nome
              <input
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
            className="bg-surface-container-lowest border border-outline-variant text-on-surface font-body-lg text-body-lg p-3 input-base"
          />
        </label>
        <label className="flex flex-col gap-1 font-label-caps text-label-caps text-outline">
          E-mail
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="bg-surface-container-lowest border border-outline-variant text-on-surface font-body-lg text-body-lg p-3 input-base"
              />
            </label>
            <button
              type="submit"
          className="btn-base w-full border-2 border-primary bg-primary text-on-primary py-3 uppercase font-label-caps text-label-caps font-bold hover:bg-ink"
        >
          Salvar
            </button>
          </form>
        </Modal>
      </div>
    </section>
  );
}
