import { useState } from 'react';
import { formatCurrency } from '../../utils/formatters';

function formatShortDate(dateStr) {
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: '2-digit' }).replace('.', '');
}

const PAGE_SIZE = 10;

export default function TransactionTable({ transacoes, carregando, onDelete }) {
  const [pagina, setPagina] = useState(0);
  const totalPaginas = Math.max(1, Math.ceil(transacoes.length / PAGE_SIZE));
  const paginaSegura = Math.min(pagina, totalPaginas - 1);
  const paginadas = transacoes.slice(paginaSegura * PAGE_SIZE, (paginaSegura + 1) * PAGE_SIZE);

  return (
    <div className="rounded-xl shadow-card border border-line overflow-hidden" style={{ backgroundColor: 'var(--bg-card)' }}>
      <table className="w-full border-collapse text-left">
        <thead className="bg-surface-variant font-label-caps text-[11px] text-on-surface-variant border-b border-line">
          <tr>
            <th className="py-3.5 px-4 font-bold uppercase w-4"></th>
            <th className="py-3.5 px-4 font-bold uppercase">Descrição</th>
            <th className="py-3.5 px-4 font-bold uppercase w-40">Categoria</th>
            <th className="py-3.5 px-4 font-bold uppercase w-28">Data</th>
            <th className="py-3.5 px-4 font-bold uppercase text-right w-36">Valor</th>
            <th className="py-3.5 px-4 font-bold uppercase w-14"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line/40">
          {carregando && (
            <tr>
              <td colSpan={6} className="text-center py-12 text-sm text-on-surface-variant">
                <span className="spinner inline-block align-middle mr-2" />Carregando...
              </td>
            </tr>
          )}
          {!carregando && paginadas.length === 0 && (
            <tr>
              <td colSpan={6} className="text-center py-12 text-sm text-on-surface-variant">
                Nenhuma movimentação neste período.
              </td>
            </tr>
          )}
          {!carregando && paginadas.map((t) => {
            const isEntrada = t.tipo === 'Entrada';
            return (
              <tr key={t.id} className="group hover:bg-surface-variant transition-colors">
                <td className="py-3.5 px-4">
                  <div className="w-1 h-8 rounded-full" style={{ backgroundColor: isEntrada ? 'var(--color-entrada)' : 'var(--color-saida)' }} />
                </td>
                <td className="py-3.5 px-4">
                  <div className="flex flex-col">
                    <span className="font-medium text-on-surface">{t.descricao}</span>
                  </div>
                </td>
                <td className="py-3.5 px-4">
                  <span
                    className={
                      'px-2.5 py-1 rounded-md text-[11px] font-semibold uppercase tracking-wider border ' +
                      (isEntrada
                        ? 'bg-entrada/5 text-entrada border-entrada/20'
                        : 'bg-saida/5 text-saida border-saida/20')
                    }
                  >
                    {t.categoriaNome || 'GERAL'}
                  </span>
                </td>
                <td className="py-3.5 px-4 font-mono text-sm text-on-surface-variant">
                  {formatShortDate(t.data)}
                </td>
                <td
                  className={
                    'py-3.5 px-4 font-mono text-sm font-semibold text-right ' +
                    (isEntrada ? 'text-entrada' : 'text-saida')
                  }
                >
                  {isEntrada ? '+ ' : '- '}{formatCurrency(t.valor)}
                </td>
                <td className="py-3.5 px-4 text-right">
                  <button
                    onClick={() => onDelete(t.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-saida/10 text-on-surface-variant hover:text-saida"
                  >
                    <span className="material-symbols-outlined text-lg">delete</span>
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {!carregando && transacoes.length > PAGE_SIZE && (
        <div className="px-4 py-3 bg-surface-variant border-t border-line flex justify-between items-center">
          <span className="text-xs text-on-surface-variant">
            {paginaSegura * PAGE_SIZE + 1}&ndash;{Math.min((paginaSegura + 1) * PAGE_SIZE, transacoes.length)} de{' '}
            {transacoes.length}
          </span>
          <div className="flex gap-1.5">
            <button
              onClick={() => setPagina(Math.max(0, paginaSegura - 1))}
              disabled={paginaSegura === 0}
              className="w-7 h-7 flex items-center justify-center rounded border border-line disabled:opacity-30 text-sm"
              style={{ backgroundColor: 'var(--bg-card)' }}
            >
              <span className="material-symbols-outlined text-sm">chevron_left</span>
            </button>
            {Array.from({ length: Math.min(totalPaginas, 5) }, (_, i) => {
              const start = Math.max(0, Math.min(paginaSegura - 2, totalPaginas - 5));
              const pageNum = start + i;
              if (pageNum >= totalPaginas) return null;
              return (
                <button
                  key={pageNum}
                  onClick={() => setPagina(pageNum)}
                  className={
                    'w-7 h-7 flex items-center justify-center rounded text-xs font-mono ' +
                    (pageNum === paginaSegura
                      ? 'bg-entrada text-white'
                      : 'border border-line')
                  }
                  style={pageNum !== paginaSegura ? { backgroundColor: 'var(--bg-card)' } : undefined}
                >
                  {pageNum + 1}
                </button>
              );
            })}
            <button
              onClick={() => setPagina(Math.min(totalPaginas - 1, paginaSegura + 1))}
              disabled={paginaSegura >= totalPaginas - 1}
              className="w-7 h-7 flex items-center justify-center rounded border border-line disabled:opacity-30 text-sm"
              style={{ backgroundColor: 'var(--bg-card)' }}
            >
              <span className="material-symbols-outlined text-sm">chevron_right</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
