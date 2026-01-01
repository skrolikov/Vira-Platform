/**
 * DevTools для Vira Framework
 * Инструменты для отладки и мониторинга состояния
 */

import { getStateGraph, exportStateGraph } from "./state-graph";
import type { StateGraph } from "./state-graph";

/**
 * DevTools Manager
 */
export class ViraDevTools {
  private static instance: ViraDevTools | null = null;
  private listeners: Set<(data: any) => void> = new Set();
  private history: Array<{ type: string; payload: any; timestamp: number }> = [];
  private maxHistorySize = 1000;

  static getInstance(): ViraDevTools {
    if (!ViraDevTools.instance) {
      ViraDevTools.instance = new ViraDevTools();
    }
    return ViraDevTools.instance;
  }

  /**
   * Подписаться на события DevTools
   */
  subscribe(listener: (data: any) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Отправить событие
   */
  emit(type: string, payload: any): void {
    const event = { type, payload, timestamp: Date.now() };
    this.history.push(event);

    // Ограничиваем размер истории
    if (this.history.length > this.maxHistorySize) {
      this.history.shift();
    }

    // Уведомляем подписчиков
    this.listeners.forEach(listener => {
      try {
        listener(event);
      } catch (err) {
        console.error("DevTools listener error:", err);
      }
    });
  }

  /**
   * Получить историю событий
   */
  getHistory(): Array<{ type: string; payload: any; timestamp: number }> {
    return [...this.history];
  }

  /**
   * Очистить историю
   */
  clearHistory(): void {
    this.history = [];
  }

  /**
   * Получить текущее состояние StateGraph
   */
  getStateGraph(): StateGraph {
    return getStateGraph();
  }

  /**
   * Экспортировать StateGraph в JSON
   */
  exportStateGraph(): string {
    return exportStateGraph();
  }

  /**
   * Записать действие сервиса
   */
  logServiceAction(serviceName: string, action: string, payload: any): void {
    this.emit("service:action", { serviceName, action, payload });
  }

  /**
   * Записать изменение состояния
   */
  logStateChange(serviceName: string, property: string, oldValue: any, newValue: any): void {
    this.emit("state:change", { serviceName, property, oldValue, newValue });
  }

  /**
   * Записать ошибку
   */
  logError(serviceName: string, error: Error): void {
    this.emit("error", { serviceName, error: error.message, stack: error.stack });
  }
}

/**
 * Глобальный экземпляр DevTools
 */
export const devTools = ViraDevTools.getInstance();

/**
 * React hook для подключения DevTools
 */
import { useEffect } from "react";

export function useDevTools(enabled: boolean = process.env.NODE_ENV === "development"): void {
  useEffect(() => {
    if (!enabled) return;

    // Подключаем DevTools к window для доступа из консоли
    (window as any).__VIRA_DEVTOOLS__ = devTools;

    // Логируем подключение
    devTools.emit("devtools:connected", { timestamp: Date.now() });

    return () => {
      devTools.emit("devtools:disconnected", { timestamp: Date.now() });
    };
  }, [enabled]);
}

import React from "react";

/**
 * HOC для логирования действий компонента
 */
export function withDevToolsLogging<T extends React.ComponentType<any>>(
  Component: T,
  componentName: string
): T {
  return ((props: React.ComponentProps<T>) => {
    useEffect(() => {
      devTools.emit("component:mount", { componentName, props });
      return () => {
        devTools.emit("component:unmount", { componentName });
      };
    }, []);

    return React.createElement(Component, props);
  }) as T;
}

