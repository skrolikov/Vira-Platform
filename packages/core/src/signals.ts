/**
 * ViraSignals - Signal система как в SolidJS
 * 
 * const [count, setCount] = signal(0);
 * 
 * Автоматически связывается с сервисами и компонентами
 */

import * as React from "react";
import { scheduleUpdate } from "./batch";

// Типы для signals
export type Signal<T> = () => T;
export type SignalSetter<T> = (value: T | ((prev: T) => T)) => T;

// Внутренняя структура signal для отслеживания подписчиков
interface SignalInternal<T> {
  value: T;
  observers: Set<() => void>;
}

// Глобальный контекст для отслеживания текущего читателя/писателя
let currentObserver: (() => void) | null = null;
let currentBatch: Array<() => void> | null = null;

// Стек эффектов для правильной очистки зависимостей (как Vue 3)
const effectStack: Array<{
  effect: () => void;
  deps: Set<SignalInternal<any>>;
}> = [];

// Map для связи сигналов с их внутренней структурой
const signalInternalMap = new WeakMap<Signal<any>, SignalInternal<any>>();

/**
 * Создание signal (как в SolidJS)
 * 
 * @example
 * const [count, setCount] = signal(0);
 * 
 * // Чтение
 * console.log(count()); // 0
 * 
 * // Запись
 * setCount(10);
 * setCount(prev => prev + 1);
 */
export function signal<T>(initialValue: T): [Signal<T>, SignalSetter<T>] {
  const internal: SignalInternal<T> = {
    value: initialValue,
    observers: new Set<() => void>(),
  };

  const getter: Signal<T> = () => {
    // Если есть активный наблюдатель - подписываем его
    if (currentObserver) {
      internal.observers.add(currentObserver);
      
      // Добавляем в зависимости текущего эффекта
      const currentEffectEntry = effectStack[effectStack.length - 1];
      if (currentEffectEntry) {
        currentEffectEntry.deps.add(internal as any);
      }
    }
    return internal.value;
  };

  const setter: SignalSetter<T> = (newValue) => {
    const nextValue = typeof newValue === "function"
      ? (newValue as (prev: T) => T)(internal.value)
      : newValue;

    if (nextValue !== internal.value) {
      internal.value = nextValue;

      // Уведомляем всех наблюдателей
      if (currentBatch) {
        // Добавляем в батч
        currentBatch.push(() => {
          internal.observers.forEach(obs => obs());
        });
      } else {
        // Сразу уведомляем
        scheduleUpdate(() => {
          internal.observers.forEach(obs => obs());
        });
      }
    }

    return internal.value;
  };

  // Сохраняем связь между getter и internal
  signalInternalMap.set(getter, internal);

  return [getter, setter];
}

/**
 * Создание computed signal (вычисляемое значение)
 * 
 * @example
 * const [count, setCount] = signal(0);
 * const doubleCount = computed(() => count() * 2);
 */
export function computed<T>(computeFn: () => T): Signal<T> {
  let cachedValue: T;
  let isDirty = true;
  const observers = new Set<() => void>();
  const deps = new Set<Signal<any>>();

  const getter: Signal<T> = () => {
    // Если значение устарело - пересчитываем
    if (isDirty) {
      // Собираем зависимости
      const prevObserver = currentObserver;
      const newObserver = () => {
        isDirty = true;
        // Уведомляем подписчиков этого computed
        scheduleUpdate(() => {
          observers.forEach(obs => obs());
        });
      };

      currentObserver = newObserver;
      deps.clear();

      try {
        cachedValue = computeFn();
        // После вычисления все использованные signals будут в deps
        // через их getter, который добавит newObserver в их observers
      } finally {
        currentObserver = prevObserver;
      }

      isDirty = false;
    }

    // Подписываем текущего наблюдателя
    if (currentObserver) {
      observers.add(currentObserver);
    }

    return cachedValue!;
  };

  // Первоначальное вычисление
  const prevObserver = currentObserver;
  currentObserver = null;
  cachedValue = computeFn();
  currentObserver = prevObserver;

  return getter;
}

/**
 * Эффект уровня SolidJS
 * Автоматически запускается при изменении зависимостей
 * 
 * @example
 * const [count, setCount] = signal(0);
 * 
 * effect(() => {
 *   console.log("Count changed:", count());
 * });
 */
