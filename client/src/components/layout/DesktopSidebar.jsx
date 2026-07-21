import { useLocation, useNavigate } from 'react-router-dom';

const navLinks = [
  { id: '', label: 'Extrato', icon: 'receipt_long' },
  { id: 'relatorios', label: 'Relatórios', icon: 'analytics' },
  { id: 'ajustes', label: 'Ajustes', icon: 'settings' },
];

export default function DesktopSidebar({ contas, contaSelecionadaId, onSelectConta }) {
  const location = useLocation();
  const navigate = useNavigate();
  const pagina = location.pathname.replace(/^\/+/, '') || '';

  return (
    <aside className="hidden md:flex fixed left-0 top-0 h-full w-[280px] flex-col z-40 bg-inverse-surface shadow-md">
      <div className="px-md py-lg flex flex-col gap-lg">
        <div className="font-headline-xl text-headline-xl text-surface tracking-tighter uppercase italic leading-none">
          FinSync
        </div>

        <div className="flex flex-col gap-xs mt-md">
          <span className="font-label-caps text-label-caps text-surface-variant/60 uppercase mb-xs">Contas Ativas</span>
          {contas.length === 0 && (
            <span className="text-surface-variant/40 font-body-sm text-body-sm">Nenhuma conta cadastrada</span>
          )}
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
                    ? 'ink-stamp-active flex items-center gap-xs p-4 w-full transition-all duration-200'
                    : 'flex items-center gap-xs p-4 w-full text-surface-variant hover:bg-surface-container-highest transition-all group duration-200'
                }
              >
                <span className="material-symbols-outlined" style={selecionada ? {} : undefined}>
                  {conta.tipo === 'Comercial' ? 'storefront' : 'person'}
                </span>
                <span className="font-label-caps text-label-caps uppercase tracking-widest">
                  {conta.nome}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <nav className="mt-auto px-md pb-lg flex flex-col gap-base">
        <div className="font-label-caps text-label-caps text-surface-variant/40 uppercase mb-base px-xs">Menu</div>
        {navLinks.map((link) => {
          const isActive = pagina === link.id;
          return (
            <button
              key={link.id}
              type="button"
              onClick={() => navigate(`/${link.id}`)}
              className={
                'flex items-center gap-xs p-3 rounded-lg transition-colors ' +
                (isActive
                  ? 'bg-surface-container-highest/10 text-surface font-bold'
                  : 'text-surface-variant hover:bg-surface-container-highest')
              }
            >
              <span className="material-symbols-outlined">{link.icon}</span>
              <span className="font-body-sm text-body-sm">{link.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
