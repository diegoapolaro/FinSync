export default function TransactionForm({
  form,
  setForm,
  handleSubmit,
  setFormAberto,
}) {
  return (
    <form
      onSubmit={handleSubmit}
      className="bg-surface-container border-b border-dashed border-outline-variant p-gutter flex flex-col gap-3"
    >
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setForm({ ...form, tipo: 'Entrada' })}
          className={
            form.tipo === 'Entrada'
              ? 'flex-1 border-2 border-stamp-accent bg-tertiary-fixed-dim/20 text-stamp-accent py-3 uppercase font-label-caps text-label-caps font-bold transition-colors flex items-center justify-center gap-2'
              : 'flex-1 border-2 border-outline text-outline py-3 uppercase font-label-caps text-label-caps font-bold hover:bg-primary hover:text-on-primary hover:border-primary transition-colors flex items-center justify-center gap-2'
          }
        >
          <span className="material-symbols-outlined text-lg">add</span>
          Entrada
        </button>
        <button
          type="button"
          onClick={() => setForm({ ...form, tipo: 'Saida' })}
          className={
            form.tipo === 'Saida'
              ? 'flex-1 border-2 border-stamp-accent bg-tertiary-fixed-dim/20 text-stamp-accent py-3 uppercase font-label-caps text-label-caps font-bold transition-colors flex items-center justify-center gap-2'
              : 'flex-1 border-2 border-outline text-outline py-3 uppercase font-label-caps text-label-caps font-bold hover:bg-primary hover:text-on-primary hover:border-primary transition-colors flex items-center justify-center gap-2'
          }
        >
          <span className="material-symbols-outlined text-lg">remove</span>
          Saída
        </button>
      </div>
      <label className="flex flex-col gap-2 font-label-caps text-label-caps text-outline">
        Descrição
        <input
          placeholder="Ex: Venda de pizza"
          value={form.descricao}
          onChange={(e) => setForm({ ...form, descricao: e.target.value })}
          required
          className="bg-surface-container-lowest border border-outline-variant text-on-surface font-body-lg text-body-lg p-3 focus:border-primary focus:outline-2 focus:outline-primary/10"
        />
      </label>
      <div className="flex gap-3">
        <label className="flex flex-col gap-2 font-label-caps text-label-caps text-outline flex-1">
          Valor
          <input
            min="0.01"
            step="0.01"
            type="number"
            placeholder="0,00"
            value={form.valor}
            onChange={(e) => setForm({ ...form, valor: e.target.value })}
            required
            className="bg-surface-container-lowest border border-outline-variant text-on-surface font-body-lg text-body-lg p-3 focus:border-primary focus:outline-2 focus:outline-primary/10"
          />
        </label>
        <label className="flex flex-col gap-2 font-label-caps text-label-caps text-outline flex-1">
          Data
          <input
            type="date"
            value={form.data}
            onChange={(e) => setForm({ ...form, data: e.target.value })}
            className="bg-surface-container-lowest border border-outline-variant text-on-surface font-body-lg text-body-lg p-3 focus:border-primary focus:outline-2 focus:outline-primary/10"
          />
        </label>
      </div>
      <div className="flex gap-3 mt-2">
        <button
          type="button"
          onClick={() => setFormAberto(false)}
          className="flex-1 border-2 border-outline text-outline py-3 uppercase font-label-caps text-label-caps font-bold hover:bg-primary hover:text-on-primary hover:border-primary transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="flex-1 border-2 border-primary bg-primary text-on-primary py-3 uppercase font-label-caps text-label-caps font-bold hover:bg-ink transition-colors"
        >
          Registrar {form.tipo.toLowerCase()}
        </button>
      </div>
    </form>
  );
}
