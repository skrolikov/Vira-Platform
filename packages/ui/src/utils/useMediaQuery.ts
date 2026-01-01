import { useState, useEffect } from "react";
import { getBreakpoints } from "./breakpoints";

/**
 * Hook для определения размера экрана
 * Возвращает true, если медиа-запрос соответствует
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia(query);
    
    // Устанавливаем начальное значение
    setMatches(mediaQuery.matches);

    // Обработчик изменений
    const handler = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    // Современный способ с addEventListener
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handler);
      return () => mediaQuery.removeEventListener("change", handler);
    } else {
      // Fallback для старых браузеров
      mediaQuery.addListener(handler);
      return () => mediaQuery.removeListener(handler);
    }
  }, [query]);

  return matches;
}

/**
 * Hook для проверки, является ли экран мобильным (< md breakpoint)
 */
export function useIsMobile(): boolean {
  const breakpoints = getBreakpoints();
  return useMediaQuery(`(max-width: ${parseInt(breakpoints.md) - 1}px)`);
}

/**
 * Hook для проверки, является ли экран планшетом или больше (>= md breakpoint)
 */
export function useIsTabletAndUp(): boolean {
  const breakpoints = getBreakpoints();
  return useMediaQuery(`(min-width: ${breakpoints.md})`);
}

