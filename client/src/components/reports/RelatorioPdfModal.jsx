import { useRef } from 'react';
import { Printer, Download, X } from 'lucide-react';
import { Button } from '../ui/button';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { TIPO_TRANSACAO } from '../../utils/constants';

export default function RelatorioPdfModal({
  aberto,
  onFechar,
  periodoNome = 'Mês Atual',
  resumo = {},
  detalhamento = [],
  transacoes = [],
  contaNome = 'Todas as Contas',
}) {
  const relatorioRef = useRef(null);

  if (!aberto) return null;

  function handleImprimir() {
    window.print();
  }

  const totalEntradas = resumo?.totalEntradas ?? 0;
  const totalSaidas = resumo?.totalSaidas ?? 0;
  const saldo = resumo?.saldo ?? (totalEntradas - totalSaidas);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm print:p-0 print:bg-white">
      <div className="bg-card text-card-foreground border border-border rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden print:border-none print:shadow-none print:max-h-none print:max-w-none print:w-full">
        {/* Header do Modal (oculto na impressão) */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border print:hidden bg-secondary/50">
          <div>
            <h3 className="font-semibold text-base text-foreground">Relatório Financeiro Formatado</h3>
            <p className="text-xs text-muted-foreground">Visualize e imprima ou salve em PDF</p>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="default" onClick={handleImprimir} className="rounded-xl gap-1.5 text-xs font-semibold">
              <Printer className="w-4 h-4" />
              Imprimir / Salvar PDF
            </Button>
            <Button size="iconSm" variant="ghost" onClick={onFechar} className="rounded-xl text-muted-foreground hover:text-foreground">
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Conteúdo Imprimível do Relatório */}
        <div ref={relatorioRef} className="p-6 md:p-10 overflow-y-auto flex-1 print:p-0 print:overflow-visible text-foreground bg-card print:bg-white print:text-black">
          {/* Cabeçalho do Relatório */}
          <div className="flex justify-between items-start border-b border-border pb-6 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-bold text-2xl tracking-tight text-primary print:text-blue-600">FinSync</span>
                <span className="text-xs font-semibold uppercase px-2 py-0.5 rounded bg-secondary print:bg-gray-100 text-muted-foreground">
                  Relatório Executivo
                </span>
              </div>
              <p className="text-xs text-muted-foreground print:text-gray-500">
                Conta: <strong className="text-foreground print:text-black">{contaNome}</strong> | Período: <strong className="text-foreground print:text-black">{periodoNome}</strong>
              </p>
            </div>
            <div className="text-right text-xs text-muted-foreground print:text-gray-500">
              <p>Gerado em: {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
              <p>Sistema: FinSync Web App</p>
            </div>
          </div>

          {/* Resumo Financeiro / Indicadores */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="p-4 rounded-xl bg-secondary/40 print:bg-gray-50 border border-border/80">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground block mb-1">
                Total Entradas
              </span>
              <span className="text-xl font-bold numeric-mono text-emerald-600 print:text-green-700">
                {formatCurrency(totalEntradas)}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-secondary/40 print:bg-gray-50 border border-border/80">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground block mb-1">
                Total Saídas
              </span>
              <span className="text-xl font-bold numeric-mono text-rose-600 print:text-red-700">
                {formatCurrency(totalSaidas)}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-secondary/40 print:bg-gray-50 border border-border/80">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground block mb-1">
                Resultado Líquido
              </span>
              <span className={`text-xl font-bold numeric-mono ${saldo >= 0 ? 'text-emerald-600 print:text-green-700' : 'text-rose-600 print:text-red-700'}`}>
                {saldo >= 0 ? '+ ' : '- '}
                {formatCurrency(Math.abs(saldo))}
              </span>
            </div>
          </div>

          {/* Breakdown por Categoria */}
          {detalhamento.length > 0 && (
            <div className="mb-8">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                Distribuição por Categoria
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {detalhamento.map((cat, i) => (
                  <div key={i} className="p-2.5 rounded-lg border border-border/60 bg-secondary/20 flex justify-between items-center text-xs">
                    <span className="font-medium text-foreground truncate max-w-[130px]">{cat.categoriaNome || 'Sem Categoria'}</span>
                    <span className="numeric-mono font-semibold text-foreground">{formatCurrency(Math.abs(cat.total))}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tabela de Transações */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
              Lançamentos do Período ({transacoes.length})
            </h4>
            <div className="border border-border rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-secondary/60 print:bg-gray-100 border-b border-border text-muted-foreground font-semibold">
                    <th className="py-2.5 px-3">Data</th>
                    <th className="py-2.5 px-3">Descrição</th>
                    <th className="py-2.5 px-3">Categoria</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Valor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {transacoes.slice(0, 100).map((t) => (
                    <tr key={t.id}>
                      <td className="py-2 px-3 whitespace-nowrap">{formatDate(t.data)}</td>
                      <td className="py-2 px-3 font-medium text-foreground">{t.descricao}</td>
                      <td className="py-2 px-3 text-muted-foreground">{t.categoriaNome || '-'}</td>
                      <td className="py-2 px-3">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${t.status === 'Pago' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'}`}>
                          {t.status}
                        </span>
                      </td>
                      <td className={`py-2 px-3 text-right numeric-mono font-semibold ${t.tipo === TIPO_TRANSACAO.ENTRADA ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {t.tipo === TIPO_TRANSACAO.ENTRADA ? '+ ' : '- '}
                        {formatCurrency(t.valor)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
