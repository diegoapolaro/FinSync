import { useState, useContext } from 'react';
import { Shield, Lock, KeyRound } from 'lucide-react';
import { alterarSenha, definirSenha } from '../../services/api';
import { AuthContext } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import SettingsSection from './SettingsSection';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

export default function SegurancaSection() {
  const auth = useContext(AuthContext);
  const user = auth?.user ?? null;
  const { addToast } = useToast();
  const [painelAberto, setPainelAberto] = useState(false);
  const [senhaAtual, setSenhaAtual] = useState('');
  const [senhaNova, setSenhaNova] = useState('');
  const [salvando, setSalvando] = useState(false);

  const temSenha = user?.temSenha !== false;

  async function handleAlterarSenha(e: React.FormEvent) {
    e.preventDefault();
    if (temSenha && !senhaAtual) {
      addToast('Preencha a senha atual.', 'error');
      return;
    }
    if (!senhaNova) {
      addToast('Preencha a nova senha.', 'error');
      return;
    }
    if (senhaNova.length < 8) {
      addToast('A nova senha deve ter no mínimo 8 caracteres.', 'error');
      return;
    }
    setSalvando(true);
    try {
      if (temSenha) {
        await alterarSenha(senhaAtual, senhaNova);
        addToast('Senha alterada com sucesso!', 'success');
      } else {
        await definirSenha(senhaNova);
        addToast(
          'Senha definida com sucesso! Agora você pode fazer login com email e senha.',
          'success',
        );
      }
      setPainelAberto(false);
      setSenhaAtual('');
      setSenhaNova('');
    } catch (err: any) {
      addToast(err.message, 'error');
    } finally {
      setSalvando(false);
    }
  }

  return (
    <SettingsSection
      id="seguranca"
      title="Segurança da Conta"
      superLabel="Segurança & Exclusão"
      description="Gerencie credenciais de acesso, revogação de vínculos PJ e conformidade com LGPD."
      icon={Shield}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Card 1: Credencial e Senha */}
        <Card
          className="p-5 flex items-center justify-between hover:shadow-md transition-all cursor-pointer border-border/80 bg-card"
          onClick={() => setPainelAberto(!painelAberto)}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-primary">
              {temSenha ? (
                <Lock className="w-5 h-5 text-foreground" />
              ) : (
                <KeyRound className="w-5 h-5 text-foreground" />
              )}
            </div>
            <div>
              <h4 className="font-bold text-sm text-foreground">
                {temSenha ? 'Alterar Senha' : 'Definir Senha'}
              </h4>
              <p className="text-xs text-muted-foreground">
                {temSenha ? 'Atualizar credencial de login' : 'Criar senha para login com email'}
              </p>
            </div>
          </div>
        </Card>

        {/* Card 2: Zona de Exclusão / Desconectar PJ (Mockup Wise) */}
        <Card className="p-5 flex flex-col justify-between gap-3 border-destructive/30 bg-destructive/5">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 text-destructive font-bold text-sm">
              <Shield className="w-4 h-4" />
              <span>Zona de Exclusão PJ</span>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Ao desvincular a empresa, todas as integrações bancárias são imediatamente revogadas no Banco Central e o histórico é congelado.
            </p>
          </div>
          <div className="flex items-center justify-between pt-1">
            <Button
              variant="destructive"
              size="sm"
              onClick={() => addToast('Operação de desconexão bloqueada para conta principal.', 'info')}
              className="rounded-full text-xs font-semibold h-8"
            >
              Desconectar PJ
            </Button>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                addToast('Política LGPD: Seus dados financeiros são criptografados de ponta a ponta.', 'info');
              }}
              className="text-[11px] text-muted-foreground hover:text-foreground underline"
            >
              Política de retenção LGPD
            </a>
          </div>
        </Card>
      </div>

      {painelAberto && (
        <Card className="mt-4 p-6 space-y-4 border border-border">
          <h4 className="font-bold text-sm text-foreground uppercase tracking-wide">
            {temSenha ? 'Alteração de Senha' : 'Definir Senha'}
          </h4>
          {!temSenha && (
            <p className="text-sm text-muted-foreground">
              Sua conta foi criada com Google. Defina uma senha para também poder fazer login com
              email e senha.
            </p>
          )}
          <form onSubmit={handleAlterarSenha} className="space-y-4">
            {temSenha && (
              <Input
                type="password"
                placeholder="Senha atual"
                value={senhaAtual}
                onChange={(e) => setSenhaAtual(e.target.value)}
                disabled={salvando}
                className="bg-secondary border-border"
                required
              />
            )}
            <Input
              type="password"
              placeholder="Nova senha (mínimo 8 caracteres)"
              value={senhaNova}
              onChange={(e) => setSenhaNova(e.target.value)}
              disabled={salvando}
              className="bg-secondary border-border"
              required
              minLength={8}
            />
            <div className="flex gap-2">
              <Button variant="default" size="sm" type="submit" disabled={salvando}>
                {salvando ? 'Salvando...' : temSenha ? 'Salvar Nova Senha' : 'Definir Senha'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                type="button"
                disabled={salvando}
                onClick={() => {
                  setPainelAberto(false);
                  setSenhaAtual('');
                  setSenhaNova('');
                }}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </Card>
      )}
    </SettingsSection>
  );
}
