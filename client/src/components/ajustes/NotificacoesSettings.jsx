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

export default function NotificacoesSettings({ prefs, atualizar }) {
  return (
    <section className="mb-stack-loose">
      <h3 className="font-headline-md text-[18px] uppercase tracking-wide mb-stack-base text-surface-tint">
        NOTIFICAÇÕES
      </h3>
      <div className="pb-stack-base border-b border-dashed border-outline-variant">
        <Campo label="Lembrete diário">
          <Toggle
            checked={prefs.lembreteDiario}
            onChange={() => atualizar('lembreteDiario', !prefs.lembreteDiario)}
          />
        </Campo>
        <Campo label="Alerta de saldo baixo">
          <Toggle
            checked={prefs.alertaSaldoBaixo}
            onChange={() => atualizar('alertaSaldoBaixo', !prefs.alertaSaldoBaixo)}
          />
        </Campo>
      </div>
    </section>
  );
}
