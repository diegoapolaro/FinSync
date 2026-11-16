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
                : 'bg-brand-borderDark'
            }`}
          />
        ))}
      </div>
      {forca > 0 && (
        <p
          className={`text-xs font-semibold ${
            forca <= 1 ? 'text-destructive' : forca <= 2 ? 'text-amber-500' : 'text-brand-lime'
          }`}
        >
          {labels[forca]}
        </p>
      )}
    </div>
  );
}

/* ─── Brand Metrics Showcase (Painel Esquerdo - Wise Dark Style) ──────────────────────── */
function BrandPanel() {
  return (
    <section
      className="hidden lg:flex lg:w-[54%] bg-brand-forestDeep text-brand-darkPaper relative overflow-hidden flex-col justify-between p-8 sm:p-12 lg:p-16 border-r border-brand-borderDark/60 select-none custom-scrollbar"
      data-purpose="brand-metrics-showcase"
    >
      {/* Subtle Ambient Atmosphere Glows */}
      <div className="absolute -top-40 -left-40 w-[550px] h-[550px] bg-brand-lime/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[450px] h-[450px] bg-brand-lime/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Header & Integrated Status */}
      <div className="relative z-10">
        <header className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-lime flex items-center justify-center p-1.5 shadow-lg shadow-brand-lime/10">
              <img
                src={logoSymbol}
                alt="FinSync Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight text-white leading-none">
                FinSync
              </span>
              <span className="text-[11px] text-brand-darkMuted font-medium tracking-wide mt-1">
                Inteligência em Fluxo de Caixa
              </span>
            </div>
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] border border-brand-borderDark backdrop-blur-sm text-[11px] text-brand-linen/90 font-medium">
            <span className="w-2 h-2 rounded-full bg-brand-lime animate-pulse" />
            <span>Open Finance Ativo</span>
          </div>
        </header>

        {/* Editorial Display Typography */}
        <div className="max-w-xl">
          <p className="text-xs uppercase tracking-widest text-brand-lime font-bold mb-3 flex items-center gap-2">
            <span className="w-4 h-0.5 bg-brand-lime rounded-full" />
            Conciliação &amp; Liquidez Preditiva
          </p>
          <h1 className="text-3xl sm:text-4xl lg:text-[40px] leading-[1.12] font-black tracking-tight text-white mb-4">
            O dinheiro da sua empresa, nítido até o último centavo.
          </h1>
          <p className="text-brand-darkMuted text-base sm:text-lg font-normal leading-relaxed max-w-lg">
            Unifique contas bancárias, maquininhas de cartão e boletos em um fluxo contínuo em tempo real, sem surpresas no fechamento.
          </p>
        </div>
      </div>

      {/* Bespoke Cohesive Cashflow Engine & Micro-ledger Visual */}
      <div className="relative z-10 my-8 max-w-xl">
        <div className="rounded-2xl border border-brand-borderDark bg-[#0d1609]/90 backdrop-blur-xl shadow-2xl overflow-hidden">
          {/* Ledger Header Bar */}
          <div className="p-5 pb-4 border-b border-brand-borderDark/80 flex items-center justify-between">
            <div>
              <div className="text-[11px] font-semibold text-brand-darkMuted uppercase tracking-wider mb-1">
                Posição Líquida Consolidada
              </div>
              <div className="flex items-baseline gap-3">
                <span className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                  R$ 248.910<span className="text-brand-lime font-normal text-2xl sm:text-3xl">,40</span>
                </span>
                <span className="inline-flex items-center gap-1 text-xs font-bold text-brand-lime bg-brand-lime/10 border border-brand-lime/25 px-2 py-0.5 rounded-full">
                  <TrendingUp className="w-3 h-3 stroke-[2.5]" />
                  +18,4%
                </span>
              </div>
            </div>
            <div className="text-right hidden sm:block">
              <div className="text-[11px] text-brand-darkMuted">Previsão 30 dias</div>
              <div className="text-sm font-bold text-white tracking-tight font-mono">
                R$ 312.450,00
              </div>
            </div>
          </div>

          {/* Mini Bank Sync Row */}
          <div className="px-5 py-2.5 bg-black/20 border-b border-brand-borderDark/60 flex items-center justify-between text-xs text-brand-darkMuted">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 font-medium text-white/90">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-lime" />
                3 conexões ativas
              </span>
              <span className="text-white/20">|</span>
              <div className="flex items-center gap-2 text-[11px] text-brand-darkMuted">
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
          <div className="divide-y divide-brand-borderDark/50 text-xs">
            {/* Item 1 */}
            <div className="p-3.5 px-5 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-brand-lime/15 border border-brand-lime/30 flex items-center justify-center text-brand-lime shrink-0">
                  <ArrowDownLeft className="w-3.5 h-3.5 stroke-[2.5]" />
                </div>
                <div className="truncate">
                  <p className="font-medium text-white truncate">Recebíveis de Cartão (Lote Stone)</p>
                  <p className="text-[11px] text-brand-darkMuted">Conciliado automaticamente • Maquininha</p>
                </div>
              </div>
              <div className="text-right shrink-0 pl-3">
                <span className="font-semibold text-brand-lime tracking-tight font-mono">+ R$ 14.820,00</span>
                <span className="block text-[10px] text-brand-darkMuted/70 font-mono">14:32</span>
              </div>
            </div>

            {/* Item 2 */}
            <div className="p-3.5 px-5 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-brand-linen/80 shrink-0">
                  <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
                </div>
                <div className="truncate">
                  <p className="font-medium text-white truncate">Fornecedor Matéria-Prima — NFe #4081</p>
                  <p className="text-[11px] text-brand-darkMuted">Boleto liquidado • DDA Itaú</p>
                </div>
              </div>
              <div className="text-right shrink-0 pl-3">
                <span className="font-semibold text-white/90 tracking-tight font-mono">- R$ 3.490,50</span>
                <span className="block text-[10px] text-brand-darkMuted/70 font-mono">12:15</span>
              </div>
            </div>
          </div>

          {/* Micro Stats Strip in Card */}
          <div className="p-4 bg-[#091004]/90 border-t border-brand-borderDark/80 grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-[11px] text-brand-darkMuted block">Índice de Conciliação</span>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-base font-bold text-white font-mono">99,8%</span>
                <span className="text-[10px] text-brand-lime font-medium">Zero divergências</span>
              </div>
            </div>
            <div>
              <span className="text-[11px] text-brand-darkMuted block">Tempo Economizado</span>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-base font-bold text-white font-mono">~18h/mês</span>
                <span className="text-[10px] text-brand-darkMuted font-medium">por empresa</span>
              </div>
            </div>
          </div>
        </div>

        {/* Subtle Editorial Social Proof */}
        <div className="mt-5 pt-4 flex items-center justify-between text-xs text-brand-darkMuted border-t border-brand-borderDark/60">
          <div className="flex items-center gap-6">
            <div>
              <span className="block text-base font-bold text-white tracking-tight">R$ 1.8 Bi+</span>
              <span className="text-[11px] text-brand-darkMuted">Transacionados</span>
            </div>
            <div className="w-px h-6 bg-brand-borderDark" />
            <div>
              <span className="block text-base font-bold text-white tracking-tight">14.000+</span>
              <span className="text-[11px] text-brand-darkMuted">PMEs ativas</span>
            </div>
            <div className="w-px h-6 bg-brand-borderDark hidden sm:block" />
            <div className="hidden sm:block">
              <div className="flex items-center gap-1 text-brand-lime font-bold text-xs">
                <span>★ 4.9</span>
                <span className="text-[11px] text-brand-darkMuted font-normal">/5.0</span>
              </div>
              <span className="text-[11px] text-brand-darkMuted">Satisfação dos clientes</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Security & Compliance Bar */}
      <footer className="relative z-10 pt-4 border-t border-brand-borderDark/60 flex flex-wrap items-center justify-between gap-4 text-[11px] text-brand-darkMuted">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-brand-lime shrink-0" />
          <span>Criptografia Bancária TLS 1.3 &amp; AES-256</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-brand-lime" />
          <span>Regulado pelo Banco Central do Brasil</span>
        </div>
        <div>
          <span className="font-mono text-brand-darkMuted/80">ISO 27001 Certified</span>
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

  useEffect(() => {
    const root = document.documentElement;
    const previousDark = root.classList.contains('dark');
    root.classList.add('dark');
    return () => {
      if (!previousDark) {
        root.classList.remove('dark');
      }
    };
  }, []);

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
    <main className="dark min-h-screen w-full flex flex-col lg:flex-row bg-brand-authBg text-brand-darkPaper selection:bg-brand-lime selection:text-[#0b1404]">
      {/* ──── Lado Esquerdo: Brand Metrics Showcase ──── */}
      <BrandPanel />

      {/* ──── Lado Direito: Formulário de Autenticação (Modo Escuro) ──── */}
      <section
        className="w-full lg:w-[46%] bg-brand-authBg flex flex-col justify-between p-6 sm:p-12 lg:p-16 relative"
        data-purpose="authentication-form-container"
      >
        {/* Top Utility / Suporte Bar & Header Mobile */}
        <header className="flex justify-between items-center w-full mb-8">
          {/* Header Mobile com a logo verde oficial */}
          <div className="lg:hidden flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-brand-lime flex items-center justify-center p-1.5 shadow-md shadow-brand-lime/10">
              <img src={logoSymbol} alt="FinSync Logo" className="w-full h-full object-contain" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-black text-white tracking-tight leading-none">
                FinSync
              </span>
              <span className="text-[10px] text-brand-darkMuted font-medium mt-0.5">
                Inteligência Financeira
              </span>
            </div>
          </div>

          <div className="ml-auto text-xs font-medium text-brand-darkMuted flex items-center gap-2">
            <span>Precisa de ajuda?</span>
            <button
              type="button"
              onClick={handleSuporte}
              className="text-brand-lime hover:text-brand-limeHover font-semibold hover:underline flex items-center gap-1 transition-colors"
            >
              Falar com suporte
              <HelpCircle className="w-3.5 h-3.5" />
            </button>
          </div>
        </header>

        {/* Center Form Wrapper */}
        <div className="w-full max-w-md mx-auto my-auto py-2">
          {/* Welcome Header */}
          <div className="mb-6">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-brand-darkPaper tracking-tight mb-2">
              {modo === 'login' ? 'Bem-vindo de volta' : 'Criar sua conta'}
            </h2>
            <p className="text-brand-darkMuted text-sm leading-relaxed">
              {modo === 'login'
                ? 'Entre com suas credenciais para continuar.'
                : 'Preencha os dados abaixo para começar.'}
            </p>
          </div>

          {/* Pill Segmented Control (Wise Style Tab) */}
          <div
            aria-label="Opções de Acesso"
            className="bg-brand-authCard p-1 rounded-full flex items-center mb-6 text-sm font-semibold border border-brand-borderDark"
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
                  ? 'bg-brand-lime text-[#0b1404] shadow-sm'
                  : 'text-brand-darkMuted hover:text-brand-darkPaper',
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
                  ? 'bg-brand-lime text-[#0b1404] shadow-sm'
                  : 'text-brand-darkMuted hover:text-brand-darkPaper',
              )}
            >
              Criar Conta
            </button>
          </div>

          {/* Social Fast Login & e-CNPJ */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
            {/* Google OAuth Login Container */}
            <div className="w-full flex items-center justify-center">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => addToast('Erro ao conectar com Google.', 'error')}
                text={modo === 'login' ? 'signin_with' : 'signup_with'}
                shape="pill"
                theme="filled_black"
                size="large"
                width="200"
                logo_alignment="left"
              />
            </div>

            {/* Certificado Digital e-CNPJ Button */}
            <button
              type="button"
              onClick={handleCertificadoDigital}
              className="w-full h-10 flex items-center justify-center gap-2 px-3 border border-brand-borderDark rounded-full bg-brand-authCard hover:bg-[#192712] text-brand-darkPaper text-xs font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-brand-lime cursor-pointer"
            >
              <FileBadge className="w-4 h-4 text-brand-lime shrink-0" />
              <span>Certificado e-CNPJ</span>
            </button>
          </div>

          {/* Divisor */}
          <div className="relative flex items-center justify-center my-6">
            <div className="border-t border-brand-borderDark w-full" />
            <span className="bg-brand-authBg px-3 text-xs uppercase tracking-wider text-brand-darkMuted font-medium absolute">
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
                  className="block text-xs font-bold text-brand-darkMuted uppercase tracking-wider"
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
                    className="rounded-xl h-12 bg-brand-authCard border-brand-inputBorder text-brand-darkPaper placeholder:text-brand-darkMuted/40 focus-visible:ring-1 focus-visible:ring-brand-lime focus-visible:border-brand-lime"
                  />
                </div>
              </div>
            )}

            {/* Campo Email / CNPJ */}
            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="block text-xs font-bold text-brand-darkMuted uppercase tracking-wider"
              >
                E-mail ou CNPJ
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-brand-darkMuted z-10">
                  <Mail className="w-4 h-4" />
                </div>
                <Input
                  id="email"
                  type="email"
                  name="identifier"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="block w-full pl-10 pr-4 py-3 rounded-xl border border-brand-inputBorder bg-brand-authCard text-sm text-brand-darkPaper placeholder:text-brand-darkMuted/40 focus-visible:border-brand-lime focus-visible:ring-1 focus-visible:ring-brand-lime transition-colors h-12"
                />
              </div>
            </div>

            {/* Campo Senha */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-xs font-bold text-brand-darkMuted uppercase tracking-wider"
                >
                  Senha de acesso
                </label>
                {modo === 'login' && (
                  <button
                    type="button"
                    onClick={() => addToast('Recuperação de senha em breve!', 'info')}
                    className="text-xs font-semibold text-brand-lime hover:text-brand-limeHover transition-colors"
                  >
                    Esqueci minha senha
                  </button>
                )}
              </div>
              <PasswordInput
                id="password"
                name="password"
                required
                minLength={8}
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="Mínimo 8 caracteres"
                className="rounded-xl h-12 border border-brand-inputBorder bg-brand-authCard text-sm text-brand-darkPaper placeholder:text-brand-darkMuted/40 focus-visible:border-brand-lime focus-visible:ring-1 focus-visible:ring-brand-lime transition-colors"
              />
              {modo === 'registrar' && <IndicadorForcaSenha senha={senha} />}
            </div>

            {/* Campo Confirmar Senha (Apenas Cadastro) */}
            {modo === 'registrar' && (
              <div className="space-y-1.5">
                <label
                  htmlFor="confirmarSenha"
                  className="block text-xs font-bold text-brand-darkMuted uppercase tracking-wider"
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
                    'rounded-xl h-12 border border-brand-inputBorder bg-brand-authCard text-sm text-brand-darkPaper placeholder:text-brand-darkMuted/40 focus-visible:border-brand-lime focus-visible:ring-1 focus-visible:ring-brand-lime transition-colors',
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
                    name="remember_device"
                    checked={lembrarDispositivo}
                    onChange={(e) => setLembrarDispositivo(e.target.checked)}
                    className="w-4 h-4 rounded text-brand-lime bg-brand-authCard border-brand-inputBorder focus:ring-brand-lime focus:ring-offset-brand-authBg accent-brand-lime"
                  />
                  <span className="text-xs text-brand-darkMuted font-medium">
                    Lembrar deste dispositivo por 30 dias
                  </span>
                </label>
              </div>
            )}

            {/* Mensagem de Erro Inline */}
            {erro && (
              <div className="rounded-xl bg-destructive/15 border border-destructive/30 p-3">
                <p className="text-xs sm:text-sm text-destructive font-medium">{erro}</p>
              </div>
            )}

            {/* Botão de Ação Primária CTA */}
            <div className="pt-2">
              <Button
                type="submit"
                disabled={loading || !cadastroValido}
                className="w-full py-3.5 px-6 rounded-full bg-brand-lime hover:bg-brand-limeHover disabled:opacity-50 disabled:cursor-not-allowed text-[#0b1404] font-extrabold text-sm tracking-wide shadow-lg shadow-brand-lime/20 transition-all flex items-center justify-center gap-2 focus:ring-4 focus:ring-brand-lime/30 h-12 cursor-pointer"
              >
                {loading && (
                  <span className="inline-block w-4 h-4 border-2 border-[#0b1404] border-t-transparent rounded-full animate-spin mr-1" />
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
          <div className="text-center pt-5 text-xs text-brand-darkMuted">
            <button
              type="button"
              onClick={() => {
                setModo(modo === 'login' ? 'registrar' : 'login');
                resetForm();
              }}
              className="hover:underline transition-colors focus:outline-none"
            >
              {modo === 'login' ? (
                <>
                  Não tem conta?{' '}
                  <span className="font-bold text-brand-lime hover:underline">
                    Criar conta
                  </span>
                </>
              ) : (
                <>
                  Já tem conta?{' '}
                  <span className="font-bold text-brand-lime hover:underline">
                    Entrar
                  </span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Legal and LGPD Footer */}
        <footer className="w-full text-center text-[11px] text-brand-darkMuted mt-8 pt-4 border-t border-brand-borderDark flex flex-col sm:flex-row items-center justify-center gap-3">
          <span>© {new Date().getFullYear()} FinSync Tecnologia Financeira S.A.</span>
          <div className="flex items-center gap-2">
            <a href="#termos" className="hover:text-brand-darkPaper transition-colors underline">
              Termos de Uso
            </a>
            <span>•</span>
            <a href="#privacidade" className="hover:text-brand-darkPaper transition-colors underline">
              Privacidade &amp; LGPD
            </a>
            <span>•</span>
            <a href="#seguranca" className="hover:text-brand-darkPaper transition-colors underline">
              Segurança Bancária
            </a>
          </div>
        </footer>
      </section>
    </main>
  );
}
