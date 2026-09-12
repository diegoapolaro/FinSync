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

let cacheRaw = undefined;
let cacheState = null;

function carregarState() {
  try {
    const raw = localStorage.getItem(CHAVE);
    if (raw === cacheRaw && cacheState) {
      return cacheState;
    }
    cacheRaw = raw;
    cacheState = raw ? { ...PADRAO, ...JSON.parse(raw) } : { ...PADRAO };
  } catch {
    cacheState = { ...PADRAO };
  }
  return cacheState;
}

export function resetPreferenciasCache() {
  cacheRaw = undefined;
  cacheState = null;
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
    const serialized = JSON.stringify(atualizado);
    try {
      localStorage.setItem(CHAVE, serialized);
    } catch (err) {
      console.error('Erro ao salvar preferências:', err);
    }
    cacheRaw = serialized;
    cacheState = atualizado;
    listeners.forEach((listener) => listener());
  }, []);


  return { prefs, atualizar };
}

export function getPreferencias() {
  return carregarState();
}

