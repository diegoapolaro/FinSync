import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Search, Download, Settings, LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

export default function DesktopHeader() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [pesquisa, setPesquisa] = useState('');

  const hoje = new Date();
  const mesAno = hoje.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }).toUpperCase();

  function handleSearchKeyDown(e) {
    if (e.key === 'Enter' && pesquisa.trim()) {
      navigate('/?search=' + encodeURIComponent(pesquisa.trim()));
    }
  }

  return (
    <header className="hidden md:flex justify-between items-center px-8 py-4 w-full border-b bg-background/95">
      <div className="flex items-center gap-3">
        {location.pathname === '/' && (
          <>
            <h1 className="font-semibold text-2xl tracking-tight text-foreground">
              Extrato
            </h1>
            <div className="px-2.5 py-1 bg-muted text-muted-foreground rounded-md text-xs font-mono">
              {mesAno}
            </div>
          </>
        )}
      </div>

      <div className="flex items-center gap-3">
        <div className="relative">
          <Input
            className="h-9 pl-9 pr-4 w-64 rounded-md text-sm"
            placeholder="Pesquisar transação..."
            type="text"
            value={pesquisa}
            onChange={(e) => setPesquisa(e.target.value)}
            onKeyDown={handleSearchKeyDown}
          />
          <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-3" />
        </div>

        <Button
          variant="ghost"
          size="iconSm"
          onClick={() => navigate('/ajustes#exportar')}
          title="Exportar dados"
        >
          <Download className="w-4 h-4 text-muted-foreground" />
        </Button>

        <Button
          variant="ghost"
          size="iconSm"
          onClick={() => navigate('/ajustes')}
          title="Configurações"
        >
          <Settings className="w-4 h-4 text-muted-foreground" />
        </Button>

        <div className="h-6 w-px bg-border mx-1" />

        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center font-semibold text-primary-foreground text-xs">
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
          >
            <LogOut className="w-4 h-4 text-muted-foreground hover:text-destructive" />
          </Button>
        </div>
      </div>
    </header>
  );
}
