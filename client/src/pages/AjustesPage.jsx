import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import PerfilSection from '../components/ajustes/PerfilSection';
import ContasSection from '../components/ajustes/ContasSection';
import CategoriasSection from '../components/ajustes/CategoriasSection';
import PreferenciasSettings from '../components/ajustes/PreferenciasSettings';
import NotificacoesSettings from '../components/ajustes/NotificacoesSettings';
import ExportarDados from '../components/ajustes/ExportarDados';
import Seguranca from '../components/ajustes/Seguranca';
import Sobre from '../components/ajustes/Sobre';
import usePreferencias from '../hooks/usePreferencias';

function Secao({ titulo, children }) {
  return (
    <section className="mb-stack-loose">
      <h3 className="font-headline-md text-[18px] uppercase tracking-wide mb-stack-base text-surface-tint">
        {titulo}
      </h3>
      <div className="pb-stack-base border-b border-dashed border-outline-variant">
        {children}
      </div>
    </section>
  );
}

export default function AjustesPage() {
  const { contas, setContas, categorias, setCategorias } = useOutletContext();
  const { prefs, atualizar } = usePreferencias();

  const [perfilAberto, setPerfilAberto] = useState(false);
  const [contaEditando, setContaEditando] = useState(null);
  const [contaCriando, setContaCriando] = useState(false);
  const [catEditando, setCatEditando] = useState(null);
  const [catCriando, setCatCriando] = useState(false);
  const [senhaAberto, setSenhaAberto] = useState(false);

  return (
    <div className="torn-edge-top torn-edge-bottom px-gutter pt-margin-page pb-[100px] md:pb-gutter">
      <div className="md:hidden flex justify-between items-center mb-stack-loose pb-stack-base border-b border-dashed border-outline-variant">
        <h1 className="font-headline-md text-headline-md text-primary tracking-tighter uppercase">FINSYNC</h1>
        <span className="material-symbols-outlined text-[28px] text-on-surface">close</span>
      </div>

      <h2 className="font-headline-md text-headline-md uppercase mb-stack-loose text-center">AJUSTES</h2>

      <PerfilSection prefs={prefs} atualizar={atualizar} aberto={perfilAberto} setAberto={setPerfilAberto} />

      <ContasSection
        contas={contas}
        onContasChange={setContas}
        editando={contaEditando}
        setEditando={setContaEditando}
        criando={contaCriando}
        setCriando={setContaCriando}
      />

      <CategoriasSection
        categorias={categorias}
        onCategoriasChange={setCategorias}
        editando={catEditando}
        setEditando={setCatEditando}
        criando={catCriando}
        setCriando={setCatCriando}
      />

      <PreferenciasSettings prefs={prefs} atualizar={atualizar} />
      <NotificacoesSettings prefs={prefs} atualizar={atualizar} />
      <ExportarDados />
      <Seguranca aberto={senhaAberto} setAberto={setSenhaAberto} />
      <Sobre />
    </div>
  );
}

export { Secao };
