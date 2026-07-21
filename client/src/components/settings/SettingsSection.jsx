export default function SettingsSection({ id, title, icon, color, children, className = '' }) {
  return (
    <section id={id} className={'scroll-mt-28 ' + className}>
      <div
        className="border-t-4 pt-5 mb-5"
        style={{ borderTopColor: color || 'var(--color-primaria)' }}
      >
        <div className="flex items-center gap-2.5 mb-1">
          {icon && (
            <span className="material-symbols-outlined" style={{ color: color || 'var(--color-primaria)', fontSize: 22 }}>
              {icon}
            </span>
          )}
          <h2 className="text-lg font-bold uppercase tracking-wider" style={{ color: color || 'var(--color-primaria)' }}>
            {title}
          </h2>
        </div>
      </div>
      {children}
    </section>
  );
}
