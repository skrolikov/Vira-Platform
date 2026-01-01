/**
 * Vira Reactive V2 - Полностью реактивное ядро без useState/useEffect
 * 
 * Цель: полностью убрать необходимость в useState/useEffect для реактивного состояния
 * 
 * Основные концепции:
 * 1. reactive() - создание реактивного значения
 * 2. computed() - вычисляемые значения (автоматически обновляются при изменении зависимостей)
 * 3. effect() - побочные эффекты (замена useEffect)
 * 4. useReactive() - хук для использования в компонентах (автоматическая подписка)
 */

import { scheduleUpdate } from "./batch";

// Типы для реактивных значений
export type ReactiveValue<T> = {
  value: T;
  __reactive__: true;
  __subscribers__: Set<() => void>;
  __deps__?: Set<ReactiveValue<any>>;
};

export type ReactiveRef<T> = {
  value: T;
};

// Глобальный контекст для отслеживания текущих подписок и эффектов
let currentSubscriber: (() => void) | null = null;
let currentEffect: (() => void | (() => void)) | null = null;
let effectCleanup: (() => void) | null = null;

/**
 * Создание реактивного значения
 * 
 * @example
 * const count = reactive(0);
 * count.value = 10; // Автоматически обновит все подписчики
 */
export function reactive<T>(initialValue: T): ReactiveRef<T> {
  const subscribers = new Set<() => void>();
  const deps = new Set<ReactiveValue<any>>();

  const reactiveValue: ReactiveValue<T> = {
    value: initialValue,
    __reactive__: true,
    __subscribers__: subscribers,
    __deps__: deps,
  };

  // Создаём Proxy для перехвата get/set
  return new Proxy(reactiveValue as any, {
    get(target, prop) {
      if (prop === "value") {
        // При чтении значения подписываем текущего подписчика
        if (currentSubscriber) {
          subscribers.add(currentSubscriber);
          // Добавляем себя в зависимости текущего computed/effect
          if (currentEffect && target.__deps__) {
            target.__deps__.add(target);
          }
        }
        return target.value;
      }
      return target[prop as keyof typeof target];
    },
    set(target, prop, newValue) {
      if (prop === "value") {
        const oldValue = target.value;
        if (oldValue !== newValue) {
          target.value = newValue;
          // Уведомляем всех подписчиков
          scheduleUpdate(() => {
            subscribers.forEach((fn) => fn());
          });
        }
        return true;
      }
      return false;
    },
  }) as ReactiveRef<T>;
}

/**
 * Создание вычисляемого значения (computed)
 * Автоматически пересчитывается при изменении зависимостей
 * 
 * @example
 * const count = reactive(0);
 * const doubleCount = computed(() => count.value * 2);
 * // doubleCount.value всегда равно count.value * 2
 */
export function computed<T>(computeFn: () => T): ReactiveRef<T> {
  const subscribers = new Set<() => void>();
  const deps = new Set<ReactiveValue<any>>();
  let cachedValue: T;
  let isDirty = true;

  const reactiveValue: ReactiveValue<T> = {
    get value() {
      // Если нужно пересчитать
      if (isDirty) {
        // Собираем зависимости
        const prevSubscriber = currentSubscriber;
        const prevEffect = currentEffect;

        currentSubscriber = () => {
          isDirty = true;
          // Уведомляем подписчиков этого computed
          scheduleUpdate(() => {
            subscribers.forEach((fn) => fn());
          });
        };

        currentEffect = currentSubscriber;
        deps.clear();

        try {
          cachedValue = computeFn();
        } finally {
          currentSubscriber = prevSubscriber;
          currentEffect = prevEffect;
        }

        isDirty = false;
      }

      // Подписываем текущего подписчика
      if (currentSubscriber) {
        subscribers.add(currentSubscriber);
      }

      return cachedValue!;
    },
    set value(_) {
      throw new Error("Computed values are read-only");
    },
    __reactive__: true,
    __subscribers__: subscribers,
    __deps__: deps,
  } as any;

  // Вычисляем начальное значение
  currentSubscriber = () => {
    isDirty = true;
    scheduleUpdate(() => {
      subscribers.forEach((fn) => fn());
    });
  };
  currentEffect = currentSubscriber;
  deps.clear();
  cachedValue = computeFn();
  currentSubscriber = null;
  currentEffect = null;

  return reactiveValue as any as ReactiveRef<T>;
}

