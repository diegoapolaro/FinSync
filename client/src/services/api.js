const TRANSACOES_URL = '/api/transacoes';
const CONTAS_URL = '/api/contas';
const CATEGORIAS_URL = '/api/categorias';

export async function getContas() {
  const res = await fetch(CONTAS_URL);
  if (!res.ok) throw new Error('Erro ao carregar contas');
  return res.json();
}

export async function getResumoConta(contaId) {
  const res = await fetch(`${CONTAS_URL}/${contaId}/resumo`);
  if (!res.ok) throw new Error('Erro ao carregar resumo da conta');
  return res.json();
}

export async function createConta(conta) {
  const res = await fetch(CONTAS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(conta),
  });
  if (!res.ok) throw new Error('Erro ao criar conta');
  return res.json();
}

export async function updateConta(id, conta) {
  const res = await fetch(`${CONTAS_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(conta),
  });
  if (!res.ok) throw new Error('Erro ao atualizar conta');
}

export async function getTransacoes(contaId) {
  const url = contaId ? `${TRANSACOES_URL}?contaId=${contaId}` : TRANSACOES_URL;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Erro ao carregar transacoes');
  return res.json();
}

export async function getTransacao(id) {
  const res = await fetch(`${TRANSACOES_URL}/${id}`);
  if (!res.ok) throw new Error('Transacao nao encontrada');
  return res.json();
}

export async function createTransacao(transacao) {
  const res = await fetch(TRANSACOES_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(transacao),
  });
  if (!res.ok) throw new Error('Erro ao criar transacao');
  return res.json();
}

export async function updateTransacao(id, transacao) {
  const res = await fetch(`${TRANSACOES_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(transacao),
  });
  if (!res.ok) throw new Error('Erro ao atualizar transacao');
}

export async function deleteTransacao(id) {
  const res = await fetch(`${TRANSACOES_URL}/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Erro ao deletar transacao');
}

export async function getCategorias() {
  const res = await fetch(CATEGORIAS_URL);
  if (!res.ok) throw new Error('Erro ao carregar categorias');
  return res.json();
}

export async function createCategoria(categoria) {
  const res = await fetch(CATEGORIAS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(categoria),
  });
  if (!res.ok) throw new Error('Erro ao criar categoria');
  return res.json();
}

export async function updateCategoria(id, categoria) {
  const res = await fetch(`${CATEGORIAS_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(categoria),
  });
  if (!res.ok) throw new Error('Erro ao atualizar categoria');
}

export async function exportarTransacoes(contaId, periodo, formato) {
  const params = new URLSearchParams();
  if (contaId) params.set('contaId', contaId);
  params.set('periodo', periodo);
  params.set('formato', formato);
  const res = await fetch(`${TRANSACOES_URL}/exportar?${params}`);
  if (!res.ok) throw new Error('Erro ao exportar transacoes');
  return res.blob();
}
