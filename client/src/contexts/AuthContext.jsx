import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { setAuthToken, setOnUnauthorized, login as apiLogin, registrar as apiRegistrar } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = sessionStorage.getItem('finsync_user');
    return saved ? JSON.parse(saved) : null;
  });
  const navigate = useNavigate();

  useEffect(() => {
    const savedToken = sessionStorage.getItem('finsync_token');
    if (savedToken) {
      setAuthToken(savedToken);
    }
  }, []);

  useEffect(() => {
    setOnUnauthorized(() => {
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
    sessionStorage.setItem('finsync_token', data.token);
    sessionStorage.setItem('finsync_user', JSON.stringify({ nome: data.nome, email: data.email }));
    setAuthToken(data.token);
    setUser({ nome: data.nome, email: data.email });
    return data;
  }, []);

  const registrar = useCallback(async (nome, email, senha) => {
    const data = await apiRegistrar(nome, email, senha);
    sessionStorage.setItem('finsync_token', data.token);
    sessionStorage.setItem('finsync_user', JSON.stringify({ nome: data.nome, email: data.email }));
    setAuthToken(data.token);
    setUser({ nome: data.nome, email: data.email });
    return data;
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem('finsync_token');
    sessionStorage.removeItem('finsync_user');
    setAuthToken(null);
    setUser(null);
    navigate('/login');
  }, [navigate]);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, registrar, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider');
  return ctx;
}