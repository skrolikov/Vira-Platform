/**
 * Реактивные объекты через Proxy (как в Vue 3)
 * Рекурсивный Proxy для вложенных объектов
 */

import { scheduleUpdate } from "./batch";

// Типы для реактивных объектов
export type Reactive<T> = T & {
  readonly __reactive__: true;
  readonly __isProxy__: true;
};

const reactiveMap = new WeakMap<object, any>();
const rawMap = new WeakMap<any, object>();

// Стек для отслеживания активного эффекта (для очистки зависимостей)
const effectStack: Array<() => void> = [];

/**
 * Создание реактивного объекта (рекурсивный Proxy)
 * 
 * @example
 * const state = reactive({
 *   name: "Ivan",
 *   settings: {
 *     theme: "dark"
 *   }
 * });
 * 
 * // Всё автоматически реактивное
 * effect(() => {
 *   console.log(state.name, state.settings.theme);
 * });
 */
export function reactive<T extends object>(target: T): Reactive<T> {
  // Если уже реактивный - возвращаем существующий
  if (reactiveMap.has(target)) {
    return reactiveMap.get(target);
  }

  // Если это уже proxy - возвращаем исходный объект
  if (rawMap.has(target)) {
    return target as Reactive<T>;
  }

  const proxy = new Proxy(target, {
    get(target, key, receiver) {
      // Исключаем служебные ключи
      if (key === "__reactive__" || key === "__isProxy__") {
        return true;
      }
      if (key === "__raw__") {
        return target;
      }

      const result = Reflect.get(target, key, receiver);

      // Если это объект - делаем его реактивным
      if (typeof result === "object" && result !== null) {
        return reactive(result);
      }

      // Если есть активный эффект - подписываем его
      if (effectStack.length > 0) {
        const activeEffect = effectStack[effectStack.length - 1];
        track(target, key, activeEffect);
      }

      return result;
    },

    set(target, key, value, receiver) {
      const oldValue = Reflect.get(target, key, receiver);
      const result = Reflect.set(target, key, value, receiver);

      // Если значение изменилось - триггерим эффекты
      if (oldValue !== value) {
        trigger(target, key);
      }

      return result;
    },

    deleteProperty(target, key) {
      const hadKey = Reflect.has(target, key);
      const result = Reflect.deleteProperty(target, key);

      if (hadKey) {
        trigger(target, key);
      }

      return result;
    },
  });

  reactiveMap.set(target, proxy);
  rawMap.set(proxy, target);

  return proxy as Reactive<T>;
}

// Хранилище зависимостей (target -> key -> Set<effect>)
const targetMap = new WeakMap<object, Map<string | symbol, Set<() => void>>>();

/**
 * Отслеживание зависимости (track)
 */
function track(target: object, key: string | symbol, effect: () => void) {
  let depsMap = targetMap.get(target);
  if (!depsMap) {
    targetMap.set(target, (depsMap = new Map()));
  }

  let deps = depsMap.get(key);
  if (!deps) {
    depsMap.set(key, (deps = new Set()));
  }

  deps.add(effect);
}

/**
 * Триггер обновлений (trigger)
 */
function trigger(target: object, key: string | symbol) {
  const depsMap = targetMap.get(target);
  if (!depsMap) return;

  const deps = depsMap.get(key);
  if (!deps) return;

  // Выполняем все эффекты
  scheduleUpdate(() => {
    deps.forEach(effect => effect());
  });
}

/**
 * Очистка зависимостей для эффекта
 */
export function cleanupDeps(effect: () => void) {
  // Проходим по всем targetMap и удаляем effect из зависимостей
  // Это дорого, но нужно для правильной работы
  // В будущем можно оптимизировать, храня обратные ссылки
}

/**
 * Запуск эффекта с очисткой зависимостей (как Vue 3)
 */
export function runWithTracking<T>(effect: () => T): T {
  effectStack.push(effect);
  
  try {
    // Очищаем старые зависимости
    cleanupDeps(effect);
    
    // Запускаем эффект (автоматически собираем зависимости)
    return effect();
  } finally {
    effectStack.pop();
  }
}

/**
 * Получение исходного объекта из proxy
 */
export function toRaw<T>(reactive: Reactive<T>): T {
  return rawMap.get(reactive) as T || reactive;
}

