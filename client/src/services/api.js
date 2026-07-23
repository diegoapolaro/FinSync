const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

let authToken = null;
let onUnauthorized = null;

export function setAuthToken(token) { authToken = token; }

export function setOnUnauthorized(callback) { onUnauthorized = callback; }

function getAuthHeaders() {
  return authToken ? { 'Authorization': `Bearer ${authToken}` } : {};
}

async function authFetch(url, options = {}) {
  const res = await fetch(url, {
    ...options,
    headers: { ...options.headers, ...getAuthHeaders() },
  });
  if (res.status === 401 && onUnauthorized) {
    onUnauthorized();
  }
  return handleResponse(res);
}

async function handleResponse(res) {
  if (!res.ok) {
    let message = `Erro ${res.status}: ${res.statusText}`;
    try {
      const body = await res.json();
      if (body.error) {
        message = body.error;
      } else if (body.detail) {
        message = body.detail;
      } else if (body.title) {
        message = body.title;
      }
      if (body.errors) {
        const errosDetalhados = Object.entries(body.errors)
          .map(([campo, msgs]) => `${campo}: ${msgs.join(', ')}`)
          .join('; ');
        if (errosDetalhados) message = `${message} (${errosDetalhados})`;
      }
    } catch {}
    throw new Error(message);
  }
  if (res.status === 204) return;
  const text = await res.text();
  return text ? JSON.parse(text) : undefined;
}

function url(path) {
  return `${BASE_URL}${path}`;
}

export async function login(email, senha) {
  const res = await fetch(url('/auth/login'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, senha }),
  });
  return handleResponse(res);
}

export async function registrar(nome, email, senha) {
  const res = await fetch(url('/auth/registrar'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nome, email, senha }),
  });
  return handleResponse(res);
}

export async function getContas() {
  return authFetch(url('/contas'));
}

export async function getResumoConta(contaId) {
  return authFetch(url(`/contas/${contaId}/resumo`));
}

export async function createConta(conta) {
  return authFetch(url('/contas'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(conta),
  });
}

export async function updateConta(id, conta) {
  return authFetch(url(`/contas/${id}`), {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(conta),
  });
}

export async function deleteConta(id) {
  return authFetch(url(`/contas/${id}`), {
    method: 'DELETE',
  });
}

export async function getTransacoes(contaId, data, dataInicio, dataFim, page = 1, pageSize = 20) {
  const params = new URLSearchParams();
  if (contaId) params.set('contaId', contaId);
  if (data) params.set('data', data);
  if (dataInicio) params.set('dataInicio', dataInicio);
  if (dataFim) params.set('dataFim', dataFim);
  params.set('page', page);
  params.set('pageSize', pageSize);
  return authFetch(url(`/transacoes?${params}`));
}

export async function getTransacoesRange(contaId, dataInicio, dataFim, page = 1, pageSize = 20) {
  return getTransacoes(contaId, null, dataInicio, dataFim, page, pageSize);
}

export async function getTransacao(id) {
  return authFetch(url(`/transacoes/${id}`));
}

export async function createTransacao(transacao) {
  return authFetch(url('/transacoes'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(transacao),
  });
}

export async function updateTransacao(id, transacao) {
  return authFetch(url(`/transacoes/${id}`), {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(transacao),
  });
}

export async function deleteTransacao(id) {
  return authFetch(url(`/transacoes/${id}`), {
    method: 'DELETE',
  });
}

export async function getCategorias() {
  return authFetch(url('/categorias'));
}

export async function createCategoria(categoria) {
  return authFetch(url('/categorias'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(categoria),
  });
}

export async function updateCategoria(id, categoria) {
  return authFetch(url(`/categorias/${id}`), {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(categoria),
  });
}

export async function getDetalhamento(contaId, dataInicio, dataFim) {
  const params = new URLSearchParams();
  if (contaId) params.set('contaId', contaId);
  params.set('dataInicio', dataInicio);
  params.set('dataFim', dataFim);
  return authFetch(url(`/transacoes/detalhamento?${params}`));
}

export async function getResumoPeriodo(contaId, dataInicio, dataFim) {
  const params = new URLSearchParams();
  if (contaId) params.set('contaId', contaId);
  params.set('dataInicio', dataInicio);
  params.set('dataFim', dataFim);
  return authFetch(url(`/transacoes/resumo-periodo?${params}`));
}

export async function exportarTransacoes(contaId, periodo, formato) {
  const params = new URLSearchParams();
  if (contaId) params.set('contaId', contaId);
  params.set('periodo', periodo);
  params.set('formato', formato);
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
