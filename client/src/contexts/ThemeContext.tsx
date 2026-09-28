import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import usePreferencias from '../hooks/usePreferencias';

export type TemaType = 'claro' | 'escuro' | 'sistema' | string;

export interface TemaContextType {
  tema: TemaType;
  alternarTema: () => void;
}

const TemaContext = createContext<TemaContextType>({
  tema: 'claro',
  alternarTema: () => {},
});

interface Props {
  children: ReactNode;
}

export function TemaProvider({ children }: Props) {
  const { prefs, atualizar } = usePreferencias();
  const tema = prefs?.tema || 'claro';

  useEffect(() => {
    const root = document.documentElement;
    if (tema === 'escuro') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [tema]);

  const alternarTema = () => {
    atualizar('tema', tema === 'escuro' ? 'claro' : 'escuro');
  };

  return <TemaContext.Provider value={{ tema, alternarTema }}>{children}</TemaContext.Provider>;
}

export function useTema(): TemaContextType {
  const ctx = useContext(TemaContext);
  return ctx || { tema: 'claro', alternarTema: () => {} };
}

export interface UseThemeResult extends TemaContextType {
  isDark: boolean;
  toggleTheme: () => void;
}

export function useTheme(): UseThemeResult {
  const { tema, alternarTema } = useTema();
  return {
    tema,
    alternarTema,
    isDark: tema === 'escuro',
    toggleTheme: alternarTema,
  };
}
