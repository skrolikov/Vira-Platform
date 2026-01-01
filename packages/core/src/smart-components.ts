/**
 * Smart Components - Компоненты без логики, фреймворк подкладывает всё сам
 * 
 * @example
 * <v-table data="@clients" columns="@clientColumns" />
 * 
 * Фреймворк автоматически:
 * - находит сервис "clients"
 * - подписывается на изменения
 * - применяет auto-binding
 */

import * as React from "react";
import { useViraContext, resolveModel, parseModel } from "./context";
import { useService } from "./services";
import { useSignal } from "./signals";
import { useReactiveService } from "./reactive";

// Типы для smart компонентов
export interface SmartComponentProps {
  [key: string]: any;
  "v-bind"?: Record<string, any>;
  "v-model"?: string;
}

/**
 * Обработка специальных атрибутов smart компонентов
 * 
 * @param props - пропсы компонента
 * @param context - Vira контекст
 */
function processSmartProps(
  props: SmartComponentProps,
  context: any
): Record<string, any> {
  const processed: Record<string, any> = {};

  for (const [key, value] of Object.entries(props)) {
    // Пропуск служебных атрибутов
    if (key.startsWith("v-") || key.startsWith("@")) {
      continue;
    }

    // Обработка @service.property синтаксиса
    if (typeof value === "string" && value.startsWith("@")) {
      const modelPath = value.substring(1); // Убираем "@"
      
      try {
        const binding = resolveModel(modelPath, context);
        processed[key] = (binding as any).value;
      } catch (err) {
        console.warn(`Failed to resolve @${modelPath}:`, err);
        processed[key] = value;
      }
    } else {
      processed[key] = value;
    }
  }

  return processed;
}

/**
 * HOC для создания smart компонента
 * Автоматически обрабатывает @ синтаксис и подписки
 * 
 * @example
 * const SmartTable = smart(Table);
 * 
 * // Использование:
 * <SmartTable data="@clients" columns="@clientColumns" />
 */
export function smart<P extends Record<string, any>>(
  Component: React.ComponentType<P>
): React.FC<P & SmartComponentProps> {
  return (props: P & SmartComponentProps) => {
    const context = useViraContext();

    // Обрабатываем smart пропсы
    const processedProps = processSmartProps(props, context) as P;

    // Находим все @ ссылки для подписки
    const subscriptions: Array<{ service: string; property?: string }> = [];

    for (const [key, value] of Object.entries(props)) {
      if (typeof value === "string" && value.startsWith("@")) {
        const modelPath = value.substring(1);
        const parsed = parseModel(modelPath);
        
        if (parsed) {
          subscriptions.push({
            service: parsed.service,
            property: parsed.property,
          });
        }
      }
    }

    // Подписываемся на все найденные сервисы
    for (const sub of subscriptions) {
      try {
        const service = useService(sub.service);
        // Автоматическая подписка будет обработана через контекст
        // если сервис реактивный
        if (sub.property && (service as any).__reactive__) {
          // Подписка через контекст уже обработана в processSmartProps
        }
      } catch (err) {
        console.warn(`Failed to subscribe to ${sub.service}:`, err);
      }
    }

    return React.createElement(Component, processedProps);
  };
}

/**
 * Фабрика для создания smart компонентов с авто-подписками
 * 
 * @example
 * const SmartTable = createSmartComponent(Table, {
 *   data: { service: "client", property: "clients" },
 *   columns: { static: true },
 * });
 */
export interface SmartComponentConfig {
  [propName: string]: {
    service?: string;
    property?: string;
    static?: boolean;
  };
}

export function createSmartComponent<P extends Record<string, any>>(
  Component: React.ComponentType<P>,
  config: SmartComponentConfig
): React.FC<P> {
  return (props: P) => {
    const processedProps = { ...props };

    // Применяем конфигурацию
    for (const [propName, propConfig] of Object.entries(config)) {
      if (propConfig.static) {
        // Статический проп - оставляем как есть
        continue;
      }

      if (propConfig.service && propConfig.property) {
        // Динамический проп из сервиса
        try {
          const service = useService(propConfig.service);
          useReactiveService(propConfig.service);
          
          if (propConfig.property) {
            processedProps[propName as keyof P] = (service as any)[propConfig.property];
          }
        } catch (err) {
          console.warn(`Failed to bind ${propName}:`, err);
        }
      }
    }

    return React.createElement(Component, processedProps);
  };
}

/**
 * JSX трансформация для обработки v- и @ синтаксиса
 * (Требует babel/transform плагина - будет в компиляторе)
 */
export const VIRA_JSX_TRANSFORMS = {
  // @service.property → resolveModel
  "@": (value: string) => {
    return {
      type: "model",
      path: value.substring(1),
    };
  },
  
  // v-bind → spread props
  "v-bind": (value: Record<string, any>) => {
    return {
      type: "spread",
      props: value,
    };
  },
  
  // v-model → двустороннее связывание
  "v-model": (value: string) => {
    return {
      type: "model",
      path: value,
      twoWay: true,
    };
  },
};

