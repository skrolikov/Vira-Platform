/**
 * REST Client с автомаппингом API → сервисы
 * Автоматическое создание CRUD, пагинации, мутаций, кеширования
 */

import { MiddlewareManager, RequestConfig, createLoggingMiddleware, type RestMiddleware } from "./middleware";

// ============================================
// REST CLIENT TYPES
// ============================================

export interface RestClientConfig {
  baseURL?: string;
  headers?: Record<string, string>;
  timeout?: number;
  cache?: boolean;
  cacheTTL?: number;
  useStorageCache?: boolean; // Использовать localStorage для кэша
  middleware?: MiddlewareManager; // Middleware для перехвата запросов
  retry?: {
    maxRetries?: number;
    delay?: number;
    retryCondition?: (error: Error) => boolean;
  };
}

export interface RestQueryOptions {
  page?: number;
  limit?: number;
  sort?: string;
  filter?: Record<string, any>;
  search?: string;
}

export interface RestResponse<T = any> {
  data: T;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    pages?: number;
  };
}

export interface RestResource<T = any> {
  list: (options?: RestQueryOptions) => Promise<RestResponse<T[]>>;
  get: (id: string | number) => Promise<T>;
  create: (data: Partial<T>) => Promise<T>;
  update: (id: string | number, data: Partial<T>) => Promise<T>;
  delete: (id: string | number) => Promise<void>;
  count: (filter?: Record<string, any>) => Promise<number>;
}

// ============================================
// CACHE
// ============================================

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class RestCache {
  private cache = new Map<string, CacheEntry<any>>();
  private useStorage: boolean;
  private storagePrefix = "vira_rest_cache_";

  constructor(useStorage: boolean = true) {
    this.useStorage = useStorage;
  }

  private getStorageKey(key: string): string {
    return `${this.storagePrefix}${key}`;
  }

  get<T>(key: string): T | null {
    // Проверяем память
    const entry = this.cache.get(key);
    if (entry) {
      const age = Date.now() - entry.timestamp;
      if (age <= entry.ttl) {
        return entry.data;
      }
      this.cache.delete(key);
    }

    // Проверяем localStorage
    if (this.useStorage && typeof localStorage !== "undefined") {
      try {
        const stored = localStorage.getItem(this.getStorageKey(key));
        if (stored) {
          const entry: CacheEntry<T> = JSON.parse(stored);
          const age = Date.now() - entry.timestamp;
          if (age <= entry.ttl) {
            // Восстанавливаем в память
            this.cache.set(key, entry);
            return entry.data;
          }
          localStorage.removeItem(this.getStorageKey(key));
        }
      } catch (e) {
        console.warn("Failed to read from localStorage cache:", e);
      }
    }

    return null;
  }

  set<T>(key: string, data: T, ttl: number): void {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl,
    };

    // Кэшируем в память
    this.cache.set(key, entry);

    // Кэшируем в localStorage
    if (this.useStorage && typeof localStorage !== "undefined") {
      try {
        localStorage.setItem(this.getStorageKey(key), JSON.stringify(entry));
      } catch (e) {
        console.warn("Failed to write to localStorage cache:", e);
      }
    }
  }

  clear(): void {
    this.cache.clear();
    
    // Очищаем localStorage
    if (this.useStorage && typeof localStorage !== "undefined") {
      try {
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
          if (key.startsWith(this.storagePrefix)) {
            localStorage.removeItem(key);
          }
        });
      } catch (e) {
        console.warn("Failed to clear localStorage cache:", e);
      }
    }
  }

  delete(key: string): void {
    this.cache.delete(key);
    
    // Удаляем из localStorage
    if (this.useStorage && typeof localStorage !== "undefined") {
      try {
        localStorage.removeItem(this.getStorageKey(key));
      } catch (e) {
        console.warn("Failed to delete from localStorage cache:", e);
      }
    }
  }
}

// ============================================
// REST CLIENT
// ============================================

class ViraRestClient {
  private config: Required<Omit<RestClientConfig, "middleware" | "retry">> & {
    middleware: MiddlewareManager;
    retry?: RestClientConfig["retry"];
  };
  private cache: RestCache;

  constructor(config: RestClientConfig = {}) {
    this.config = {
      baseURL: config.baseURL || "",
      headers: {
        "Content-Type": "application/json",
        ...config.headers,
      },
      timeout: config.timeout || 30000,
      cache: config.cache !== false,
      cacheTTL: config.cacheTTL || 60000, // 1 минута по умолчанию
      useStorageCache: config.useStorageCache !== false, // По умолчанию включен
      middleware: config.middleware || new MiddlewareManager(),
      retry: config.retry,
    };

    this.cache = new RestCache(this.config.useStorageCache);

    // Добавляем logging middleware по умолчанию в dev режиме
    if (process.env.NODE_ENV === "development") {
      this.config.middleware.use(createLoggingMiddleware(false));
    }
  }

