/**
 * Lifecycle hooks для сервисов
 * onMount, onUnmount, onUpdate
 */

import { useEffect, useRef } from "react";

// ============================================
// LIFECYCLE TYPES
// ============================================

export interface ServiceLifecycle {
  onMount?: () => void | (() => void);
  onUnmount?: () => void;
  onUpdate?: (deps: any[]) => void;
}

export interface ServiceWithLifecycle extends ServiceLifecycle {
  __lifecycle__?: true;
}

// ============================================
// LIFECYCLE HOOK
// ============================================

/**
 * React hook для lifecycle сервиса
 * Автоматически вызывает onMount, onUnmount, onUpdate
 */
export function useServiceLifecycle(
  service: ServiceWithLifecycle,
  deps: any[] = []
): void {
  const isFirstMount = useRef(true);
  const prevDepsRef = useRef(deps);

  useEffect(() => {
    // onMount - вызывается при первом монтировании
    if (isFirstMount.current && service.onMount) {
      const cleanup = service.onMount();
      isFirstMount.current = false;

      // Если onMount вернул функцию - это cleanup для onUnmount
      if (typeof cleanup === "function") {
        return cleanup;
      }
    }

    // onUpdate - вызывается при изменении deps
    if (!isFirstMount.current && service.onUpdate) {
      const prevDeps = prevDepsRef.current;
      const depsChanged = prevDeps.length !== deps.length ||
        prevDeps.some((prev, i) => prev !== deps[i]);

      if (depsChanged) {
        service.onUpdate(deps);
        prevDepsRef.current = deps;
      }
    }

    // onUnmount - вызывается при размонтировании
    return () => {
      if (service.onUnmount && !isFirstMount.current) {
        service.onUnmount();
      }
    };
  }, deps);
}

/**
 * Декоратор для добавления lifecycle к сервису
 */
export function withLifecycle<T extends object>(
  service: T,
  lifecycle: ServiceLifecycle
): T & ServiceWithLifecycle {
  return Object.assign(service, {
    ...lifecycle,
    __lifecycle__: true as const,
  });
}