export function effect(effectFn: () => void | (() => void)) {
  let cleanup: (() => void) | null = null;
  let isActive = true;
  let deps = new Set<SignalInternal<any>>();

  const runEffect = () => {
    if (!isActive) return;

    // Выполняем cleanup предыдущего эффекта
    if (cleanup) {
      cleanup();
      cleanup = null;
    }

    // ⚡ ОЧИСТКА: Удаляем runEffect из старых зависимостей
    deps.forEach(dep => {
      dep.observers.delete(runEffect);
    });
    deps.clear();

    // Добавляем в стек эффектов для правильной очистки
    const effectEntry = {
      effect: runEffect,
      deps,
    };
    effectStack.push(effectEntry);

    // Устанавливаем контекст для сбора зависимостей
    const prevObserver = currentObserver;
    currentObserver = runEffect;

    try {
      const result = effectFn();
      if (typeof result === "function") {
        cleanup = result;
      }
    } finally {
      currentObserver = prevObserver;
      effectStack.pop();
    }
  };

  // Первый запуск
  runEffect();

  // Возвращаем функцию для остановки эффекта
  return () => {
    isActive = false;
    
    // ⚡ ОЧИСТКА: Удаляем runEffect из всех зависимостей
    deps.forEach(dep => {
      dep.observers.delete(runEffect);
    });
    deps.clear();
    
    if (cleanup) {
      cleanup();
      cleanup = null;
    }
  };
}

/**
 * Batch обновления (группировка изменений)
 * 
 * @example
 * batch(() => {
 *   setCount(1);
 *   setName("John");
 *   // Все обновления применятся одновременно
 * });
 */
export function batch<T>(fn: () => T): T {
  const prevBatch = currentBatch;
  currentBatch = [];

  try {
    const result = fn();
    // Применяем все обновления
    if (currentBatch.length > 0) {
      scheduleUpdate(() => {
        currentBatch!.forEach(update => update());
      });
    }
    return result;
  } finally {
    currentBatch = prevBatch;
  }
}

/**
 * React hook для использования signal в компонентах
 * 
 * @example
 * const [count, setCount] = signal(0);
 * 
 * function Counter() {
 *   const countValue = useSignal(count);
 *   return <button onClick={() => setCount(count() + 1)}>{countValue}</button>;
 * }
 */
export function useSignal<T>(signal: Signal<T>): T {
  const [, forceUpdate] = React.useReducer((x) => x + 1, 0);
  const updateFnRef = React.useRef<(() => void) | null>(null);

  React.useEffect(() => {
    const updateFn = () => forceUpdate();
    updateFnRef.current = updateFn;
    
    // Получаем внутреннюю структуру signal
    const signalInternal = signalInternalMap.get(signal);
    if (signalInternal) {
      // Подписываемся на изменения
      signalInternal.observers.add(updateFn);
    }
    
    // Читаем текущее значение
    const currentValue = signal();

    // ⚡ ОЧИСТКА: Удаляем подписку при размонтировании
    return () => {
      if (signalInternal && updateFnRef.current) {
        signalInternal.observers.delete(updateFnRef.current);
      }
      updateFnRef.current = null;
    };
  }, [signal]);

  // Возвращаем текущее значение (без создания подписки, она уже создана в useEffect)
  const prevObserver = currentObserver;
  currentObserver = null;
  const value = signal();
  currentObserver = prevObserver;
  
  return value;
}

/**
 * Создание signal из свойства сервиса
 * Автоматически связывается с реактивным сервисом
 * 
 * @example
 * class UserService {
 *   count = 0;
 * }
 * 
 * const userService = createReactiveService(new UserService());
 * const [count, setCount] = signalFromService(userService, "count");
 */
export function signalFromService<T extends object, K extends keyof T>(
  service: T,
  property: K
): [Signal<T[K]>, SignalSetter<T[K]>] {
  const [getter, setter] = signal((service as any)[property]);

  // Следим за изменениями в сервисе
  if ((service as any).__reactive__) {
    effect(() => {
      const newValue = (service as any)[property];
      const currentValue = getter();
      if (newValue !== currentValue) {
        setter(newValue);
      }
    });
  }

  // При установке значения - обновляем сервис
  const originalSetter = setter;
  const serviceSetter: SignalSetter<T[K]> = (value) => {
    const newValue = typeof value === "function"
      ? (value as any)(getter())
      : value;
    (service as any)[property] = newValue;
    return originalSetter(newValue);
  };

  return [getter, serviceSetter];
}

