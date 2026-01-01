import { useEffect, useRef } from "react";
import { createFocusTrap, getFocusableElements, focusFirstElement } from "../accessibility";

/**
 * Hook для focus trap в модальных окнах и drawer'ах
 */
export interface UseFocusTrapOptions {
  enabled?: boolean;
  initialFocus?: HTMLElement | null;
  returnFocusOnDeactivate?: boolean;
}

export function useFocusTrap(options: UseFocusTrapOptions = {}) {
  const {
    enabled = true,
    initialFocus = null,
    returnFocusOnDeactivate = true,
  } = options;

  const containerRef = useRef<HTMLElement | null>(null);
  const previousActiveElementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!enabled || !containerRef.current) return;

    // Сохраняем текущий активный элемент
    if (returnFocusOnDeactivate) {
      previousActiveElementRef.current = document.activeElement as HTMLElement;
    }

    // Устанавливаем фокус
    if (initialFocus) {
      initialFocus.focus();
    } else {
      focusFirstElement(containerRef.current);
    }

    // Создаем focus trap
    const cleanup = createFocusTrap(containerRef.current);

    return () => {
      cleanup();
      // Восстанавливаем фокус
      if (returnFocusOnDeactivate && previousActiveElementRef.current) {
        previousActiveElementRef.current.focus();
      }
    };
  }, [enabled, initialFocus, returnFocusOnDeactivate]);

  return containerRef;
}

