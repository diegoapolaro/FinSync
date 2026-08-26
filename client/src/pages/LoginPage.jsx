import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { cn } from '@/lib/utils';
import logoSymbol from '@/assets/logo-symbol.png';

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
                    ? 'bg-laranja'
                    : 'bg-entrada'
                : 'bg-muted'
            }`}
          />
        ))}
      </div>
      {forca > 0 && (
        <p
          className={`text-xs font-semibold ${
            forca <= 1 ? 'text-destructive' : forca <= 2 ? 'text-laranja' : 'text-entrada'
          }`}
        >
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
    <div className="min-h-screen bg-background relative flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md relative z-10">
        {/* Brand Logo & Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-card border border-border/80 p-2 mb-3 shadow-sm overflow-hidden">
            <img src={logoSymbol} alt="FinSync Logo" className="w-full h-full object-contain" />
          </div>
          <h1 className="font-normal text-3xl tracking-[-0.03em] text-foreground">FinSync</h1>
          <p className="text-muted-foreground text-sm mt-1 font-medium">
            {modo === 'login'
              ? 'Seu dinheiro, elegantemente organizado.'
              : 'Crie sua conta para começar.'}
          </p>
        </div>

        {/* Auth Card */}
        <Card className="p-6 md:p-8 border border-border rounded-2xl">
          {/* Google Login Button */}
          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => addToast('Erro ao conectar com Google.', 'error')}
              text={modo === 'login' ? 'signin_with' : 'signup_with'}
              shape="pill"
              width="380"
              logo_alignment="center"
            />
          </div>

          {/* Separator */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-card px-3 text-muted-foreground uppercase tracking-wider font-semibold">
                ou
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {modo === 'registrar' && (
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Nome Completo
                </label>
                <Input
                  type="text"
                  required
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Seu nome"
                  className="rounded-xl h-11 bg-secondary border-border"
                />
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Email
              </label>
              <Input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="rounded-xl h-11 bg-secondary border-border"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Senha
              </label>
              <Input
                type="password"
                required
                minLength={8}
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="Mínimo 8 caracteres"
                className="rounded-xl h-11 bg-secondary border-border"
              />
              {modo === 'registrar' && <IndicadorForcaSenha senha={senha} />}
            </div>

            {modo === 'registrar' && (
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Confirmar Senha
                </label>
                <Input
                  type="password"
                  required
                  value={confirmarSenha}
                  onChange={(e) => setConfirmarSenha(e.target.value)}
                  placeholder="Repita a senha"
                  className={cn(
                    'rounded-xl h-11 bg-secondary border-border',
                    senhasNaoCoincidem ? 'border-destructive focus-visible:ring-destructive' : '',
                  )}
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
              size="lg"
              className="w-full mt-3 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold tracking-tight"
            >
              {loading ? (
                <span className="inline-block w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2" />
              ) : null}
              {loading ? 'Aguarde...' : modo === 'login' ? 'Entrar no FinSync' : 'Criar Conta'}
            </Button>

            <div className="text-center pt-3">
              <button
                type="button"
                onClick={() => {
                  setModo(modo === 'login' ? 'registrar' : 'login');
                  setNome('');
                  setEmail('');
                  setSenha('');
                  setConfirmarSenha('');
                }}
                className="text-xs font-semibold text-primary hover:underline"
              >
                {modo === 'login'
                  ? 'Não tem uma conta? Cadastre-se gratuitamente'
                  : 'Já possui uma conta? Faça login'}
              </button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
