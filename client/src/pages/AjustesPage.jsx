import { useEffect, useState, useMemo } from 'react';
import { useOutletContext, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  User,
  Building,
  Tag,
  Sliders,
  Bell,
  Download,
  Shield,
  Moon,
  Repeat,
  Target,
} from 'lucide-react';
import useI18n from '../hooks/useI18n';
import { useTema } from '../contexts/ThemeContext';
import { useSmoothScroll } from '../hooks/useSmoothScroll';
import { cn } from '@/lib/utils';
import PerfilSection from '../components/settings/PerfilSection';
import ContasSection from '../components/settings/ContasSection';
import CategoriasSection from '../components/settings/CategoriasSection';
import RecorrenciasSection from '../components/settings/RecorrenciasSection';
import OrcamentosSection from '../components/settings/OrcamentosSection';
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
  const { scrollToElement } = useSmoothScroll();

  const [activeSection, setActiveSection] = useState('perfil');

  const navItems = useMemo(
    () => [
      { id: 'perfil', label: t('ajustes_perfil', 'Perfil'), Icon: User },
      { id: 'contas', label: t('ajustes_contas', 'Contas'), Icon: Building },
      { id: 'categorias', label: t('ajustes_categorias', 'Categorias'), Icon: Tag },
      {
        id: 'recorrencias',
        label: t('ajustes_recorrencias', 'Recorrências & Fixos'),
        Icon: Repeat,
      },
      { id: 'orcamentos', label: t('ajustes_orcamentos', 'Orçamentos'), Icon: Target },
      { id: 'preferencias', label: t('ajustes_preferencias', 'Preferências'), Icon: Sliders },
      { id: 'notificacoes', label: t('ajustes_notificacoes', 'Notificações'), Icon: Bell },
      { id: 'exportar', label: t('ajustes_exportar', 'Exportar'), Icon: Download },
      { id: 'seguranca', label: t('ajustes_seguranca', 'Segurança'), Icon: Shield },
    ],
    [t],
  );

  const handleNavClick = (e, targetId) => {
    if (e && e.preventDefault) {
      e.preventDefault();
    }
    setActiveSection(targetId);
    scrollToElement(targetId, { offset: 28 });
    if (typeof window !== 'undefined' && window.history?.replaceState) {
      window.history.replaceState(null, '', `#${targetId}`);
    }
  };

  // Scroll suave inicial caso a rota carregue com #hash
  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace('#', '');
      const el = document.getElementById(id);
      if (el) {
        setActiveSection(id);
        const timer = setTimeout(() => {
          scrollToElement(id, { offset: 28 });
        }, 120);
        return () => clearTimeout(timer);
      }
    }
  }, [location.hash, scrollToElement]);

  // ScrollSpy para acompanhar a seção ativa conforme a rolagem da página
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const sectionIds = navItems.map((item) => item.id);
    const container = document.querySelector('main.overflow-y-auto');

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          const visibleEntries = entries.filter((entry) => entry.isIntersecting);
          if (visibleEntries.length > 0) {
            const mostVisible = visibleEntries.sort(
              (a, b) => b.intersectionRatio - a.intersectionRatio,
            )[0];
            if (mostVisible?.target?.id) {
              setActiveSection(mostVisible.target.id);
            }
          }
        },
        {
          root: container || null,
          rootMargin: '-10% 0px -70% 0px',
          threshold: [0, 0.2, 0.5],
        },
      );

      sectionIds.forEach((id) => {
        const el = document.getElementById(id);
        if (el) observer.observe(el);
      });

      return () => observer.disconnect();
    }
  }, [navItems]);

  return (
    <div className="px-4 md:px-8 max-w-7xl mx-auto pb-32 md:pb-12 pt-6">
      {/* Mobile Quick Category Slider (Horizontal Sticky Chips) */}
      <div className="lg:hidden sticky top-0 z-20 -mx-4 px-4 py-2.5 bg-background/90 backdrop-blur-md border-b border-border mb-6">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 scroll-smooth">
          {navItems.map((item) => {
            const { Icon } = item;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={(e) => handleNavClick(e, item.id)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all shrink-0',
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/25 font-bold'
                    : 'bg-secondary/80 text-muted-foreground hover:text-foreground hover:bg-secondary',
                )}
                aria-current={isActive ? 'true' : undefined}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Settings Navigation Sidebar (Desktop) */}
        <aside className="hidden lg:block lg:col-span-3">
          <Card className="p-3 sticky top-24 shadow-sm border border-border bg-card/95 backdrop-blur-sm">
            <nav className="flex flex-col gap-1 relative" aria-label="Navegação de Ajustes">
              {navItems.map((item) => {
                const { Icon } = item;
                const isActive = activeSection === item.id;
                return (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    onClick={(e) => handleNavClick(e, item.id)}
                    className={cn(
                      'relative flex items-center gap-3 px-4 py-2.5 rounded-xl transition-colors text-xs font-semibold select-none group',
                      isActive
                        ? 'text-primary font-bold'
                        : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60',
                    )}
                    aria-current={isActive ? 'true' : undefined}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeSettingsNav"
                        className="absolute inset-0 bg-primary/10 border border-primary/20 rounded-xl"
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}
                    <Icon
                      className={cn(
                        'w-4 h-4 relative z-10 transition-colors',
                        isActive
                          ? 'text-primary'
                          : 'text-muted-foreground group-hover:text-foreground',
                      )}
                    />
                    <span className="relative z-10">{item.label}</span>
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

          {/* Orçamentos */}
          <OrcamentosSection categorias={categorias} />

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
