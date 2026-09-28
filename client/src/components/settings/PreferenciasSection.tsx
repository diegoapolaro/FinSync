import { useState, useEffect } from 'react';
import { Sliders, Moon, Sparkles, RefreshCw, TrendingUp } from 'lucide-react';
import usePreferencias from '../../hooks/usePreferencias';
import useI18n from '../../hooks/useI18n';
import { useTema } from '../../contexts/ThemeContext';
import SettingsSection from './SettingsSection';
import { Card } from '../ui/card';
import { Switch } from '../ui/switch';
import { Button } from '../ui/button';
import { formatCurrency, formatDate } from '../../utils/formatters';
import {
  obterCotacoes,
  buscarCotacoesAoVivo,
  getCotacao,
  subscribeCotacoes,
} from '../../services/cotacaoService';

export default function PreferenciasSection() {
  const { prefs, atualizar } = usePreferencias();
  const { t } = useI18n();
  const { tema, alternarTema } = useTema();

  const [cotacoes, setCotacoes] = useState(() => obterCotacoes());
  const [atualizandoCotacoes, setAtualizandoCotacoes] = useState(false);

  useEffect(() => {
    return subscribeCotacoes((novas) => {
      if (novas) setCotacoes(novas);
    });
  }, []);

  const handleAtualizarCotacoes = async () => {
    setAtualizandoCotacoes(true);
    try {
      const novas = await buscarCotacoesAoVivo();
      if (novas) setCotacoes(novas);
    } finally {
      setAtualizandoCotacoes(false);
    }
  };

  const moedaAtiva = prefs.moeda || 'Real Brasileiro (BRL - R$)';
  const formatoDataAtivo = prefs.formatoData || 'dd/mm/aaaa';
  const idiomaAtivo = prefs.idioma || 'Português (Brasil)';

  const taxaAtiva = getCotacao(moedaAtiva);
  const isEstrangeira = moedaAtiva.includes('USD') || moedaAtiva.includes('EUR');
  const exemploValorBase = 55000;
  const exemploConvertido = formatCurrency(exemploValorBase, moedaAtiva);
  const exemploData = formatDate('2026-08-23', formatoDataAtivo);

  const taxaUSD = (cotacoes?.USD || 5.5).toFixed(2);
  const taxaEUR = (cotacoes?.EUR || 6.0).toFixed(2);

  return (
    <SettingsSection
      id="preferencias"
      title={t('pref_titulo', 'Preferências do Sistema')}
      icon={Sliders}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Idioma */}
        <Card className="p-5 space-y-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
            {t('pref_idioma', 'Idioma')}
          </label>
          <select
            className="flex h-11 w-full rounded-xl border border-border bg-secondary px-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            value={idiomaAtivo}
            onChange={(e) => atualizar('idioma', e.target.value)}
          >
            <option value="Português (Brasil)">Português (Brasil)</option>
            <option value="English (US)">English (US)</option>
            <option value="Español">Español</option>
          </select>
        </Card>

        {/* Moeda */}
        <Card className="p-5 space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
              {t('pref_moeda', 'Moeda Padrão')}
            </label>
            {isEstrangeira && (
              <span className="text-[10px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
                1 {moedaAtiva.includes('USD') ? 'USD' : 'EUR'} = R$ {taxaAtiva.toFixed(2)}
              </span>
            )}
          </div>
          <select
            className="flex h-11 w-full rounded-xl border border-border bg-secondary px-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            value={moedaAtiva}
            onChange={(e) => atualizar('moeda', e.target.value)}
          >
            <option value="Real Brasileiro (BRL - R$)">Real Brasileiro (BRL - R$)</option>
            <option value="US Dollar (USD - $)">US Dollar (USD - $)</option>
            <option value="Euro (EUR - €)">Euro (EUR - €)</option>
          </select>
        </Card>

        {/* Formato de Data */}
        <Card className="p-5 space-y-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
            {t('pref_formato_data', 'Formato de Data')}
          </label>
          <select
            className="flex h-11 w-full rounded-xl border border-border bg-secondary px-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            value={formatoDataAtivo}
            onChange={(e) => atualizar('formatoData', e.target.value)}
          >
            <option value="dd/mm/aaaa">DD/MM/AAAA (ex: 23/08/2026)</option>
            <option value="aaaa-mm-dd">AAAA-MM-DD (ex: 2026-08-23)</option>
            <option value="mm/dd/aaaa">MM/DD/AAAA (ex: 08/23/2026)</option>
          </select>
        </Card>

        {/* Tema */}
        <Card className="p-5 flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Moon className="w-4 h-4 text-muted-foreground" />
              <label className="block text-xs font-bold uppercase tracking-wider text-foreground">
                {t('pref_modo_escuro', 'Modo Escuro')}
              </label>
            </div>
            <p className="text-xs text-muted-foreground">
              {t('pref_modo_escuro_desc', 'Alternar entre o tema claro e escuro')}
            </p>
          </div>
          <Switch
            aria-label="Modo Escuro Preferências"
            checked={tema === 'escuro'}
            onCheckedChange={alternarTema}
          />
        </Card>

        {/* Live Preview Card */}
        <Card className="p-5 md:col-span-2 bg-secondary/30 border-border border-dashed space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-xs font-bold uppercase tracking-wider text-foreground">
                {t('pref_preview_titulo', 'Pré-visualização em Tempo Real')}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground bg-secondary px-2 py-0.5 rounded-lg border border-border">
                <TrendingUp className="w-3 h-3 text-emerald-500" />
                USD: R$ {taxaUSD} | EUR: R$ {taxaEUR}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleAtualizarCotacoes}
                disabled={atualizandoCotacoes}
                title="Atualizar cotações de câmbio"
                className="h-7 px-2 text-[11px] text-muted-foreground hover:text-foreground"
              >
                <RefreshCw
                  className={`w-3 h-3 mr-1 ${atualizandoCotacoes ? 'animate-spin' : ''}`}
                />
                Atualizar
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <div className="bg-card/70 border border-border/80 rounded-xl p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-medium text-muted-foreground">
                  {t('pref_preview_moeda', 'Exemplo de Moeda')}
                </span>
                {isEstrangeira && (
                  <span className="text-[9px] text-muted-foreground numeric-mono">
                    Base R$ 55k
                  </span>
                )}
              </div>
              <span className="text-base font-bold numeric-mono text-primary block">
                {exemploConvertido}
              </span>
              {isEstrangeira && (
                <span className="text-[10px] text-muted-foreground block mt-0.5">
                  R$ 55.000,00 ÷ {taxaAtiva.toFixed(2)}
                </span>
              )}
            </div>

            <div className="bg-card/70 border border-border/80 rounded-xl p-3">
              <span className="text-[11px] font-medium text-muted-foreground block mb-1">
                {t('pref_preview_data', 'Exemplo de Data')}
              </span>
              <span className="text-base font-bold numeric-mono text-foreground block">
                {exemploData}
              </span>
            </div>

            <div className="bg-card/70 border border-border/80 rounded-xl p-3">
              <span className="text-[11px] font-medium text-muted-foreground block mb-1">
                {t('pref_preview_idioma', 'Idioma Selecionado')}
              </span>
              <span className="text-base font-semibold text-foreground block">{idiomaAtivo}</span>
            </div>
          </div>
        </Card>
      </div>
    </SettingsSection>
  );
}
