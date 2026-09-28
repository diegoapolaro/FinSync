import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';

vi.mock('@react-oauth/google', () => ({
  GoogleOAuthProvider: ({ children }: any) => <>{children}</>,
  GoogleLogin: () => <div>Google Login Mock</div>,
}));

describe('App', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('finsync_preferencias', JSON.stringify({
      formatoData: 'dd/mm/aaaa',
      moeda: 'Real Brasileiro (BRL - R$)',
      idioma: 'Português (Brasil)',
      tema: 'claro',
      lembreteDiario: true,
      alertaSaldoBaixo: false,
    }));
  });

  it('renders without crashing', () => {
    render(<App />);
    expect(screen.getAllByText(/FinSync/i)[0]).toBeInTheDocument();
  });
});
