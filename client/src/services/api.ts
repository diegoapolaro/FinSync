import type {
  AuthResponse,
  LoginRequest,
  RegistrarRequest,
  GoogleLoginRequest,
  AtualizarPerfilRequest,
  AlterarSenhaRequest,
  DefinirSenhaRequest,
  TransacaoDto,
  CreateTransacaoDto,
  UpdateTransacaoDto,
  PagedResponse,
  SugestaoDescricaoDto,
  ContaDto,
  CreateContaDto,
  UpdateContaDto,
  ContaResumoDto,
  CategoriaDto,
  CreateCategoriaDto,
  UpdateCategoriaDto,
  OrcamentoDto,
  CreateOrcamentoDto,
  UpdateOrcamentoDto,
  StatusOrcamentoDto,
  RecorrenciaDto,
  CreateRecorrenciaDto,
  UpdateRecorrenciaDto,
  ResumoRecorrenciasDto,
  ResumoPeriodoDto,
  ProcessarRecorrenciasResponse,
  DetalhamentoCategoriaDto
} from '@/types';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

let authToken: string | null = null;
let onUnauthorized: (() => void) | null = null;

export function setAuthToken(token: string | null): void {
  authToken = token;
}

export function setOnUnauthorized(callback: () => void): void {
  onUnauthorized = callback;
}

function getAuthHeaders(): HeadersInit {
  return authToken ? { Authorization: `Bearer ${authToken}` } : {};
}

async function authFetch<T = any>(url: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: { ...options.headers, ...getAuthHeaders() },
  });
  if (res.status === 401 && onUnauthorized) {
    onUnauthorized();
  }
  return handleResponse<T>(res);
}

async function handleResponse<T = any>(res: Response): Promise<T> {
  if (!res.ok) {
    let message = `Erro ${res.status}: ${res.statusText}`;
    try {
      if (typeof res.json === 'function') {
        const body = await res.json();
        if (typeof body === 'string') {
          message = body;
        } else if (body?.error) {
          message = body.error;
        } else if (body?.detail) {
          message = body.detail;
        } else if (body?.title) {
          message = body.title;
        }
        if (body?.errors) {
          const errosDetalhados = Object.entries(body.errors)
            .map(([campo, msgs]) => `${campo}: ${(msgs as string[]).join(', ')}`)
            .join('; ');
          if (errosDetalhados) message = `${message} (${errosDetalhados})`;
        }
      } else if (typeof res.text === 'function') {
        const text = await res.text();
        if (text && text.trim()) message = text;
      }
    } catch {
      try {
        if (typeof res.text === 'function') {
          const text = await res.text();
          if (text && text.trim()) message = text;
        }
      } catch {}
    }
    throw new Error(message);
  }
  if (res.status === 204) return undefined as any;
  const text = typeof res.text === 'function' ? await res.text() : undefined;
  return text ? JSON.parse(text) : (undefined as any);
}

function url(path: string): string {
  return `${BASE_URL}${path}`;
}

export async function login(email: string, senha: string): Promise<AuthResponse> {
  const res = await fetch(url('/auth/login'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, senha } as LoginRequest),
  });
  return handleResponse<AuthResponse>(res);
}

export async function registrar(nome: string, email: string, senha: string): Promise<AuthResponse> {
  const res = await fetch(url('/auth/registrar'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nome, email, senha } as RegistrarRequest),
  });
  return handleResponse<AuthResponse>(res);
}

export async function loginGoogle(idToken: string): Promise<AuthResponse> {
  const res = await fetch(url('/auth/google'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken } as GoogleLoginRequest),
  });
  return handleResponse<AuthResponse>(res);
}

export async function alterarSenha(senhaAtual: string, novaSenha: string): Promise<void> {
  return authFetch<void>(url('/auth/alterar-senha'), {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ senhaAtual, novaSenha } as AlterarSenhaRequest),
  });
}

export async function definirSenha(novaSenha: string): Promise<void> {
  return authFetch<void>(url('/auth/definir-senha'), {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ novaSenha } as DefinirSenhaRequest),
  });
}

export async function atualizarPerfil(dados: AtualizarPerfilRequest): Promise<AuthResponse> {
  return authFetch<AuthResponse>(url('/auth/perfil'), {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dados),
  });
}

export async function getContas(): Promise<ContaDto[]> {
  return authFetch<ContaDto[]>(url('/contas'));
}

export async function getResumoConta(contaId: string): Promise<ContaResumoDto> {
  return authFetch<ContaResumoDto>(url(`/contas/${contaId}/resumo`));
}

export async function createConta(conta: CreateContaDto): Promise<ContaDto> {
  return authFetch<ContaDto>(url('/contas'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(conta),
  });
}

