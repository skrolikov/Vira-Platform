/**
 * Reactive Router - Реактивный роутер (проще, чем React Router)
 * 
 * @example
 * const route = reactiveRoute();
 * 
 * // Компонент автоматически обновляется при смене URL
 * function App() {
 *   const currentRoute = useSignal(route.current);
 *   const params = useSignal(route.params);
 *   
 *   return <div>Current: {currentRoute()}</div>;
 * }
 */

import { signal, Signal, computed, effect } from "./signals";
import { useSignal } from "./signals";

export interface RouteParams {
  [key: string]: string;
}

export interface RouteMatch {
  path: string;
  params: RouteParams;
  query: RouteParams;
  hash: string;
}

export interface ReactiveRouter {
  current: Signal<string>;
  params: Signal<RouteParams>;
  query: Signal<RouteParams>;
  hash: Signal<string>;
  navigate: (path: string, options?: { replace?: boolean; state?: any }) => void;
  go: (delta: number) => void;
  back: () => void;
  forward: () => void;
  match: (pattern: string) => Signal<RouteMatch | null>;
}

/**
 * Создание реактивного роутера
 * 
 * @example
 * const router = reactiveRoute();
 * 
 * // Использование в компоненте
 * function App() {
 *   const current = useSignal(router.current);
 *   
 *   if (current() === "/users") {
 *     return <UsersPage />;
 *   }
 *   return <HomePage />;
 * }
 */
export function reactiveRoute(basePath: string = ""): ReactiveRouter {
  // Получаем текущий путь
  const getPath = () => {
    const path = window.location.pathname.replace(basePath, "") || "/";
    return path;
  };

  const getParams = (): RouteParams => {
    const params: RouteParams = {};
    // Парсим params из URL (если есть)
    return params;
  };

  const getQuery = (): RouteParams => {
    const params: RouteParams = {};
    const searchParams = new URLSearchParams(window.location.search);
    searchParams.forEach((value, key) => {
      params[key] = value;
    });
    return params;
  };

  const getHash = () => {
    return window.location.hash.substring(1);
  };

  const [current, setCurrent] = signal<string>(getPath());
  const [params, setParams] = signal<RouteParams>(getParams());
  const [query, setQuery] = signal<RouteParams>(getQuery());
  const [hash, setHash] = signal<string>(getHash());

  // Слушаем изменения истории браузера
  const updateRoute = () => {
    setCurrent(getPath());
    setParams(getParams());
    setQuery(getQuery());
    setHash(getHash());
  };

  // Подписываемся на popstate
  effect(() => {
    window.addEventListener("popstate", updateRoute);
    return () => {
      window.removeEventListener("popstate", updateRoute);
    };
  });

  const navigate = (path: string, options: { replace?: boolean; state?: any } = {}) => {
    const fullPath = basePath + path;
    
    if (options.replace) {
      window.history.replaceState(options.state, "", fullPath);
    } else {
      window.history.pushState(options.state, "", fullPath);
    }
    
    updateRoute();
  };

  const go = (delta: number) => {
    window.history.go(delta);
    // updateRoute вызовется через popstate
  };

  const back = () => {
    window.history.back();
  };

  const forward = () => {
    window.history.forward();
  };

  const match = (pattern: string): Signal<RouteMatch | null> => {
    return computed(() => {
      const currentPath = current();
      const routeParams: RouteParams = {};
      
      // Простой паттерн матчинг (можно улучшить)
      const patternParts = pattern.split("/");
      const pathParts = currentPath.split("/");
      
      if (patternParts.length !== pathParts.length) {
        return null;
      }
      
      for (let i = 0; i < patternParts.length; i++) {
        const patternPart = patternParts[i];
        const pathPart = pathParts[i];
        
        if (patternPart.startsWith(":")) {
          // Параметр маршрута
          const paramName = patternPart.substring(1);
          routeParams[paramName] = pathPart;
        } else if (patternPart !== pathPart) {
          return null;
        }
      }
      
      return {
        path: currentPath,
        params: routeParams,
        query: query(),
        hash: hash(),
      };
    });
  };

  return {
    current,
    params,
    query,
    hash,
    navigate,
    go,
    back,
    forward,
    match,
  };
}

/**
 * Хук для использования роутера в компонентах
 * 
 * @example
 * function App() {
 *   const router = useRouter();
 *   const current = useSignal(router.current);
 *   
 *   return <div>Route: {current()}</div>;
 * }
 */
let globalRouter: ReactiveRouter | null = null;

export function setGlobalRouter(router: ReactiveRouter) {
  globalRouter = router;
}

export function useRouter(): ReactiveRouter {
  if (!globalRouter) {
    globalRouter = reactiveRoute();
  }
  return globalRouter;
}

