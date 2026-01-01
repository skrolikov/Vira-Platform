import { createContext, useContext } from "react";
import { BindingContext } from "./types";
import { getServiceContainer } from "./services";

/**
 * Контекст для auto-binding и DI
 */

const ViraContext = createContext<BindingContext>({
  services: getServiceContainer(),
  currentService: undefined,
});

export const ViraContextProvider = ViraContext.Provider;

/**
 * Использование контекста Vira
 */
export function useViraContext(): BindingContext {
  return useContext(ViraContext);
}

/**
 * Парсинг action строки: "client.create" -> { service: "client", method: "create" }
 */
export function parseAction(action: string): { service: string; method: string } {
  const parts = action.split(".");
  
  if (parts.length !== 2) {
    throw new Error(
      `Invalid action format: "${action}". Expected format: "serviceName.methodName"`
    );
  }

  return {
    service: parts[0],
    method: parts[1],
  };
}

/**
 * Парсинг model строки: "client.name" -> { service: "client", property: "name" }
 */
export function parseModel(model: string): { service: string; property: string } {
  const parts = model.split(".");
  
  if (parts.length !== 2) {
    throw new Error(
      `Invalid model format: "${model}". Expected format: "serviceName.propertyName"`
    );
  }

  return {
    service: parts[0],
    property: parts[1],
  };
}

/**
 * Резолвинг action - получение метода из сервиса
 */
export function resolveAction(
  action: string,
  context: BindingContext
): Function {
  const { service: serviceName, method: methodName } = parseAction(action);
  
  const service = context.services.get(serviceName);
  
  if (!service) {
    throw new Error(`Service "${serviceName}" not found`);
  }

  const method = (service as any)[methodName];
  
  if (typeof method !== "function") {
    throw new Error(
      `Method "${methodName}" not found in service "${serviceName}"`
    );
  }

  // Биндим контекст сервиса
  return method.bind(service);
}

/**
 * Резолвинг model - получение значения и сеттера из сервиса
 */
export function resolveModel(
  model: string,
  context: BindingContext
): { value: any; setValue: (value: any) => void; service: any } {
  const { service: serviceName, property: propertyName } = parseModel(model);
  
  const service = context.services.get(serviceName);
  
  if (!service) {
    throw new Error(`Service "${serviceName}" not found`);
  }

  // Получаем актуальное значение (может быть геттер)
  const propertyValue = (service as any)[propertyName];
  const value = typeof propertyValue === "function" 
    ? propertyValue.call(service)
    : propertyValue;
  
  // Ищем сеттер: сначала точное имя setXxx, потом проверяем прямое присваивание
  const setterName = `set${propertyName.charAt(0).toUpperCase()}${propertyName.slice(1)}`;
  let setter = (service as any)[setterName];

  // Если есть метод setter - используем его
  if (typeof setter === "function") {
    return {
      value,
      service,
      setValue: setter.bind(service),
    };
  }

  // Если нет сеттера, но property это геттер - пробуем прямое присваивание
  // (для случаев когда свойство приватное, но есть публичный сеттер через метод)
  return {
    value,
    service,
    setValue: (newValue: any) => {
      // Прямая установка свойства (триггерит реактивность если сервис реактивный)
      // Если есть метод setter - вызываем его, иначе прямое присваивание
      if (typeof (service as any)[setterName] === "function") {
        (service as any)[setterName](newValue);
      } else {
        // Прямое присваивание (работает для реактивных сервисов)
        (service as any)[propertyName] = newValue;
      }
    },
  };
}

