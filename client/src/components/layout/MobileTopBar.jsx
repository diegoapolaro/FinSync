import { LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function MobileTopBar() {
  const { user, logout } = useAuth();

  return (
    <header className="md:hidden flex justify-between items-center px-4 py-3 w-full bg-background border-b sticky top-0 z-30">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center font-bold text-primary-foreground text-sm">
          FS
        </div>
        <h1 className="font-semibold text-lg tracking-tight text-foreground">
          FinSync
        </h1>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold text-muted-foreground truncate max-w-[100px]">
          {user?.nome}
        </span>
        <button
          onClick={logout}
          className="p-2 rounded-md hover:bg-muted text-muted-foreground"
          title="Sair"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
