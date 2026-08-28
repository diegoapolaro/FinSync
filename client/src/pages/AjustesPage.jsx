import { useOutletContext } from 'react-router-dom';
import { User, Building, Tag, Sliders, Bell, Download, Shield, Moon, Repeat } from 'lucide-react';
import usePreferencias from '../hooks/usePreferencias';
import { useTema } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import SettingsSection from '../components/settings/SettingsSection';
import ContasSection from '../components/settings/ContasSection';
import CategoriasSection from '../components/settings/CategoriasSection';
import RecorrenciasSection from '../components/settings/RecorrenciasSection';
import PreferenciasSection from '../components/settings/PreferenciasSection';
import NotificacoesSection from '../components/settings/NotificacoesSection';
import SegurancaSection from '../components/settings/SegurancaSection';
import ExportarSection from '../components/settings/ExportarSection';
import { Card } from '../components/ui/card';
import { Switch } from '../components/ui/switch';

const navItems = [
  { id: 'perfil', label: 'Perfil', Icon: User },
  { id: 'contas', label: 'Contas', Icon: Building },
  { id: 'categorias', label: 'Categorias', Icon: Tag },
  { id: 'recorrencias', label: 'Recorrências & Fixos', Icon: Repeat },
  { id: 'preferencias', label: 'Preferências', Icon: Sliders },
  { id: 'notificacoes', label: 'Notificações', Icon: Bell },
  { id: 'exportar', label: 'Exportar', Icon: Download },
  { id: 'seguranca', label: 'Segurança', Icon: Shield },
];

export default function AjustesPage() {
  const context = useOutletContext() || {};
  const contas = context.contas || [];
  const setContas = context.setContas || (() => {});
  const categorias = context.categorias || [];
  const setCategorias = context.setCategorias || (() => {});

  const { user } = useAuth();
  const { prefs } = usePreferencias();
  const { tema, alternarTema } = useTema();

  return (
    <div className="px-4 md:px-8 max-w-7xl mx-auto pb-32 md:pb-12 pt-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Settings Navigation Sidebar */}
        <aside className="lg:col-span-3">
          <Card className="p-4 sticky top-24 shadow-sm border border-border">
            <nav className="flex flex-col gap-1">
              {navItems.map((item) => {
                const { Icon } = item;
                return (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    className="flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-secondary transition-all text-xs font-semibold text-foreground"
                  >
                    <Icon className="w-4 h-4 text-muted-foreground" />
                    <span>{item.label}</span>
                  </a>
                );
              })}
            </nav>

            <div className="border-t border-border mt-4 pt-4 px-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Moon className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs font-semibold text-foreground">Modo Escuro</span>
              </div>
              <Switch
                aria-label="Modo Escuro Lateral"
                checked={tema === 'escuro'}
                onCheckedChange={alternarTema}
              />
            </div>
          </Card>
        </aside>

        {/* Main Content Settings */}
        <div className="lg:col-span-9 space-y-10">
          {/* Perfil */}
          <SettingsSection id="perfil" title="Perfil do Usuário" icon={User}>
            <Card className="p-6 flex items-center justify-between border-border/80 shadow-sm">
              <div className="flex items-center gap-4">
                {user?.fotoUrl ? (
                  <img
                    src={user.fotoUrl}
                    alt={user?.nome || 'Foto de perfil'}
                    className="w-14 h-14 rounded-full object-cover border border-border/80 shadow-sm shrink-0"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center font-bold text-primary-foreground text-xl select-none shrink-0">
                    {user?.nome ? user.nome.charAt(0).toUpperCase() : 'U'}
                  </div>
                )}
                <div className="min-w-0">
                  <h3 className="font-normal text-lg text-foreground tracking-[-0.03em] truncate">
                    {user?.nome || 'Usuário'}
                  </h3>
                  <p className="text-xs text-muted-foreground truncate">
                    {user?.email || 'usuario@email.com'}
                  </p>
                </div>
              </div>
            </Card>
          </SettingsSection>

          {/* Contas */}
          <ContasSection contas={contas} setContas={setContas} />

          {/* Categorias */}
          <CategoriasSection categorias={categorias} setCategorias={setCategorias} />

          {/* Recorrências & Fixos */}
          <RecorrenciasSection contas={contas} categorias={categorias} />

          {/* Preferências */}
          <PreferenciasSection />

          {/* Notificações */}
          <NotificacoesSection />

          {/* Exportar */}
          <ExportarSection />

          {/* Segurança */}
          <SegurancaSection />
        </div>
      </div>
    </div>
  );
}
