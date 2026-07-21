export default function SettingsSection({ id, title, icon, color = '#2F6B4F', children, className = '' }) {
  return (
    <section id={id} className={'scroll-mt-28 ' + className}>
      <div
        className="border-t-4 pt-5 mb-5"
        style={{ borderTopColor: color }}
      >
        <div className="flex items-center gap-2.5 mb-1">
          {icon && (
            <span className="material-symbols-outlined" style={{ color, fontSize: 22 }}>
              {icon}
            </span>
          )}
          <h2 className="text-lg font-bold uppercase tracking-wider" style={{ color }}>
            {title}
          </h2>
        </div>
      </div>
      {children}
    </section>
  );
}
