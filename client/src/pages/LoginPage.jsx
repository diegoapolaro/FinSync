import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { PasswordInput } from '../components/ui/password-input';
import { cn } from '@/lib/utils';
import logoFull from '@/assets/logo-full.png';
import logoSymbol from '@/assets/logo-symbol.png';
import {
  Wallet,
  BarChart3,
  ShieldCheck,
} from 'lucide-react';

/* ─── Indicador de Força de Senha ──────────────────────── */
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

/* ─── Brand Panel (Lado Esquerdo) ──────────────────────── */
function BrandPanel() {
  return (
    <div className="hidden lg:flex lg:w-1/2 relative bg-primary overflow-hidden">
      {/* Fundo com gradiente e pattern abstrato */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-primary-active" />
      
      {/* Pattern decorativo abstrato — grid de pontos */}
      <div className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      {/* Glow decorativo */}
      <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-white/10 blur-3xl" />
      <div className="absolute -top-20 -left-20 w-64 h-64 rounded-full bg-white/5 blur-3xl" />

      {/* Conteúdo */}
      <div className="relative z-10 flex flex-col justify-center px-12 xl:px-16 py-12 w-full">
        {/* Logo */}
        <div className="mb-12">
          <img
            src={logoFull}
            alt="FinSync"
            className="h-10 brightness-0 invert"
          />
        </div>

        {/* Headline */}
        <h1 className="text-4xl xl:text-5xl font-bold text-white leading-[1.15] tracking-tight max-w-lg">
          Controle total das suas finanças, de um jeito simples.
        </h1>

        {/* Subtexto */}
        <p className="mt-5 text-white/70 text-lg max-w-md leading-relaxed">
          Organize receitas e despesas em um só lugar. Pessoal ou comercial, você decide.
        </p>

        {/* Badges de funcionalidade */}
        <div className="flex flex-wrap gap-3 mt-8">
          {[
            { icon: Wallet, label: 'Multi-contas' },
            { icon: BarChart3, label: 'Relatórios visuais' },
            { icon: ShieldCheck, label: '100% seu' },
          ].map(({ icon: Icon, label }) => (
            <span
              key={label}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-white/90 text-sm font-medium border border-white/10"
            >
              <Icon className="w-4 h-4" />
              {label}
            </span>
          ))}
        </div>

        {/* Elemento gráfico abstrato — Composição de cards flutuantes */}
        <div className="mt-12 relative" aria-hidden="true">
          <div className="flex gap-4">
            {/* Card de saldo simulado */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/10 w-52">
              <p className="text-white/60 text-xs font-medium uppercase tracking-wider">Saldo Total</p>
              <p className="text-white text-2xl font-bold font-mono mt-1.5 tabular-nums">
                R$ 12.450
              </p>
              <div className="flex items-center gap-1.5 mt-2">
                <span className="inline-block w-2 h-2 rounded-full bg-[#05b169]" />
                <span className="text-[#05b169] text-xs font-semibold">+8,3%</span>
                <span className="text-white/40 text-xs">este mês</span>
              </div>
            </div>

            {/* Mini card de transação */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/10 w-44 self-end">
              <p className="text-white/60 text-xs font-medium uppercase tracking-wider">Receitas</p>
              <p className="text-[#05b169] text-xl font-bold font-mono mt-1.5 tabular-nums">
                R$ 8.200
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Página Principal ─────────────────────────────────── */
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
  const [erro, setErro] = useState('');

  const senhasNaoCoincidem =
    modo === 'registrar' && confirmarSenha.length > 0 && senha !== confirmarSenha;
  const cadastroValido =
    modo !== 'registrar' || (senha === confirmarSenha && confirmarSenha.length > 0);

  function resetForm() {
    setNome('');
    setEmail('');
    setSenha('');
    setConfirmarSenha('');
    setErro('');
  }

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
    setErro('');
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
      setErro(err.message);
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex bg-background">
      {/* ──── Lado Esquerdo: Brand Panel ──── */}
      <BrandPanel />

      {/* ──── Lado Direito: Formulário ──── */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center px-6 py-12 sm:px-12 overflow-y-auto">
        {/* Header mobile: Logo compacto + headline curto */}
        <div className="lg:hidden text-center mb-8 w-full max-w-md">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-card border border-border/80 p-2 mb-3 shadow-sm overflow-hidden">
            <img src={logoSymbol} alt="FinSync Logo" className="w-full h-full object-contain" />
          </div>
          <h1 className="font-bold text-2xl tracking-tight text-foreground">FinSync</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Suas finanças, elegantemente organizadas.
          </p>
        </div>

        {/* Card do formulário */}
        <Card className="w-full max-w-md p-8 md:p-10 border border-border rounded-2xl">
          {/* Título do formulário */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              {modo === 'login' ? 'Bem-vindo de volta' : 'Criar sua conta'}
            </h2>
            <p className="text-muted-foreground text-sm mt-1.5">
              {modo === 'login'
                ? 'Entre com suas credenciais para continuar.'
                : 'Preencha os dados abaixo para começar.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Campo Nome (só cadastro) */}
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

            {/* Campo Email */}
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

            {/* Campo Senha com toggle de visibilidade */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Senha
              </label>
              <PasswordInput
                required
                minLength={8}
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="Mínimo 8 caracteres"
                className="rounded-xl h-11 bg-secondary border-border"
              />
              {modo === 'registrar' && <IndicadorForcaSenha senha={senha} />}
            </div>

            {/* Campo Confirmar Senha (só cadastro) */}
            {modo === 'registrar' && (
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Confirmar Senha
                </label>
                <PasswordInput
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

            {/* Link "Esqueci minha senha" (só login) */}
            {modo === 'login' && (
              <div className="flex justify-end">
                <button
                  type="button"
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors cursor-not-allowed"
                  title="Em breve"
                  onClick={() => addToast('Recuperação de senha em breve!', 'info')}
                >
                  Esqueci minha senha
                </button>
              </div>
            )}

            {/* Mensagem de erro inline */}
            {erro && (
              <div className="rounded-xl bg-destructive/10 border border-destructive/20 px-4 py-2.5">
                <p className="text-sm text-destructive">{erro}</p>
              </div>
            )}

            {/* Botão principal */}
            <Button
              type="submit"
              disabled={loading || !cadastroValido}
              variant="default"
              size="lg"
              className="w-full rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold tracking-tight"
            >
              {loading && (
                <span className="inline-block w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2" />
              )}
              {loading
                ? 'Entrando...'
                : modo === 'login'
                  ? 'Entrar'
                  : 'Criar Conta'}
            </Button>
          </form>

          {/* Divisor "ou" */}
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

          {/* Google Login */}
          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => addToast('Erro ao conectar com Google.', 'error')}
              text={modo === 'login' ? 'signin_with' : 'signup_with'}
              shape="rectangular"
              theme="outline"
              size="large"
              width="400"
              logo_alignment="left"
            />
          </div>

          {/* Rodapé: alternar modo */}
          <div className="text-center pt-6">
            <button
              type="button"
              onClick={() => {
                setModo(modo === 'login' ? 'registrar' : 'login');
                resetForm();
              }}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {modo === 'login' ? (
                <>Não tem conta? <span className="text-primary font-semibold">Criar conta</span></>
              ) : (
                <>Já tem conta? <span className="text-primary font-semibold">Entrar</span></>
              )}
            </button>
          </div>
        </Card>

        {/* Footer discreto */}
        <p className="text-xs text-muted-foreground mt-8">
          © {new Date().getFullYear()} FinSync. Todos os direitos reservados.
        </p>
      </div>
    </div>
  );
}
