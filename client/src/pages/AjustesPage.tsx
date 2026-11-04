import React, { useEffect, useState, useMemo } from 'react';
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
  RotateCcw,
  CheckCircle2,
  ArrowRight,
  ChevronRight,
} from 'lucide-react';
import useI18n from '../hooks/useI18n';
import { useTema } from '../contexts/ThemeContext';
import { useToast } from '../contexts/ToastContext';
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
import { Button } from '../components/ui/button';
import { Switch } from '../components/ui/switch';
import type { ContaDto, CategoriaDto } from '@/types';

interface OutletContextType {
  contas?: ContaDto[];
  setContas?: React.Dispatch<React.SetStateAction<ContaDto[]>>;
  categorias?: CategoriaDto[];
  setCategorias?: React.Dispatch<React.SetStateAction<CategoriaDto[]>>;
  contaSelecionadaId?: number | string;
  abrirModalNovaConta?: () => void;
}

export default function AjustesPage(): React.ReactElement {
  const context = useOutletContext<OutletContextType>() || {};
  const contas = context.contas || [];
  const setContas = context.setContas || (() => {});
  const categorias = context.categorias || [];
  const setCategorias = context.setCategorias || (() => {});
  const contaSelecionadaId = context.contaSelecionadaId;

  const contaAtiva = useMemo(() => {
    return contas.find((c) => String(c.id) === String(contaSelecionadaId));
  }, [contas, contaSelecionadaId]);

  const { t } = useI18n();
  const { tema, alternarTema } = useTema();
  const { addToast } = useToast();
  const location = useLocation();
  const { scrollToElement } = useSmoothScroll();

  const [activeSection, setActiveSection] = useState<string>('perfil');

  const navItems = useMemo(
    () => [
      { id: 'perfil', label: t('ajustes_perfil', 'Perfil & Empresa'), Icon: User },
      {
        id: 'contas',
        label: t('ajustes_contas', 'Contas & Open Finance'),
        Icon: Building,
        badge: `${contas.length} ativas`,
      },
      {
        id: 'categorias',
        label: t('ajustes_categorias', 'Plano de Contas & Categorias'),
        Icon: Tag,
        badge: `${categorias.length} itens`,
      },
      { id: 'preferencias', label: t('ajustes_preferencias', 'Moeda & Regionalização'), Icon: Sliders },
      {
        id: 'notificacoes',
        label: t('ajustes_notificacoes', 'Notificações & Alertas DRE'),
        Icon: Bell,
        indicator: true,
      },
      { id: 'exportar', label: t('ajustes_exportar', 'Exportação Fiscal & Relatórios'), Icon: Download },
      { id: 'seguranca', label: t('ajustes_seguranca', 'Segurança & Exclusão'), Icon: Shield },
      {
        id: 'recorrencias',
        label: t('ajustes_recorrencias', 'Recorrências & Fixos'),
        Icon: Repeat,
      },
      { id: 'orcamentos', label: t('ajustes_orcamentos', 'Orçamentos'), Icon: Target },
    ],
    [t, contas.length, categorias.length],
  );

  const handleNavClick = (e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>, targetId: string) => {
    if (e && e.preventDefault) {
      e.preventDefault();
    }
    setActiveSection(targetId);
    scrollToElement(targetId, { offset: 28 });
    if (typeof window !== 'undefined' && window.history?.replaceState) {
      window.history.replaceState(null, '', `#${targetId}`);
    }
  };

  const handleDescartar = () => {
    addToast('Alterações não salvas foram descartadas.', 'info');
  };

  const handleSalvarTudo = () => {
    addToast('Todas as preferências operacionais e cadastrais foram salvas com sucesso!', 'success');
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
    <div className="px-4 md:px-8 max-w-7xl mx-auto pb-32 md:pb-16 pt-6">
      {/* Page Header Area com Ações Globais */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-border/60">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-bold font-mono uppercase tracking-wider text-primary">
              Configurações Globais
            </span>
            <span className="text-muted-foreground/60 text-xs">•</span>
            <span className="text-xs font-semibold text-muted-foreground">
              {contaAtiva?.nome || 'Pizzaria Bella Forneria'}
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight font-sans">
            Ajustes do Sistema
          </h1>
          <p className="text-xs md:text-sm text-muted-foreground max-w-2xl leading-relaxed">
            Gerencie contas integradas, centros de custo, preferências fiscais e parametrizações operacionais da empresa.
          </p>
        </div>

        {/* Top Action Buttons */}
        <div className="flex items-center gap-2.5 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDescartar}
            className="rounded-full text-xs font-semibold flex items-center gap-1.5 h-10 px-4 border-border/80"
          >
            <RotateCcw className="w-3.5 h-3.5 text-muted-foreground" />
            <span>Descartar alterações</span>
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={handleSalvarTudo}
            className="rounded-full text-xs font-bold flex items-center gap-2 h-10 px-5 shadow-sm bg-[#9fe870] hover:bg-[#8ee05b] text-[#163300] transition-transform active:scale-95"
          >
            <CheckCircle2 className="w-4 h-4 text-[#163300]" />
            <span>Salvar Preferências</span>
          </Button>
        </div>
      </div>

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

      {/* Master Two-Column Bento Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mt-6">
        {/* LEFT COLUMN: Sticky Vertical Sub-Nav & Status Card (4 cols) */}
        <aside className="hidden lg:flex lg:col-span-4 flex-col gap-5 lg:sticky lg:top-24">
          <Card className="p-3 shadow-sm border border-border/80 bg-card rounded-2xl flex flex-col gap-1">
            <div className="px-3 py-2 flex items-center justify-between border-b border-border/40 mb-1">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-muted-foreground">
                Módulos de Gestão
              </span>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                v3.4.1
              </span>
            </div>

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
                      'relative flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-colors text-xs font-semibold select-none group',
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
                    <div className="flex items-center gap-2.5 relative z-10">
                      <Icon
                        className={cn(
                          'w-4 h-4 transition-colors',
                          isActive
                            ? 'text-primary'
                            : 'text-muted-foreground group-hover:text-foreground',
                        )}
                      />
                      <span>{item.label}</span>
                    </div>

                    <div className="relative z-10 flex items-center gap-1.5">
                      {item.badge && (
                        <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
                          {item.badge}
                        </span>
                      )}
                      {item.indicator && (
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      )}
                      <ChevronRight className="w-3.5 h-3.5 text-muted-foreground opacity-40 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </a>
                );
              })}
            </nav>

            <div className="border-t border-border mt-3 pt-3 px-3 flex items-center justify-between">
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

          {/* Bento Summary Card: Status Operacional (Wise Deep Moss / Lime Voltage) */}
          <div className="bg-[#163300] text-white p-5 rounded-2xl shadow-sm flex flex-col gap-3 relative overflow-hidden border border-[#254d00]">
            <div className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full bg-[#9fe870]/10 blur-xl pointer-events-none" />
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#9fe870]">
                Status Operacional
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#9fe870]/20 text-[#9fe870] text-[10px] font-mono font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-[#9fe870] animate-pulse" />
                Em Conformidade
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-4xl font-extrabold font-mono tracking-tight text-white">
                100%
              </span>
              <span className="text-xs text-[#e2f6d5]/80 mt-1 leading-relaxed">
                Sincronismo com Banco Central &amp; RFB ativo sem pendências cadastrais.
              </span>
            </div>
            <div className="pt-2 border-t border-[#254d00]">
              <button
                type="button"
                onClick={() => addToast('Certidão cadastral e conformidade fiscal gerada com sucesso!', 'success')}
                className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-[#9fe870] hover:text-white transition-colors cursor-pointer"
              >
                <span>Emitir Certidão Cadastral</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </aside>

        {/* RIGHT COLUMN: Core Content Panels (8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-8 min-w-0">
          {/* Seção A: Perfil do Usuário & Dados Fiscais da Empresa */}
          <PerfilSection />

          {/* Seção B: Contas & Open Finance 3.0 */}
          <ContasSection contas={contas} setContas={setContas} />

          {/* Seção C: Plano de Contas & Centros de Custo (DRE) */}
          <CategoriasSection categorias={categorias} setCategorias={setCategorias} />

          {/* Seção D: Moeda, Idioma, Regionalização & Toggles Inteligentes */}
          <PreferenciasSection />

          {/* Seção: Notificações & Alertas */}
          <NotificacoesSection />

          {/* Seção E: Exportação Contábil & Relatórios */}
          <ExportarSection />

          {/* Seção: Segurança da Conta & Zona de Exclusão */}
          <SegurancaSection />

          {/* Módulos Complementares: Recorrências & Orçamentos */}
          <RecorrenciasSection contas={contas} categorias={categorias} />
          <OrcamentosSection categorias={categorias} />
        </div>
      </div>
    </div>
  );
}
