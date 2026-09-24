import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import DesktopHeader from './DesktopHeader';
import MobileTopBar from './MobileTopBar';
import { AuthContext } from '../../contexts/AuthContext';
import { TemaProvider } from '../../contexts/ThemeContext';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  useLocation: () => ({ pathname: '/' }),
}));

describe('DesktopHeader & MobileTopBar - Perfil e Navegação', () => {
  const mockUser = {
    nome: 'Diego Polaro',
    email: 'diego@finsync.app',
    fotoUrl: null,
  };

  const mockLogout = vi.fn();

  function renderDesktopHeader(user = mockUser) {
    return render(
      <AuthContext.Provider value={{ user, logout: mockLogout }}>
        <TemaProvider>
          <DesktopHeader />
        </TemaProvider>
      </AuthContext.Provider>,
    );
  }

  function renderMobileTopBar(user = mockUser) {
    return render(
      <AuthContext.Provider value={{ user, logout: mockLogout }}>
        <TemaProvider>
          <MobileTopBar />
        </TemaProvider>
      </AuthContext.Provider>,
    );
  }

  it('DesktopHeader: deve renderizar iniciais quando não houver fotoUrl e navegar para perfil ao clicar', () => {
    renderDesktopHeader();

    expect(screen.getByText('D')).toBeInTheDocument();
    expect(screen.getByText('Diego Polaro')).toBeInTheDocument();

    const perfilBtn = screen.getByTitle('Ver meu perfil');
    fireEvent.click(perfilBtn);

    expect(mockNavigate).toHaveBeenCalledWith('/ajustes#perfil');
  });

  it('DesktopHeader: deve renderizar imagem de perfil quando fotoUrl estiver definida', () => {
    const userComFoto = {
      ...mockUser,
      fotoUrl: 'https://exemplo.com/avatar.jpg',
    };
    renderDesktopHeader(userComFoto);

    const avatarImg = screen.getByRole('img', { name: 'Diego Polaro' });
    expect(avatarImg).toBeInTheDocument();
    expect(avatarImg).toHaveAttribute('src', 'https://exemplo.com/avatar.jpg');
  });

  it('DesktopHeader: deve disparar onOpenAtalhos ao clicar no botão de atalhos', () => {
    const handleOpenAtalhos = vi.fn();
    render(
      <AuthContext.Provider value={{ user: mockUser, logout: mockLogout }}>
        <TemaProvider>
          <DesktopHeader onOpenAtalhos={handleOpenAtalhos} />
        </TemaProvider>
      </AuthContext.Provider>,
    );

    const atalhosBtn = screen.getByRole('button', { name: /atalhos de teclado/i });
    fireEvent.click(atalhosBtn);

    expect(handleOpenAtalhos).toHaveBeenCalledTimes(1);
  });

  it('MobileTopBar: deve navegar para perfil ao clicar no botão de usuário', () => {
    mockNavigate.mockClear();
    renderMobileTopBar();

    const perfilBtn = screen.getByTitle('Ver perfil');
    fireEvent.click(perfilBtn);

    expect(mockNavigate).toHaveBeenCalledWith('/ajustes#perfil');
  });
});
