import { useEffect, useState, useCallback } from 'react';
import { Outlet } from 'react-router-dom';
import { getCategorias, getContas } from '../../services/api';
import MobileTopBar from './MobileTopBar';
import DesktopHeader from './DesktopHeader';
import DesktopSidebar from './DesktopSidebar';
import BottomNav from './BottomNav';
import NovaContaModal from '../common/NovaContaModal';

export default function Layout() {
  const [contas, setContas] = useState([]);
  const [contaSelecionadaId, setContaSelecionadaId] = useState('');
  const [categorias, setCategorias] = useState([]);
  const [modalNovaContaAberto, setModalNovaContaAberto] = useState(false);

  const abrirModalNovaConta = useCallback(() => {
    setModalNovaContaAberto(true);
  }, []);

  const handleContaCriada = useCallback((novaConta) => {
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
    <div className="bg-background text-foreground antialiased min-h-screen overflow-hidden font-sans">
      <MobileTopBar onNovaContaClick={abrirModalNovaConta} />

      <DesktopSidebar
        contas={contas}
        contaSelecionadaId={contaSelecionadaId}
        onSelectConta={setContaSelecionadaId}
        onNovaContaClick={abrirModalNovaConta}
      />

      <div className="md:ml-64 flex flex-col h-screen">
        <DesktopHeader />

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
            }}
          />
        </main>
      </div>

      <BottomNav />

      <NovaContaModal
        open={modalNovaContaAberto}
        onOpenChange={setModalNovaContaAberto}
        onContaCriada={handleContaCriada}
      />
    </div>
  );
}
