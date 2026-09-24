import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Verifica se o elemento atualmente em foco é um campo interativo de digitação.
 */
function isInputElement(element) {
  if (!element) return false;
  const tagName = element.tagName?.toUpperCase();
  return (
    tagName === 'INPUT' ||
    tagName === 'TEXTAREA' ||
    tagName === 'SELECT' ||
    element.isContentEditable ||
    element.getAttribute?.('role') === 'textbox'
  );
}

/**
 * Hook global de atalhos de teclado para navegação e produtividade fintech.
 * 
 * Atalhos suportados:
 * - '?' : abre modal de atalhos de ajuda
 * - 'n' / 'N' : novo lançamento (/lancamentos)
 * - 'd' / 'D' : dashboard (/)
 * - 'e' / 'E' : extrato (/extrato)
 * - 'r' / 'R' : relatórios (/relatorios)
 * - 'i' / 'I' : importar (/importar)
 * - 'a' / 'A' : ajustes (/ajustes)
 * - '/' : foca no input de busca ativa (data-shortcut="search")
 * - 'Escape' : fecha modais abertos
 */
export function useKeyboardShortcuts({
  onToggleHelp,
  onCloseModal,
  isHelpOpen = false,
  enabled = true,
} = {}) {
  const navigate = useNavigate();

  useEffect(() => {
    if (!enabled) return;

    function handleKeyDown(event) {
      // Tecla Escape funciona mesmo dentro de inputs para permitir fechar modais rapidamente
      if (event.key === 'Escape') {
        if (onCloseModal) {
          onCloseModal();
        }
        return;
      }

      // Se o usuário estiver digitando em um input ou campo editável, ignoramos atalhos de letras
      if (isInputElement(document.activeElement)) {
        return;
      }

      // Atalho '?' para alternar modal de ajuda
      if (event.key === '?' || (event.shiftKey && event.key === '/')) {
        event.preventDefault();
        onToggleHelp?.();
        return;
      }

      // Atalho '/' para focar na busca
      if (event.key === '/') {
        const searchInput = document.querySelector('[data-shortcut="search"]');
        if (searchInput) {
          event.preventDefault();
          searchInput.focus();
          if (typeof searchInput.select === 'function') {
            searchInput.select();
          }
        }
        return;
      }

      // Não processar comandos com Ctrl, Meta (Cmd), Alt combinados para não interferir nos atalhos do navegador/OS
      if (event.ctrlKey || event.metaKey || event.altKey) {
        return;
      }

      const key = event.key.toLowerCase();

      switch (key) {
        case 'n':
          event.preventDefault();
          navigate('/lancamentos');
          break;
        case 'd':
          event.preventDefault();
          navigate('/');
          break;
        case 'e':
          event.preventDefault();
          navigate('/extrato');
          break;
        case 'r':
          event.preventDefault();
          navigate('/relatorios');
          break;
        case 'i':
          event.preventDefault();
          navigate('/importar');
          break;
        case 'a':
          event.preventDefault();
          navigate('/ajustes');
          break;
        default:
          break;
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enabled, isHelpOpen, navigate, onToggleHelp, onCloseModal]);
}
