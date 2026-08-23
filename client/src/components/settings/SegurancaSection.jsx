import { useState } from 'react';
import { Shield, Lock } from 'lucide-react';
import { alterarSenha } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';
import SettingsSection from './SettingsSection';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

export default function SegurancaSection() {
  const { addToast } = useToast();
  const [alterarSenhaAberto, setAlterarSenhaAberto] = useState(false);
  const [senhaAtual, setSenhaAtual] = useState('');
  const [senhaNova, setSenhaNova] = useState('');
  const [salvandoSenha, setSalvandoSenha] = useState(false);

  async function handleAlterarSenha(e) {
    e.preventDefault();
    if (!senhaAtual || !senhaNova) {
      addToast('Preencha todos os campos.', 'error');
      return;
    }
    if (senhaNova.length < 6) {
      addToast('A nova senha deve ter no mínimo 6 caracteres.', 'error');
      return;
    }
    setSalvandoSenha(true);
    try {
      await alterarSenha(senhaAtual, senhaNova);
      addToast('Senha alterada com sucesso!', 'success');
      setAlterarSenhaAberto(false);
      setSenhaAtual('');
      setSenhaNova('');
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setSalvandoSenha(false);
    }
  }

  return (
    <SettingsSection id="seguranca" title="Segurança da Conta" icon={Shield}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card
          className="p-5 flex items-center justify-between hover:shadow-md transition-all cursor-pointer"
          onClick={() => setAlterarSenhaAberto(!alterarSenhaAberto)}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
              <Lock className="w-5 h-5 text-foreground" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-foreground">Alterar Senha</h4>
              <p className="text-xs text-muted-foreground">Atualizar credencial de login</p>
            </div>
          </div>
        </Card>
      </div>

      {alterarSenhaAberto && (
        <Card className="mt-4 p-6 space-y-4 border border-border/60">
          <h4 className="font-bold text-sm text-foreground uppercase tracking-wide">
            Alteração de Senha
          </h4>
          <form onSubmit={handleAlterarSenha} className="space-y-4">
            <Input
              type="password"
              placeholder="Senha atual"
              value={senhaAtual}
              onChange={(e) => setSenhaAtual(e.target.value)}
              disabled={salvandoSenha}
              required
            />
            <Input
              type="password"
              placeholder="Nova senha (mínimo 6 caracteres)"
              value={senhaNova}
              onChange={(e) => setSenhaNova(e.target.value)}
              disabled={salvandoSenha}
              required
              minLength={6}
            />
            <div className="flex gap-2">
              <Button variant="default" size="sm" type="submit" disabled={salvandoSenha}>
                {salvandoSenha ? 'Salvando...' : 'Salvar Nova Senha'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                type="button"
                disabled={salvandoSenha}
                onClick={() => {
                  setAlterarSenhaAberto(false);
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
