import { createContext, useContext, useEffect, useState } from 'react';

const STORAGE_KEY = 'finsync_preferencias';

const TemaContext = createContext(null);

function carregarPrefs() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function TemaProvider({ children }) {
  const [tema, setTema] = useState(() => {
    const prefs = carregarPrefs();
    return prefs.tema || 'claro';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (tema === 'escuro') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [tema]);

  useEffect(() => {
    const prefs = carregarPrefs();
    prefs.tema = tema;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  }, [tema]);

  const alternarTema = () => {
    setTema((t) => (t === 'escuro' ? 'claro' : 'escuro'));
  };

  return (
    <TemaContext.Provider value={{ tema, setTema, alternarTema }}>
      {children}
    </TemaContext.Provider>
  );
}

export function useTema() {
  const ctx = useContext(TemaContext);
  if (!ctx) throw new Error('useTema deve ser usado dentro de TemaProvider');
  return ctx;
}
