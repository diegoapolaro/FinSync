import { Keyboard } from 'lucide-react';
import Modal from './Modal';

const ATALHOS_NAVEGACAO = [
  { tecla: 'D', descricao: 'Ir para o Dashboard' },
  { tecla: 'E', descricao: 'Ir para o Extrato' },
  { tecla: 'R', descricao: 'Ir para os Relatórios' },
  { tecla: 'I', descricao: 'Ir para Importação CSV' },
  { tecla: 'A', descricao: 'Ir para Ajustes do Sistema' },
];

const ATALHOS_ACOES = [
  { tecla: 'N', descricao: 'Novo lançamento financeiro' },
  { tecla: '/', descricao: 'Focar na barra de busca (Extrato)' },
  { tecla: '?', descricao: 'Abrir / Fechar esta ajuda de atalhos' },
  { tecla: 'Esc', descricao: 'Fechar modais e caixas de diálogo' },
];

export default function KeyboardShortcutsModal({ open, onClose }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Atalhos de Teclado"
      description="Navegue e execute ações no FinSync com máxima agilidade pelo teclado."
      icon={<Keyboard className="w-5 h-5 text-primary" />}
    >
      <div className="space-y-5 text-sm">
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2.5">
            Navegação Rápida
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {ATALHOS_NAVEGACAO.map((item) => (
              <div
                key={item.tecla}
                className="flex items-center justify-between p-2 rounded-xl bg-secondary/40 border border-border/40 hover:bg-secondary/70 transition-colors"
              >
                <span className="text-foreground/90 font-medium text-xs">{item.descricao}</span>
                <kbd className="px-2 py-0.5 min-w-[24px] text-center text-xs font-mono font-bold bg-background text-foreground border border-border/80 rounded-md shadow-sm">
                  {item.tecla}
                </kbd>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2.5">
            Ações & Produtividade
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {ATALHOS_ACOES.map((item) => (
              <div
                key={item.tecla}
                className="flex items-center justify-between p-2 rounded-xl bg-secondary/40 border border-border/40 hover:bg-secondary/70 transition-colors"
              >
                <span className="text-foreground/90 font-medium text-xs">{item.descricao}</span>
                <kbd className="px-2 py-0.5 min-w-[24px] text-center text-xs font-mono font-bold bg-background text-foreground border border-border/80 rounded-md shadow-sm">
                  {item.tecla}
                </kbd>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-2 border-t border-border/40 flex items-center justify-between text-xs text-muted-foreground">
          <span>Dica: Os atalhos são desativados enquanto você digita em formulários.</span>
          <kbd className="px-2 py-0.5 text-[11px] font-mono font-bold bg-muted text-muted-foreground border border-border/50 rounded">
            Esc para sair
          </kbd>
        </div>
      </div>
    </Modal>
  );
}
