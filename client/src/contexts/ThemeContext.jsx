import { createContext, useContext, useEffect } from 'react';
import usePreferencias from '../hooks/usePreferencias';

const TemaContext = createContext(null);

export function TemaProvider({ children }) {
  const { prefs, atualizar } = usePreferencias();
  const tema = prefs.tema || 'claro';

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

  return (
    <TemaContext.Provider value={{ tema, alternarTema }}>
      {children}
    </TemaContext.Provider>
  );
}

export function useTema() {
  const ctx = useContext(TemaContext);
  if (!ctx) throw new Error('useTema deve ser usado dentro de TemaProvider');
  return ctx;
}
