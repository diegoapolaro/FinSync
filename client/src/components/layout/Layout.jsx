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
    <div className="bg-surface text-on-surface antialiased min-h-screen overflow-hidden">
      <MobileTopBar />

      <DesktopSidebar
        contas={contas}
        contaSelecionadaId={contaSelecionadaId}
        onSelectConta={setContaSelecionadaId}
      />

      <div className="md:ml-[280px] flex flex-col h-screen">
        <DesktopHeader />

        <main className="flex-1 overflow-y-auto page-transition-wrapper">
          <Outlet context={{
            contas,
            contaSelecionadaId,
            setContaSelecionadaId,
            categorias,
            setContas,
            setCategorias,
          }} />
        </main>
      </div>

      <BottomNav />
    </div>
  );
}
