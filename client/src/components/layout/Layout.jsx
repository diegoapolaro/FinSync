import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { getCategorias, getContas } from '../../services/api';
import MobileTopBar from './MobileTopBar';
import DesktopHeader from './DesktopHeader';
import DesktopSidebar from './DesktopSidebar';
import BottomNav from './BottomNav';

export default function Layout() {
  const [contas, setContas] = useState([]);
  const [contaSelecionadaId, setContaSelecionadaId] = useState('');
  const [categorias, setCategorias] = useState([]);

  useEffect(() => {
    async function init() {
      const contasDaApi = await getContas();
      setContas(contasDaApi);
      if (contasDaApi.length > 0) {
        setContaSelecionadaId(String(contasDaApi[0].id));
      }
      getCategorias().then(setCategorias).catch(() => {});
    }
    init().catch(() => {});
  }, []);

  return (
    <div className="bg-surface-container-high text-on-surface antialiased min-h-screen flex flex-col items-center">
      <MobileTopBar />

      <DesktopSidebar
        contas={contas}
        contaSelecionadaId={contaSelecionadaId}
        onSelectConta={setContaSelecionadaId}
      />

      <main className="w-full max-w-receipt-width bg-paper min-h-screen md:min-h-[819px] shadow-lg md:my-8 flex flex-col relative pb-24 md:pb-8 md:ml-64">
        <div className="w-full h-4 receipt-edge-top bg-surface-container-high absolute top-0 left-0 -translate-y-full hidden md:block" />

        <DesktopHeader />

        <Outlet context={{
          contas,
          contaSelecionadaId,
          setContaSelecionadaId,
          categorias,
          setContas,
          setCategorias,
        }} />
      </main>

      <BottomNav />
    </div>
  );
}
