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
    <div className="bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.08)] border border-[#C7C4B8] overflow-hidden">
      <table className="w-full border-collapse text-left">
        <thead className="bg-[#F5F5F2] font-label-caps text-[11px] text-[#707972] border-b border-[#C7C4B8]">
          <tr>
            <th className="py-3.5 px-4 font-bold uppercase w-4"></th>
            <th className="py-3.5 px-4 font-bold uppercase">Descrição</th>
            <th className="py-3.5 px-4 font-bold uppercase w-40">Categoria</th>
            <th className="py-3.5 px-4 font-bold uppercase w-28">Data</th>
            <th className="py-3.5 px-4 font-bold uppercase text-right w-36">Valor</th>
            <th className="py-3.5 px-4 font-bold uppercase w-14"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#C7C4B8]/40">
          {carregando && (
            <tr>
              <td colSpan={6} className="text-center py-12 text-sm text-[#707972]">
                <span className="spinner inline-block align-middle mr-2" />Carregando...
              </td>
            </tr>
          )}
          {!carregando && paginadas.length === 0 && (
            <tr>
              <td colSpan={6} className="text-center py-12 text-sm text-[#707972]">
                Nenhuma movimentação neste período.
              </td>
            </tr>
          )}
          {!carregando && paginadas.map((t) => {
            const isEntrada = t.tipo === 'Entrada';
            const cor = isEntrada ? '#105137' : '#B23A2E';
            return (
              <tr key={t.id} className="group hover:bg-[#F5F5F2] transition-colors">
                <td className="py-3.5 px-4">
                  <div className="w-1 h-8 rounded-full" style={{ backgroundColor: cor }} />
                </td>
                <td className="py-3.5 px-4">
                  <div className="flex flex-col">
                    <span className="font-medium text-[#181D1A]">{t.descricao}</span>
                  </div>
                </td>
                <td className="py-3.5 px-4">
                  <span
                    className={
                      'px-2.5 py-1 rounded-md text-[11px] font-semibold uppercase tracking-wider border ' +
                      (isEntrada
                        ? 'bg-[#105137]/5 text-[#105137] border-[#105137]/20'
                        : 'bg-[#B23A2E]/5 text-[#B23A2E] border-[#B23A2E]/20')
                    }
                  >
                    {t.categoriaNome || 'GERAL'}
                  </span>
                </td>
                <td className="py-3.5 px-4 font-mono text-sm text-[#707972]">
                  {formatShortDate(t.data)}
                </td>
                <td
                  className={
                    'py-3.5 px-4 font-mono text-sm font-semibold text-right ' +
                    (isEntrada ? 'text-[#105137]' : 'text-[#B23A2E]')
                  }
                >
                  {isEntrada ? '+ ' : '- '}{formatCurrency(t.valor)}
                </td>
                <td className="py-3.5 px-4 text-right">
                  <button
                    onClick={() => onDelete(t.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-[#B23A2E]/10 text-[#707972] hover:text-[#B23A2E]"
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
        <div className="px-4 py-3 bg-[#F5F5F2] border-t border-[#C7C4B8] flex justify-between items-center">
          <span className="text-xs text-[#707972]">
            {paginaSegura * PAGE_SIZE + 1}&ndash;{Math.min((paginaSegura + 1) * PAGE_SIZE, transacoes.length)} de{' '}
            {transacoes.length}
          </span>
          <div className="flex gap-1.5">
            <button
              onClick={() => setPagina(Math.max(0, paginaSegura - 1))}
              disabled={paginaSegura === 0}
              className="w-7 h-7 flex items-center justify-center rounded border border-[#C7C4B8] hover:bg-white disabled:opacity-30 text-sm"
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
                      ? 'bg-[#105137] text-white'
                      : 'border border-[#C7C4B8] hover:bg-white')
                  }
                >
                  {pageNum + 1}
                </button>
              );
            })}
            <button
              onClick={() => setPagina(Math.min(totalPaginas - 1, paginaSegura + 1))}
              disabled={paginaSegura >= totalPaginas - 1}
              className="w-7 h-7 flex items-center justify-center rounded border border-[#C7C4B8] hover:bg-white disabled:opacity-30 text-sm"
            >
              <span className="material-symbols-outlined text-sm">chevron_right</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
