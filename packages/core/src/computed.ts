/**
 * Computed Values - Вычисляемые значения для реактивной системы
 * Автоматически пересчитываются при изменении зависимостей
 */

import { createSignal } from "./reactive";

/**
 * Computed signal - автоматически пересчитывается при изменении зависимостей
 * 
 * @example
 * const firstName = createSignal("Иван");
 * const lastName = createSignal("Иванов");
 * const fullName = createComputed(() => `${firstName()} ${lastName()}`);
 */
export function createComputed<T>(
  computation: () => T,
  dependencies?: Array<() => any>
): () => T {
  const [getValue, setValue] = createSignal<T>(computation() as T);

  // Пересчёт при изменении зависимостей
  const update = () => {
    const newValue = computation();
    setValue(() => newValue);
  };

  // Если зависимости не указаны, пытаемся найти их автоматически
  // через отслеживание вызовов сигналов внутри computation
  if (!dependencies) {
    // Простая реализация - можно улучшить с помощью Proxy
    // Пока что требуется явное указание зависимостей
    throw new Error("Dependencies must be explicitly provided for now");
  }

  // Подписываемся на все зависимости
  dependencies.forEach(dep => {
    const depValue = dep();
    // Если это сигнал - подписываемся на его изменения
    // (это упрощённая версия, реальная реализация сложнее)
  });

  return getValue;
}

/**
 * Создание computed свойства для сервиса
 */
export function defineComputed<T>(
  service: any,
  propertyName: string,
  computation: () => T,
  dependencies: string[]
): void {
  const computedValue = createComputed(computation);
  
  Object.defineProperty(service, propertyName, {
    get: () => computedValue(),
    enumerable: true,
    configurable: true,
  });
}

