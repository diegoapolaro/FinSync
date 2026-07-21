export default function ChartContainer({ title, icon, children, className = '' }) {
  return (
    <div
      className={
        'rounded-xl shadow-card border border-line p-5 ' +
        className
      }
      style={{ backgroundColor: 'var(--bg-card)' }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-on-surface text-base">{title}</h3>
        {icon && (
          <span className="material-symbols-outlined text-on-surface-variant text-lg">{icon}</span>
        )}
      </div>
      {children}
    </div>
  );
}
