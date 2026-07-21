import { useLocation, useNavigate } from 'react-router-dom';

const tabs = [
  { id: '', label: 'Extrato' },
  { id: 'lancamentos', label: 'Lançamentos' },
  { id: 'relatorios', label: 'Relatórios' },
  { id: 'ajustes', label: 'Ajustes' },
];

export default function DesktopHeader() {
  const location = useLocation();
  const navigate = useNavigate();
  const pagina = location.pathname.replace(/^\/+/, '') || '';

  return (
    <header className="hidden md:flex justify-between items-center px-margin-desktop py-4 w-full bg-surface border-b border-outline-variant sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <h2 className="font-headline-lg text-headline-lg font-bold text-primary tracking-tight">FINSYNC</h2>
      </div>
      <div className="flex items-center gap-md">
        <div className="hidden sm:flex items-center bg-surface-container rounded-full px-4 py-2 border border-outline-variant">
          <span className="material-symbols-outlined text-on-surface-variant mr-2">search</span>
          <input className="bg-transparent border-none focus:ring-0 text-body-sm font-body-sm w-48" placeholder="Search entries..." type="text" />
        </div>
        <div className="flex items-center gap-sm">
          <span className="material-symbols-outlined text-on-surface-variant cursor-pointer hover:bg-surface-container-high p-2 rounded-full transition-colors">notifications</span>
          <span className="material-symbols-outlined text-on-surface-variant cursor-pointer hover:bg-surface-container-high p-2 rounded-full transition-colors">account_circle</span>
        </div>
      </div>
    </header>
  );
}
