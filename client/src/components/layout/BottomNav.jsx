import { useLocation, useNavigate } from 'react-router-dom';
import { ReceiptText, PlusCircle, BarChart3, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { id: '', label: 'Extrato', Icon: ReceiptText },
  { id: 'lancamentos', label: 'Lançar', Icon: PlusCircle },
  { id: 'relatorios', label: 'Relatórios', Icon: BarChart3 },
  { id: 'ajustes', label: 'Ajustes', Icon: Settings },
];

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const pagina = location.pathname.replace(/^\/+/, '') || '';

  return (
    <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 py-2 bg-background/85 backdrop-blur-xl border-t border-border/80 shadow-2xl">
      {navItems.map((item) => {
        const isActive = pagina === item.id;
        const { Icon } = item;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => navigate(`/${item.id}`)}
            className={cn(
              'flex flex-col items-center justify-center py-1 px-3.5 rounded-full transition-all relative',
              isActive
                ? 'text-primary font-semibold'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {isActive && <div className="absolute inset-0 bg-primary/10 rounded-full -z-10" />}
            <Icon
              className={cn(
                'w-5 h-5 transition-transform',
                isActive ? 'scale-110 stroke-[2.2]' : 'stroke-[1.7]',
              )}
            />
            <span className="text-[10px] font-medium mt-1 tracking-tight">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
