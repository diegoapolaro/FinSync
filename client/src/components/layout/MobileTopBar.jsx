import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Moon, Sun } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import logoSymbol from '@/assets/logo-symbol.png';

export default function MobileTopBar() {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
  }, [user?.fotoUrl]);

  return (
    <header className="md:hidden flex justify-between items-center px-4 py-3 w-full bg-background/85 backdrop-blur-md border-b border-border/80 sticky top-0 z-30 transition-colors">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-xl bg-card border border-border/80 flex items-center justify-center p-1 shadow-sm overflow-hidden shrink-0">
          <img src={logoSymbol} alt="FinSync Logo" className="w-full h-full object-contain" />
        </div>
        <h1 className="font-normal text-base tracking-[-0.03em] text-foreground">FinSync</h1>
      </div>
      <div className="flex items-center gap-1.5">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          title="Alternar tema"
        >
          {isDark ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-indigo-400" />
          )}
        </button>
        <button
          type="button"
          onClick={() => navigate('/ajustes#perfil')}
          title="Ver perfil"
          className="flex items-center gap-1.5 p-1 rounded-xl hover:bg-secondary transition-colors max-w-[120px] text-left"
        >
          {user?.fotoUrl && !imgError ? (
            <img
              src={user.fotoUrl}
              alt={user?.nome || 'Foto de perfil'}
              onError={() => setImgError(true)}
              className="w-6 h-6 rounded-full object-cover border border-border/80 shrink-0"
            />
          ) : (
            <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center font-bold text-primary-foreground text-[10px] shrink-0">
              {user?.nome ? user.nome.charAt(0).toUpperCase() : 'U'}
            </div>
          )}
          <span className="text-xs font-semibold text-foreground truncate">
            {user?.nome}
          </span>
        </button>
        <button
          onClick={logout}
          className="p-2 rounded-full hover:bg-destructive/15 text-muted-foreground hover:text-destructive transition-colors"
          title="Sair"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
