import { useEffect } from 'react';
import { useOutletContext, useLocation } from 'react-router-dom';
import { User, Building, Tag, Sliders, Bell, Download, Shield, Moon, Repeat } from 'lucide-react';
import useI18n from '../hooks/useI18n';
import { useTema } from '../contexts/ThemeContext';
import PerfilSection from '../components/settings/PerfilSection';
import ContasSection from '../components/settings/ContasSection';
import CategoriasSection from '../components/settings/CategoriasSection';
import RecorrenciasSection from '../components/settings/RecorrenciasSection';
import PreferenciasSection from '../components/settings/PreferenciasSection';
import NotificacoesSection from '../components/settings/NotificacoesSection';
import SegurancaSection from '../components/settings/SegurancaSection';
import ExportarSection from '../components/settings/ExportarSection';
import { Card } from '../components/ui/card';
import { Switch } from '../components/ui/switch';

export default function AjustesPage() {
  const context = useOutletContext() || {};
  const contas = context.contas || [];
  const setContas = context.setContas || (() => {});
  const categorias = context.categorias || [];
  const setCategorias = context.setCategorias || (() => {});

  const { t } = useI18n();
  const { tema, alternarTema } = useTema();
  const location = useLocation();


  const navItems = [
    { id: 'perfil', label: t('ajustes_perfil', 'Perfil'), Icon: User },
    { id: 'contas', label: t('ajustes_contas', 'Contas'), Icon: Building },
    { id: 'categorias', label: t('ajustes_categorias', 'Categorias'), Icon: Tag },
    { id: 'recorrencias', label: t('ajustes_recorrencias', 'Recorrências & Fixos'), Icon: Repeat },
    { id: 'preferencias', label: t('ajustes_preferencias', 'Preferências'), Icon: Sliders },
    { id: 'notificacoes', label: t('ajustes_notificacoes', 'Notificações'), Icon: Bell },
    { id: 'exportar', label: t('ajustes_exportar', 'Exportar'), Icon: Download },
    { id: 'seguranca', label: t('ajustes_seguranca', 'Segurança'), Icon: Shield },
  ];

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace('#', '');
      const el = document.getElementById(id);
      if (el) {
        setTimeout(() => {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      }
    }
  }, [location.hash]);

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
                <span className="text-xs font-semibold text-foreground">
                  {t('pref_modo_escuro', 'Modo Escuro')}
                </span>
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
          {/* Perfil do Usuário com Gerenciador de Foto e Nome */}
          <PerfilSection />

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
