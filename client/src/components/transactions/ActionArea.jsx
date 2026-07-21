export default function ActionArea({ abrirLancamento }) {
  return (
    <div className="px-gutter py-margin-page flex justify-center gap-3">
      <button
        type="button"
        onClick={() => abrirLancamento('Entrada')}
        className="btn-base border-2 border-ink text-ink font-label-caps text-label-caps px-6 py-4 uppercase tracking-widest hover:bg-ink hover:text-paper flex items-center gap-2"
      >
        <span className="material-symbols-outlined text-sm">add_circle</span>
        + Entrada
      </button>
      <button
        type="button"
        onClick={() => abrirLancamento('Saida')}
        className="btn-base border-2 border-ink text-ink font-label-caps text-label-caps px-6 py-4 uppercase tracking-widest hover:bg-ink hover:text-paper flex items-center gap-2"
      >
        <span className="material-symbols-outlined text-sm">remove_circle</span>
        - Saída
      </button>
    </div>
  );
}
