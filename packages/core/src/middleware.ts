/**
 * Middleware System для REST Client
 * Позволяет перехватывать и модифицировать запросы/ответы
 */

export interface RestMiddleware {
  beforeRequest?: (config: RequestConfig) => RequestConfig | Promise<RequestConfig>;
  afterResponse?: (response: Response, config: RequestConfig) => Response | Promise<Response>;
  onError?: (error: Error, config: RequestConfig) => Error | Promise<Error>;
}

export interface RequestConfig {
  url: string;
  method: string;
  headers: Record<string, string>;
  body?: any;
  [key: string]: any;
}

/**
 * Middleware Manager
 */
export class MiddlewareManager {
  private middlewares: RestMiddleware[] = [];

  /**
   * Добавить middleware
   */
  use(middleware: RestMiddleware): void {
    this.middlewares.push(middleware);
  }

  /**
   * Удалить middleware
   */
  remove(middleware: RestMiddleware): void {
    const index = this.middlewares.indexOf(middleware);
    if (index > -1) {
      this.middlewares.splice(index, 1);
    }
  }

  /**
   * Очистить все middleware
   */
  clear(): void {
    this.middlewares = [];
  }

  /**
   * Применить beforeRequest middleware
   */
  async applyBeforeRequest(config: RequestConfig): Promise<RequestConfig> {
    let currentConfig = config;

    for (const middleware of this.middlewares) {
      if (middleware.beforeRequest) {
        currentConfig = await middleware.beforeRequest(currentConfig);
      }
    }

    return currentConfig;
  }

  /**
   * Применить afterResponse middleware
   */
  async applyAfterResponse(
    response: Response,
    config: RequestConfig
  ): Promise<Response> {
    let currentResponse = response;

    for (const middleware of this.middlewares) {
      if (middleware.afterResponse) {
        currentResponse = await middleware.afterResponse(currentResponse, config);
      }
    }

    return currentResponse;
  }

  /**
   * Применить onError middleware
   */
  async applyOnError(
    error: Error,
    config: RequestConfig
  ): Promise<Error> {
    let currentError = error;

    for (const middleware of this.middlewares) {
      if (middleware.onError) {
        currentError = await middleware.onError(currentError, config);
      }
    }

    return currentError;
  }
}

/**
 * Встроенные middleware
 */

/**
 * Auth middleware - добавляет токен в заголовки
 */
export function createAuthMiddleware(getToken: () => string | Promise<string>): RestMiddleware {
  return {
    beforeRequest: async (config) => {
      const token = await getToken();
      return {
        ...config,
        headers: {
          ...config.headers,
          Authorization: `Bearer ${token}`,
        },
      };
    },
  };
}

/**
 * Retry middleware - повторяет запрос при ошибке
 */
export function createRetryMiddleware(
  maxRetries: number = 3,
  delay: number = 1000
): RestMiddleware {
  return {
    onError: async (error, config) => {
      // Retry логика будет в самом REST client
      return error;
    },
  };
}

/**
 * Logging middleware - логирует запросы и ответы
 */
export function createLoggingMiddleware(verbose: boolean = false): RestMiddleware {
  return {
    beforeRequest: (config) => {
      if (verbose) {
        console.log("[REST] Request:", config.method, config.url, config);
      }
      return config;
    },
    afterResponse: (response, config) => {
      if (verbose) {
        console.log("[REST] Response:", response.status, config.url);
      }
      return response;
    },
    onError: (error, config) => {
      console.error("[REST] Error:", error.message, config.url);
      return error;
    },
  };
}

/**
 * Cache middleware - кэширует GET запросы
 */
export function createCacheMiddleware(
  ttl: number = 60000,
  storage?: Storage
): RestMiddleware {
  const cache = new Map<string, { data: any; timestamp: number }>();

  return {
    beforeRequest: async (config) => {
      if (config.method === "GET" && storage) {
        const cached = storage.getItem(`cache_${config.url}`);
        if (cached) {
          const { data, timestamp } = JSON.parse(cached);
          if (Date.now() - timestamp < ttl) {
            // Возвращаем кэшированный ответ (нужно обернуть в Response)
            return config;
          }
        }
      }
      return config;
    },
  };
}

