import { useEffect, useRef } from "react";
import { KeyboardNavigationOptions, createKeyboardHandler } from "../accessibility";

/**
 * Hook для keyboard navigation
 */
export function useKeyboardNavigation(
  options: KeyboardNavigationOptions,
  deps: any[] = []
) {
  const handlerRef = useRef(createKeyboardHandler(options));

  useEffect(() => {
    handlerRef.current = createKeyboardHandler(options);
  }, deps);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => handlerRef.current(e);
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);
}

/**
 * Hook для keyboard navigation внутри элемента
 */
export function useElementKeyboardNavigation<T extends HTMLElement>(
  options: KeyboardNavigationOptions,
  deps: any[] = []
) {
  const elementRef = useRef<T>(null);
  const handlerRef = useRef(createKeyboardHandler(options));

  useEffect(() => {
    handlerRef.current = createKeyboardHandler(options);
  }, deps);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const handler = (e: KeyboardEvent) => {
      // Проверяем, что фокус внутри элемента
      if (element.contains(document.activeElement)) {
        handlerRef.current(e);
      }
    };

    element.addEventListener("keydown", handler);
    return () => element.removeEventListener("keydown", handler);
  }, []);

  return elementRef;
}

/**
 * Hook для arrow key navigation в списках
 */
export interface UseArrowNavigationOptions {
  itemCount: number;
  onSelect: (index: number) => void;
  currentIndex?: number;
  loop?: boolean;
  orientation?: "horizontal" | "vertical";
}

export function useArrowNavigation(options: UseArrowNavigationOptions) {
  const {
    itemCount,
    onSelect,
    currentIndex = -1,
    loop = false,
    orientation = "vertical",
  } = options;

  const handleKeyDown = (e: KeyboardEvent) => {
    if (orientation === "vertical") {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        const nextIndex = currentIndex < itemCount - 1 ? currentIndex + 1 : (loop ? 0 : currentIndex);
        onSelect(nextIndex);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        const prevIndex = currentIndex > 0 ? currentIndex - 1 : (loop ? itemCount - 1 : currentIndex);
        onSelect(prevIndex);
      }
    } else {
      if (e.key === "ArrowRight") {
        e.preventDefault();
        const nextIndex = currentIndex < itemCount - 1 ? currentIndex + 1 : (loop ? 0 : currentIndex);
        onSelect(nextIndex);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        const prevIndex = currentIndex > 0 ? currentIndex - 1 : (loop ? itemCount - 1 : currentIndex);
        onSelect(prevIndex);
      }
    }

    if (e.key === "Home") {
      e.preventDefault();
      onSelect(0);
    } else if (e.key === "End") {
      e.preventDefault();
      onSelect(itemCount - 1);
    }
  };

  return handleKeyDown;
}

