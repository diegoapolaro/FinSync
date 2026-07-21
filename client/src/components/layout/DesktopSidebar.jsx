import { useLocation, useNavigate } from 'react-router-dom';

export default function DesktopSidebar({ contas, contaSelecionadaId, onSelectConta }) {
  const location = useLocation();
  const navigate = useNavigate();
  const pagina = location.pathname.replace(/^\/+/, '') || '';

  return (
    <aside className="hidden md:flex fixed left-0 top-0 h-full w-64 flex-col z-40 bg-inverse-surface shadow-md">
      <div className="p-margin-desktop flex flex-col items-center gap-md pt-xl">
        <span className="w-16 h-16 rounded-full bg-primary-container/30 flex items-center justify-center">
          <span className="material-symbols-outlined text-3xl text-surface">finance</span>
        </span>
        <div className="text-center">
          <h1 className="font-headline-xl text-headline-xl text-surface uppercase">Books</h1>
          <p className="text-surface-variant font-label-caps text-label-caps tracking-widest text-sm">Manage Ledger</p>
        </div>
      </div>

      <nav className="flex-1 mt-xl space-y-1 px-4">
        <div className="mb-4 px-2">
          <span className="text-surface-variant font-label-caps text-label-caps tracking-widest text-xs opacity-60">CONTAS</span>
        </div>

        {contas.map((conta) => {
          const selecionada = String(conta.id) === contaSelecionadaId;
          return (
            <button
              key={conta.id}
              type="button"
              onClick={() => {
                onSelectConta(String(conta.id));
                navigate('/');
              }}
              className={
                selecionada
              ? 'w-full flex items-center gap-3 px-4 py-3 font-bold uppercase tracking-widest transition-all ink-stamp-active'
              : 'w-full flex items-center gap-3 px-4 py-3 text-surface-variant hover:bg-surface-container-high hover:text-surface transition-all uppercase tracking-widest'
          }
        >
          <span className="material-symbols-outlined" style={selecionada ? { fontVariationSettings: "'FILL' 1" } : undefined}>
            {conta.tipo === 'Comercial' ? 'storefront' : 'person'}
          </span>
          <span className="font-label-caps text-label-caps text-left">{conta.nome}</span>
        </button>
        );
      })}
    </nav>

      <div className="p-margin-desktop mt-auto space-y-2">
        <div className="pt-4 border-t border-outline-variant/20">
          <button
            type="button"
            onClick={() => navigate('/ajustes')}
            className={
              pagina === 'ajustes'
              ? 'w-full flex items-center gap-3 px-4 py-3 font-bold uppercase tracking-widest transition-all ink-stamp-active'
              : 'w-full flex items-center gap-3 px-4 py-3 text-surface-variant hover:bg-surface-container-high hover:text-surface transition-all uppercase tracking-widest'
            }
          >
            <span className="material-symbols-outlined">settings</span>
            <span className="font-label-caps text-label-caps">Ajustes</span>
          </button>
        </div>
        <button className="w-full py-3 bg-secondary text-on-secondary font-bold rounded-lg hover:scale-[1.02] active:scale-95 transition-all shadow-md flex items-center justify-center gap-2 mt-2">
          <span className="material-symbols-outlined">add</span>
          New Book
        </button>
      </div>
    </aside>
  );
}
