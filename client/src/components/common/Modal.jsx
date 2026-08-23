import { Dialog, DialogTitle, DialogClose } from '../ui/dialog';

export default function Modal({ aberto, onClose, titulo, children }) {
  return (
    <Dialog open={aberto} onOpenChange={(open) => { if (!open) onClose(); }}>
      <div className="flex items-center justify-between pb-4 border-b border-border/50">
        <DialogTitle className="text-lg font-bold text-foreground uppercase tracking-wide">
          {titulo}
        </DialogTitle>
        <DialogClose onClick={onClose} />
      </div>
      <div className="pt-4">{children}</div>
    </Dialog>
  );
}