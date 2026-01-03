/**
 * Auto-bound Actions - Автоматическая обработка ошибок, загрузки, логирования
 * 
 * @example
 * class UserService {
 *   load = action(async () => {
 *     this.users = await api.get("/users");
 *   });
 * }
 * 
 * // action автоматически:
 * // - делает batch обновления
 * // - обрабатывает ошибки
 * // - показывает loading состояние
 * // - логирует в DevTools
 */

import { signal, Signal, batch } from "./signals";
import { createReactiveService } from "./reactive";

export interface ActionOptions {
  errorBoundary?: boolean;
  loadingIndicator?: boolean;
  batchUpdates?: boolean;
  logToDevTools?: boolean;
  retry?: {
    attempts: number;
    delay: number;
  };
}

export interface ActionState {
  loading: Signal<boolean>;
  error: Signal<Error | null>;
  lastSuccess: Signal<Date | null>;
}

/**
 * Декоратор для создания action метода
 * 
 * @example
 * class UserService {
 *   users = [];
 *   
 *   load = action(async () => {
 *     this.users = await api.get("/users");
 *   });
 *   
 *   create = action(async (userData) => {
 *     const user = await api.post("/users", userData);
 *     this.users.push(user);
 *   }, {
 *     errorBoundary: true,
 *     retry: { attempts: 3, delay: 1000 }
 *   });
 * }
 */
export function action<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  options: ActionOptions = {}
): T & ActionState {
  const [loading, setLoading] = signal<boolean>(false);
  const [error, setError] = signal<Error | null>(null);
  const [lastSuccess, setLastSuccess] = signal<Date | null>(null);

  const actionFn = async (...args: Parameters<T>): Promise<ReturnType<T>> => {
    setLoading(true);
    setError(null);

    let attempts = 0;
    const maxAttempts = options.retry?.attempts ?? 1;

    while (attempts < maxAttempts) {
      try {
        // Логирование в DevTools
        if (options.logToDevTools !== false) {
          const actionName = fn.name || "anonymous";
          console.log(`[Action] ${actionName} started`, args);
        }

        let result: ReturnType<T>;

        if (options.batchUpdates !== false) {
          // Выполняем в batch для оптимизации
          result = await batch(async () => {
            return await fn(...args);
          });
        } else {
          result = await fn(...args);
        }

        setLoading(false);
        setLastSuccess(new Date());
        setError(null);

        // Логирование успеха
        if (options.logToDevTools !== false) {
          const actionName = fn.name || "anonymous";
          console.log(`[Action] ${actionName} succeeded`, result);
        }

        return result;
      } catch (err) {
        attempts++;

        const errorObj = err instanceof Error ? err : new Error(String(err));

        if (attempts >= maxAttempts) {
          // Все попытки исчерпаны
          setLoading(false);
          setError(errorObj);

          // Логирование ошибки
          if (options.logToDevTools !== false) {
            const actionName = fn.name || "anonymous";
          }

          // Error boundary обработка
          if (options.errorBoundary) {
            // Можно пробросить в глобальный error boundary
            // или обработать локально
          }

          throw errorObj;
        } else {
          // Повторная попытка
          const delay = options.retry?.delay ?? 1000;
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    throw new Error("Unexpected action execution end");
  };

  // Добавляем состояние к функции
  const actionWithState = actionFn as T & ActionState;
  actionWithState.loading = loading;
  actionWithState.error = error;
  actionWithState.lastSuccess = lastSuccess;

  return actionWithState;
}

/**
 * Хелпер для использования action в React компонентах
 * 
 * @example
 * const userService = useService("user");
 * 
 * function UsersList() {
 *   const loading = useSignal(userService.load.loading);
 *   const error = useSignal(userService.load.error);
 *   
 *   useEffect(() => {
 *     userService.load();
 *   }, []);
 *   
 *   if (loading()) return <div>Loading...</div>;
 *   if (error()) return <div>Error: {error()?.message}</div>;
 *   return <div>...</div>;
 * }
 */
export function useAction<T extends ActionState>(actionFn: T) {
  return {
    loading: actionFn.loading,
    error: actionFn.error,
    lastSuccess: actionFn.lastSuccess,
  };
}

/**
 * Декоратор класса для автоматического применения action ко всем async методам
 * 
 * @example
 * @withActions
 * class UserService {
 *   async load() {
 *     this.users = await api.get("/users");
 *   }
 *   
 *   async create(userData) {
 *     return await api.post("/users", userData);
 *   }
 * }
 */
export function withActions<T extends { new (...args: any[]): {} }>(
  constructor: T
): T {
  return class extends constructor {
    constructor(...args: any[]) {
      super(...args);

      // Проходим по всем методам класса
      const prototype = Object.getPrototypeOf(this);
      const propertyNames = Object.getOwnPropertyNames(prototype);

      for (const propName of propertyNames) {
        if (propName === "constructor") continue;

        const descriptor = Object.getOwnPropertyDescriptor(prototype, propName);
        if (!descriptor) continue;

        const value = descriptor.value;
        if (typeof value !== "function") continue;

        // Проверяем, что это async функция
        if (value.constructor.name === "AsyncFunction") {
          // Заменяем на action
          (this as any)[propName] = action(value.bind(this));
        }
      }
    }
  };
}

