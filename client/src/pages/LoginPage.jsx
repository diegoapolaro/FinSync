import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';

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
                minLength={6}
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="Mínimo 6 caracteres"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
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
