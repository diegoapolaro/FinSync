import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Search, Download, Settings, LogOut, Moon, Sun } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

export default function DesktopHeader() {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [pesquisa, setPesquisa] = useState('');

  const hoje = new Date();
  const mesAno = hoje.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  function handleSearchKeyDown(e) {
    if (e.key === 'Enter' && pesquisa.trim()) {
      navigate('/?search=' + encodeURIComponent(pesquisa.trim()));
    }
  }

  return (
    <header className="hidden md:flex justify-between items-center px-8 py-3.5 w-full border-b border-border/80 bg-background/80 backdrop-blur-md sticky top-0 z-30 transition-colors">
      <div className="flex items-center gap-3">
        {location.pathname === '/' ? (
          <>
            <h1 className="font-normal text-xl tracking-[-0.03em] text-foreground">Extrato</h1>
            <div className="px-3 py-1 bg-secondary text-muted-foreground rounded-full text-[11px] font-medium capitalize border border-border/50">
              {mesAno}
            </div>
          </>
        ) : (
          <h1 className="font-normal text-xl tracking-[-0.03em] text-foreground capitalize">
            {location.pathname.replace('/', '') || 'FinSync'}
          </h1>
        )}
      </div>

      <div className="flex items-center gap-3">
        <div className="relative">
          <Input
            className="h-9 pl-9 pr-4 w-60 rounded-xl bg-secondary border border-border text-xs focus-visible:ring-primary placeholder:text-muted-foreground/70"
            placeholder="Buscar transação..."
            type="text"
            value={pesquisa}
            onChange={(e) => setPesquisa(e.target.value)}
            onKeyDown={handleSearchKeyDown}
          />
          <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-3.5 top-2.5" />
        </div>

        <Button
          variant="ghost"
          size="iconSm"
          onClick={toggleTheme}
          title={isDark ? 'Tema Claro' : 'Tema Escuro'}
          className="rounded-full hover:bg-muted text-muted-foreground hover:text-foreground"
        >
          {isDark ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-indigo-400" />
          )}
        </Button>

        <Button
          variant="ghost"
          size="iconSm"
          onClick={() => navigate('/ajustes#exportar')}
          title="Exportar dados"
          className="rounded-full hover:bg-muted text-muted-foreground hover:text-foreground"
        >
          <Download className="w-4 h-4" />
        </Button>

        <Button
          variant="ghost"
          size="iconSm"
          onClick={() => navigate('/ajustes')}
          title="Configurações"
          className="rounded-full hover:bg-muted text-muted-foreground hover:text-foreground"
        >
          <Settings className="w-4 h-4" />
        </Button>

        <div className="h-5 w-px bg-border/80 mx-1" />

        <div className="flex items-center gap-2 pl-1">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center font-semibold text-primary-foreground text-xs">
            {user?.nome ? user.nome.charAt(0).toUpperCase() : 'U'}
          </div>
          <span className="text-xs font-semibold text-foreground truncate max-w-[120px]">
            {user?.nome}
          </span>
          <Button
            variant="ghost"
            size="iconSm"
            onClick={logout}
            title="Sair"
            className="rounded-full hover:bg-destructive/15 hover:text-destructive text-muted-foreground"
          >
            <LogOut className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
