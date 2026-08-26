import { LogOut, Moon, Sun } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';

export default function MobileTopBar() {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  return (
    <header className="md:hidden flex justify-between items-center px-4 py-3 w-full bg-background/85 backdrop-blur-md border-b border-border/80 sticky top-0 z-30 transition-colors">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center font-bold text-primary-foreground text-xs">
          FS
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
        <span className="text-xs font-semibold text-muted-foreground truncate max-w-[90px]">
          {user?.nome}
        </span>
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
