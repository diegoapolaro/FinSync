import { useCallback, useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { getCategorias, getContas } from '../../services/api';
import MobileTopBar from './MobileTopBar';
import DesktopHeader from './DesktopHeader';
import DesktopSidebar from './DesktopSidebar';
import BottomNav from './BottomNav';
import MobileBalanceBar from './MobileBalanceBar';

const resumoInicial = {
  totalEntradas: 0,
  totalSaidas: 0,
  saldo: 0,
  totalEntradasHoje: 0,
  totalSaidasHoje: 0,
  saldoDiario: 0,
  totalEntradasMes: 0,
  totalSaidasMes: 0,
  saldoMensal: 0,
  quantidadeTransacoes: 0,
};

export default function Layout() {
  const location = useLocation();
  const pagina = location.pathname.replace(/^\/+/, '') || '';

  const [contas, setContas] = useState([]);
  const [contaSelecionadaId, setContaSelecionadaId] = useState('');
  const [categorias, setCategorias] = useState([]);
  const [resumo, setResumo] = useState(resumoInicial);
  const [temTransacoes, setTemTransacoes] = useState(false);

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

  const abrirLancamento = useCallback(() => {}, []);

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
          setResumo,
          setTemTransacoes,
        }} />
      </main>

      <BottomNav
        abrirLancamento={abrirLancamento}
        resumo={resumo}
        temTransacoes={temTransacoes}
      />

      {pagina === '' && temTransacoes && <MobileBalanceBar resumo={resumo} />}
    </div>
  );
}
