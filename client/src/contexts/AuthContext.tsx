import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  setAuthToken,
  setOnUnauthorized,
  login as apiLogin,
  registrar as apiRegistrar,
  loginGoogle as apiLoginGoogle,
  atualizarPerfil as apiAtualizarPerfil,
} from '../services/api';

import { LoginRequest, RegistrarRequest, AtualizarPerfilRequest, AuthResponse } from '@/types';

export interface AuthUser {
  nome: string;
  email: string;
  fotoUrl?: string;
  temSenha?: boolean;
}

export interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (email: string, senha?: string) => Promise<AuthResponse>;
  registrar: (nome: string, email: string, senha?: string) => Promise<AuthResponse>;
  loginGoogle: (idToken: string) => Promise<AuthResponse>;
  logout: () => void;
  atualizarPerfil: (dados: AtualizarPerfilRequest) => Promise<AuthResponse>;
}

export const AuthContext = createContext<AuthContextType | null>(null);

interface Props {
  children: ReactNode;
}

export function AuthProvider({ children }: Props) {
  const [user, setUser] = useState<AuthUser | null>(() => {
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
    return () => setOnUnauthorized(() => {});
  }, [navigate]);

  const isAuthenticated = !!user;

  const login = useCallback(async (email: string, senha?: string) => {
    const data = await apiLogin(email, senha || '');
    localStorage.setItem('finsync_token', data.token);
    localStorage.setItem(
      'finsync_user',
      JSON.stringify({
        nome: data.nome,
        email: data.email,
        fotoUrl: data.fotoUrl || undefined,
        temSenha: data.temSenha,
      }),
    );
    setAuthToken(data.token);
    setUser({ nome: data.nome, email: data.email, fotoUrl: data.fotoUrl || undefined, temSenha: data.temSenha });
    return data;
  }, []);

  const registrar = useCallback(async (nome: string, email: string, senha?: string) => {
    const data = await apiRegistrar(nome, email, senha || '');
    localStorage.setItem('finsync_token', data.token);
    localStorage.setItem(
      'finsync_user',
      JSON.stringify({
        nome: data.nome,
        email: data.email,
        fotoUrl: data.fotoUrl || undefined,
        temSenha: data.temSenha,
      }),
    );
    setAuthToken(data.token);
    setUser({ nome: data.nome, email: data.email, fotoUrl: data.fotoUrl || undefined, temSenha: data.temSenha });
    return data;
  }, []);

  const loginGoogle = useCallback(async (idToken: string) => {
    const data = await apiLoginGoogle(idToken);
    localStorage.setItem('finsync_token', data.token);
    localStorage.setItem(
      'finsync_user',
      JSON.stringify({
        nome: data.nome,
        email: data.email,
        fotoUrl: data.fotoUrl || undefined,
        temSenha: data.temSenha,
      }),
    );
    setAuthToken(data.token);
    setUser({ nome: data.nome, email: data.email, fotoUrl: data.fotoUrl || undefined, temSenha: data.temSenha });
    return data;
  }, []);

  const atualizarPerfil = useCallback(async (dados: AtualizarPerfilRequest) => {
    const data = await apiAtualizarPerfil(dados);
    if (data?.token) {
      localStorage.setItem('finsync_token', data.token);
      setAuthToken(data.token);
    }
    const updated = {
      nome: data.nome,
      email: data.email,
      fotoUrl: data.fotoUrl || undefined,
      temSenha: data.temSenha,
    };
    localStorage.setItem('finsync_user', JSON.stringify(updated));
    setUser(updated);
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
    <AuthContext.Provider
      value={{ user, isAuthenticated, login, registrar, loginGoogle, logout, atualizarPerfil }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider');
  return ctx;
}
