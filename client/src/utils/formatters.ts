import { getPreferencias } from '../hooks/usePreferencias';
import { getLocaleFromIdioma } from '../i18n/translations';
import {
  converterDeBRL,
  converterParaBRL,
  getCotacao,
  obterCotacoes,
} from '../services/cotacaoService';

export { converterDeBRL, converterParaBRL, getCotacao, obterCotacoes };

export function getCurrencyConfig(moedaStr?: string | null) {
  if (moedaStr?.includes('USD')) {
    return { code: 'USD', symbol: '$', locale: 'en-US' };
  }
  if (moedaStr?.includes('EUR')) {
    return { code: 'EUR', symbol: '€', locale: 'de-DE' };
  }
  return { code: 'BRL', symbol: 'R$', locale: 'pt-BR' };
}

export function formatCurrency(value: string | number | null | undefined, moedaOverride?: string | null, { converter = true } = {}) {
  const prefs = getPreferencias();
  const moeda = moedaOverride || prefs?.moeda || 'Real Brasileiro (BRL - R$)';
  const { code, locale } = getCurrencyConfig(moeda);
  const valorFinal = converter ? converterDeBRL(Number(value || 0), moeda) : Number(value ?? 0);

  return Number(valorFinal ?? 0).toLocaleString(locale, {
    style: 'currency',
    currency: code,
  });
}

function mesCurto(date: Date, locale = 'pt-BR') {
  return date.toLocaleDateString(locale, { month: 'short' }).replace('.', '');
}

export function formatPeriodoLabel(
  filtroTipo: string,
  dataSelecionada: Date,
  dataInicio: Date,
  dataFim: Date,
  mesReferencia?: Date | null,
  idiomaOverride?: string | null,
) {
  const prefs = getPreferencias();
  const idioma = idiomaOverride || prefs?.idioma || 'Português (Brasil)';
  const locale = getLocaleFromIdioma(idioma);

  if (filtroTipo === 'dia') {
    return dataSelecionada.toLocaleDateString(locale, {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  }
  if (filtroTipo === 'periodo') {
    return `${String(dataInicio.getDate()).padStart(2, '0')} ${mesCurto(dataInicio, locale)} - ${String(
      dataFim.getDate(),
    ).padStart(2, '0')} ${mesCurto(dataFim, locale)} ${dataFim.getFullYear()}`;
  }
  const label = (mesReferencia ?? dataFim).toLocaleDateString(locale, {
    month: 'long',
    year: 'numeric',
  });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export function formatDisplayDate(value: string | Date | null | undefined, formatoOverride?: string | null, idiomaOverride?: string | null) {
  if (!value) return '';
  const date =
    typeof value === 'string'
      ? value.includes('T')
        ? new Date(value)
        : new Date(`${value}T12:00:00`)
      : new Date(value);
  if (isNaN(date.getTime())) return String(value);

  const prefs = getPreferencias();
  const formato = formatoOverride || prefs?.formatoData || 'dd/mm/aaaa';
  const idioma = idiomaOverride || prefs?.idioma || 'Português (Brasil)';
  const locale = getLocaleFromIdioma(idioma);

  if (formato === 'aaaa-mm-dd') {
    const dia = String(date.getDate()).padStart(2, '0');
    const mes = String(date.getMonth() + 1).padStart(2, '0');
    const ano = String(date.getFullYear());
    return `${ano}-${mes}-${dia}`;
  }

  if (formato === 'mm/dd/aaaa') {
    return date
      .toLocaleDateString(locale, {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
      })
      .toUpperCase();
  }

  return date
    .toLocaleDateString(locale, {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
    .toUpperCase();
}

export function formatDate(value: string | Date | null | undefined, formatoOverride?: string | null) {
  if (!value) return '';
  const date =
    typeof value === 'string'
      ? value.includes('T')
        ? new Date(value)
        : new Date(`${value}T12:00:00`)
      : new Date(value);
  if (isNaN(date.getTime())) return String(value);

  const prefs = getPreferencias();
  const formato = formatoOverride || prefs?.formatoData || 'dd/mm/aaaa';

  const dia = String(date.getDate()).padStart(2, '0');
  const mes = String(date.getMonth() + 1).padStart(2, '0');
  const ano = String(date.getFullYear());

  if (formato === 'aaaa-mm-dd') {
    return `${ano}-${mes}-${dia}`;
  }
  if (formato === 'mm/dd/aaaa') {
    return `${mes}/${dia}/${ano}`;
  }
  return `${dia}/${mes}/${ano}`;
}

export function formatCurrencyInput(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return '';
  let str = String(value);
  if (!str.trim()) return '';

  if (typeof value === 'number') {
    str = str.replace('.', ',');
  }

  const clean = str.replace(/[^0-9,]/g, '');
  if (!clean) return '';

  const parts = clean.split(',');
  let integerPart = parts[0];
  const decimalPart = parts.length > 1 ? parts.slice(1).join('').slice(0, 2) : null;

  if (integerPart.length > 1 && integerPart.startsWith('0')) {
    integerPart = integerPart.replace(/^0+/, '') || '0';
  } else if (!integerPart && decimalPart !== null) {
    integerPart = '0';
  }

  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

  if (decimalPart !== null) {
    return `${formattedInteger},${decimalPart}`;
  }
  return formattedInteger;
}

export function parseCurrencyInput(value: string | number | null | undefined): number {
  if (typeof value === 'number') return isNaN(value) ? 0 : value;
  if (!value) return 0;
  const clean = String(value).replace(/\./g, '').replace(',', '.');
  const num = parseFloat(clean);
  return isNaN(num) ? 0 : num;
}
