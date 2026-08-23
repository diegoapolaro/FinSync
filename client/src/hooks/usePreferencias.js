import { useCallback, useEffect, useState } from 'react';

const CHAVE = 'finsync_preferencias';

const PADRAO = {
  formatoData: 'dd/mm/aaaa',
  moeda: 'Real Brasileiro (BRL - R$)',
  idioma: 'Português (Brasil)',
  tema: 'claro',
  lembreteDiario: true,
  alertaSaldoBaixo: false,
  nome: '',
  email: '',
};

function carregar() {
  try {
    const raw = localStorage.getItem(CHAVE);
    return raw ? { ...PADRAO, ...JSON.parse(raw) } : { ...PADRAO };
  } catch {
    return { ...PADRAO };
  }
}

const listeners = new Set();

function emitir(novasPrefs) {
  listeners.forEach((listener) => listener(novasPrefs));
}

export default function usePreferencias() {
  const [prefs, setPrefs] = useState(() => carregar());

  useEffect(() => {
    const handleChange = (novas) => {
      setPrefs(novas);
    };
    listeners.add(handleChange);

    const handleStorage = (e) => {
      if (e.key === CHAVE) {
        setPrefs(carregar());
      }
    };
    window.addEventListener('storage', handleStorage);

    return () => {
      listeners.delete(handleChange);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  const atualizar = useCallback((chave, valor) => {
    const atual = carregar();
    const atualizado = { ...atual, [chave]: valor };
    try {
      localStorage.setItem(CHAVE, JSON.stringify(atualizado));
    } catch (err) {
      console.error('Erro ao salvar preferências:', err);
    }
    setPrefs(atualizado);
    emitir(atualizado);
  }, []);

  return { prefs, atualizar };
}
