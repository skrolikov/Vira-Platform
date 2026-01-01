/**
 * Реактивная система для сервисов (как SolidJS, но поверх React)
 * Автоматические обновления компонентов при изменении сервисов
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { scheduleUpdate } from "./batch";

// ============================================
// SIGNAL SYSTEM
// ============================================

interface Signal<T = any> {
  value: T;
  subscribers: Set<() => void>;
}

/**
 * Создание реактивного сигнала
 */
export function createSignal<T>(initialValue: T): [
  () => T,
  (value: T | ((prev: T) => T)) => void
] {
  const signal: Signal<T> = {
    value: initialValue,
    subscribers: new Set(),
  };

  const getter = () => {
    // Здесь будет добавляться подписчик (через useEffect в компоненте)
    if (currentSubscriber) {
      signal.subscribers.add(currentSubscriber);
    }
    return signal.value;
  };

  const setter = (value: T | ((prev: T) => T)) => {
    const newValue = typeof value === "function" 
      ? (value as (prev: T) => T)(signal.value)
      : value;

    if (newValue !== signal.value) {
      signal.value = newValue;
      // Уведомляем всех подписчиков
      signal.subscribers.forEach(sub => sub());
    }
  };

  return [getter, setter];
}

// Текущий подписчик (устанавливается в useReactive)
let currentSubscriber: (() => void) | null = null;

/**
 * React hook для использования реактивных сигналов
 */
export function useReactive<T>(getter: () => T): T {
  const [value, setValue] = useState(() => {
    // Первоначальное значение
    const prevSubscriber = currentSubscriber;
    currentSubscriber = null;
    const result = getter();
    currentSubscriber = prevSubscriber;
    return result;
  });

  const getterRef = useRef(getter);

  useEffect(() => {
    getterRef.current = getter;
  }, [getter]);

  useEffect(() => {
    let isActive = true;

    const update = () => {
      if (isActive) {
        const prevSubscriber = currentSubscriber;
        currentSubscriber = update;
        const newValue = getterRef.current();
        currentSubscriber = prevSubscriber;

        setValue(() => newValue);
      }
    };

    // Подписываемся на изменения
    const prevSubscriber = currentSubscriber;
    currentSubscriber = update;
    getterRef.current(); // Вызываем чтобы добавить подписку
    currentSubscriber = prevSubscriber;

    return () => {
      isActive = false;
    };
  }, []);

  return value;
}

// ============================================
// REACTIVE SERVICE MIXIN
// ============================================

/**
 * Миксин для реактивных сервисов
 * Автоматически триггерит обновления при изменении свойств
 */
export function createReactiveService<T extends object>(
  service: T
): T & { __reactive__: true; __subscribers__: Set<() => void> } {
  // Проверяем, что service является валидным объектом
  if (!service || typeof service !== "object" || service === null || Array.isArray(service)) {
    throw new Error(`Cannot create reactive service: service must be a non-null object, got ${typeof service}`);
  }

  const subscribers = new Set<() => void>();
  const proxy = new Proxy(service as any, {
    get(target, prop) {
      if (prop === "__reactive__") return true;
      if (prop === "__subscribers__") return subscribers;

      // Если это геттер - подписываемся
      if (currentSubscriber && typeof prop === "string") {
        subscribers.add(currentSubscriber);
      }

      return target[prop];
    },

    set(target, prop, value) {
      const oldValue = target[prop];
      target[prop] = value;

      // Если значение изменилось - уведомляем подписчиков (с batch)
      if (oldValue !== value) {
        subscribers.forEach(sub => scheduleUpdate(sub));
      }

      return true;
    },
  });

  return proxy;
}

/**
 * Регистрация подписчика для реактивного сервиса
 */
export function subscribeReactive(
  service: any,
  subscriber: () => void
): () => void {
  if (service.__reactive__ && service.__subscribers__) {
    service.__subscribers__.add(subscriber);
    return () => {
      service.__subscribers__.delete(subscriber);
    };
  }
  return () => {};
}

/**
 * React hook для использования реактивного сервиса
 * Автоматически обновляет компонент при изменениях
 */
export function useReactiveService<T>(service: T | (() => T)): T {
  const serviceRef = useRef(service instanceof Function ? service() : service);
  const [, forceUpdate] = useState({});

  useEffect(() => {
    const actualService = service instanceof Function ? service() : service;

    if (!(actualService as any).__reactive__) {
      // Если сервис не реактивный - делаем его реактивным
      serviceRef.current = createReactiveService(actualService as object) as T;
    } else {
      serviceRef.current = actualService;
    }

    const unsubscribe = subscribeReactive(serviceRef.current as any, () => {
      forceUpdate({});
    });

    return unsubscribe;
  }, []);

  return serviceRef.current;
}

