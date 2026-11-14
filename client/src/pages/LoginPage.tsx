import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { PasswordInput } from '../components/ui/password-input';
import { cn } from '@/lib/utils';
import logoSymbol from '@/assets/logo-symbol.png';
import {
  ArrowRight,
  FileBadge,
  ShieldCheck,
  CheckCircle2,
  Mail,
  HelpCircle,
  TrendingUp,
  ArrowDownLeft,
  ArrowUpRight,
} from 'lucide-react';

/* ─── Indicador de Força de Senha ──────────────────────── */
function IndicadorForcaSenha({ senha }: { senha?: string }) {
  const calcularForca = (s: string) => {
    let score = 0;
    if (s.length >= 8) score++;
    if (/[a-z]/.test(s) && /[A-Z]/.test(s)) score++;
    if (/\d/.test(s)) score++;
    if (/[^a-zA-Z0-9]/.test(s)) score++;
    return score;
  };

  const forca = calcularForca(senha || '');
  const labels = ['', 'Fraca', 'Razoável', 'Boa', 'Forte'];

  if (!senha) return null;

  return (
    <div className="space-y-1 mt-1.5">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((level) => (
          <div
            key={level}
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              forca >= level
                ? level <= 1
                  ? 'bg-destructive'
                  : level <= 2
                    ? 'bg-amber-500'
                    : 'bg-brand-lime'
                : 'bg-brand-fog'
            }`}
          />
        ))}
      </div>
      {forca > 0 && (
        <p
          className={`text-xs font-semibold ${
            forca <= 1 ? 'text-destructive' : forca <= 2 ? 'text-amber-500' : 'text-brand-forest'
          }`}
        >
          {labels[forca]}
        </p>
      )}
    </div>
  );
}

/* ─── Brand Metrics Showcase (Painel Esquerdo - Wise Style) ──────────────────────── */
function BrandPanel() {
  return (
    <section
      className="hidden lg:flex lg:w-[52%] xl:w-[54%] bg-brand-forest text-brand-paper relative overflow-hidden flex-col justify-between p-8 sm:p-12 lg:p-14 select-none"
      data-purpose="brand-metrics-showcase"
    >
      {/* Brilhos ambientais sutis */}
      <div className="absolute -top-40 -left-40 w-[550px] h-[550px] bg-brand-lime/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[450px] h-[450px] bg-brand-lime/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Topo: Logo oficial verde & Status de Conexão */}
      <div className="relative z-10">
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            {/* Logo do Site com símbolo verde e contraste perfeito */}
            <div className="w-11 h-11 rounded-xl bg-brand-forestDark/80 border border-white/15 flex items-center justify-center p-2 shadow-lg shadow-black/30 backdrop-blur-md">
              <img
                src={logoSymbol}
                alt="FinSync Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-black tracking-tight text-white leading-none">
                FinSync
              </span>
              <span className="text-[11px] text-brand-linen/70 font-medium tracking-wide mt-1">
                Inteligência em Fluxo de Caixa
              </span>
            </div>
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm text-[11px] text-brand-linen/90 font-medium">
            <span className="w-2 h-2 rounded-full bg-brand-lime animate-pulse" />
            <span>Open Finance Ativo</span>
          </div>
        </header>

        {/* Tipografia Editorial Wise */}
        <div className="max-w-xl">
          <p className="text-xs uppercase tracking-widest text-brand-lime font-bold mb-3 flex items-center gap-2">
            <span className="w-4 h-0.5 bg-brand-lime rounded-full" />
            Conciliação & Liquidez Preditiva
          </p>
          <h1 className="text-3xl sm:text-4xl xl:text-[42px] leading-[1.12] font-black tracking-tight text-white mb-4">
            O dinheiro da sua empresa, nítido até o último centavo.
          </h1>
          <p className="text-brand-linen/80 text-base sm:text-lg font-normal leading-relaxed max-w-lg">
            Unifique contas bancárias, maquininhas de cartão e boletos em um fluxo contínuo em tempo real, sem surpresas no fechamento.
          </p>
        </div>
      </div>

      {/* Visual de Conciliação / Micro-Ledger Coeso */}
      <div className="relative z-10 my-6 max-w-xl">
        <div className="rounded-2xl border border-white/15 bg-brand-forestDark/75 backdrop-blur-xl shadow-2xl overflow-hidden">
          {/* Header do Ledger */}
          <div className="p-5 pb-4 border-b border-white/10 flex items-center justify-between">
            <div>
              <div className="text-[11px] font-semibold text-brand-linen/60 uppercase tracking-wider mb-1">
                Posição Líquida Consolidada
              </div>
              <div className="flex items-baseline gap-3">
                <span className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                  R$ 248.910<span className="text-brand-lime font-normal text-2xl sm:text-3xl">,40</span>
                </span>
                <span className="inline-flex items-center gap-1 text-xs font-bold text-brand-lime bg-brand-lime/10 border border-brand-lime/20 px-2 py-0.5 rounded-full">
                  <TrendingUp className="w-3 h-3 stroke-[2.5]" />
                  +18,4%
                </span>
              </div>
            </div>
            <div className="text-right hidden sm:block">
              <div className="text-[11px] text-brand-linen/60 font-medium">Previsão 30 dias</div>
              <div className="text-sm font-bold text-white tracking-tight font-mono">
                R$ 312.450,00
              </div>
            </div>
          </div>

          {/* Mini Bank Sync Row */}
          <div className="px-5 py-2.5 bg-white/[0.03] border-b border-white/5 flex items-center justify-between text-xs text-brand-linen/70">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 font-medium text-white/90">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-lime" />
                3 conexões ativas
              </span>
              <span className="text-white/30">|</span>
              <div className="flex items-center gap-2 text-[11px] text-brand-linen/60">
                <span>Itaú PJ</span>
                <span>•</span>
                <span>Stone POS</span>
                <span>•</span>
                <span>Banco Inter</span>
              </div>
            </div>
            <span className="text-[11px] text-brand-lime/80 font-mono">há 2 min</span>
          </div>

          {/* Dynamic Live Transaction Stream */}
          <div className="divide-y divide-white/5 text-xs">
            {/* Item 1: Entrada */}
            <div className="p-3.5 px-5 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-brand-lime/15 border border-brand-lime/30 flex items-center justify-center text-brand-lime shrink-0">
                  <ArrowDownLeft className="w-3.5 h-3.5 stroke-[2.5]" />
                </div>
                <div className="truncate">
                  <p className="font-medium text-white truncate">
                    Recebíveis de Cartão (Lote Stone)
                  </p>
                  <p className="text-[11px] text-brand-linen/60">
                    Conciliado automaticamente • Maquininha
                  </p>
                </div>
              </div>
              <div className="text-right shrink-0 pl-3">
                <span className="font-semibold text-brand-lime tracking-tight font-mono">
                  + R$ 14.820,00
                </span>
                <span className="block text-[10px] text-brand-linen/50 font-mono">14:32</span>
              </div>
            </div>

            {/* Item 2: Saída */}
            <div className="p-3.5 px-5 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-white/10 border border-white/10 flex items-center justify-center text-brand-linen/80 shrink-0">
                  <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
                </div>
                <div className="truncate">
                  <p className="font-medium text-white truncate">
                    Fornecedor Matéria-Prima — NFe #4081
                  </p>
                  <p className="text-[11px] text-brand-linen/60">
                    Boleto liquidado • DDA Itaú
                  </p>
                </div>
              </div>
              <div className="text-right shrink-0 pl-3">
                <span className="font-semibold text-white/90 tracking-tight font-mono">
                  - R$ 3.490,50
                </span>
                <span className="block text-[10px] text-brand-linen/50 font-mono">12:15</span>
              </div>
            </div>
          </div>

          {/* Micro Stats Strip */}
          <div className="p-4 bg-brand-forest/90 border-t border-white/10 grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-[11px] text-brand-linen/60 block">Índice de Conciliação</span>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-base font-bold text-white font-mono">99,8%</span>
                <span className="text-[10px] text-brand-lime font-medium">Zero divergências</span>
              </div>
            </div>
            <div>
              <span className="text-[11px] text-brand-linen/60 block">Tempo Economizado</span>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-base font-bold text-white font-mono">~18h/mês</span>
                <span className="text-[10px] text-brand-linen/70 font-medium">por empresa</span>
              </div>
            </div>
          </div>
        </div>

        {/* Social Proof */}
        <div className="mt-5 pt-4 flex items-center justify-between text-xs text-brand-linen/80 border-t border-white/10">
          <div className="flex items-center gap-6">
            <div>
              <span className="block text-base font-bold text-white tracking-tight">R$ 1.8 Bi+</span>
              <span className="text-[11px] text-brand-linen/60">Transacionados</span>
            </div>
            <div className="w-px h-6 bg-white/15" />
            <div>
              <span className="block text-base font-bold text-white tracking-tight">14.000+</span>
              <span className="text-[11px] text-brand-linen/60">PMEs ativas</span>
            </div>
            <div className="w-px h-6 bg-white/15 hidden sm:block" />
            <div className="hidden sm:block">
              <div className="flex items-center gap-1 text-brand-lime font-bold text-xs">
                <span>★ 4.9</span>
                <span className="text-[11px] text-brand-linen/60 font-normal">/5.0</span>
              </div>
              <span className="text-[11px] text-brand-linen/60">Satisfação dos clientes</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer de Segurança & Compliance */}
      <footer className="relative z-10 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-4 text-[11px] text-brand-linen/60">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-brand-lime shrink-0" />
          <span>Criptografia Bancária TLS 1.3 & AES-256</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-brand-lime" />
          <span>Regulado pelo Banco Central do Brasil</span>
        </div>
        <div>
          <span className="font-mono">ISO 27001 Certified</span>
        </div>
      </footer>
    </section>
  );
}

/* ─── Página Principal ─────────────────────────────────── */
export default function LoginPage(): React.ReactElement {
  const { isAuthenticated, login, registrar, loginGoogle } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) navigate('/', { replace: true });
  }, [isAuthenticated, navigate]);

  const [modo, setModo] = useState<'login' | 'registrar'>('login');
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [lembrarDispositivo, setLembrarDispositivo] = useState(true);
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

  async function handleGoogleSuccess(credentialResponse: any) {
    try {
      await loginGoogle(credentialResponse.credential);
      navigate('/');
    } catch (err: any) {
      addToast(err.message, 'error');
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
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
    } catch (err: any) {
      setErro(err.message);
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }

  function handleSuporte() {
    addToast('Nosso canal de suporte via WhatsApp e e-mail está ativo: suporte@finsync.app', 'info');
  }

  function handleCertificadoDigital() {
    addToast('Em breve: autenticação segura via Certificado Digital e-CNPJ A1/A3 ICP-Brasil.', 'info');
  }

  return (
    <main className="min-h-screen w-full flex flex-col lg:flex-row bg-brand-fog text-brand-graphite selection:bg-brand-lime selection:text-brand-forest">
      {/* ──── Lado Esquerdo: Brand Metrics Showcase ──── */}
      <BrandPanel />

      {/* ──── Lado Direito: Formulário de Autenticação ──── */}
      <section
        className="w-full lg:w-[48%] xl:w-[46%] bg-brand-paper flex flex-col justify-between p-6 sm:p-10 lg:p-14 relative"
        data-purpose="authentication-form-container"
      >
        {/* Top Utility / Suporte Bar & Header Mobile */}
        <header className="flex justify-between items-center w-full mb-6">
          {/* Header Mobile com a logo verde oficial */}
          <div className="lg:hidden flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-brand-forest flex items-center justify-center p-1.5 shadow-md shadow-brand-forestDark/40">
              <img src={logoSymbol} alt="FinSync Logo" className="w-full h-full object-contain" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-black text-brand-forest tracking-tight leading-none">
                FinSync
              </span>
              <span className="text-[10px] text-brand-muted font-medium mt-0.5">
                Inteligência Financeira
              </span>
            </div>
          </div>

          <div className="ml-auto text-xs font-medium text-brand-muted flex items-center gap-2">
            <span>Precisa de ajuda?</span>
            <button
              type="button"
              onClick={handleSuporte}
              className="text-brand-forest font-semibold hover:underline flex items-center gap-1 transition-colors"
            >
              Falar com suporte
              <HelpCircle className="w-3.5 h-3.5" />
            </button>
          </div>
        </header>

        {/* Center Form Wrapper */}
        <div className="w-full max-w-md mx-auto my-auto py-4">
          {/* Welcome Header */}
          <div className="mb-6">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-brand-graphite tracking-tight mb-2">
              {modo === 'login' ? 'Bem-vindo de volta' : 'Criar sua conta'}
            </h2>
            <p className="text-brand-muted text-sm leading-relaxed">
              {modo === 'login'
                ? 'Entre com suas credenciais para continuar.'
                : 'Preencha os dados abaixo para começar.'}
            </p>
          </div>

          {/* Pill Segmented Control (Wise Style Tab) */}
          <div
            aria-label="Opções de Acesso"
            className="bg-brand-fog p-1 rounded-full flex items-center mb-6 text-sm font-semibold border border-brand-fog"
            role="tablist"
          >
            <button
              role="tab"
              type="button"
              aria-selected={modo === 'login'}
              onClick={() => {
                if (modo !== 'login') {
                  setModo('login');
                  resetForm();
                }
              }}
              className={cn(
                'flex-1 py-2 rounded-full font-bold text-center transition-all focus:outline-none',
                modo === 'login'
                  ? 'bg-brand-lime text-brand-forest shadow-sm'
                  : 'text-brand-muted hover:text-brand-graphite',
              )}
            >
              Entrar
            </button>
            <button
              role="tab"
              type="button"
              aria-selected={modo === 'registrar'}
              onClick={() => {
                if (modo !== 'registrar') {
                  setModo('registrar');
                  resetForm();
                }
              }}
              className={cn(
                'flex-1 py-2 rounded-full font-bold text-center transition-all focus:outline-none',
                modo === 'registrar'
                  ? 'bg-brand-lime text-brand-forest shadow-sm'
                  : 'text-brand-muted hover:text-brand-graphite',
              )}
            >
              Criar Conta
            </button>
          </div>

          {/* Social Fast Login & e-CNPJ */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
            {/* Google OAuth Login Container */}
            <div className="w-full flex items-center justify-center">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => addToast('Erro ao conectar com Google.', 'error')}
                text={modo === 'login' ? 'signin_with' : 'signup_with'}
                shape="pill"
                theme="outline"
                size="large"
                width="200"
                logo_alignment="left"
              />
            </div>

            {/* Certificado Digital e-CNPJ Button */}
            <button
              type="button"
              onClick={handleCertificadoDigital}
              className="w-full h-10 flex items-center justify-center gap-2 px-3 border border-brand-fog rounded-full bg-brand-paper hover:bg-brand-fog/50 text-brand-graphite text-xs font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-brand-lime"
            >
              <FileBadge className="w-4 h-4 text-brand-forest shrink-0" />
              <span>Certificado e-CNPJ</span>
            </button>
          </div>

          {/* Divisor */}
          <div className="relative flex items-center justify-center my-5">
            <div className="border-t border-brand-fog w-full" />
            <span className="bg-brand-paper px-3 text-xs uppercase tracking-wider text-brand-muted font-medium absolute">
              ou com seu e-mail corporativo
            </span>
          </div>

          {/* Formulário Principal */}
          <form onSubmit={handleSubmit} className="space-y-4" data-purpose="auth-form">
            {/* Campo Nome (Apenas Cadastro) */}
            {modo === 'registrar' && (
              <div className="space-y-1.5">
                <label
                  htmlFor="nome"
                  className="block text-xs font-bold text-brand-graphite uppercase tracking-wider"
                >
                  Nome Completo
                </label>
                <div className="relative rounded-xl">
                  <Input
                    id="nome"
                    type="text"
                    required
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    placeholder="Seu nome"
                    className="rounded-xl h-11 bg-white border-brand-fog text-brand-graphite placeholder:text-brand-muted/60 focus-visible:ring-brand-lime focus-visible:border-brand-forest"
                  />
                </div>
              </div>
            )}

            {/* Campo Email / CNPJ */}
            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="block text-xs font-bold text-brand-graphite uppercase tracking-wider"
              >
                E-mail ou CNPJ
              </label>
              <div className="relative rounded-xl">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-brand-muted z-10">
                  <Mail className="w-4 h-4" />
                </div>
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="pl-10 rounded-xl h-11 bg-white border-brand-fog text-brand-graphite placeholder:text-brand-muted/60 focus-visible:ring-brand-lime focus-visible:border-brand-forest"
                />
              </div>
            </div>

            {/* Campo Senha */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-xs font-bold text-brand-graphite uppercase tracking-wider"
                >
                  Senha de acesso
                </label>
                {modo === 'login' && (
                  <button
                    type="button"
                    onClick={() => addToast('Recuperação de senha em breve!', 'info')}
                    className="text-xs font-semibold text-brand-forest hover:text-brand-limeHover transition-colors"
                  >
                    Esqueci minha senha
                  </button>
                )}
              </div>
              <PasswordInput
                id="password"
                required
                minLength={8}
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="Mínimo 8 caracteres"
                className="rounded-xl h-11 bg-white border-brand-fog text-brand-graphite placeholder:text-brand-muted/60 focus-visible:ring-brand-lime focus-visible:border-brand-forest"
              />
              {modo === 'registrar' && <IndicadorForcaSenha senha={senha} />}
            </div>

            {/* Campo Confirmar Senha (Apenas Cadastro) */}
            {modo === 'registrar' && (
              <div className="space-y-1.5">
                <label
                  htmlFor="confirmarSenha"
                  className="block text-xs font-bold text-brand-graphite uppercase tracking-wider"
                >
                  Confirmar Senha
                </label>
                <PasswordInput
                  id="confirmarSenha"
                  required
                  value={confirmarSenha}
                  onChange={(e) => setConfirmarSenha(e.target.value)}
                  placeholder="Repita a senha"
                  className={cn(
                    'rounded-xl h-11 bg-white border-brand-fog text-brand-graphite placeholder:text-brand-muted/60 focus-visible:ring-brand-lime focus-visible:border-brand-forest',
                    senhasNaoCoincidem ? 'border-destructive focus-visible:ring-destructive' : '',
                  )}
                />
                {senhasNaoCoincidem && (
                  <p className="text-xs text-destructive font-medium">As senhas não coincidem.</p>
                )}
              </div>
            )}

            {/* Lembrar deste dispositivo (Modo Login) */}
            {modo === 'login' && (
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={lembrarDispositivo}
                    onChange={(e) => setLembrarDispositivo(e.target.checked)}
                    className="w-4 h-4 rounded text-brand-forest border-brand-fog focus:ring-brand-lime accent-brand-forest"
                  />
                  <span className="text-xs text-brand-muted font-medium">
                    Lembrar deste dispositivo por 30 dias
                  </span>
                </label>
              </div>
            )}

            {/* Mensagem de Erro Inline */}
            {erro && (
              <div className="rounded-xl bg-destructive/10 border border-destructive/20 p-3">
                <p className="text-xs sm:text-sm text-destructive font-medium">{erro}</p>
              </div>
            )}

            {/* Botão de Ação Primária CTA */}
            <div className="pt-2">
              <Button
                type="submit"
                disabled={loading || !cadastroValido}
                className="w-full py-3.5 px-6 rounded-full bg-brand-lime hover:bg-brand-limeHover text-brand-forest font-black text-sm tracking-wide shadow-md transition-all flex items-center justify-center gap-2 focus:ring-4 focus:ring-brand-lime/30 h-12"
              >
                {loading && (
                  <span className="inline-block w-4 h-4 border-2 border-brand-forest border-t-transparent rounded-full animate-spin mr-1" />
                )}
                <span>
                  {loading
                    ? 'Entrando...'
                    : modo === 'login'
                      ? 'Entrar'
                      : 'Criar Conta'}
                </span>
                {!loading && <ArrowRight className="w-4 h-4 stroke-[2.5]" />}
              </Button>
            </div>
          </form>

          {/* Alternar Modo (Login <-> Cadastro) */}
          <div className="text-center pt-5 text-xs text-brand-muted">
            <button
              type="button"
              onClick={() => {
                setModo(modo === 'login' ? 'registrar' : 'login');
                resetForm();
              }}
              className="hover:underline transition-colors focus:outline-none"
            >
              {modo === 'login' ? (
                <>Não tem conta? <span className="font-bold text-brand-forest">Criar conta</span></>
              ) : (
                <>Já tem conta? <span className="font-bold text-brand-forest">Entrar</span></>
              )}
            </button>
          </div>
        </div>

        {/* Legal and LGPD Footer */}
        <footer className="w-full text-center text-[11px] text-brand-muted/80 mt-6 pt-4 border-t border-brand-fog flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3">
          <span>© {new Date().getFullYear()} FinSync Tecnologia Financeira S.A.</span>
          <div className="flex items-center gap-2">
            <a href="#termos" className="hover:text-brand-forest underline">
              Termos de Uso
            </a>
            <span>•</span>
            <a href="#privacidade" className="hover:text-brand-forest underline">
              Privacidade & LGPD
            </a>
            <span>•</span>
            <a href="#seguranca" className="hover:text-brand-forest underline">
              Segurança Bancária
            </a>
          </div>
        </footer>
      </section>
    </main>
  );
}
