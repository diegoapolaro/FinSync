const CHAVE_COTACOES = 'finsync_cotacoes';
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hora de cache

export const COTACAO_PADRAO = {
  USD: 5.50,
  EUR: 6.00,
  BRL: 1.0,
  dataAtualizacao: new Date().toISOString(),
};

let cotacoesEmMemoria = null;
const listeners = new Set();

export function subscribeCotacoes(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function notificarListeners() {
  listeners.forEach((l) => {
    try {
      l(cotacoesEmMemoria);
    } catch (err) {
      console.error('Erro no listener de cotação:', err);
    }
  });
}

export function carregarCotacoesCache() {
  if (cotacoesEmMemoria) return cotacoesEmMemoria;
  try {
    const raw = localStorage.getItem(CHAVE_COTACOES);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.USD && parsed.EUR) {
        cotacoesEmMemoria = {
          USD: Number(parsed.USD) || COTACAO_PADRAO.USD,
          EUR: Number(parsed.EUR) || COTACAO_PADRAO.EUR,
          BRL: 1.0,
          dataAtualizacao: parsed.dataAtualizacao || COTACAO_PADRAO.dataAtualizacao,
        };
        return cotacoesEmMemoria;
      }
    }
  } catch {
    // fallback
  }

  cotacoesEmMemoria = { ...COTACAO_PADRAO };
  return cotacoesEmMemoria;
}

export async function buscarCotacoesAoVivo() {
  try {
    const res = await fetch('https://economia.awesomeapi.com.br/json/last/USD-BRL,EUR-BRL');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    const usdRate = parseFloat(data?.USDBRL?.bid);
    const eurRate = parseFloat(data?.EURBRL?.bid);

    if (usdRate && eurRate) {
      const novoCache = {
        USD: usdRate,
        EUR: eurRate,
        BRL: 1.0,
        dataAtualizacao: new Date().toISOString(),
      };
      cotacoesEmMemoria = novoCache;
      try {
        localStorage.setItem(CHAVE_COTACOES, JSON.stringify(novoCache));
      } catch (err) {
        console.error('Erro ao salvar cotações no localStorage:', err);
      }
      notificarListeners();
      return novoCache;
    }
  } catch (err) {
    console.warn('FinSync: Não foi possível buscar cotações ao vivo, utilizando cache/padrão:', err);
  }

  return carregarCotacoesCache();
}

export function obterCotacoes() {
  const cotacoes = carregarCotacoesCache();
  try {
    const ts = new Date(cotacoes.dataAtualizacao).getTime();
    if (Date.now() - ts > CACHE_TTL_MS) {
      // Atualiza em background
      buscarCotacoesAoVivo().catch(() => {});
    }
  } catch {
    // ignora
  }
  return cotacoes;
}

export function setCotacoesManual(taxas) {
  const atual = carregarCotacoesCache();
  const novo = {
    ...atual,
    ...taxas,
    BRL: 1.0,
    dataAtualizacao: new Date().toISOString(),
  };
  cotacoesEmMemoria = novo;
  try {
    localStorage.setItem(CHAVE_COTACOES, JSON.stringify(novo));
  } catch {}
  notificarListeners();
  return novo;
}

export function getCotacao(moedaStr) {
  const cotacoes = carregarCotacoesCache();
  if (moedaStr?.includes('USD')) return cotacoes.USD || COTACAO_PADRAO.USD;
  if (moedaStr?.includes('EUR')) return cotacoes.EUR || COTACAO_PADRAO.EUR;
  return 1.0;
}

export function converterDeBRL(valorEmBRL, moedaDestino) {
  const num = Number(valorEmBRL ?? 0);
  if (!num || isNaN(num)) return 0;
  const taxa = getCotacao(moedaDestino);
  if (!taxa || taxa === 1) return num;
  return num / taxa;
}

export function converterParaBRL(valorEmMoeda, moedaOrigem) {
  const num = Number(valorEmMoeda ?? 0);
  if (!num || isNaN(num)) return 0;
  const taxa = getCotacao(moedaOrigem);
  if (!taxa || taxa === 1) return num;
  return num * taxa;
}
