import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthContext';
import * as api from '../services/api';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

vi.mock('../services/api', () => ({
  setAuthToken: vi.fn(),
  setOnUnauthorized: vi.fn(),
  login: vi.fn(),
  registrar: vi.fn(),
  loginGoogle: vi.fn(),
  atualizarPerfil: vi.fn(),
}));

function ConsumerComponent() {
  const { user, isAuthenticated, login, registrar, loginGoogle, logout, atualizarPerfil } = useAuth();
  return (
    <div>
      <span data-testid="auth-status">{isAuthenticated ? 'autenticado' : 'deslogado'}</span>
      <span data-testid="user-name">{user?.nome || ''}</span>
      <span data-testid="user-foto">{user?.fotoUrl || ''}</span>
      <button onClick={() => login('test@finsync.app', 'senha123')}>Fazer Login</button>
      <button onClick={() => registrar('Novo User', 'novo@finsync.app', 'senha123')}>Registrar</button>
      <button onClick={() => loginGoogle('google-token')}>Login Google</button>
      <button onClick={() => atualizarPerfil({ nome: 'Diego Atualizado', fotoUrl: 'https://foto-nova.jpg' })}>
        Atualizar Perfil
      </button>
      <button onClick={() => logout()}>Sair</button>
    </div>
  );
}

