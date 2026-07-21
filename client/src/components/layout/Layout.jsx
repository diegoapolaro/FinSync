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
    <div className="bg-surface text-on-surface antialiased min-h-screen">
      <MobileTopBar />

      <DesktopSidebar
        contas={contas}
        contaSelecionadaId={contaSelecionadaId}
        onSelectConta={setContaSelecionadaId}
      />

      <DesktopHeader />

      <main className="md:ml-64 pb-32 md:pb-12 min-h-screen">
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
