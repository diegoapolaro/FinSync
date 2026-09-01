import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  setAuthToken,
  setOnUnauthorized,
  login as apiLogin,
  registrar as apiRegistrar,
  loginGoogle as apiLoginGoogle,
} from '../services/api';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('finsync_user') || sessionStorage.getItem('finsync_user');
    return saved ? JSON.parse(saved) : null;
  });
  const navigate = useNavigate();

  useEffect(() => {
    const savedToken = localStorage.getItem('finsync_token') || sessionStorage.getItem('finsync_token');
    if (savedToken) {
      setAuthToken(savedToken);
      // Garante migração para localStorage caso estivesse em sessionStorage
      if (!localStorage.getItem('finsync_token')) {
        localStorage.setItem('finsync_token', savedToken);
      }
    }
  }, []);

  useEffect(() => {
    setOnUnauthorized(() => {
      localStorage.removeItem('finsync_token');
      localStorage.removeItem('finsync_user');
      sessionStorage.removeItem('finsync_token');
      sessionStorage.removeItem('finsync_user');
      setAuthToken(null);
      setUser(null);
      navigate('/login');
    });
    return () => setOnUnauthorized(null);
  }, [navigate]);

  const isAuthenticated = !!user;

  const login = useCallback(async (email, senha) => {
    const data = await apiLogin(email, senha);
    localStorage.setItem('finsync_token', data.token);
    localStorage.setItem(
      'finsync_user',
      JSON.stringify({
        nome: data.nome,
        email: data.email,
        fotoUrl: data.fotoUrl,
        temSenha: data.temSenha,
      }),
    );
    setAuthToken(data.token);
    setUser({ nome: data.nome, email: data.email, fotoUrl: data.fotoUrl, temSenha: data.temSenha });
    return data;
  }, []);

  const registrar = useCallback(async (nome, email, senha) => {
    const data = await apiRegistrar(nome, email, senha);
    localStorage.setItem('finsync_token', data.token);
    localStorage.setItem(
      'finsync_user',
      JSON.stringify({
        nome: data.nome,
        email: data.email,
        fotoUrl: data.fotoUrl,
        temSenha: data.temSenha,
      }),
    );
    setAuthToken(data.token);
    setUser({ nome: data.nome, email: data.email, fotoUrl: data.fotoUrl, temSenha: data.temSenha });
    return data;
  }, []);

  const loginGoogle = useCallback(async (idToken) => {
    const data = await apiLoginGoogle(idToken);
    localStorage.setItem('finsync_token', data.token);
    localStorage.setItem(
      'finsync_user',
      JSON.stringify({
        nome: data.nome,
        email: data.email,
        fotoUrl: data.fotoUrl,
        temSenha: data.temSenha,
      }),
    );
    setAuthToken(data.token);
    setUser({ nome: data.nome, email: data.email, fotoUrl: data.fotoUrl, temSenha: data.temSenha });
    return data;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('finsync_token');
    localStorage.removeItem('finsync_user');
    sessionStorage.removeItem('finsync_token');
    sessionStorage.removeItem('finsync_user');
    setAuthToken(null);
    setUser(null);
    navigate('/login');
  }, [navigate]);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, registrar, loginGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider');
  return ctx;
}
