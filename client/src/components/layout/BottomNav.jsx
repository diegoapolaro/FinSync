import { useLocation, useNavigate } from 'react-router-dom';

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const pagina = location.pathname.replace(/^\/+/, '') || '';

  const navItems = [
    { id: '', label: 'Lançamentos', icon: 'add_box' },
    { id: 'relatorios', label: 'Relatórios', icon: 'analytics' },
    { id: 'ajustes', label: 'Ajustes', icon: 'settings' },
  ];

  return (
    <nav className="fixed bottom-0 w-full flex justify-between items-center py-4 bg-background border-t border-dashed border-outline-variant md:border-t-2 md:border-primary z-50 max-w-receipt-width md:max-w-none left-1/2 md:left-0 -translate-x-1/2 md:translate-x-0 md:pl-64">
      <div className="flex gap-4 md:gap-8 flex-grow justify-around md:justify-start px-4">
        {navItems.map((item) => {
          const isActive = pagina === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => navigate(`/${item.id}`)}
              className={
                isActive
                  ? 'flex flex-col items-center justify-center text-primary font-bold underline decoration-2 active:translate-y-0.5 hover:invert relative'
                  : 'flex flex-col items-center justify-center text-secondary opacity-60 active:translate-y-0.5 hover:opacity-100'
              }
            >
              {isActive && item.id === 'ajustes' && (
                <div className="absolute inset-0 bg-tertiary-fixed-dim/20 -rotate-3 -m-2 -z-10 stamp-bg border-2 border-on-tertiary-container rounded-sm" />
              )}
              <span className="material-symbols-outlined mb-1" style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}>{item.icon}</span>
              <span className="font-label-caps text-label-caps">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
