import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { TemaProvider } from './contexts/ThemeContext';
import { ToastProvider } from './contexts/ToastContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ErrorBoundary from './components/common/ErrorBoundary';
import Layout from './components/layout/Layout';
import LoginPage from './pages/LoginPage';
import './styles/animations.css';
import Extrato from './pages/Extrato';
import LancamentosPage from './pages/LancamentosPage';
import RelatoriosPage from './pages/RelatoriosPage';
import AjustesPage from './pages/AjustesPage';

function ProtectedRoute() {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Outlet />;
}

export default function App() {
  return (
    <ErrorBoundary>
      <TemaProvider>
        <ToastProvider>
          <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <AuthProvider>
              <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route element={<ProtectedRoute />}>
                  <Route element={<Layout />}>
                    <Route path="/" element={<Extrato />} />
                    <Route path="/lancamentos" element={<LancamentosPage />} />
                    <Route path="/relatorios" element={<RelatoriosPage />} />
                    <Route path="/ajustes" element={<AjustesPage />} />
                  </Route>
                </Route>
              </Routes>
            </AuthProvider>
          </BrowserRouter>
        </ToastProvider>
      </TemaProvider>
    </ErrorBoundary>
  );
}
