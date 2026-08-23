import { useLocation, useNavigate } from 'react-router-dom';
import { ReceiptText, BarChart3, Settings, Store, User, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

const navLinks = [
  { id: '', label: 'Extrato', Icon: ReceiptText },
  { id: 'lancamentos', label: 'Lançamentos', Icon: Plus },
  { id: 'relatorios', label: 'Relatórios', Icon: BarChart3 },
  { id: 'ajustes', label: 'Ajustes', Icon: Settings },
];

export default function DesktopSidebar({ contas, contaSelecionadaId, onSelectConta }) {
  const location = useLocation();
  const navigate = useNavigate();
  const pagina = location.pathname.replace(/^\/+/, '') || '';

  return (
    <aside className="hidden md:flex fixed left-0 top-0 h-full w-64 flex-col z-40 bg-card text-card-foreground border-r select-none">
      {/* Brand Header */}
      <div className="px-4 pt-6 pb-5 flex flex-col gap-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-md bg-primary flex items-center justify-center font-bold text-primary-foreground text-sm">
            FS
          </div>
          <span className="font-semibold text-lg tracking-tight text-foreground">
            FinSync
          </span>
        </div>

        {/* Contas Switcher (ex-app-shell-row from DESIGN.md) */}
        <div className="flex flex-col gap-1.5 mt-2">
          <span className="px-2 text-xs font-medium text-muted-foreground">
            Contas Ativas
          </span>
          {contas.length === 0 && (
              <span className="text-xs text-muted-foreground py-2 px-2">
              Nenhuma conta cadastrada
            </span>
          )}
          {contas.map((conta) => {
            const selecionada = String(conta.id) === contaSelecionadaId;
            const Icon = conta.tipo === 'Comercial' ? Store : User;
            return (
              <button
                key={conta.id}
                type="button"
                onClick={() => {
                  onSelectConta(String(conta.id));
                  navigate('/');
                }}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors text-left',
                  selecionada
                    ? 'bg-primary/15 text-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <Icon className={cn('w-4 h-4', selecionada ? 'text-primary' : 'text-muted-foreground')} />
                <span className="truncate">{conta.nome}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="mt-auto px-4 pb-6 flex flex-col gap-1">
        <span className="text-xs font-medium text-muted-foreground px-2 mb-2">
          Menu
        </span>
        {navLinks.map((link) => {
          const isActive = pagina === link.id;
          const { Icon } = link;
          return (
            <button
              key={link.id}
              type="button"
              onClick={() => navigate(`/${link.id}`)}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              )}
            >
              <Icon className="w-5 h-5" />
              <span>{link.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
