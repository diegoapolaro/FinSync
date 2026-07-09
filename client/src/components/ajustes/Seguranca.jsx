import { useState } from 'react';
import Modal from '../Modal';

function AlterarSenhaModal({ aberto, onClose }) {
  const [atual, setAtual] = useState('');
  const [nova, setNova] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [erro, setErro] = useState('');

  const coincidem = nova.length > 0 && nova === confirmar;

  function salvar(e) {
    e.preventDefault();
    if (nova !== confirmar) {
      setErro('As senhas não coincidem.');
      return;
    }
    if (nova.length < 6) {
      setErro('A senha deve ter no mínimo 6 caracteres.');
      return;
    }
    setAtual('');
    setNova('');
    setConfirmar('');
    setErro('');
    onClose();
    alert('Senha alterada com sucesso!');
  }

  return (
    <Modal aberto={aberto} onClose={onClose} titulo="Alterar Senha">
      <form onSubmit={salvar} className="flex flex-col gap-4">
        {erro && <p className="font-body-sm text-body-sm text-error bg-error-container p-2">{erro}</p>}
        <label className="flex flex-col gap-1 font-label-caps text-label-caps text-outline">
          Senha Atual
          <input
            type="password"
            value={atual}
            onChange={(e) => setAtual(e.target.value)}
            required
            className="bg-surface-container-lowest border border-outline-variant text-on-surface font-body-lg text-body-lg p-3 focus:border-primary focus:outline-2 focus:outline-primary/10"
          />
        </label>
        <label className="flex flex-col gap-1 font-label-caps text-label-caps text-outline">
          Nova Senha
          <input
            type="password"
            value={nova}
            onChange={(e) => setNova(e.target.value)}
            required
            minLength={6}
            className="bg-surface-container-lowest border border-outline-variant text-on-surface font-body-lg text-body-lg p-3 focus:border-primary focus:outline-2 focus:outline-primary/10"
          />
        </label>
        <label className="flex flex-col gap-1 font-label-caps text-label-caps text-outline">
          Confirmar Nova Senha
          <input
            type="password"
            value={confirmar}
            onChange={(e) => setConfirmar(e.target.value)}
            required
            className={`bg-surface-container-lowest border ${confirmar && !coincidem ? 'border-error' : 'border-outline-variant'} text-on-surface font-body-lg text-body-lg p-3 focus:border-primary focus:outline-2 focus:outline-primary/10`}
          />
          {confirmar && !coincidem && (
            <span className="font-label-caps text-label-caps text-error mt-1">Senhas não coincidem</span>
          )}
        </label>
        <button
          type="submit"
          disabled={!coincidem || nova.length < 6}
          className="w-full border-2 border-primary bg-primary text-on-primary py-3 uppercase font-label-caps text-label-caps font-bold hover:bg-ink transition-colors disabled:opacity-40"
        >
          Alterar Senha
        </button>
      </form>
    </Modal>
  );
}

export default function Seguranca({ aberto, setAberto }) {
  return (
    <>
      <section className="mb-stack-loose">
        <h3 className="font-headline-md text-[18px] uppercase tracking-wide mb-stack-base text-surface-tint">
          SEGURANÇA
        </h3>
        <div className="pb-stack-base border-b border-dashed border-outline-variant">
          <button
            type="button"
            onClick={() => setAberto(true)}
            className="text-left font-body-sm text-body-sm text-primary hover:underline underline-offset-4 decoration-primary decoration-dashed w-max"
          >
            Alterar Senha
          </button>
        </div>
      </section>
      <div className="text-center mt-8 mb-stack-loose">
        <button
          type="button"
          className="font-label-caps text-label-caps text-error hover:underline underline-offset-4 decoration-error decoration-dashed"
        >
          EXCLUIR CONTA PERMANENTEMENTE
        </button>
      </div>

      <AlterarSenhaModal aberto={aberto} onClose={() => setAberto(false)} />
    </>
  );
}
