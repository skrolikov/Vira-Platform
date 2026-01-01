/**
 * ViraService - Сервисный слой с DI и реактивностью
 * 
 * Проще, чем Zustand/MobX/Redux
 * 
 * @example
 * createService("client", () => {
 *   const clients = reactive([]);
 *   const loading = signal(false);
 *   
 *   const fetchClients = async () => {
 *     loading.set(true);
 *     clients.value = await api.clients.list();
 *     loading.set(false);
 *   };
 *   
 *   return { clients, loading, fetchClients };
 * });
 * 
 * // Использование
 * export const clientService = useService("client");
 */

import { signal, Signal } from "./signals";
import { createService, useService as useServiceBase } from "./services";
import { createReactiveService } from "./reactive";

export type ViraServiceFactory<T> = () => T;
export type ViraService<T> = T & { __vira_service__: true };

/**
 * Создание Vira сервиса с реактивностью
 * 
 * @example
 * createViraService("client", () => {
 *   const clients = reactive([]);
 *   const loading = signal(false);
 *   const error = signal(null);
 *   
 *   const fetchClients = async () => {
 *     loading.set(true);
 *     try {
 *       clients.value = await api.clients.list();
 *     } catch (err) {
 *       error.set(err);
 *     } finally {
 *       loading.set(false);
 *     }
 *   };
 *   
 *   return { clients, loading, error, fetchClients };
 * });
 */
export function createViraService<T extends object>(
  name: string,
  factory: ViraServiceFactory<T>
): ViraService<T> {
  const serviceInstance = factory();
  
  // Делаем сервис реактивным
  const reactiveService = createReactiveService(serviceInstance);
  
  // Регистрируем в DI контейнере
  createService(name, () => reactiveService);
  
  // Добавляем маркер ViraService
  (reactiveService as any).__vira_service__ = true;
  
  return reactiveService as unknown as ViraService<T>;
}

/**
 * Хук для использования Vira сервиса
 * 
 * @example
 * export const clientService = useViraService("client");
 * 
 * function ClientsList() {
 *   const clients = useSignal(clientService.clients);
 *   const loading = useSignal(clientService.loading);
 *   
 *   useEffect(() => {
 *     clientService.fetchClients();
 *   }, []);
 *   
 *   return <div>...</div>;
 * }
 */
export function useViraService<T = any>(name: string): T {
  return useServiceBase<T>(name);
}

/**
 * Создание сервиса с типизацией
 * 
 * @example
 * interface ClientService {
 *   clients: Signal<any[]>;
 *   loading: Signal<boolean>;
 *   fetchClients: () => Promise<void>;
 * }
 * 
 * createTypedService<ClientService>("client", () => ({
 *   clients: reactive([]),
 *   loading: signal(false),
 *   fetchClients: async () => { ... }
 * }));
 */
export function createTypedService<T extends object>(
  name: string,
  factory: ViraServiceFactory<T>
): ViraService<T> {
  return createViraService(name, factory);
}

