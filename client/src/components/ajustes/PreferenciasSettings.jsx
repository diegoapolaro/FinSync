function Campo({ label, children }) {
  return (
    <div className="flex justify-between items-center py-2">
      <span className="font-body-sm text-body-sm">{label}</span>
      {children}
    </div>
  );
}

function Toggle({ checked, onChange }) {
  return (
    <label className="relative inline-flex items-center cursor-pointer">
      <input type="checkbox" checked={checked} onChange={onChange} className="sr-only peer" />
      <div className="w-11 h-6 bg-surface-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary border-2 border-primary" />
    </label>
  );
}

export default function PreferenciasSettings({ prefs, atualizar }) {
  return (
    <section className="mb-stack-loose">
      <h3 className="font-headline-md text-[18px] uppercase tracking-wide mb-stack-base text-surface-tint">
        PREFERÊNCIAS
      </h3>
      <div className="pb-stack-base border-b border-dashed border-outline-variant">
        <Campo label="Formato de Data">
          <select
            value={prefs.formatoData}
            onChange={(e) => atualizar('formatoData', e.target.value)}
            className="bg-transparent border-0 border-b border-primary font-value-sm text-value-sm focus:ring-0 p-1 pr-6 cursor-pointer"
          >
            <option value="dd/mm/aaaa">dd/mm/aaaa</option>
            <option value="mm/dd/aaaa">mm/dd/aaaa</option>
            <option value="aaaa-mm-dd">aaaa-mm-dd</option>
          </select>
        </Campo>
        <Campo label="Moeda">
          <select
            value={prefs.moeda}
            onChange={(e) => atualizar('moeda', e.target.value)}
            className="bg-transparent border-0 border-b border-primary font-value-sm text-value-sm focus:ring-0 p-1 pr-6 cursor-pointer"
          >
            <option value="R$ (BRL)">R$ (BRL)</option>
            <option value="$ (USD)">$ (USD)</option>
            <option value="€ (EUR)">€ (EUR)</option>
          </select>
        </Campo>
        <Campo label="Tema (Claro/Escuro)">
          <Toggle
            checked={prefs.tema === 'escuro'}
            onChange={() => atualizar('tema', prefs.tema === 'escuro' ? 'claro' : 'escuro')}
          />
        </Campo>
      </div>
    </section>
  );
}
