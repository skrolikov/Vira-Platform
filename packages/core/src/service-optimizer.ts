/**
 * Оптимизации для сервисов
 * Lazy loading, service pooling, caching
 */

import { getServiceContainer } from "./services";
import type { ServiceContainer } from "./types";
import { devTools } from "./devtools";

/**
 * Lazy Service - сервис загружается только при первом обращении
 */
export function createLazyService<T>(
  name: string,
  factory: () => T,
  options: { preload?: boolean } = {}
): void {
  const container = getServiceContainer();
  let instance: T | null = null;
  let loading = false;

  const getInstance = (): T => {
    if (!instance) {
      if (loading) {
        throw new Error(`Service "${name}" is already being loaded`);
      }

      loading = true;
      try {
        instance = factory();
        devTools.logServiceAction(name, "lazy:load", {});
      } catch (error: any) {
        devTools.logError(name, error);
        throw error;
      } finally {
        loading = false;
      }
    }

    return instance;
  };

  // Регистрируем через createService
  // Используем существующую систему регистрации
  const { createService } = require("./services");
  createService(name, getInstance, { singleton: true });

  // Preload если нужно
  if (options.preload) {
    // Можно сделать асинхронную предзагрузку
    setTimeout(() => {
      getInstance();
    }, 0);
  }
}

/**
 * Service Pool - пул экземпляров для часто используемых сервисов
 */
export class ServicePool<T> {
  private pool: T[] = [];
  private factory: () => T;
  private maxSize: number;
  private currentSize = 0;

  constructor(factory: () => T, maxSize: number = 5) {
    this.factory = factory;
    this.maxSize = maxSize;
  }

  /**
   * Получить экземпляр из пула
   */
  acquire(): T {
    if (this.pool.length > 0) {
      return this.pool.pop()!;
    }

    if (this.currentSize < this.maxSize) {
      this.currentSize++;
      return this.factory();
    }

    // Если пул переполнен - создаём новый (можно улучшить стратегию)
    return this.factory();
  }

  /**
   * Вернуть экземпляр в пул
   */
  release(instance: T): void {
    if (this.pool.length < this.maxSize) {
      // Сброс состояния если нужно
      this.pool.push(instance);
    }
  }

  /**
   * Очистить пул
   */
  clear(): void {
    this.pool = [];
    this.currentSize = 0;
  }
}

/**
 * Service Cache - кэш для результатов методов сервисов
 */
export function createServiceCache<T extends object>(
  service: T,
  options: {
    methods?: string[]; // Методы для кэширования
    ttl?: number; // Time to live
    keyGenerator?: (method: string, args: any[]) => string;
  } = {}
): T {
  const cache = new Map<string, { value: any; timestamp: number }>();
  const { methods = [], ttl = 60000, keyGenerator } = options;

  const generateKey = keyGenerator || ((method: string, args: any[]) => {
    return `${method}:${JSON.stringify(args)}`;
  });

  return new Proxy(service, {
    get(target, prop: string | symbol) {
      const originalMethod = (target as any)[prop];

      // Если это не метод или не в списке для кэширования - возвращаем как есть
      if (typeof originalMethod !== "function" || !methods.includes(prop as string)) {
        return originalMethod;
      }

      // Обёртываем метод для кэширования
      return (...args: any[]) => {
        const key = generateKey(prop as string, args);
        const cached = cache.get(key);

        // Проверяем кэш
        if (cached && Date.now() - cached.timestamp < ttl) {
          return Promise.resolve(cached.value);
        }

        // Вызываем оригинальный метод
        const result = originalMethod.apply(target, args);

        // Кэшируем результат (поддерживаем промисы)
        if (result instanceof Promise) {
          return result.then((value) => {
            cache.set(key, { value, timestamp: Date.now() });
            return value;
          });
        } else {
          cache.set(key, { value: result, timestamp: Date.now() });
          return result;
        }
      };
    },
  });
}

/**
 * Debounce для методов сервисов
 */
export function debounceServiceMethod<T extends (...args: any[]) => any>(
  method: T,
  delay: number = 300
): T {
  let timeoutId: NodeJS.Timeout | null = null;

  return ((...args: any[]) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    return new Promise<any>((resolve) => {
      timeoutId = setTimeout(() => {
        timeoutId = null;
        resolve(method(...args));
      }, delay);
    });
  }) as T;
}

/**
 * Throttle для методов сервисов
 */
export function throttleServiceMethod<T extends (...args: any[]) => any>(
  method: T,
  limit: number = 1000
): T {
  let inThrottle = false;
  let lastResult: any;

  return ((...args: any[]) => {
    if (!inThrottle) {
      inThrottle = true;
      lastResult = method(...args);

      setTimeout(() => {
        inThrottle = false;
      }, limit);

      return Promise.resolve(lastResult);
    }

    return Promise.resolve(lastResult);
  }) as T;
}

