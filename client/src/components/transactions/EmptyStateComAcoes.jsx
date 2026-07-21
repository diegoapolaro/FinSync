import { formatCurrency, formatDisplayDate } from '../../utils/formatters';

export default function EmptyStateComAcoes({ resumo, abrirLancamento }) {
  return (
    <>
      <div className="p-gutter border-b border-dashed border-outline-variant bg-surface-container-lowest">
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => abrirLancamento('Entrada')}
            className="btn-base flex-1 border-2 border-primary py-3 uppercase font-label-caps text-label-caps font-bold text-primary hover:bg-primary hover:text-on-primary flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-lg">add</span>
            Entrada
          </button>
          <button
            type="button"
            onClick={() => abrirLancamento('Saida')}
            className="btn-base flex-1 border-2 border-primary py-3 uppercase font-label-caps text-label-caps font-bold text-primary hover:bg-primary hover:text-on-primary flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-lg">remove</span>
            Saída
          </button>
        </div>
      </div>

      <div className="px-gutter py-4 border-b-2 border-primary flex justify-between items-end bg-surface-container-lowest">
        <div>
          <h2 className="font-headline-md text-headline-md text-primary">
            HOJE
          </h2>
          <p className="font-label-caps text-label-caps text-outline">
            {formatDisplayDate(new Date())}
          </p>
        </div>
        <div className="text-right">
          <span className="font-value-lg text-value-lg text-primary block">
            {formatCurrency(resumo.saldoDiario)}
          </span>
          <span className="font-label-caps text-label-caps text-outline block">
            SALDO DIÁRIO
          </span>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center min-h-[400px] p-gutter text-center">
        <div className="mb-stack-loose relative">
          <div className="w-32 h-32 border-4 border-outline/20 rounded-full flex items-center justify-center -rotate-12 border-dashed">
            <span
              className="material-symbols-outlined text-outline/40"
              style={{ fontSize: '64px', fontVariationSettings: "'wght' 200" }}
            >
              receipt_long
            </span>
          </div>
          <div className="absolute -bottom-2 -right-2 bg-background border-2 border-outline/50 w-12 h-12 flex items-center justify-center rotate-6">
            <span className="font-headline-md text-headline-md text-outline/60">
              ?
            </span>
          </div>
        </div>
        <p className="font-body-lg text-body-lg text-on-surface-variant max-w-[280px]">
          Nenhum lançamento ainda. Registre a primeira entrada ou saída acima.
        </p>
      </div>
    </>
  );
}
