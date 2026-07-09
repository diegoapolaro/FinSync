export function formatCurrency(value) {
  return Number(value ?? 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
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
