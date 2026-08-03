export function formatDateOnly(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function primeiroDiaMes(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function ultimoDiaMes(date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

export function transacoesFiltradasPorPeriodo(
  transacoes,
  filtroTipo,
  dataSelecionada,
  dataInicio,
  dataFim,
) {
  if (filtroTipo === 'dia') {
    const alvo = formatDateOnly(dataSelecionada);
    return transacoes.filter((t) => t.data === alvo);
  }
  if (filtroTipo === 'periodo') {
    const inicio = formatDateOnly(dataInicio);
    const fim = formatDateOnly(dataFim);
    return transacoes.filter((t) => t.data >= inicio && t.data <= fim);
  }
  return transacoes;
}

export function periodoEfetivoParaApi(
  filtroTipo,
  mesReferencia,
  dataSelecionada,
  dataInicio,
  dataFim,
) {
  if (filtroTipo === 'dia') {
    const alvo = formatDateOnly(dataSelecionada);
    return { dataInicio: alvo, dataFim: alvo };
  }
  if (filtroTipo === 'periodo') {
    return {
      dataInicio: formatDateOnly(dataInicio),
      dataFim: formatDateOnly(dataFim),
    };
  }
  return {
    dataInicio: formatDateOnly(primeiroDiaMes(mesReferencia)),
    dataFim: formatDateOnly(ultimoDiaMes(mesReferencia)),
  };
}