export async function updateConta(id: string, conta: UpdateContaDto): Promise<ContaDto> {
  return authFetch<ContaDto>(url(`/contas/${id}`), {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(conta),
  });
}

export async function deleteConta(id: string): Promise<void> {
  return authFetch<void>(url(`/contas/${id}`), {
    method: 'DELETE',
  });
}

export interface GetTransacoesParams {
  contaId?: string | null;
  data?: string | null;
  dataInicio?: string | null;
  dataFim?: string | null;
  page?: number;
  pageSize?: number;
  categoriaId?: string | null;
  status?: string | null;
}

export async function getTransacoes({
  contaId = null,
  data = null,
  dataInicio = null,
  dataFim = null,
  page = 1,
  pageSize = 20,
  categoriaId = null,
  status = null,
}: GetTransacoesParams = {}): Promise<PagedResponse<TransacaoDto>> {
  const params = new URLSearchParams();
  if (contaId) params.set('contaId', contaId);
  if (data) params.set('data', data);
  if (dataInicio) params.set('dataInicio', dataInicio);
  if (dataFim) params.set('dataFim', dataFim);
  if (categoriaId) params.set('categoriaId', categoriaId);
  if (status) params.set('status', status);
  params.set('page', page.toString());
  params.set('pageSize', pageSize.toString());
  return authFetch<PagedResponse<TransacaoDto>>(url(`/transacoes?${params}`));
}

export async function getTransacoesRange({
  contaId = null,
  dataInicio,
  dataFim,
  page = 1,
  pageSize = 20,
  categoriaId = null,
  status = null,
}: GetTransacoesParams = {}): Promise<PagedResponse<TransacaoDto>> {
  return getTransacoes({ contaId, dataInicio, dataFim, page, pageSize, categoriaId, status });
}

export async function getTransacao(id: string): Promise<TransacaoDto> {
  return authFetch<TransacaoDto>(url(`/transacoes/${id}`));
}

export interface GetSugestoesDescricaoParams {
  contaId?: string | null;
  tipo?: string | null;
  termo?: string | null;
  limite?: number;
}

export async function getSugestoesDescricao({
  contaId = null,
  tipo = null,
  termo = null,
  limite = 50,
}: GetSugestoesDescricaoParams = {}): Promise<SugestaoDescricaoDto[]> {
  const params = new URLSearchParams();
  if (contaId) params.set('contaId', contaId);
  if (tipo) params.set('tipo', tipo);
  if (termo) params.set('termo', termo);
  if (limite) params.set('limite', limite.toString());
  const qs = params.toString() ? `?${params}` : '';
  return authFetch<SugestaoDescricaoDto[]>(url(`/transacoes/sugestoes-descricao${qs}`));
}

export async function createTransacao(transacao: CreateTransacaoDto): Promise<TransacaoDto> {
  return authFetch<TransacaoDto>(url('/transacoes'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(transacao),
  });
}

export async function updateTransacao(id: number | string, transacao: UpdateTransacaoDto): Promise<TransacaoDto> {
  return authFetch<TransacaoDto>(url(`/transacoes/${id}`), {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(transacao),
  });
}

