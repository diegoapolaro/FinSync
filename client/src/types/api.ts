import type {
  TipoTransacao,
  TipoConta,
  StatusTransacao,
  FrequenciaRecorrencia,
  ModoValorParcelamento,
} from './enums';

// ── Auth ──────────────────────────────────────────────────────────────

export interface RegistrarRequest {
  nome: string;
  email: string;
  senha: string;
}

export interface LoginRequest {
  email: string;
  senha: string;
}

export interface GoogleLoginRequest {
  idToken: string;
}

export interface AuthResponse {
  token: string;
  nome: string;
  email: string;
  fotoUrl?: string | null;
  temSenha: boolean;
}

export interface AlterarSenhaRequest {
  senhaAtual: string;
  novaSenha: string;
}

export interface DefinirSenhaRequest {
  novaSenha: string;
}

export interface AtualizarPerfilRequest {
  nome: string;
  fotoUrl?: string | null;
}

// ── Transações ────────────────────────────────────────────────────────

export interface CreateTransacaoDto {
  descricao: string;
  valor: number;
  tipo: TipoTransacao;
  status?: StatusTransacao;
  data: string; // DateOnly → "YYYY-MM-DD"
  contaId: number;
  categoriaId?: number | null;
  parcelado?: boolean;
  totalParcelas?: number | null;
  modoValorParcelamento?: ModoValorParcelamento | string | null;
  tornarRecorrente?: boolean;
  frequenciaRecorrencia?: FrequenciaRecorrencia | null;
  dataFimRecorrencia?: string | null;
}

export interface UpdateTransacaoDto {
  descricao: string;
  valor: number;
  tipo: TipoTransacao;
  status: StatusTransacao;
  data: string;
  contaId: number;
  categoriaId?: number | null;
}

export interface UpdateStatusTransacaoDto {
  status: StatusTransacao;
}

export interface TransacaoDto {
  id: number;
  descricao: string;
  valor: number;
  tipo: TipoTransacao;
  status: StatusTransacao;
  data: string;
  contaId: number;
  contaNome: string;
  categoriaId?: number | null;
  categoriaNome?: string;
  categoriaCor?: string;
  parcelamentoId?: string | null; // Guid serializado como string
  numeroParcela?: number | null;
  totalParcelas?: number | null;
  recorrenciaId?: number | null;
  frequenciaRecorrencia?: FrequenciaRecorrencia | null;
}

export interface PagedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface DetalhamentoCategoriaDto {
  categoriaId?: number | null;
  categoriaNome: string;
  categoriaCor: string;
  total: number;
}

export interface TransacaoPreviewDto {
  data: string;
  descricao: string;
  valor: number;
  tipo: TipoTransacao;
}

export interface SugestaoDescricaoDto {
  descricao: string;
  totalUsos: number;
  ultimaData?: string | null;
  categoriaId?: number | null;
}

// ── Contas ─────────────────────────────────────────────────────────────

export interface CreateContaDto {
  nome: string;
  tipo: TipoConta;
}

export interface UpdateContaDto {
  nome: string;
  tipo: TipoConta;
  arquivada: boolean;
}

export interface ContaDto {
  id: number;
  nome: string;
  tipo: TipoConta;
  arquivada: boolean;
}

export interface ContaResumoDto {
  totalEntradas: number;
  totalSaidas: number;
  saldo: number;
  totalEntradasHoje: number;
  totalSaidasHoje: number;
  saldoDiario: number;
  totalEntradasMes: number;
  totalSaidasMes: number;
  saldoMensal: number;
  quantidadeTransacoes: number;
}

// ── Categorias ────────────────────────────────────────────────────────

export interface CreateCategoriaDto {
  nome: string;
  cor: string;
  tipo: TipoTransacao;
}

export interface UpdateCategoriaDto {
  nome: string;
  cor: string;
  tipo: TipoTransacao;
}

export interface CategoriaDto {
  id: number;
  nome: string;
  cor: string;
  tipo: TipoTransacao;
}

// ── Orçamentos ────────────────────────────────────────────────────────

export interface CreateOrcamentoDto {
  categoriaId: number;
  valorLimite: number;
  mes: number;
  ano: number;
}

export interface UpdateOrcamentoDto {
  valorLimite: number;
}

export interface OrcamentoDto {
  id: number;
  categoriaId: number;
  valorLimite: number;
  mes: number;
  ano: number;
}

export interface StatusOrcamentoDto extends OrcamentoDto {
  totalGasto: number;
  percentualUso: number;
}

// ── Recorrências ──────────────────────────────────────────────────────

export interface CreateRecorrenciaDto {
  descricao: string;
  valor: number;
  tipo: TipoTransacao;
  frequencia?: FrequenciaRecorrencia;
  dataInicio: string;
  dataFim?: string | null;
  statusPadrao?: StatusTransacao;
  contaId: number;
  categoriaId?: number | null;
}

export interface UpdateRecorrenciaDto {
  descricao: string;
  valor: number;
  tipo: TipoTransacao;
  frequencia: FrequenciaRecorrencia;
  dataInicio: string;
  dataFim?: string | null;
  statusPadrao: StatusTransacao;
  ativo: boolean;
  contaId: number;
  categoriaId?: number | null;
  atualizarTransacoesFuturas?: boolean;
}

export interface RecorrenciaDto {
  id: number;
  descricao: string;
  valor: number;
  tipo: TipoTransacao;
  frequencia: FrequenciaRecorrencia;
  dataInicio: string;
  dataFim?: string | null;
  statusPadrao: StatusTransacao;
  ativo: boolean;
  proximoVencimento?: string | null;
  contaId: number;
  contaNome: string;
  categoriaId?: number | null;
  categoriaNome?: string;
  categoriaCor?: string;
  totalTransacoesGeradas: number;
}

export interface ResumoRecorrenciasDto {
  totalReceitasFixas: number;
  totalDespesasFixas: number;
  saldoFixo: number;
  totalAtivas: number;
  totalPausadas: number;
}

// ── Resumo Período ────────────────────────────────────────────────────

export interface ResumoPeriodoDto {
  totalEntradas: number;
  totalSaidas: number;
  saldo: number;
}

// ── Processar Recorrências ────────────────────────────────────────────

export interface ProcessarRecorrenciasResponse {
  novasTransacoesGeradas: number;
}
