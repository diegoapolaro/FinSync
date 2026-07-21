import { useState } from 'react';
import { exportarTransacoes } from '../../services/api';

function Campo({ label, children }) {
  return (
    <div className="flex justify-between items-center py-2">
      <span className="font-body-sm text-body-sm">{label}</span>
      {children}
    </div>
  );
}

export default function ExportarDados() {
  const [periodo, setPeriodo] = useState('mes_atual');
  const [exportando, setExportando] = useState(false);

  async function baixar() {
    setExportando(true);
    try {
      const blob = await exportarTransacoes(null, periodo, 'csv');
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `extrato_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      alert('Erro ao exportar transações.');
    }
    setExportando(false);
  }

  return (
    <section className="mb-stack-loose">
      <h3 className="font-headline-md text-[18px] uppercase tracking-wide mb-stack-base text-surface-tint">
        EXPORTAR DADOS
      </h3>
      <div className="pb-stack-base border-b border-dashed border-outline-variant">
        <Campo label="Período">
          <select
            value={periodo}
            onChange={(e) => setPeriodo(e.target.value)}
            className="bg-transparent border-0 border-b border-primary font-value-sm text-value-sm focus:ring-0 p-1 pr-6 cursor-pointer"
          >
            <option value="mes_atual">Este Mês</option>
            <option value="mes_passado">Mês Passado</option>
            <option value="ultimos_90">Últimos 90 dias</option>
            <option value="todos">Todos</option>
          </select>
        </Campo>
        <button
          type="button"
          onClick={baixar}
          disabled={exportando}
          className="btn-base w-full font-label-caps text-label-caps text-primary border-2 border-primary p-3 uppercase hover:bg-primary hover:text-on-primary flex justify-center items-center gap-2 mt-4 disabled:opacity-50"
        >
          {exportando && <span className="spinner-sm spinner" />}
          <span className="material-symbols-outlined">download</span>
          {exportando ? 'EXPORTANDO...' : 'BAIXAR EXTRATO (CSV)'}
        </button>
      </div>
    </section>
  );
}
