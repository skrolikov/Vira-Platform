/**
 * Reactive Queries - Автоматические обновления компонентов при изменении API данных
 * 
 * @example
 * const users = query(() => api.users.list());
 * // Компонент автоматически обновляется при изменении данных
 */

import { signal, Signal } from "./signals";
import { effect } from "./signals";

export interface QueryOptions {
  refetchOnMount?: boolean;
  refetchInterval?: number;
  staleTime?: number;
  cacheTime?: number;
}

export interface QueryResult<T> {
  data: Signal<T | null>;
  loading: Signal<boolean>;
  error: Signal<Error | null>;
  refetch: () => Promise<void>;
  invalidate: () => void;
}

/**
 * Reactive Query - автоматически обновляет компонент при изменении данных
 * 
 * @example
 * const users = query(() => api.users.list());
 * 
 * function UsersList() {
 *   const usersData = useSignal(users.data);
 *   const loading = useSignal(users.loading);
 *   
 *   if (loading()) return <div>Loading...</div>;
 *   return <div>{usersData()?.map(...)}</div>;
 * }
 */
export function query<T>(
  queryFn: () => Promise<T>,
  options: QueryOptions = {}
): QueryResult<T> {
  const [data, setData] = signal<T | null>(null);
  const [loading, setLoading] = signal<boolean>(false);
  const [error, setError] = signal<Error | null>(null);

  let isInvalidated = false;
  let lastFetchTime = 0;
  let refetchIntervalId: ReturnType<typeof setInterval> | null = null;

  const fetchData = async () => {
    if (loading()) return; // Уже загружается

    setLoading(true);
    setError(null);

    try {
      const result = await queryFn();
      setData(result);
      lastFetchTime = Date.now();
      isInvalidated = false;
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  };

  const refetch = async () => {
    await fetchData();
  };

  const invalidate = () => {
    isInvalidated = true;
    const now = Date.now();
    const staleTime = options.staleTime ?? 0;
    
    if (now - lastFetchTime > staleTime) {
      fetchData();
    }
  };

  // Автоматическая перезагрузка при монтировании
  if (options.refetchOnMount !== false) {
    fetchData();
  }

  // Интервальная перезагрузка
  if (options.refetchInterval) {
    refetchIntervalId = setInterval(() => {
      if (!loading() && !isInvalidated) {
        fetchData();
      }
    }, options.refetchInterval);

    // Cleanup
    effect(() => {
      return () => {
        if (refetchIntervalId) {
          clearInterval(refetchIntervalId);
        }
      };
    });
  }

  return {
    data,
    loading,
    error,
    refetch,
    invalidate,
  };
}

/**
 * Mutation - для изменения данных с автоматическим инвалидированием queries
 * 
 * @example
 * const createUser = mutation(
 *   (userData) => api.users.create(userData),
 *   {
 *     onSuccess: () => {
 *       usersQuery.invalidate(); // Инвалидируем список пользователей
 *     }
 *   }
 * );
 */
export interface MutationOptions<T, V> {
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  invalidateQueries?: Array<QueryResult<any>>;
}

export interface MutationResult<T, V> {
  mutate: (variables: V) => Promise<T>;
  loading: Signal<boolean>;
  error: Signal<Error | null>;
}

export function mutation<T, V = void>(
  mutationFn: (variables: V) => Promise<T>,
  options: MutationOptions<T, V> = {}
): MutationResult<T, V> {
  const [loading, setLoading] = signal<boolean>(false);
  const [error, setError] = signal<Error | null>(null);

  const mutate = async (variables: V): Promise<T> => {
    setLoading(true);
    setError(null);

    try {
      const result = await mutationFn(variables);
      
      // Инвалидируем связанные queries
      if (options.invalidateQueries) {
        options.invalidateQueries.forEach(q => q.invalidate());
      }
      
      if (options.onSuccess) {
        options.onSuccess(result);
      }

      return result;
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error(String(err));
      setError(errorObj);
      
      if (options.onError) {
        options.onError(errorObj);
      }
      
      throw errorObj;
    } finally {
      setLoading(false);
    }
  };

  return {
    mutate,
    loading,
    error,
  };
}

