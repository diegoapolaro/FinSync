import { Dialog, DialogTitle, DialogDescription, DialogClose } from '../ui/dialog';

export default function Modal({
  aberto,
  open,
  onClose,
  onOpenChange,
  titulo,
  title,
  descricao,
  description,
  icon,
  children,
}) {
  const isAberto = open !== undefined ? open : aberto;
  const fechar = () => {
    onClose?.();
    onOpenChange?.(false);
  };
  const modalTitulo = title || titulo;
  const modalDescricao = description || descricao;

  return (
    <Dialog
      open={isAberto}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) fechar();
      }}
    >
      <div className="flex items-start justify-between pb-4 border-b border-border/50">
        <div className="flex items-center gap-3">
          {icon && (
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center shrink-0">
              {icon}
            </div>
          )}
          <div>
            {modalTitulo && (
              <DialogTitle className="text-lg font-semibold text-foreground tracking-tight">
                {modalTitulo}
              </DialogTitle>
            )}
            {modalDescricao && (
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                {modalDescricao}
              </DialogDescription>
            )}
          </div>
        </div>
        <DialogClose onClick={fechar} />
      </div>
      <div className="pt-4">{children}</div>
    </Dialog>
  );
}
