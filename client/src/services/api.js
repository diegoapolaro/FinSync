const BASE_URL = '/api/transacoes';

export async function getTransacoes() {
  const res = await fetch(BASE_URL);
  if (!res.ok) throw new Error('Erro ao carregar transações');
  return res.json();
}

export async function getTransacao(id) {
  const res = await fetch(`${BASE_URL}/${id}`);
  if (!res.ok) throw new Error('Transação não encontrada');
  return res.json();
}

export async function createTransacao(transacao) {
  const res = await fetch(BASE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(transacao),
  });
  if (!res.ok) throw new Error('Erro ao criar transação');
  return res.json();
}

export async function updateTransacao(id, transacao) {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(transacao),
  });
  if (!res.ok) throw new Error('Erro ao atualizar transação');
}

export async function deleteTransacao(id) {
  const res = await fetch(`${BASE_URL}/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Erro ao deletar transação');
}
