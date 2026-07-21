import { useLocation, useNavigate } from 'react-router-dom';

const navItems = [
  { id: '', label: 'Extrato', icon: 'receipt_long' },
  { id: 'lancamentos', label: 'Lançamentos', icon: 'add_box' },
  { id: 'relatorios', label: 'Relatórios', icon: 'analytics' },
  { id: 'ajustes', label: 'Ajustes', icon: 'settings' },
];

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const pagina = location.pathname.replace(/^\/+/, '') || '';

  return (
    <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-center items-center gap-md px-4 py-3 bg-surface-container/90 backdrop-blur-md border-t border-outline-variant">
      {navItems.map((item) => {
        const isActive = pagina === item.id;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => navigate(`/${item.id}`)}
            className={
              isActive
                ? 'flex flex-col items-center justify-center bg-primary-container text-on-primary-container rounded-lg px-6 py-2 scale-90'
                : 'flex flex-col items-center justify-center text-on-surface-variant px-6 py-2 hover:text-primary transition-transform active:scale-90 duration-150'
            }
          >
            <span className="material-symbols-outlined" style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}>
              {item.icon}
            </span>
            <span className="font-label-caps text-[10px] mt-1 uppercase">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