describe('AuthContext - Persistência e Ciclo de Sessão', () => {
  let unauthorizedHandler = null;

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    sessionStorage.clear();
    unauthorizedHandler = null;

    api.setOnUnauthorized.mockImplementation((cb) => {
      unauthorizedHandler = cb;
    });
  });

  it('deve restaurar a sessão do localStorage se existirem token e usuário salvos', () => {
    const savedUser = { nome: 'Diego', email: 'diego@finsync.app', fotoUrl: null, temSenha: true };
    localStorage.setItem('finsync_user', JSON.stringify(savedUser));
    localStorage.setItem('finsync_token', 'jwt-token-valido');

    render(
      <AuthProvider>
        <ConsumerComponent />
      </AuthProvider>,
    );

    expect(screen.getByTestId('auth-status')).toHaveTextContent('autenticado');
    expect(screen.getByTestId('user-name')).toHaveTextContent('Diego');
    expect(api.setAuthToken).toHaveBeenCalledWith('jwt-token-valido');
  });

  it('deve salvar token e usuário no localStorage após login com sucesso', async () => {
    api.login.mockResolvedValue({
      token: 'jwt-login-novo',
      nome: 'Diego Polaro',
      email: 'diego@finsync.app',
      fotoUrl: null,
      temSenha: true,
    });

    render(
      <AuthProvider>
        <ConsumerComponent />
      </AuthProvider>,
    );

    expect(screen.getByTestId('auth-status')).toHaveTextContent('deslogado');

    await act(async () => {
      screen.getByText('Fazer Login').click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('autenticado');
      expect(screen.getByTestId('user-name')).toHaveTextContent('Diego Polaro');
      expect(localStorage.getItem('finsync_token')).toBe('jwt-login-novo');
      expect(JSON.parse(localStorage.getItem('finsync_user'))).toEqual({
        nome: 'Diego Polaro',
        email: 'diego@finsync.app',
        fotoUrl: null,
        temSenha: true,
      });
      expect(api.setAuthToken).toHaveBeenCalledWith('jwt-login-novo');
    });
  });

  it('deve salvar token e usuário no localStorage após cadastro com sucesso', async () => {
    api.registrar.mockResolvedValue({
      token: 'jwt-registrar-novo',
      nome: 'Novo User',
      email: 'novo@finsync.app',
      fotoUrl: null,
      temSenha: true,
    });

    render(
      <AuthProvider>
        <ConsumerComponent />
      </AuthProvider>,
    );

    await act(async () => {
      screen.getByText('Registrar').click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('autenticado');
      expect(screen.getByTestId('user-name')).toHaveTextContent('Novo User');
      expect(localStorage.getItem('finsync_token')).toBe('jwt-registrar-novo');
    });
  });

  it('deve salvar token e usuário no localStorage após login Google', async () => {
    api.loginGoogle.mockResolvedValue({
      token: 'jwt-google-novo',
      nome: 'Google User',
      email: 'google@finsync.app',
      fotoUrl: 'https://foto.jpg',
      temSenha: false,
    });

    render(
      <AuthProvider>
        <ConsumerComponent />
      </AuthProvider>,
    );

    await act(async () => {
      screen.getByText('Login Google').click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('autenticado');
      expect(screen.getByTestId('user-name')).toHaveTextContent('Google User');
      expect(localStorage.getItem('finsync_token')).toBe('jwt-google-novo');
    });
  });

  it('deve limpar localStorage, resetar estado e redirecionar ao executar logout', async () => {
    localStorage.setItem('finsync_token', 'jwt-existente');
    localStorage.setItem('finsync_user', JSON.stringify({ nome: 'Diego' }));

    render(
      <AuthProvider>
        <ConsumerComponent />
      </AuthProvider>,
    );

    expect(screen.getByTestId('auth-status')).toHaveTextContent('autenticado');

    act(() => {
      screen.getByText('Sair').click();
    });

    expect(localStorage.getItem('finsync_token')).toBeNull();
    expect(localStorage.getItem('finsync_user')).toBeNull();
    expect(api.setAuthToken).toHaveBeenCalledWith(null);
    expect(screen.getByTestId('auth-status')).toHaveTextContent('deslogado');
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  it('deve limpar localStorage e redirecionar para /login quando a API retornar 401 Unauthorized', async () => {
    localStorage.setItem('finsync_token', 'jwt-expirado');
    localStorage.setItem('finsync_user', JSON.stringify({ nome: 'Diego' }));

    render(
      <AuthProvider>
        <ConsumerComponent />
      </AuthProvider>,
    );

    expect(screen.getByTestId('auth-status')).toHaveTextContent('autenticado');

    expect(unauthorizedHandler).toBeTypeOf('function');
    act(() => {
      unauthorizedHandler();
    });

    expect(localStorage.getItem('finsync_token')).toBeNull();
    expect(localStorage.getItem('finsync_user')).toBeNull();
    expect(api.setAuthToken).toHaveBeenCalledWith(null);
    expect(screen.getByTestId('auth-status')).toHaveTextContent('deslogado');
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  it('deve atualizar usuário e salvar no localStorage ao chamar atualizarPerfil', async () => {
    const savedUser = { nome: 'Diego', email: 'diego@finsync.app', fotoUrl: null, temSenha: true };
    localStorage.setItem('finsync_user', JSON.stringify(savedUser));
    localStorage.setItem('finsync_token', 'jwt-token-valido');

    api.atualizarPerfil.mockResolvedValue({
      token: 'jwt-atualizado',
      nome: 'Diego Atualizado',
      email: 'diego@finsync.app',
      fotoUrl: 'https://foto-nova.jpg',
      temSenha: true,
    });

    render(
      <AuthProvider>
        <ConsumerComponent />
      </AuthProvider>,
    );

    expect(screen.getByTestId('user-name')).toHaveTextContent('Diego');

    await act(async () => {
      screen.getByText('Atualizar Perfil').click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('user-name')).toHaveTextContent('Diego Atualizado');
      expect(screen.getByTestId('user-foto')).toHaveTextContent('https://foto-nova.jpg');
      expect(localStorage.getItem('finsync_token')).toBe('jwt-atualizado');
      expect(JSON.parse(localStorage.getItem('finsync_user'))).toEqual({
        nome: 'Diego Atualizado',
        email: 'diego@finsync.app',
        fotoUrl: 'https://foto-nova.jpg',
        temSenha: true,
      });
      expect(api.setAuthToken).toHaveBeenCalledWith('jwt-atualizado');
    });
  });
});
