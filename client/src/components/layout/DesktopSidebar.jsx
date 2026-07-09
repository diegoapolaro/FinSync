import { useLocation, useNavigate } from 'react-router-dom';

export default function DesktopSidebar({ contas, contaSelecionadaId, onSelectConta }) {
  const location = useLocation();
  const navigate = useNavigate();
  const pagina = location.pathname.replace(/^\/+/, '') || '';

  return (
    <nav className="hidden md:flex flex-col gap-stack-base p-gutter bg-surface fixed left-0 top-0 h-full w-64 border-r-2 border-primary z-50">
      <div className="mb-8">
        <h1 className="font-headline-md text-headline-md text-primary tracking-tighter uppercase mb-2">
          FINSYNC
        </h1>
        <p className="font-label-caps text-label-caps text-outline">CONTAS</p>
        <p className="font-label-caps text-label-caps text-outline opacity-70">
          SELECIONE O LIVRO
        </p>
      </div>

      {contas.length === 0 && (
        <p className="font-label-caps text-label-caps text-outline">
          Sem contas cadastradas
        </p>
      )}

      <div className="flex flex-col gap-stack-base">
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
                  ? 'flex items-center gap-2 -rotate-3 border-2 border-stamp-accent text-stamp-accent bg-tertiary-fixed-dim/20 p-4 font-bold scale-105 transition-transform duration-200 ease-in-out stamp-bg'
                  : 'flex items-center gap-2 p-4 text-outline border-2 border-transparent opacity-50 hover:bg-secondary-container transition-transform duration-200 ease-in-out'
              }
            >
              <span className="material-symbols-outlined" style={selecionada ? { fontVariationSettings: "'FILL' 1" } : undefined}>
                {conta.tipo === 'Comercial' ? 'storefront' : 'person'}
              </span>
              <span className="font-label-caps text-label-caps text-left">
                {conta.nome}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-auto pt-stack-base border-t border-dashed border-outline-variant">
        <button
          type="button"
          onClick={() => navigate('/ajustes')}
          className={
            pagina === 'ajustes'
              ? 'flex items-center gap-2 w-full p-3 -rotate-3 border-2 border-stamp-accent text-stamp-accent bg-tertiary-fixed-dim/20 font-bold scale-105 transition-transform duration-200 ease-in-out stamp-bg'
              : 'flex items-center gap-2 w-full p-3 text-outline border-2 border-transparent opacity-50 hover:bg-secondary-container transition-transform duration-200 ease-in-out'
          }
        >
          <span className="material-symbols-outlined">settings</span>
          <span className="font-label-caps text-label-caps text-left">Ajustes</span>
        </button>
      </div>
    </nav>
  );
}