  /**
   * Добавить middleware
   */
  use(middleware: RestMiddleware): void {
    this.config.middleware.use(middleware);
  }

  private async request<T>(
    method: string,
    url: string,
    data?: any,
    options: { cache?: boolean } = {}
  ): Promise<T> {
    const fullURL = url.startsWith("http") 
      ? url 
      : `${this.config.baseURL}${url}`;

    // Проверяем кеш для GET запросов
    if (method === "GET" && this.config.cache && options.cache !== false) {
      const cached = this.cache.get<T>(fullURL);
      if (cached) {
        return cached;
      }
    }

    // Всегда берём актуальные заголовки (включая Authorization)
    const currentHeaders = { ...this.config.headers };
    
    let requestConfig: RequestConfig = {
      url: fullURL,
      method,
      headers: currentHeaders,
      ...(data && { body: data }),
    };

    // Применяем beforeRequest middleware
    requestConfig = await this.config.middleware.applyBeforeRequest(requestConfig);

    // Retry логика
    const maxRetries = this.config.retry?.maxRetries || 0;
    const delay = this.config.retry?.delay || 1000;
    const retryCondition = this.config.retry?.retryCondition || (() => true);

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

        // Логируем запрос в dev режиме для отладки
        if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
          console.log('[REST] Request:', requestConfig.method, requestConfig.url, {
            headers: requestConfig.headers,
            hasAuth: !!requestConfig.headers?.Authorization,
          });
        }

        const response = await fetch(requestConfig.url, {
          method: requestConfig.method,
          headers: requestConfig.headers,
          body: requestConfig.body ? JSON.stringify(requestConfig.body) : undefined,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        // Применяем afterResponse middleware
        const processedResponse = await this.config.middleware.applyAfterResponse(
          response,
          requestConfig
        );

        if (!processedResponse.ok) {
          // Пытаемся получить текст ошибки
          let errorMessage = `HTTP ${processedResponse.status}: ${processedResponse.statusText}`;
          try {
            const contentType = processedResponse.headers.get("content-type");
            if (contentType?.includes("application/json")) {
              const errorData = await processedResponse.json();
              errorMessage = errorData.message || errorData.error || errorMessage;
            } else {
              const text = await processedResponse.text();
              // Если это HTML (начинается с <), значит скорее всего страница ошибки
              if (text.trim().startsWith("<")) {
                if (processedResponse.status === 401 || processedResponse.status === 403) {
                  errorMessage = "Требуется авторизация. Пожалуйста, войдите в систему.";
                  // Редиректим на логин при 401/403, если мы в браузере
                  if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
                    // Используем setTimeout чтобы не блокировать обработку ошибки
                    setTimeout(() => {
                      window.location.href = '/login';
                    }, 0);
                  }
                } else {
                  errorMessage = `Ошибка ${processedResponse.status}: получен HTML вместо JSON. Проверьте, что бэкенд запущен и доступен.`;
                }
              } else {
                errorMessage = text || errorMessage;
              }
            }
          } catch (e) {
            // Не удалось распарсить ошибку, оставляем стандартное сообщение
            // Но всё равно редиректим при 401/403
            if (processedResponse.status === 401 || processedResponse.status === 403) {
              errorMessage = "Требуется авторизация. Пожалуйста, войдите в систему.";
              if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
                setTimeout(() => {
                  window.location.href = '/login';
                }, 0);
              }
            }
          }
          const error = new Error(errorMessage);
          // Добавляем статус в ошибку для middleware
          (error as any).status = processedResponse.status;
          const processedError = await this.config.middleware.applyOnError(error, requestConfig);
          throw processedError;
        }

