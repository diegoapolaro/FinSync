import { useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, ReceiptText, PlusCircle, BarChart3, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import useI18n from '../../hooks/useI18n';
import { motion } from 'framer-motion';

export default function BottomNav() {
  const { t } = useI18n();
  const location = useLocation();
  const navigate = useNavigate();
  const pagina = location.pathname.replace(/^\/+/, '') || '';

  const navItems = [
    { id: '', label: t('nav_dashboard', 'Início'), Icon: LayoutDashboard },
    { id: 'extrato', label: t('nav_extrato', 'Extrato'), Icon: ReceiptText },
    { id: 'lancamentos', label: t('nav_lancamentos', 'Lançar'), Icon: PlusCircle, isPrimary: true },
    { id: 'relatorios', label: t('nav_relatorios', 'Relatórios'), Icon: BarChart3 },
    { id: 'ajustes', label: t('nav_ajustes', 'Ajustes'), Icon: Settings },
  ];

  return (
    <nav className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-2 py-2 bg-background/70 backdrop-blur-2xl border border-white/10 dark:border-white/5 shadow-2xl rounded-3xl flex items-center justify-between gap-1 w-[90%] max-w-sm">
      {navItems.map((item) => {
        const isActive = pagina === item.id;
        const { Icon, isPrimary } = item;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => navigate(`/${item.id}`)}
            className={cn(
              'flex flex-col items-center justify-center p-2 rounded-2xl transition-all relative outline-none',
              isActive
                ? 'text-primary font-semibold'
                : 'text-muted-foreground hover:text-foreground',
              isPrimary && 'bg-primary text-white shadow-lg shadow-primary/25 px-4 rounded-full',
            )}
          >
            {isActive && !isPrimary && (
              <motion.div
                layoutId="bubble"
                className="absolute inset-0 bg-primary/10 rounded-2xl -z-10"
                transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
              />
            )}
            <Icon
              className={cn(
                'transition-transform',
                isPrimary ? 'w-6 h-6 stroke-[2]' : 'w-[22px] h-[22px]',
                isActive && !isPrimary ? 'scale-110 stroke-[2.2]' : 'stroke-[1.8]',
              )}
            />
            {!isPrimary && (
              <span className="text-[10px] mt-1 font-medium hidden sm:block">{item.label}</span>
            )}
          </button>
        );
      })}
    </nav>
  );
}