export async function updateTransacaoStatus(id: number | string, status: string): Promise<TransacaoDto> {
  return authFetch<TransacaoDto>(url(`/transacoes/${id}/status`), {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
}

export interface DeleteTransacaoParams {
  excluirTodasParcelas?: boolean;
  excluirFuturas?: boolean;
}

export async function deleteTransacao(
  id: number | string,
  { excluirTodasParcelas = false, excluirFuturas = false }: DeleteTransacaoParams = {},
): Promise<void> {
  const params = new URLSearchParams();
  if (excluirTodasParcelas) params.set('excluirTodasParcelas', 'true');
  if (excluirFuturas) params.set('excluirFuturas', 'true');
  const qs = params.toString() ? `?${params}` : '';
  return authFetch<void>(url(`/transacoes/${id}${qs}`), {
    method: 'DELETE',
  });
}

export async function getRecorrencias(): Promise<RecorrenciaDto[]> {
  return authFetch<RecorrenciaDto[]>(url('/recorrencias'));
}

export async function getResumoRecorrencias(): Promise<ResumoRecorrenciasDto> {
  return authFetch<ResumoRecorrenciasDto>(url('/recorrencias/resumo'));
}

export async function getRecorrencia(id: string): Promise<RecorrenciaDto> {
  return authFetch<RecorrenciaDto>(url(`/recorrencias/${id}`));
}

export async function createRecorrencia(recorrencia: CreateRecorrenciaDto): Promise<RecorrenciaDto> {
  return authFetch<RecorrenciaDto>(url('/recorrencias'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(recorrencia),
  });
}

export async function updateRecorrencia(id: string, recorrencia: UpdateRecorrenciaDto): Promise<RecorrenciaDto> {
  return authFetch<RecorrenciaDto>(url(`/recorrencias/${id}`), {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(recorrencia),
  });
}

export async function toggleRecorrenciaAtivo(id: string): Promise<RecorrenciaDto> {
  return authFetch<RecorrenciaDto>(url(`/recorrencias/${id}/toggle-ativo`), {
    method: 'PATCH',
  });
}

export async function deleteRecorrencia(id: string, excluirFuturas = true): Promise<void> {
  return authFetch<void>(url(`/recorrencias/${id}?excluirFuturas=${excluirFuturas}`), {
    method: 'DELETE',
  });
}

export async function processarRecorrencias(): Promise<ProcessarRecorrenciasResponse> {
  return authFetch<ProcessarRecorrenciasResponse>(url('/recorrencias/processar'), {
    method: 'POST',
  });
}

export async function getCategorias(): Promise<CategoriaDto[]> {
  return authFetch<CategoriaDto[]>(url('/categorias'));
}

export async function createCategoria(categoria: CreateCategoriaDto): Promise<CategoriaDto> {
  return authFetch<CategoriaDto>(url('/categorias'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(categoria),
  });
}

export async function updateCategoria(id: string, categoria: UpdateCategoriaDto): Promise<CategoriaDto> {
  return authFetch<CategoriaDto>(url(`/categorias/${id}`), {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(categoria),
  });
}

export async function getDetalhamento(contaId: string | null, dataInicio: string, dataFim: string): Promise<DetalhamentoCategoriaDto[]> {
  const params = new URLSearchParams();
  if (contaId) params.set('contaId', contaId);
  params.set('dataInicio', dataInicio);
  params.set('dataFim', dataFim);
  return authFetch<DetalhamentoCategoriaDto[]>(url(`/transacoes/detalhamento?${params}`));
}

export async function getResumoPeriodo(contaId: string | null, dataInicio: string, dataFim: string): Promise<ResumoPeriodoDto> {
  const params = new URLSearchParams();
  if (contaId) params.set('contaId', contaId);
  params.set('dataInicio', dataInicio);
  params.set('dataFim', dataFim);
  return authFetch<ResumoPeriodoDto>(url(`/transacoes/resumo-periodo?${params}`));
}

export async function exportarTransacoes(contaId: string | null, periodo: string | null, formato: string | null, dataInicio?: string | null, dataFim?: string | null): Promise<Blob> {
  const params = new URLSearchParams();
  if (contaId) params.set('contaId', contaId);
  if (periodo) params.set('periodo', periodo);
  if (formato) params.set('formato', formato);
  if (dataInicio) params.set('dataInicio', dataInicio);
  if (dataFim) params.set('dataFim', dataFim);
  const res = await fetch(url(`/transacoes/exportar?${params}`), {
    headers: { ...getAuthHeaders() },
  });
  if (!res.ok) {
    if (res.status === 401 && onUnauthorized) {
      onUnauthorized();
    }
    let message = 'Erro ao exportar';
    try {
      const body = await res.json();
      if (body.detail) message = body.detail;
    } catch {}
    throw new Error(message);
  }
  return res.blob();
}

// Orcamentos
export async function getOrcamentosResumo(mes?: number, ano?: number): Promise<StatusOrcamentoDto[]> {
  const params = new URLSearchParams();
  if (mes) params.set('mes', mes.toString());
  if (ano) params.set('ano', ano.toString());
  return authFetch<StatusOrcamentoDto[]>(url(`/orcamentos/resumo?${params}`));
}

export async function createOrcamento(orcamento: CreateOrcamentoDto): Promise<OrcamentoDto> {
  return authFetch<OrcamentoDto>(url('/orcamentos'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(orcamento),
  });
}

export async function updateOrcamento(id: string, orcamento: UpdateOrcamentoDto): Promise<OrcamentoDto> {
  return authFetch<OrcamentoDto>(url(`/orcamentos/${id}`), {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(orcamento),
  });
}

export async function deleteOrcamento(id: string): Promise<void> {
  return authFetch<void>(url(`/orcamentos/${id}`), {
    method: 'DELETE',
  });
}
// Importacao
export async function importarArquivoCsv(file: File): Promise<any> {
  const formData = new FormData();
  formData.append('arquivo', file);
  const res = await fetch(url('/transacoes/importar'), {
    method: 'POST',
    headers: { ...getAuthHeaders() },
    body: formData,
  });
  return handleResponse<any>(res);
}

export async function createTransacoesLote(transacoes: CreateTransacaoDto[]): Promise<TransacaoDto[]> {
  return authFetch<TransacaoDto[]>(url('/transacoes/lote'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(transacoes),
  });
}
