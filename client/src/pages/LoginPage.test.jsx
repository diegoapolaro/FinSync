import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LoginPage from './LoginPage';
import { AuthContext } from '../contexts/AuthContext';
import { ToastProvider } from '../contexts/ToastContext';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('@react-oauth/google', () => ({
  GoogleLogin: ({ onSuccess, onError, text }) => (
    <div data-testid="google-login-container">
      <span>{text}</span>
      <button type="button" onClick={() => onSuccess({ credential: 'google-token-xyz' })}>
        Simular Google Sucesso
      </button>
      <button type="button" onClick={() => onError()}>
        Simular Google Erro
      </button>
    </div>
  ),
}));

describe('LoginPage.jsx', () => {
  let mockLogin;
  let mockRegistrar;
  let mockLoginGoogle;

  beforeEach(() => {
    vi.clearAllMocks();
    mockLogin = vi.fn().mockResolvedValue({ token: 'jwt', nome: 'Diego' });
    mockRegistrar = vi.fn().mockResolvedValue({ token: 'jwt', nome: 'Diego' });
    mockLoginGoogle = vi.fn().mockResolvedValue({ token: 'jwt', nome: 'Diego' });
  });

  function renderLoginPage(authOverrides = {}) {
    const authValue = {
      user: null,
      isAuthenticated: false,
      login: mockLogin,
      registrar: mockRegistrar,
      loginGoogle: mockLoginGoogle,
      logout: vi.fn(),
      ...authOverrides,
    };

    return render(
      <AuthContext.Provider value={authValue}>
        <ToastProvider>
          <LoginPage />
        </ToastProvider>
      </AuthContext.Provider>,
    );
  }

  describe('Renderização e Estado Inicial', () => {
    it('deve renderizar a tela de login com formulário, botão Google e textos padrão', () => {
      renderLoginPage();

      expect(screen.getByText('FinSync')).toBeInTheDocument();
      expect(screen.getByText('Seu dinheiro, elegantemente organizado.')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('seu@email.com')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Mínimo 8 caracteres')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Entrar no FinSync' })).toBeInTheDocument();
      expect(screen.getByTestId('google-login-container')).toBeInTheDocument();
      expect(screen.getByText('signin_with')).toBeInTheDocument();

      // Campos de registro não devem estar presentes no modo login
      expect(screen.queryByPlaceholderText('Seu nome')).not.toBeInTheDocument();
      expect(screen.queryByPlaceholderText('Repita a senha')).not.toBeInTheDocument();
    });

    it('deve redirecionar para a página principal se o usuário já estiver autenticado', () => {
      renderLoginPage({ isAuthenticated: true });

      expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true });
    });
  });

  describe('Alternância entre Login e Registro', () => {
    it('deve alternar para modo de cadastro e voltar para login ao clicar no botão', () => {
      renderLoginPage();

      const btnAlternar = screen.getByRole('button', {
        name: 'Não tem uma conta? Cadastre-se gratuitamente',
      });
      fireEvent.click(btnAlternar);

      // Estado do modo cadastro
      expect(screen.getByText('Crie sua conta para começar.')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Seu nome')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Repita a senha')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Criar Conta' })).toBeInTheDocument();
      expect(screen.getByText('signup_with')).toBeInTheDocument();

      // Preencher campos e voltar para o login
      fireEvent.change(screen.getByPlaceholderText('Seu nome'), {
        target: { value: 'Diego Polaro' },
      });
      const btnVoltarLogin = screen.getByRole('button', {
        name: 'Já possui uma conta? Faça login',
      });
      fireEvent.click(btnVoltarLogin);

      // Campos de cadastro devem sumir e o modo login restaurado
      expect(screen.getByText('Seu dinheiro, elegantemente organizado.')).toBeInTheDocument();
      expect(screen.queryByPlaceholderText('Seu nome')).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Entrar no FinSync' })).toBeInTheDocument();
    });
  });

  describe('Indicador de Força de Senha', () => {
    it('deve calcular e exibir as forças de senha (Fraca, Razoável, Boa, Forte)', async () => {
      renderLoginPage();

      // Ir para o modo cadastro
      fireEvent.click(
        screen.getByRole('button', {
          name: 'Não tem uma conta? Cadastre-se gratuitamente',
        }),
      );

      const inputSenha = screen.getByPlaceholderText('Mínimo 8 caracteres');

      // 1. Senha curta/simples -> Fraca
      fireEvent.change(inputSenha, { target: { value: '123' } });
      expect(screen.getByText('Fraca')).toBeInTheDocument();

      // 2. Senha média (tamanho >= 8 e números) -> Razoável
      fireEvent.change(inputSenha, { target: { value: '12345678' } });
      expect(screen.getByText('Razoável')).toBeInTheDocument();

      // 3. Senha boa (tamanho >= 8 + maiúsculas/minúsculas + números) -> Boa
      fireEvent.change(inputSenha, { target: { value: 'SenhaForte123' } });
      expect(screen.getByText('Boa')).toBeInTheDocument();

      // 4. Senha forte (+ caractere especial) -> Forte
      fireEvent.change(inputSenha, { target: { value: 'SenhaForte@123' } });
      expect(screen.getByText('Forte')).toBeInTheDocument();
    });
  });

  describe('Validação de Confirmação de Senha no Cadastro', () => {
    it('deve exibir mensagem de erro e manter botão Criar Conta desabilitado quando as senhas não coincidirem', () => {
      renderLoginPage();

      fireEvent.click(
        screen.getByRole('button', {
          name: 'Não tem uma conta? Cadastre-se gratuitamente',
        }),
      );

      const inputNome = screen.getByPlaceholderText('Seu nome');
      const inputEmail = screen.getByPlaceholderText('seu@email.com');
      const inputSenha = screen.getByPlaceholderText('Mínimo 8 caracteres');
      const inputConfirmar = screen.getByPlaceholderText('Repita a senha');
      const btnCriarConta = screen.getByRole('button', { name: 'Criar Conta' });

      fireEvent.change(inputNome, { target: { value: 'Diego' } });
      fireEvent.change(inputEmail, { target: { value: 'diego@finsync.app' } });
      fireEvent.change(inputSenha, { target: { value: 'Senha12345' } });
      fireEvent.change(inputConfirmar, { target: { value: 'OutraSenha123' } });

      expect(screen.getByText('As senhas não coincidem.')).toBeInTheDocument();
      expect(btnCriarConta).toBeDisabled();
    });

    it('deve habilitar botão Criar Conta quando as senhas coincidirem', () => {
      renderLoginPage();

      fireEvent.click(
        screen.getByRole('button', {
          name: 'Não tem uma conta? Cadastre-se gratuitamente',
        }),
      );

      const inputNome = screen.getByPlaceholderText('Seu nome');
      const inputEmail = screen.getByPlaceholderText('seu@email.com');
      const inputSenha = screen.getByPlaceholderText('Mínimo 8 caracteres');
      const inputConfirmar = screen.getByPlaceholderText('Repita a senha');
      const btnCriarConta = screen.getByRole('button', { name: 'Criar Conta' });

      fireEvent.change(inputNome, { target: { value: 'Diego' } });
      fireEvent.change(inputEmail, { target: { value: 'diego@finsync.app' } });
      fireEvent.change(inputSenha, { target: { value: 'Senha12345' } });
      fireEvent.change(inputConfirmar, { target: { value: 'Senha12345' } });

      expect(screen.queryByText('As senhas não coincidem.')).not.toBeInTheDocument();
      expect(btnCriarConta).not.toBeDisabled();
    });
  });

  describe('Submissão de Formulário (Login e Cadastro)', () => {
    it('deve submeter o login com sucesso e navegar para /', async () => {
      renderLoginPage();

      const inputEmail = screen.getByPlaceholderText('seu@email.com');
      const inputSenha = screen.getByPlaceholderText('Mínimo 8 caracteres');
      const btnEntrar = screen.getByRole('button', { name: 'Entrar no FinSync' });

      fireEvent.change(inputEmail, { target: { value: 'usuario@finsync.app' } });
      fireEvent.change(inputSenha, { target: { value: 'Senha123' } });
      fireEvent.click(btnEntrar);

      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith('usuario@finsync.app', 'Senha123');
        expect(mockNavigate).toHaveBeenCalledWith('/');
      });
    });

    it('deve exibir toast de erro quando a função login falhar', async () => {
      mockLogin.mockRejectedValue(new Error('Credenciais inválidas.'));
      renderLoginPage();

      const inputEmail = screen.getByPlaceholderText('seu@email.com');
      const inputSenha = screen.getByPlaceholderText('Mínimo 8 caracteres');
      const btnEntrar = screen.getByRole('button', { name: 'Entrar no FinSync' });

      fireEvent.change(inputEmail, { target: { value: 'errado@finsync.app' } });
      fireEvent.change(inputSenha, { target: { value: 'errada' } });
      fireEvent.click(btnEntrar);

      await waitFor(() => {
        expect(screen.getByText('Credenciais inválidas.')).toBeInTheDocument();
      });
    });

    it('deve submeter o cadastro com sucesso chamando registrar e navegar para /', async () => {
      renderLoginPage();

      fireEvent.click(
        screen.getByRole('button', {
          name: 'Não tem uma conta? Cadastre-se gratuitamente',
        }),
      );

      const inputNome = screen.getByPlaceholderText('Seu nome');
      const inputEmail = screen.getByPlaceholderText('seu@email.com');
      const inputSenha = screen.getByPlaceholderText('Mínimo 8 caracteres');
      const inputConfirmar = screen.getByPlaceholderText('Repita a senha');
      const btnCriarConta = screen.getByRole('button', { name: 'Criar Conta' });

      fireEvent.change(inputNome, { target: { value: 'Diego Polaro' } });
      fireEvent.change(inputEmail, { target: { value: 'diego@finsync.app' } });
      fireEvent.change(inputSenha, { target: { value: 'MinhaSenha@123' } });
      fireEvent.change(inputConfirmar, { target: { value: 'MinhaSenha@123' } });
      fireEvent.click(btnCriarConta);

      await waitFor(() => {
        expect(mockRegistrar).toHaveBeenCalledWith(
          'Diego Polaro',
          'diego@finsync.app',
          'MinhaSenha@123',
        );
        expect(mockNavigate).toHaveBeenCalledWith('/');
      });
    });

    it('deve exibir toast de erro quando o cadastro falhar', async () => {
      mockRegistrar.mockRejectedValue(new Error('Email já cadastrado.'));
      renderLoginPage();

      fireEvent.click(
        screen.getByRole('button', {
          name: 'Não tem uma conta? Cadastre-se gratuitamente',
        }),
      );

      fireEvent.change(screen.getByPlaceholderText('Seu nome'), {
        target: { value: 'Diego' },
      });
      fireEvent.change(screen.getByPlaceholderText('seu@email.com'), {
        target: { value: 'duplicado@finsync.app' },
      });
      fireEvent.change(screen.getByPlaceholderText('Mínimo 8 caracteres'), {
        target: { value: 'Senha@123' },
      });
      fireEvent.change(screen.getByPlaceholderText('Repita a senha'), {
        target: { value: 'Senha@123' },
      });

      fireEvent.click(screen.getByRole('button', { name: 'Criar Conta' }));

      await waitFor(() => {
        expect(screen.getByText('Email já cadastrado.')).toBeInTheDocument();
      });
    });
  });

  describe('Google OAuth Login', () => {
    it('deve autenticar via Google com sucesso e navegar para /', async () => {
      renderLoginPage();

      const btnGoogleSucesso = screen.getByRole('button', {
        name: 'Simular Google Sucesso',
      });
      fireEvent.click(btnGoogleSucesso);

      await waitFor(() => {
        expect(mockLoginGoogle).toHaveBeenCalledWith('google-token-xyz');
        expect(mockNavigate).toHaveBeenCalledWith('/');
      });
    });

    it('deve exibir toast de erro quando loginGoogle falhar', async () => {
      mockLoginGoogle.mockRejectedValue(new Error('Falha no token Google.'));
      renderLoginPage();

      const btnGoogleSucesso = screen.getByRole('button', {
        name: 'Simular Google Sucesso',
      });
      fireEvent.click(btnGoogleSucesso);

      await waitFor(() => {
        expect(screen.getByText('Falha no token Google.')).toBeInTheDocument();
      });
    });

    it('deve exibir toast de erro quando o GoogleLogin acionar onError', async () => {
      renderLoginPage();

      const btnGoogleErro = screen.getByRole('button', {
        name: 'Simular Google Erro',
      });
      fireEvent.click(btnGoogleErro);

      await waitFor(() => {
        expect(screen.getByText('Erro ao conectar com Google.')).toBeInTheDocument();
      });
    });
  });
});
