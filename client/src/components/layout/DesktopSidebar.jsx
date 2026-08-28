import { useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, ReceiptText, BarChart3, Settings, Store, User, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import logoSymbol from '@/assets/logo-symbol.png';

const navLinks = [
  { id: '', label: 'Dashboard', Icon: LayoutDashboard },
  { id: 'extrato', label: 'Extrato', Icon: ReceiptText },
  { id: 'lancamentos', label: 'Lançamentos', Icon: Plus },
  { id: 'relatorios', label: 'Relatórios', Icon: BarChart3 },
  { id: 'ajustes', label: 'Ajustes', Icon: Settings },
];

export default function DesktopSidebar({
  contas,
  contaSelecionadaId,
  onSelectConta,
  onNovaContaClick,
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const pagina = location.pathname.replace(/^\/+/, '') || '';

  return (
    <aside className="hidden md:flex fixed left-0 top-0 h-full w-64 flex-col z-40 bg-card text-card-foreground border-r border-border select-none">
      {/* Brand Header */}
      <div className="px-5 pt-7 pb-4 flex flex-col gap-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-card border border-border/80 flex items-center justify-center p-1.5 shadow-sm overflow-hidden shrink-0">
            <img src={logoSymbol} alt="FinSync Logo" className="w-full h-full object-contain" />
          </div>
          <div className="flex flex-col">
            <span className="font-normal text-lg tracking-[-0.03em] text-foreground flex items-center gap-1.5">
              FinSync
            </span>
            <span className="text-[11px] font-medium text-muted-foreground tracking-wider uppercase">
              Institucional
            </span>
          </div>
        </div>

        {/* Contas Switcher */}
        <div className="flex flex-col gap-2 mt-2">
          <div className="flex items-center justify-between px-1">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Contas
            </span>
            <div className="flex items-center gap-1.5">
              {contas.length > 0 && (
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
                  {contas.length}
                </span>
              )}
              {onNovaContaClick && (
                <button
                  type="button"
                  onClick={onNovaContaClick}
                  title="Criar nova conta / livro"
                  className="p-1 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {contas.length === 0 && (
            <div className="px-2 py-2 text-center bg-muted/40 rounded-xl border border-dashed border-border/70">
              <span className="text-xs text-muted-foreground block mb-2">
                Nenhuma conta ativa
              </span>
              {onNovaContaClick && (
                <button
                  type="button"
                  onClick={onNovaContaClick}
                  className="w-full py-1.5 px-2.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Criar Conta</span>
                </button>
              )}
            </div>
          )}

          <div className="flex flex-col gap-1">
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
                    'group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left relative overflow-hidden',
                    selecionada
                      ? 'bg-secondary text-primary font-semibold border border-border shadow-sm'
                      : 'text-muted-foreground hover:bg-secondary/60 hover:text-foreground border border-transparent',
                  )}
                >
                  <div
                    className={cn(
                      'w-7 h-7 rounded-lg flex items-center justify-center transition-colors',
                      selecionada
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground group-hover:bg-secondary group-hover:text-foreground',
                    )}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <span className="truncate flex-1">{conta.nome}</span>
                  {selecionada && <div className="w-1.5 h-1.5 rounded-full bg-primary" />}
                </button>
              );
            })}

            {contas.length > 0 && onNovaContaClick && (
              <button
                type="button"
                onClick={onNovaContaClick}
                className="flex items-center gap-2.5 px-3 py-2 mt-1 rounded-xl text-xs font-medium text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all text-left border border-dashed border-border/70 hover:border-primary/40"
              >
                <div className="w-6 h-6 rounded-md bg-muted/60 flex items-center justify-center text-muted-foreground group-hover:text-primary">
                  <Plus className="w-3.5 h-3.5" />
                </div>
                <span>Adicionar Conta</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="mt-auto px-4 pb-6 flex flex-col gap-1">
        <span className="text-[11px] font-semibold text-muted-foreground px-2 mb-1 uppercase tracking-wider">
          Navegação
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
                'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm transition-all relative font-medium',
                isActive
                  ? 'bg-primary text-primary-foreground font-semibold shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary/70',
              )}
            >
              <Icon className="w-4 h-4" />
              <span>{link.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
