import { Sliders, Moon } from 'lucide-react';
import usePreferencias from '../../hooks/usePreferencias';
import { useTema } from '../../contexts/ThemeContext';
import SettingsSection from './SettingsSection';
import { Card } from '../ui/card';
import { Switch } from '../ui/switch';

export default function PreferenciasSection() {
  const { prefs, atualizar } = usePreferencias();
  const { tema, alternarTema } = useTema();

  return (
    <SettingsSection id="preferencias" title="Preferências do Sistema" icon={Sliders}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Idioma */}
        <Card className="p-5 space-y-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Idioma
          </label>
          <select
            className="flex h-11 w-full rounded-xl border border-border bg-secondary px-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            value={prefs.idioma || 'Português (Brasil)'}
            onChange={(e) => atualizar('idioma', e.target.value)}
          >
            <option value="Português (Brasil)">Português (Brasil)</option>
            <option value="English (US)">English (US)</option>
            <option value="Español">Español</option>
          </select>
        </Card>

        {/* Moeda */}
        <Card className="p-5 space-y-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Moeda Padrão
          </label>
          <select
            className="flex h-11 w-full rounded-xl border border-border bg-secondary px-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            value={prefs.moeda || 'Real Brasileiro (BRL - R$)'}
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
            Formato de Data
          </label>
          <select
            className="flex h-11 w-full rounded-xl border border-border bg-secondary px-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            value={prefs.formatoData || 'dd/mm/aaaa'}
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
                Modo Escuro
              </label>
            </div>
            <p className="text-xs text-muted-foreground">Alternar entre o tema claro e escuro</p>
          </div>
          <Switch
            aria-label="Modo Escuro Preferências"
            checked={tema === 'escuro'}
            onCheckedChange={alternarTema}
          />
        </Card>
      </div>
    </SettingsSection>
  );
}
