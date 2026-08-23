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
    <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-2 py-2 bg-background/95 backdrop-blur-lg border-t shadow-lg">
      {navItems.map((item) => {
        const isActive = pagina === item.id;
        const { Icon } = item;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => navigate(`/${item.id}`)}
            className={cn(
              'flex flex-col items-center justify-center py-1.5 px-3 rounded-md transition-colors',
              isActive
                ? 'bg-primary text-primary-foreground font-semibold'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <Icon className={cn('w-5 h-5', isActive ? 'stroke-[2.5]' : 'stroke-[1.8]')} />
            <span className="text-[10px] font-semibold mt-0.5 uppercase tracking-wider">
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
