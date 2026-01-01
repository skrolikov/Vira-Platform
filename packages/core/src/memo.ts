/**
 * Мемоизация для оптимизации вычислений
 * Кэширование результатов функций для избежания повторных вычислений
 */

type MemoKey = string | number;
type MemoCache<T> = Map<MemoKey, { value: T; timestamp: number }>;

interface MemoOptions {
  ttl?: number; // Time to live в миллисекундах
  maxSize?: number; // Максимальный размер кэша
  keyGenerator?: (...args: any[]) => MemoKey;
}

/**
 * Мемоизированная функция
 */
export function memoize<T extends (...args: any[]) => any>(
  fn: T,
  options: MemoOptions = {}
): T {
  const cache: MemoCache<ReturnType<T>> = new Map();
  const { ttl, maxSize, keyGenerator } = options;

  const generateKey = keyGenerator || ((...args: any[]) => {
    // Простой key generator - можно улучшить для объектов
    return JSON.stringify(args);
  });

  const memoizedFn = ((...args: any[]) => {
    const key = generateKey(...args);
    const cached = cache.get(key);

    // Проверяем кэш
    if (cached) {
      // Проверяем TTL
      if (!ttl || Date.now() - cached.timestamp < ttl) {
        return cached.value;
      } else {
        cache.delete(key);
      }
    }

    // Вычисляем значение
    const value = fn(...args);

    // Проверяем размер кэша
    if (maxSize && cache.size >= maxSize) {
      // Удаляем самый старый элемент (FIFO)
      const firstKey = cache.keys().next().value;
      if (firstKey !== undefined) {
        cache.delete(firstKey);
      }
    }

    // Сохраняем в кэш
    cache.set(key, { value, timestamp: Date.now() });

    return value;
  }) as T;

  // Метод для очистки кэша
  (memoizedFn as any).clearCache = () => {
    cache.clear();
  };

  // Метод для получения статистики кэша
  (memoizedFn as any).getCacheStats = () => {
    return {
      size: cache.size,
      maxSize: maxSize || Infinity,
      hitRate: (memoizedFn as any).hitRate || 0,
    };
  };

  return memoizedFn;
}

/**
 * Мемоизация React компонента
 */

export function memoComponent<T extends React.ComponentType<any>>(
  Component: T,
  areEqual?: (prevProps: Readonly<React.ComponentProps<T>>, nextProps: Readonly<React.ComponentProps<T>>) => boolean
): React.MemoExoticComponent<T> {
  return React.memo(Component as React.ComponentType<any>, areEqual as any) as React.MemoExoticComponent<T>;
}

/**
 * useMemo hook с расширенными возможностями
 */
import React, { useMemo as reactUseMemo, useRef, useEffect } from "react";

export function useMemo<T>(
  factory: () => T,
  deps: React.DependencyList,
  options: { ttl?: number } = {}
): T {
  const { ttl } = options;
  const cacheRef = useRef<{ value: T; timestamp: number; deps: React.DependencyList } | null>(null);

  return reactUseMemo(() => {
    const now = Date.now();

    // Проверяем кэш
    if (cacheRef.current) {
      // Проверяем зависимости
      const depsChanged = cacheRef.current.deps.length !== deps.length ||
        cacheRef.current.deps.some((dep, i) => dep !== deps[i]);

      // Проверяем TTL
      const cacheValid = !ttl || now - cacheRef.current.timestamp < ttl;

      if (!depsChanged && cacheValid) {
        return cacheRef.current.value;
      }
    }

    // Вычисляем новое значение
    const value = factory();
    cacheRef.current = { value, timestamp: now, deps: [...deps] };

    return value;
  }, deps);
}

