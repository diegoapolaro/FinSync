const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

async function handleResponse(res) {
  if (!res.ok) {
    let message = `Erro ${res.status}: ${res.statusText}`;
    try {
      const body = await res.json();
      if (body.detail) {
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

export async function getContas() {
  const res = await fetch(url('/contas'));
  return handleResponse(res);
}

export async function getResumoConta(contaId) {
  const res = await fetch(url(`/contas/${contaId}/resumo`));
  return handleResponse(res);
}

export async function createConta(conta) {
  const res = await fetch(url('/contas'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(conta),
  });
  return handleResponse(res);
}

export async function updateConta(id, conta) {
  const res = await fetch(url(`/contas/${id}`), {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(conta),
  });
  return handleResponse(res);
}

export async function getTransacoes(contaId, data, dataInicio, dataFim) {
  const params = new URLSearchParams();
  if (contaId) params.set('contaId', contaId);
  if (data) params.set('data', data);
  if (dataInicio) params.set('dataInicio', dataInicio);
  if (dataFim) params.set('dataFim', dataFim);
  const query = params.toString();
  const path = query ? `/transacoes?${query}` : '/transacoes';
  const res = await fetch(url(path));
  return handleResponse(res);
}

export async function getTransacoesRange(contaId, dataInicio, dataFim) {
  return getTransacoes(contaId, null, dataInicio, dataFim);
}

export async function getTransacao(id) {
  const res = await fetch(url(`/transacoes/${id}`));
  return handleResponse(res);
}

export async function createTransacao(transacao) {
  const res = await fetch(url('/transacoes'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(transacao),
  });
  return handleResponse(res);
}

export async function updateTransacao(id, transacao) {
  const res = await fetch(url(`/transacoes/${id}`), {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(transacao),
  });
  return handleResponse(res);
}

export async function deleteTransacao(id) {
  const res = await fetch(url(`/transacoes/${id}`), {
    method: 'DELETE',
  });
  return handleResponse(res);
}

export async function getCategorias() {
  const res = await fetch(url('/categorias'));
  return handleResponse(res);
}

export async function createCategoria(categoria) {
  const res = await fetch(url('/categorias'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(categoria),
  });
  return handleResponse(res);
}

export async function updateCategoria(id, categoria) {
  const res = await fetch(url(`/categorias/${id}`), {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(categoria),
  });
  return handleResponse(res);
}

export async function getDetalhamento(contaId, dataInicio, dataFim) {
  const params = new URLSearchParams();
  if (contaId) params.set('contaId', contaId);
  params.set('dataInicio', dataInicio);
  params.set('dataFim', dataFim);
  const res = await fetch(url(`/transacoes/detalhamento?${params}`));
  return handleResponse(res);
}

export async function getResumoPeriodo(contaId, dataInicio, dataFim) {
  const params = new URLSearchParams();
  if (contaId) params.set('contaId', contaId);
  params.set('dataInicio', dataInicio);
  params.set('dataFim', dataFim);
  const res = await fetch(url(`/transacoes/resumo-periodo?${params}`));
  return handleResponse(res);
}

export async function exportarTransacoes(contaId, periodo, formato) {
  const params = new URLSearchParams();
  if (contaId) params.set('contaId', contaId);
  params.set('periodo', periodo);
  params.set('formato', formato);
  const res = await fetch(url(`/transacoes/exportar?${params}`));
  if (!res.ok) {
    let message = 'Erro ao exportar';
    try {
      const body = await res.json();
      if (body.detail) message = body.detail;
    } catch {}
    throw new Error(message);
  }
  return res.blob();
}
