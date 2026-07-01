const TRANSACOES_URL = '/api/transacoes';
const CONTAS_URL = '/api/contas';

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
