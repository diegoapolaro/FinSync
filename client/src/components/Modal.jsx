export default function Modal({ aberto, onClose, titulo, children }) {
  if (!aberto) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" onClick={onClose}>
      <div
        className="bg-background w-full max-w-md border-2 border-primary shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-dashed border-outline-variant px-4 py-3">
          <h2 className="font-headline-md text-headline-md text-primary uppercase text-sm">
            {titulo}
          </h2>
          <button type="button" onClick={onClose} className="text-outline hover:text-primary transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}
