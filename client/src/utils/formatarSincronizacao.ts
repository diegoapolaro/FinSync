/** Texto relativo da última sincronização (ex.: "há 5 min", "hoje às 14:30"). */
export function formatarUltimaSincronizacao(iso?: string | null, agora: Date = new Date()): string {
  if (!iso) return '';
  const data = new Date(iso);
  if (Number.isNaN(data.getTime())) return '';

  const minutos = Math.max(0, Math.floor((agora.getTime() - data.getTime()) / 60000));
  if (minutos < 1) return 'agora';
  if (minutos < 60) return `há ${minutos} min`;

  const hora = data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  if (data.toDateString() === agora.toDateString()) return `hoje às ${hora}`;
  return `em ${data.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })} às ${hora}`;
}
