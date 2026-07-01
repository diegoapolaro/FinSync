import { useCallback, useEffect, useState } from 'react';

const CHAVE = 'finsync_preferencias';

function carregar() {
  try {
    const raw = localStorage.getItem(CHAVE);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

const PADRAO = {
  formatoData: 'dd/mm/aaaa',
  moeda: 'R$ (BRL)',
  tema: 'claro',
  lembreteDiario: true,
  alertaSaldoBaixo: false,
  nome: 'João Silva',
  email: 'joao@pizzaria.com.br',
};

export default function usePreferencias() {
  const [prefs, setPrefs] = useState(() => ({ ...PADRAO, ...carregar() }));

  useEffect(() => {
    localStorage.setItem(CHAVE, JSON.stringify(prefs));
  }, [prefs]);

  useEffect(() => {
    const root = document.documentElement;
    if (prefs.tema === 'escuro') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [prefs.tema]);

  const atualizar = useCallback((chave, valor) => {
    setPrefs((p) => ({ ...p, [chave]: valor }));
  }, []);

  return { prefs, atualizar };
}
