import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";

/**
 * Provide/Inject система для Vira Framework
 * Позволяет компонентам передавать данные вниз по дереву без prop drilling
 */

interface ProvideContextValue {
  provide: (key: string, value: any) => void;
  inject: <T = any>(key: string, defaultValue?: T) => T;
  values: Map<string, any>;
}

const ProvideContext = createContext<ProvideContextValue | null>(null);

/**
 * ViraProvide - Provider компонент для provide/inject системы
 */
export interface ViraProvideProps {
  children: ReactNode;
}

export const ViraProvide: React.FC<ViraProvideProps> = ({ children }) => {
  const [values, setValues] = useState<Map<string, any>>(new Map());

  const provide = useCallback((key: string, value: any) => {
    setValues(prev => {
      const next = new Map(prev);
      next.set(key, value);
      return next;
    });
  }, []);

  const inject = useCallback(<T = any>(key: string, defaultValue?: T): T => {
    const value = values.get(key);
    return value !== undefined ? value : (defaultValue as T);
  }, [values]);

  return (
    <ProvideContext.Provider value={{ provide, inject, values }}>
      {children}
    </ProvideContext.Provider>
  );
};

/**
 * useProvideInject - Hook для использования provide/inject
 */
export function useProvideInject(): ProvideContextValue {
  const context = useContext(ProvideContext);
  if (!context) {
    // Fallback если нет провайдера
    return {
      provide: () => {},
      inject: <T = any>(_key: string, defaultValue?: T): T => defaultValue as T,
      values: new Map(),
    };
  }
  return context;
}

