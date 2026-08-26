import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';

function IndicadorForcaSenha({ senha }) {
  const calcularForca = (s) => {
    let score = 0;
    if (s.length >= 8) score++;
    if (/[a-z]/.test(s) && /[A-Z]/.test(s)) score++;
    if (/\d/.test(s)) score++;
    if (/[^a-zA-Z0-9]/.test(s)) score++;
    return score;
  };

  const forca = calcularForca(senha);
  const labels = ['', 'Fraca', 'Razoável', 'Boa', 'Forte'];

  if (!senha) return null;

  return (
    <div className="space-y-1">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((level) => (
          <div
            key={level}
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              forca >= level
                ? level <= 1
                  ? 'bg-destructive'
                  : level <= 2
                    ? 'bg-[#FFD11A]'
                    : 'bg-[#2EAD4B]'
                : 'bg-muted'
            }`}
          />
        ))}
      </div>
      {forca > 0 && (
        <p className={`text-xs ${
          forca <= 1 ? 'text-destructive' : forca <= 2 ? 'text-[#FFD11A]' : 'text-[#2EAD4B]'
        }`}>
          {labels[forca]}
        </p>
      )}
    </div>
  );
}

export default function LoginPage() {
  const { isAuthenticated, login, registrar, loginGoogle } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) navigate('/', { replace: true });
  }, [isAuthenticated, navigate]);

  const [modo, setModo] = useState('login');
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [loading, setLoading] = useState(false);

  const senhasNaoCoincidem =
    modo === 'registrar' && confirmarSenha.length > 0 && senha !== confirmarSenha;
  const cadastroValido =
    modo !== 'registrar' || (senha === confirmarSenha && confirmarSenha.length > 0);

  async function handleGoogleSuccess(credentialResponse) {
    try {
      await loginGoogle(credentialResponse.credential);
      navigate('/');
    } catch (err) {
      addToast(err.message, 'error');
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (modo === 'registrar' && senha !== confirmarSenha) {
      addToast('As senhas não coincidem.', 'error');
      return;
    }
    setLoading(true);
    try {
      if (modo === 'login') {
        await login(email, senha);
      } else {
        await registrar(nome, email, senha);
      }
      navigate('/');
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Brand Logo & Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-md bg-primary mb-4">
            <span className="text-primary-foreground font-bold text-lg">
              FS
            </span>
          </div>
          <h1 className="font-semibold text-3xl tracking-tight text-foreground">
            FinSync
          </h1>
          <p className="text-muted-foreground text-sm mt-2 font-medium">
            {modo === 'login' ? 'Controle financeiro inteligente' : 'Crie sua conta para começar'}
          </p>
        </div>

        {/* Wise-Style Auth Card */}
        <Card className="p-6 shadow-sm">
          {/* Google Login Button */}
          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => addToast('Erro ao conectar com Google.', 'error')}
              text={modo === 'login' ? 'signin_with' : 'signup_with'}
              shape="rectangular"
              width="380"
              logo_alignment="center"
            />
          </div>

          {/* Separator */}
          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-card px-3 text-muted-foreground">ou</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {modo === 'registrar' && (
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-foreground">
                  Nome Completo
                </label>
                <Input
                  type="text"
                  required
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Seu nome"
                />
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-foreground">
                Email
              </label>
              <Input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-foreground">
                Senha
              </label>
              <Input
                type="password"
                required
                minLength={8}
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="Mínimo 8 caracteres"
              />
              {modo === 'registrar' && <IndicadorForcaSenha senha={senha} />}
            </div>

            {modo === 'registrar' && (
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-foreground">
                  Confirmar Senha
                </label>
                <Input
                  type="password"
                  required
                  value={confirmarSenha}
                  onChange={(e) => setConfirmarSenha(e.target.value)}
                  placeholder="Repita a senha"
                  className={senhasNaoCoincidem ? 'border-destructive focus-visible:ring-destructive' : ''}
                />
                {senhasNaoCoincidem && (
                  <p className="text-xs text-destructive">As senhas não coincidem.</p>
                )}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading || !cadastroValido}
              variant="default"
              size="default"
              className="w-full mt-4"
            >
              {loading ? (
                <span className="inline-block w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2" />
              ) : null}
              {loading ? 'Aguarde...' : modo === 'login' ? 'Entrar' : 'Criar Conta'}
            </Button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  setModo(modo === 'login' ? 'registrar' : 'login');
                  setNome('');
                  setEmail('');
                  setSenha('');
                  setConfirmarSenha('');
                }}
                className="text-sm font-medium text-primary hover:underline"
              >
                {modo === 'login'
                  ? 'Não tem conta? Cadastre-se'
                  : 'Já tem conta? Faça login'}
              </button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