/**
 * Побочный эффект (замена useEffect)
 * Автоматически запускается при изменении зависимостей
 * 
 * @example
 * const count = reactive(0);
 * effect(() => {
 *   console.log("Count changed:", count.value);
 *   return () => console.log("Cleanup");
 * });
 */
export function effect(effectFn: () => void | (() => void)) {
  let cleanup: (() => void) | null = null;
  let isActive = true;

  const runEffect = () => {
    if (!isActive) return;

    // Выполняем cleanup предыдущего эффекта
    if (cleanup) {
      cleanup();
      cleanup = null;
    }

    // Устанавливаем контекст для сбора зависимостей
    const prevEffect = currentEffect;
    currentEffect = runEffect;

    try {
      const result = effectFn();
      if (typeof result === "function") {
        cleanup = result;
      }
    } finally {
      currentEffect = prevEffect;
    }
  };

  // Первый запуск
  runEffect();

  // Возвращаем функцию для остановки эффекта
  return () => {
    isActive = false;
    if (cleanup) {
      cleanup();
      cleanup = null;
    }
  };
}

/**
 * Хук для использования реактивных значений в React компонентах
 * Полностью заменяет useState
 * 
 * @example
 * const count = reactive(0);
 * 
 * function Counter() {
 *   const countValue = useReactive(count);
 *   return <button onClick={() => count.value++}>{countValue}</button>;
 * }
 */
export function useReactive<T>(reactiveRef: ReactiveRef<T>): T {
  // Используем встроенный useState только для принудительного обновления
  const [, forceUpdate] = React.useReducer((x) => x + 1, 0);

  React.useEffect(() => {
    const updateFn = () => forceUpdate();
    
    // Подписываемся на изменения
    if ((reactiveRef as any).__subscribers__) {
      (reactiveRef as any).__subscribers__.add(updateFn);
    }

    // Отписываемся при размонтировании
    return () => {
      if ((reactiveRef as any).__subscribers__) {
        (reactiveRef as any).__subscribers__.delete(updateFn);
      }
    };
  }, [reactiveRef]);

  // Читаем текущее значение (это создаст подписку)
  const prevSubscriber = currentSubscriber;
  currentSubscriber = () => {}; // Заглушка, подписка уже создана в useEffect
  const value = reactiveRef.value;
  currentSubscriber = prevSubscriber;

  return value;
}

/**
 * Хук для использования computed значений в React компонентах
 * 
 * @example
 * const count = reactive(0);
 * const doubleCount = computed(() => count.value * 2);
 * 
 * function Counter() {
 *   const double = useComputed(doubleCount);
 *   return <div>{double}</div>;
 * }
 */
export function useComputed<T>(computedRef: ReactiveRef<T>): T {
  return useReactive(computedRef);
}

/**
 * Хук для использования эффектов в React компонентах
 * Полностью заменяет useEffect
 * 
 * @example
 * const count = reactive(0);
 * 
 * function Counter() {
 *   useReactiveEffect(() => {
 *     console.log("Count:", count.value);
 *     return () => console.log("Cleanup");
 *   });
 * }
 */
export function useReactiveEffect(effectFn: () => void | (() => void)) {
  React.useEffect(() => {
    return effect(effectFn);
  }, []);
}

/**
 * Создание реактивного объекта (несколько значений одновременно)
 * 
 * @example
 * const state = reactiveObject({
 *   count: 0,
 *   name: "John",
 * });
 * 
 * // state.count и state.name - реактивные
 */
export function reactiveObject<T extends Record<string, any>>(
  initialValues: T
): { [K in keyof T]: ReactiveRef<T[K]> } {
  const result = {} as any;

  for (const key in initialValues) {
    result[key] = reactive(initialValues[key]);
  }

  return result;
}

// Импорт React для хуков
import * as React from "react";

