export default function ChartContainer({ title, icon, children, className = '' }) {
  return (
    <div
      className={
        'bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.08)] border border-[#C7C4B8] p-5 ' +
        className
      }
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-[#181D1A] text-base">{title}</h3>
        {icon && (
          <span className="material-symbols-outlined text-[#707972] text-lg">{icon}</span>
        )}
      </div>
      {children}
    </div>
  );
}
