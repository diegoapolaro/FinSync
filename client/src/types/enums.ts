// ── Shared Enums ──────────────────────────────────────────────────────
// Espelham os enums C# serializados via JsonStringEnumConverter

export const TipoTransacao = {
  Entrada: 'Entrada',
  Saida: 'Saida',
} as const;
export type TipoTransacao = (typeof TipoTransacao)[keyof typeof TipoTransacao];

export const TipoConta = {
  Comercial: 'Comercial',
  Pessoal: 'Pessoal',
} as const;
export type TipoConta = (typeof TipoConta)[keyof typeof TipoConta];

export const StatusTransacao = {
  Pago: 'Pago',
  Pendente: 'Pendente',
} as const;
export type StatusTransacao =
  (typeof StatusTransacao)[keyof typeof StatusTransacao];

export const FrequenciaRecorrencia = {
  Semanal: 'Semanal',
  Quinzenal: 'Quinzenal',
  Mensal: 'Mensal',
  Anual: 'Anual',
} as const;
export type FrequenciaRecorrencia =
  (typeof FrequenciaRecorrencia)[keyof typeof FrequenciaRecorrencia];

export const ModoValorParcelamento = {
  Total: 'Total',
  Parcela: 'Parcela',
} as const;
export type ModoValorParcelamento =
  (typeof ModoValorParcelamento)[keyof typeof ModoValorParcelamento];

export const ProvedorOpenFinance = {
  Manual: 'Manual',
  MockSandbox: 'MockSandbox',
  Pluggy: 'Pluggy',
  Belvo: 'Belvo',
  Klavi: 'Klavi',
} as const;
export type ProvedorOpenFinance =
  (typeof ProvedorOpenFinance)[keyof typeof ProvedorOpenFinance];

export const StatusSincronizacao = {
  Manual: 'Manual',
  Sincronizado: 'Sincronizado',
  Sincronizando: 'Sincronizando',
  Pendente: 'Pendente',
  Falha: 'Falha',
  Desconectado: 'Desconectado',
} as const;
export type StatusSincronizacao =
  (typeof StatusSincronizacao)[keyof typeof StatusSincronizacao];

