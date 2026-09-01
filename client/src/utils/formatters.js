export function formatCurrency(value) {
  return Number(value ?? 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

function mesCurto(date) {
  return date.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '');
}

export function formatPeriodoLabel(
  filtroTipo,
  dataSelecionada,
  dataInicio,
  dataFim,
  mesReferencia,
) {
  if (filtroTipo === 'dia') {
    return dataSelecionada.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  }
  if (filtroTipo === 'periodo') {
    return `${String(dataInicio.getDate()).padStart(2, '0')} ${mesCurto(dataInicio)} - ${String(
      dataFim.getDate(),
    ).padStart(2, '0')} ${mesCurto(dataFim)} ${dataFim.getFullYear()}`;
  }
  const label = (mesReferencia ?? dataFim).toLocaleDateString('pt-BR', {
    month: 'long',
    year: 'numeric',
  });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export function formatDisplayDate(value) {
  if (!value) return '';
  const date =
    typeof value === 'string'
      ? value.includes('T')
        ? new Date(value)
        : new Date(`${value}T12:00:00`)
      : new Date(value);
  if (isNaN(date.getTime())) return String(value);
  return date
    .toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
    .toUpperCase();
}

export function formatDate(value) {
  if (!value) return '';
  const date =
    typeof value === 'string'
      ? value.includes('T')
        ? new Date(value)
        : new Date(`${value}T12:00:00`)
      : new Date(value);
  if (isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export function formatCurrencyInput(value) {
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

export function parseCurrencyInput(value) {
  if (typeof value === 'number') return isNaN(value) ? 0 : value;
  if (!value) return 0;
  const clean = String(value).replace(/\./g, '').replace(',', '.');
  const num = parseFloat(clean);
  return isNaN(num) ? 0 : num;
}
