import { 
  TipoTransacao, 
  StatusTransacao, 
  FrequenciaRecorrencia, 
  ModoValorParcelamento 
} from '../types/enums';

export const TIPO_TRANSACAO = {
  ENTRADA: 'Entrada',
  SAIDA: 'Saida',
} as const;

export const CATEGORIA_TIPO = {
  ENTRADA: 'Entrada',
  SAIDA: 'Saida',
} as const;

export const STATUS_TRANSACAO = {
  PAGO: 'Pago',
  PENDENTE: 'Pendente',
} as const;

export const FREQUENCIA_RECORRENCIA = {
  SEMANAL: 'Semanal',
  QUINZENAL: 'Quinzenal',
  MENSAL: 'Mensal',
  ANUAL: 'Anual',
} as const;

export const MODO_PARCELAMENTO = {
  TOTAL: 'Total',
  PARCELA: 'Parcela',
} as const;

export const MODO_LANCAMENTO = {
  UNICO: 'unico',
  PARCELADO: 'parcelado',
  RECORRENTE: 'recorrente',
} as const;

export { TipoTransacao, StatusTransacao, FrequenciaRecorrencia, ModoValorParcelamento };
