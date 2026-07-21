export default function Modal({ aberto, onClose, titulo, children }) {
  if (!aberto) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop open" onClick={onClose}>
      <div
        className="bg-background w-full max-w-md border-2 border-primary shadow-xl modal-content-enter"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-dashed border-outline-variant px-4 py-3">
          <h2 className="font-headline-md text-headline-md text-primary uppercase text-sm">
            {titulo}
          </h2>
          <button type="button" onClick={onClose} className="btn-base text-outline hover:text-primary transition-colors rounded-full p-1">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}
