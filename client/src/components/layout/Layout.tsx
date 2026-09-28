import React, { useEffect, useState, useCallback } from 'react';
import { Outlet } from 'react-router-dom';
import { getCategorias, getContas } from '../../services/api';
import MobileTopBar from './MobileTopBar';
import DesktopHeader from './DesktopHeader';
import DesktopSidebar from './DesktopSidebar';
import BottomNav from './BottomNav';
import NovaContaModal from '../common/NovaContaModal';
import KeyboardShortcutsModal from '../common/KeyboardShortcutsModal';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';
import { ContaDto, CategoriaDto } from '@/types';

export interface OutletContextType {
  contas: ContaDto[];
  contaSelecionadaId: string;
  setContaSelecionadaId: React.Dispatch<React.SetStateAction<string>>;
  categorias: CategoriaDto[];
  setContas: React.Dispatch<React.SetStateAction<ContaDto[]>>;
  setCategorias: React.Dispatch<React.SetStateAction<CategoriaDto[]>>;
  abrirModalNovaConta: () => void;
}

export default function Layout() {
  const [contas, setContas] = useState<ContaDto[]>([]);
  const [contaSelecionadaId, setContaSelecionadaId] = useState('');
  const [categorias, setCategorias] = useState<CategoriaDto[]>([]);
  const [modalNovaContaAberto, setModalNovaContaAberto] = useState(false);
  const [modalAtalhosAberto, setModalAtalhosAberto] = useState(false);

  useKeyboardShortcuts({
    onToggleHelp: () => setModalAtalhosAberto((prev) => !prev),
    onCloseModal: () => {
      setModalAtalhosAberto(false);
      setModalNovaContaAberto(false);
    },
    isHelpOpen: modalAtalhosAberto,
  });

  const abrirModalNovaConta = useCallback(() => {
    setModalNovaContaAberto(true);
  }, []);

  const handleContaCriada = useCallback((novaConta: ContaDto) => {
    setContas((prev) => [...prev, novaConta]);
    setContaSelecionadaId(String(novaConta.id));
  }, []);

  useEffect(() => {
    async function init() {
      const contasDaApi = await getContas();
      setContas(contasDaApi);
      if (contasDaApi.length > 0) {
        setContaSelecionadaId(String(contasDaApi[0].id));
      }
      getCategorias()
        .then(setCategorias)
        .catch(() => {});
    }
    init().catch(() => {});
  }, []);

  return (
    <div className="bg-background text-foreground antialiased min-h-screen overflow-hidden font-sans selection:bg-primary/30">
      <MobileTopBar onNovaContaClick={abrirModalNovaConta} />

      <DesktopSidebar
        contas={contas}
        contaSelecionadaId={contaSelecionadaId}
        onSelectConta={setContaSelecionadaId}
        onNovaContaClick={abrirModalNovaConta}
      />

      <div className="md:ml-[260px] flex flex-col h-screen relative z-10">
        <DesktopHeader onOpenAtalhos={() => setModalAtalhosAberto(true)} />

        <main className="flex-1 overflow-y-auto">
          <Outlet
            context={{
              contas,
              contaSelecionadaId,
              setContaSelecionadaId,
              categorias,
              setContas,
              setCategorias,
              abrirModalNovaConta,
            } as OutletContextType}
          />
        </main>
      </div>

      <BottomNav />

      <NovaContaModal
        open={modalNovaContaAberto}
        onOpenChange={setModalNovaContaAberto}
        onContaCriada={handleContaCriada}
      />

      <KeyboardShortcutsModal
        open={modalAtalhosAberto}
        onClose={() => setModalAtalhosAberto(false)}
      />
    </div>
  );
}