        // Проверяем Content-Type перед парсингом JSON
        const contentType = processedResponse.headers.get("content-type");
        if (!contentType?.includes("application/json")) {
          const text = await processedResponse.text();
          if (text.trim().startsWith("<")) {
            // Если это HTML и статус 401/403, это значит нужна авторизация
            if (processedResponse.status === 401 || processedResponse.status === 403) {
              const error = new Error("Требуется авторизация. Пожалуйста, войдите в систему.");
              (error as any).status = processedResponse.status;
              // Редиректим на логин
              if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
                setTimeout(() => {
                  window.location.href = '/login';
                }, 0);
              }
              throw error;
            }
            throw new Error("Сервер вернул HTML вместо JSON. Проверьте URL и доступность API.");
          }
          // Если это не JSON и не HTML, пытаемся распарсить как текст
          throw new Error(`Неожиданный Content-Type: ${contentType}. Ожидался application/json.`);
        }

        const result = await processedResponse.json();

        // Кешируем GET запросы
        if (method === "GET" && this.config.cache && options.cache !== false) {
          this.cache.set(fullURL, result, this.config.cacheTTL);
        }

        return result;
      } catch (error: any) {
        // Если это ошибка парсинга JSON (HTML вместо JSON), создаём понятное сообщение
        if (error instanceof SyntaxError && error.message.includes('JSON')) {
          const htmlError = new Error(
            'Сервер вернул HTML вместо JSON. Возможные причины:\n' +
            '1. Бэкенд не запущен или недоступен\n' +
            '2. Требуется авторизация (401/403)\n' +
            '3. Неправильный URL или прокси-настройки'
          );
          const processedError = await this.config.middleware.applyOnError(htmlError, requestConfig);
          
          if (attempt >= maxRetries || !retryCondition(processedError)) {
            throw processedError;
          }
        } else {
          // Применяем onError middleware для других ошибок
          const processedError = await this.config.middleware.applyOnError(error, requestConfig);

          // Если это последняя попытка или ошибка не должна повторяться
          if (attempt >= maxRetries || !retryCondition(processedError)) {
            if (error.name === "AbortError") {
              throw new Error("Request timeout");
            }
            throw processedError;
          }
        }

        // Ждём перед повтором
        await new Promise(resolve => setTimeout(resolve, delay * (attempt + 1)));
      }
    }

    throw new Error("Request failed after retries");
  }

  private buildQueryString(options: RestQueryOptions): string {
    const params = new URLSearchParams();

    if (options.page) params.append("page", String(options.page));
    if (options.limit) params.append("limit", String(options.limit));
    if (options.sort) params.append("sort", options.sort);
    if (options.search) params.append("search", options.search);
    if (options.filter) {
      Object.entries(options.filter).forEach(([key, value]) => {
        params.append(`filter[${key}]`, String(value));
      });
    }

    const query = params.toString();
    return query ? `?${query}` : "";
  }

  /**
   * Создание ресурса с автоматическим CRUD
   */
  resource<T = any>(name: string): RestResource<T> {
    const basePath = `/${name}`;

    return {
      list: async (options?: RestQueryOptions) => {
        const query = this.buildQueryString(options || {});
        return this.request<RestResponse<T[]>>("GET", `${basePath}${query}`);
      },

      get: async (id: string | number) => {
        return this.request<T>("GET", `${basePath}/${id}`);
      },

      create: async (data: Partial<T>) => {
        const result = await this.request<T>("POST", basePath, data);
        // Инвалидируем кеш списка
        this.cache.delete(basePath);
        return result;
      },

      update: async (id: string | number, data: Partial<T>) => {
        const result = await this.request<T>("PUT", `${basePath}/${id}`, data);
        // Инвалидируем кеш
        this.cache.delete(basePath);
        this.cache.delete(`${basePath}/${id}`);
        return result;
      },

      delete: async (id: string | number) => {
        await this.request<void>("DELETE", `${basePath}/${id}`);
        // Инвалидируем кеш
        this.cache.delete(basePath);
        this.cache.delete(`${basePath}/${id}`);
      },

      count: async (filter?: Record<string, any>) => {
        const query = filter ? this.buildQueryString({ filter }) : "";
        const response = await this.request<{ count: number }>(
          "GET",
          `${basePath}/count${query}`
        );
        return response.count;
      },
    };
  }

  /**
   * Прямые HTTP методы
   */
  async get<T = any>(url: string, options?: { cache?: boolean }): Promise<T> {
    return this.request<T>("GET", url, undefined, options);
  }

  async post<T = any>(url: string, data?: any): Promise<T> {
    return this.request<T>("POST", url, data);
  }

  async put<T = any>(url: string, data?: any): Promise<T> {
    return this.request<T>("PUT", url, data);
  }

  async delete<T = any>(url: string): Promise<T> {
    return this.request<T>("DELETE", url);
  }

  /**
   * Установка заголовка
   */
  setHeader(key: string, value: string): void {
    this.config.headers[key] = value;
  }

  /**
   * Удаление заголовка
   */
  removeHeader(key: string): void {
    delete this.config.headers[key];
  }

  /**
   * Очистка кеша
   */
  clearCache(): void {
    this.cache.clear();
  }
}

// ============================================
// GLOBAL INSTANCE
// ============================================

let globalRestClient: ViraRestClient | null = null;

/**
 * Инициализация REST клиента
 */
export function createRestClient(config: RestClientConfig = {}): ViraRestClient {
  globalRestClient = new ViraRestClient(config);
  return globalRestClient;
}

/**
 * Получение глобального REST клиента
 */
export function getRestClient(): ViraRestClient {
  if (!globalRestClient) {
    globalRestClient = new ViraRestClient();
  }
  return globalRestClient;
}

/**
 * Создание ресурса через глобальный клиент
 */
export function rest<T = any>(name: string): RestResource<T> {
  return getRestClient().resource<T>(name);
}

/**
 * Очистка кеша
 */
export function clearRestCache(): void {
  if (globalRestClient) {
    globalRestClient.clearCache();
  }
}

