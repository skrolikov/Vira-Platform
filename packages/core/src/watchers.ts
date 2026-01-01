/**
 * Система Watchers - computed с debounce/throttle
 * Для CRM: сохранения, обновления, поиск
 */

import { signal, Signal, computed, effect } from "./signals";

export interface WatchOptions {
  immediate?: boolean;
  debounce?: number;
  throttle?: number;
  deep?: boolean;
}

/**
 * Watcher - отслеживание изменений с возможностью debounce/throttle
 * 
 * @example
 * // Debounce для поиска
 * watch(
 *   () => searchQuery(),
 *   (newValue) => {
 *     performSearch(newValue);
 *   },
 *   { debounce: 300 }
 * );
 * 
 * // Throttle для автосохранения
 * watch(
 *   () => formData(),
 *   (newValue) => {
 *     autoSave(newValue);
 *   },
 *   { throttle: 1000 }
 * );
 */
export function watch<T>(
  source: Signal<T>,
  callback: (value: T, oldValue: T) => void,
  options: WatchOptions = {}
): () => void {
  let oldValue: T = source();
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let lastRunTime = 0;

  const runCallback = (newValue: T) => {
    callback(newValue, oldValue);
    oldValue = newValue;
  };

  const debouncedCallback = (newValue: T) => {
    if (options.debounce) {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      timeoutId = setTimeout(() => {
        runCallback(newValue);
      }, options.debounce);
    } else if (options.throttle) {
      const now = Date.now();
      if (now - lastRunTime >= options.throttle) {
        runCallback(newValue);
        lastRunTime = now;
      } else {
        // Запланировать выполнение после throttle
        const remaining = options.throttle - (now - lastRunTime);
        if (!timeoutId) {
          timeoutId = setTimeout(() => {
            runCallback(newValue);
            lastRunTime = Date.now();
          }, remaining);
        }
      }
    } else {
      runCallback(newValue);
    }
  };

  // Если immediate - вызываем сразу
  if (options.immediate) {
    debouncedCallback(source());
  }

  // Подписываемся на изменения
  const stop = effect(() => {
    const newValue = source();
    debouncedCallback(newValue);
  });

  // Возвращаем функцию остановки
  return () => {
    stop();
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  };
}

/**
 * Watch multiple sources
 * 
 * @example
 * watchEffect(
 *   [() => name(), () => email()],
 *   ([name, email]) => {
 *     console.log(name, email);
 *   },
 *   { debounce: 300 }
 * );
 */
export function watchEffect<T extends any[]>(
  sources: Array<Signal<any>>,
  callback: (values: T) => void,
  options: WatchOptions = {}
): () => void {
  let oldValues: T = sources.map(s => s()) as T;
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let lastRunTime = 0;

  const runCallback = (newValues: T) => {
    callback(newValues);
    oldValues = newValues;
  };

  const debouncedCallback = (newValues: T) => {
    if (options.debounce) {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      timeoutId = setTimeout(() => {
        runCallback(newValues);
      }, options.debounce);
    } else if (options.throttle) {
      const now = Date.now();
      if (now - lastRunTime >= options.throttle) {
        runCallback(newValues);
        lastRunTime = now;
      } else {
        const remaining = options.throttle - (now - lastRunTime);
        if (!timeoutId) {
          timeoutId = setTimeout(() => {
            runCallback(newValues);
            lastRunTime = Date.now();
          }, remaining);
        }
      }
    } else {
      runCallback(newValues);
    }
  };

  if (options.immediate) {
    debouncedCallback(sources.map(s => s()) as T);
  }

  const stop = effect(() => {
    const newValues = sources.map(s => s()) as T;
    debouncedCallback(newValues);
  });

  return () => {
    stop();
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  };
}

/**
 * Упрощённый watch с автоматическим определением источника
 * 
 * @example
 * watchEffect(() => {
 *   console.log(name(), email());
 * });
 */
export function watchEffectFn(
  effectFn: () => void,
  options: WatchOptions = {}
): () => void {
  return effect(effectFn);
}

