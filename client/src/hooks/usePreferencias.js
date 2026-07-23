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
  nome: '',
  email: '',
};

export default function usePreferencias() {
  const [prefs, setPrefs] = useState(() => ({ ...PADRAO, ...carregar() }));

  useEffect(() => {
    localStorage.setItem(CHAVE, JSON.stringify(prefs));
  }, [prefs]);

  const atualizar = useCallback((chave, valor) => {
    setPrefs((p) => ({ ...p, [chave]: valor }));
  }, []);

  return { prefs, atualizar };
}
