import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';

export default function LoginPage() {
  const { isAuthenticated, login, registrar } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) navigate('/', { replace: true });
  }, [isAuthenticated, navigate]);

  const [modo, setModo] = useState('login');
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
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
    <div className="min-h-screen bg-app flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-4">
            <span className="text-primary font-bold text-3xl tracking-tight" style={{ fontFamily: 'serif' }}>FS</span>
          </div>
          <h1 className="font-headline-lg text-headline-lg text-primary uppercase tracking-widest">FinSync</h1>
          <p className="text-on-surface-variant font-body-sm text-body-sm mt-1">
            {modo === 'login' ? 'Entre com sua conta' : 'Crie sua conta'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-surface rounded-2xl shadow-xl p-8 space-y-5 border border-outline-variant">
          {modo === 'registrar' && (
            <div>
              <label className="block text-on-surface font-body-sm text-body-sm mb-1.5">Nome</label>
              <input
                type="text"
                required
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="input-base w-full bg-surface-container-low border border-outline rounded-lg font-body-sm text-body-sm px-md py-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                placeholder="Seu nome"
              />
            </div>
          )}

          <div>
            <label className="block text-on-surface font-body-sm text-body-sm mb-1.5">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-base w-full bg-surface-container-low border border-outline rounded-lg font-body-sm text-body-sm px-md py-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              placeholder="seu@email.com"
            />
          </div>

          <div>
            <label className="block text-on-surface font-body-sm text-body-sm mb-1.5">Senha</label>
            <input
              type="password"
              required
              minLength={6}
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="input-base w-full bg-surface-container-low border border-outline rounded-lg font-body-sm text-body-sm px-md py-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              placeholder="Mínimo 6 caracteres"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-base w-full bg-primary text-on-primary font-label-md text-label-md py-2.5 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {loading ? 'Aguarde...' : modo === 'login' ? 'Entrar' : 'Criar conta'}
          </button>

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => {
                setModo(modo === 'login' ? 'registrar' : 'login');
                setNome('');
                setEmail('');
                setSenha('');
              }}
              className="text-primary font-body-sm text-body-sm hover:underline"
            >
              {modo === 'login' ? 'Não tem conta? Cadastre-se' : 'Já tem conta? Faça login'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}