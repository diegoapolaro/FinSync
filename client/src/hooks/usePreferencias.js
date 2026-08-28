import { useSyncExternalStore, useCallback } from 'react';

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

let cacheState = null;

function carregarState() {
  if (cacheState) return cacheState;
  try {
    const raw = localStorage.getItem(CHAVE);
    cacheState = raw ? { ...PADRAO, ...JSON.parse(raw) } : { ...PADRAO };
  } catch {
    cacheState = { ...PADRAO };
  }
  return cacheState;
}

const listeners = new Set();

function subscribe(listener) {
  listeners.add(listener);
  const handleStorage = (e) => {
    if (e.key === CHAVE) {
      cacheState = null;
      listener();
    }
  };
  window.addEventListener('storage', handleStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener('storage', handleStorage);
  };
}

export default function usePreferencias() {
  const prefs = useSyncExternalStore(subscribe, carregarState, carregarState);

  const atualizar = useCallback((chave, valor) => {
    const atual = carregarState();
    const atualizado = { ...atual, [chave]: valor };
    try {
      localStorage.setItem(CHAVE, JSON.stringify(atualizado));
    } catch (err) {
      console.error('Erro ao salvar preferências:', err);
    }
    cacheState = atualizado;
    listeners.forEach((listener) => listener());
  }, []);

  return { prefs, atualizar };
}
