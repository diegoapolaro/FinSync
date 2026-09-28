import { Bell } from 'lucide-react';
import usePreferencias from '../../hooks/usePreferencias';
import SettingsSection from './SettingsSection';
import { Card } from '../ui/card';
import { Switch } from '../ui/switch';

export default function NotificacoesSection() {
  const { prefs, atualizar } = usePreferencias();

  return (
    <SettingsSection id="notificacoes" title="Notificações e Alertas" icon={Bell}>
      <div className="space-y-3">
        <Card className="p-5 flex items-center justify-between">
          <div>
            <h4 className="font-bold text-sm text-foreground">Alertas de Saldo Baixo</h4>
            <p className="text-xs text-muted-foreground">
              Avisar quando a conta atingir saldo crítico
            </p>
          </div>
          <Switch
            aria-label="Alertas de Saldo Baixo"
            checked={Boolean(prefs.alertaSaldoBaixo)}
            onCheckedChange={(checked) => atualizar('alertaSaldoBaixo', checked)}
          />
        </Card>

        <Card className="p-5 flex items-center justify-between">
          <div>
            <h4 className="font-bold text-sm text-foreground">Lembrete Diário de Lançamentos</h4>
            <p className="text-xs text-muted-foreground">
              Receba um lembrete para manter suas contas atualizadas
            </p>
          </div>
          <Switch
            aria-label="Lembrete Diário de Lançamentos"
            checked={Boolean(prefs.lembreteDiario)}
            onCheckedChange={(checked) => atualizar('lembreteDiario', checked)}
          />
        </Card>
      </div>
    </SettingsSection>
  );
}
