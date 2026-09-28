import { useSyncExternalStore, useCallback } from 'react';

export interface Preferencias {
  formatoData: string;
  moeda: string;
  idioma: string;
  tema: 'claro' | 'escuro' | 'sistema';
  lembreteDiario: boolean;
  alertaSaldoBaixo: boolean;
  nome: string;
  email: string;
  [key: string]: string | boolean | undefined;
}

const CHAVE = 'finsync_preferencias';

const PADRAO: Preferencias = {
  formatoData: 'dd/mm/aaaa',
  moeda: 'Real Brasileiro (BRL - R$)',
  idioma: 'Português (Brasil)',
  tema: 'claro',
  lembreteDiario: true,
  alertaSaldoBaixo: false,
  nome: '',
  email: '',
};

let cacheRaw: string | undefined = undefined;
let cacheState: Preferencias | null = null;

function carregarState(): Preferencias {
  try {
    const raw = localStorage.getItem(CHAVE);
    if (raw === cacheRaw && cacheState) {
      return cacheState;
    }
    cacheRaw = raw || undefined;
    cacheState = raw ? { ...PADRAO, ...JSON.parse(raw) } : { ...PADRAO };
  } catch {
    cacheState = { ...PADRAO };
  }
  return cacheState as Preferencias;
}

export function resetPreferenciasCache(): void {
  cacheRaw = undefined;
  cacheState = null;
}

const listeners = new Set<() => void>();

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  const handleStorage = (e: StorageEvent) => {
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

  const atualizar = useCallback((chave: keyof Preferencias, valor: any) => {
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

export function getPreferencias(): Preferencias {
  return carregarState();
}
