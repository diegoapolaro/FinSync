export function formatDateOnly(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function getHojeDateString() {
  return formatDateOnly(new Date());
}

export function getOntemDateString() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return formatDateOnly(d);
}

export function formatLabel(date) {
  const hoje = new Date();
  const amanha = new Date(hoje);
  amanha.setDate(amanha.getDate() + 1);
  const ontem = new Date(hoje);
  ontem.setDate(ontem.getDate() - 1);

  const fmt = (d) => d.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' });

  if (date.toDateString() === hoje.toDateString()) return `Hoje, ${fmt(hoje)}`;
  if (date.toDateString() === amanha.toDateString()) return `Amanhã, ${fmt(amanha)}`;
  if (date.toDateString() === ontem.toDateString()) return `Ontem, ${fmt(ontem)}`;
  return fmt(date);
}
