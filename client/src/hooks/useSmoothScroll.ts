import { useCallback, useRef } from 'react';
import { animate, AnimationPlaybackControls } from 'framer-motion';

/**
 * Encontra o container com scroll vertical ativo ou faz fallback para window.
 */
export function getScrollContainer(element: HTMLElement | null): HTMLElement | Window | Document | null {
  if (typeof window === 'undefined') return null;

  // Se houver o container principal de layout do FinSync
  const mainContainer = document.querySelector('main.overflow-y-auto') as HTMLElement;
  if (mainContainer) return mainContainer;

  let parent = element?.parentElement;
  while (parent && parent !== document.body && parent !== document.documentElement) {
    const style = window.getComputedStyle ? window.getComputedStyle(parent) : ({} as CSSStyleDeclaration);
    if (
      (style.overflowY === 'auto' || style.overflowY === 'scroll') &&
      parent.scrollHeight > parent.clientHeight
    ) {
      return parent;
    }
    parent = parent.parentElement;
  }

  return (document.scrollingElement as HTMLElement) || document.documentElement || window;
}

export interface ScrollOptions {
  offset?: number;
  onComplete?: () => void;
}

/**
 * Hook para rolagem com física natural e inércia suave usando framer-motion.
 */
export function useSmoothScroll() {
  const currentAnimationRef = useRef<AnimationPlaybackControls | null>(null);

  const stopCurrentAnimation = useCallback(() => {
    if (currentAnimationRef.current) {
      if (typeof currentAnimationRef.current.stop === 'function') {
        currentAnimationRef.current.stop();
      }
      currentAnimationRef.current = null;
    }
  }, []);

  const scrollToElement = useCallback(
    (targetId: string, { offset = 24, onComplete }: ScrollOptions = {}) => {
      if (typeof document === 'undefined') return;

      const element = document.getElementById(targetId);
      if (!element) return;

      const container = getScrollContainer(element);
      if (!container) return;

      // Interrompe animação anterior em andamento
      stopCurrentAnimation();

      const isWindow =
        container === window ||
        container === document.documentElement ||
        container === document.scrollingElement;

      let currentScroll = 0;
      if (isWindow) {
        currentScroll = window.scrollY || window.pageYOffset || document.documentElement?.scrollTop || 0;
      } else {
        currentScroll = (container as HTMLElement).scrollTop || 0;
      }

      let targetScroll = 0;
      if (isWindow) {
        const rect = element.getBoundingClientRect ? element.getBoundingClientRect() : { top: 0 };
        targetScroll = (window.scrollY || window.pageYOffset || 0) + rect.top - offset;
      } else {
        const containerHtml = container as HTMLElement;
        const containerRect = containerHtml.getBoundingClientRect
          ? containerHtml.getBoundingClientRect()
          : { top: 0 };
        const elementRect = element.getBoundingClientRect
          ? element.getBoundingClientRect()
          : { top: 0 };
        targetScroll = (containerHtml.scrollTop || 0) + (elementRect.top - containerRect.top) - offset;
      }

      // Evita scroll negativo ou além do limite
      const maxScroll = isWindow
        ? (document.documentElement?.scrollHeight || 1000) - (window.innerHeight || 800)
        : ((container as HTMLElement).scrollHeight || 1000) - ((container as HTMLElement).clientHeight || 800);
      const boundedTarget = Math.max(0, Math.min(targetScroll, Math.max(0, maxScroll)));

      // Se a distância for minúscula ou insignificante, aplica direto
      if (Math.abs(currentScroll - boundedTarget) < 1) {
        if (isWindow) {
          const isJsdom =
            typeof navigator !== 'undefined' && navigator.userAgent?.includes('jsdom');
          if (typeof window.scrollTo === 'function' && !isJsdom) {
            try {
              window.scrollTo(0, boundedTarget);
            } catch {
              if (document.documentElement) document.documentElement.scrollTop = boundedTarget;
            }
          } else if (document.documentElement) {
            document.documentElement.scrollTop = boundedTarget;
          }
        } else {
          (container as HTMLElement).scrollTop = boundedTarget;
        }
        if (onComplete) onComplete();
        return;
      }

      // Listener para cancelar a animação caso o usuário assuma o controle manualmente (wheel, touch ou keydown)
      const cancelOnUserInteraction = () => {
        stopCurrentAnimation();
        cleanupListeners();
      };

      const cleanupListeners = () => {
        window.removeEventListener('wheel', cancelOnUserInteraction);
        window.removeEventListener('touchmove', cancelOnUserInteraction);
        window.removeEventListener('keydown', cancelOnUserInteraction);
      };

      window.addEventListener('wheel', cancelOnUserInteraction, { passive: true });
      window.addEventListener('touchmove', cancelOnUserInteraction, { passive: true });
      window.addEventListener('keydown', cancelOnUserInteraction, { passive: true });

      // Animação com física spring orgânica (sensação tátil de arrasto natural)
      currentAnimationRef.current = animate(currentScroll, boundedTarget, {
        type: 'spring',
        stiffness: 85,
        damping: 20,
        mass: 0.8,
        restDelta: 0.5,
        onUpdate: (latest: number) => {
          if (isWindow) {
            const isJsdom =
              typeof navigator !== 'undefined' && navigator.userAgent?.includes('jsdom');
            if (typeof window.scrollTo === 'function' && !isJsdom) {
              try {
                window.scrollTo(0, latest);
              } catch {
                if (document.documentElement) document.documentElement.scrollTop = latest;
              }
            } else if (document.documentElement) {
              document.documentElement.scrollTop = latest;
            }
          } else {
            (container as HTMLElement).scrollTop = latest;
          }
        },
        onComplete: () => {
          cleanupListeners();
          currentAnimationRef.current = null;
          if (onComplete) onComplete();
        },
      });
    },
    [stopCurrentAnimation],
  );

  return {
    scrollToElement,
    stopCurrentAnimation,
  };
}
