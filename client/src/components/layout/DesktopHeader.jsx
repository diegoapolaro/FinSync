import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export default function DesktopHeader() {
  const navigate = useNavigate();
  const location = useLocation();
  const [pesquisa, setPesquisa] = useState('');

  const hoje = new Date();
  const mesAno = hoje.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }).toUpperCase();

  function handleSearchKeyDown(e) {
    if (e.key === 'Enter' && pesquisa.trim()) {
      navigate('/?search=' + encodeURIComponent(pesquisa.trim()));
    }
  }

  return (
    <header className="hidden md:flex justify-between items-center px-margin-desktop py-4 w-full border-b border-outline-variant bg-surface">
      <div className="flex items-center gap-md">
        {location.pathname === '/' && (
          <>
            <h1 className="font-headline-lg text-headline-lg text-primary uppercase">Extrato Mensal</h1>
            <div className="px-3 py-1 bg-surface-container-high rounded text-on-surface-variant font-data-md text-data-md">
              {mesAno}
            </div>
          </>
        )}
      </div>
      <div className="flex items-center gap-md">
        <div className="relative group">
          <input
            className="input-base bg-surface-container-low border-none rounded-lg font-body-sm text-body-sm px-md py-2 w-64 focus:ring-2 focus:ring-primary/20"
            placeholder="Pesquisar transação..."
            type="text"
            value={pesquisa}
            onChange={(e) => setPesquisa(e.target.value)}
            onKeyDown={handleSearchKeyDown}
          />
          <span className="material-symbols-outlined absolute right-3 top-2 text-on-surface-variant">search</span>
        </div>
        <button
          onClick={() => navigate('/ajustes')}
            className="btn-base p-2 hover:bg-surface-container-high rounded-full"
          title="Exportar CSV"
        >
          <span className="material-symbols-outlined text-on-surface-variant">ios_share</span>
        </button>
        <button
          onClick={() => navigate('/ajustes')}
            className="btn-base p-2 hover:bg-surface-container-high rounded-full"
          title="Configurações"
        >
          <span className="material-symbols-outlined text-on-surface-variant">settings</span>
        </button>
        <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-outline-variant bg-primary/10 flex items-center justify-center">
          <span className="material-symbols-outlined text-primary">person</span>
        </div>
      </div>
    </header>
  );
}
