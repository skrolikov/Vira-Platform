import { ServiceContainer, ServiceFactory } from "./types";
import { createReactiveService } from "./reactive";
import { registerServiceInGraph, updateServiceInGraph } from "./state-graph";

/**
 * DI Container для сервисов (как в Vue + Nuxt)
 * Версия 2.0: С автоматической реактивностью и StateGraph
 */

class ViraServiceContainer implements ServiceContainer {
  private services = new Map<string, any>();
  private factories = new Map<string, ServiceFactory>();
  private singletons = new Set<string>();

  register<T>(
    name: string, 
    factory: ServiceFactory<T>, 
    singleton: boolean = true
  ): void {
    this.factories.set(name, factory);
    
    if (singleton) {
      this.singletons.add(name);
    }
  }

  get<T>(name: string): T {
    // Если синглтон и уже создан - возвращаем
    if (this.singletons.has(name) && this.services.has(name)) {
      return this.services.get(name);
    }

    // Проверяем наличие фабрики
    const factory = this.factories.get(name);
    if (!factory) {
      throw new Error(`Service "${name}" not found. Did you forget to register it?`);
    }

    // Создаём инстанс
    const instance = factory();

    // Делаем сервис реактивным
    const reactiveInstance = createReactiveService(instance);

    // Регистрируем в StateGraph
    registerServiceInGraph(name, "service", reactiveInstance);

    // Если синглтон - сохраняем
    if (this.singletons.has(name)) {
      this.services.set(name, reactiveInstance);
    }

    return reactiveInstance;
  }

  has(name: string): boolean {
    return this.factories.has(name);
  }

  clear(): void {
    this.services.clear();
    this.factories.clear();
    this.singletons.clear();
  }

  clearService(name: string): void {
    this.services.delete(name);
  }
}

// Глобальный контейнер
const globalContainer = new ViraServiceContainer();

/**
 * Создание сервиса (как createService во Vue)
 */
export function createService<T>(
  name: string, 
  factory: ServiceFactory<T>,
  options: { singleton?: boolean } = {}
): void {
  globalContainer.register(
    name, 
    factory, 
    options.singleton !== false
  );
}

/**
 * Получение сервиса (как useService во Vue)
 * Версия 2.0: Автоматически реактивный - обновляет компонент при изменениях
 */
export function useService<T = any>(name: string): T {
  const service = globalContainer.get<T>(name);
  
  // Обновляем StateGraph
  updateServiceInGraph(name, service);
  
  return service;
}

/**
 * Проверка наличия сервиса
 */
export function hasService(name: string): boolean {
  return globalContainer.has(name);
}

/**
 * Получение контейнера (для внутреннего использования)
 */
export function getServiceContainer(): ServiceContainer {
  return globalContainer;
}

/**
 * Очистка всех сервисов (для тестов)
 */
export function clearServices(): void {
  globalContainer.clear();
}

