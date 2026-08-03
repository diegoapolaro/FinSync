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
