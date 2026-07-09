import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { TemaProvider } from './contexts/ThemeContext';
import { ToastProvider } from './contexts/ToastContext';
import ErrorBoundary from './components/common/ErrorBoundary';
import Layout from './components/layout/Layout';
import Extrato from './pages/Extrato';
import RelatoriosPage from './pages/RelatoriosPage';
import AjustesPage from './pages/AjustesPage';

export default function App() {
  return (
    <ErrorBoundary>
      <TemaProvider>
        <ToastProvider>
          <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <Routes>
              <Route element={<Layout />}>
                <Route path="/" element={<Extrato />} />
                <Route path="/relatorios" element={<RelatoriosPage />} />
                <Route path="/ajustes" element={<AjustesPage />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </ToastProvider>
      </TemaProvider>
    </ErrorBoundary>
  );
}
