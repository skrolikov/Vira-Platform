/**
 * DevTools Integration - Интеграция с DevTools для отладки
 * 
 * Граф состояний, timeline изменений, performance profiling
 */

import { Signal } from "./signals";

export interface DevToolsEvent {
  type: "signal" | "computed" | "effect" | "service" | "query";
  name: string;
  value: any;
  timestamp: number;
  stack?: string;
}

export interface StateGraphNode {
  id: string;
  type: "signal" | "computed" | "effect" | "service";
  name: string;
  value: any;
  dependencies: string[];
  dependents: string[];
}

class ViraDevTools {
  private events: DevToolsEvent[] = [];
  private graph: Map<string, StateGraphNode> = new Map();
  private isEnabled = false;

  enable() {
    this.isEnabled = true;
  }

  disable() {
    this.isEnabled = false;
  }

  /**
   * Логирование события
   */
  logEvent(event: Omit<DevToolsEvent, "timestamp">) {
    if (!this.isEnabled) return;

    const fullEvent: DevToolsEvent = {
      ...event,
      timestamp: Date.now(),
      stack: new Error().stack,
    };

    this.events.push(fullEvent);

    // Ограничиваем размер массива событий
    if (this.events.length > 1000) {
      this.events.shift();
    }
  }

  /**
   * Регистрация узла в графе состояний
   */
  registerNode(node: Omit<StateGraphNode, "dependencies" | "dependents">) {
    if (!this.graph.has(node.id)) {
      this.graph.set(node.id, {
        ...node,
        dependencies: [],
        dependents: [],
      });
    }
  }

  /**
   * Добавление зависимости в граф
   */
  addDependency(fromId: string, toId: string) {
    const from = this.graph.get(fromId);
    const to = this.graph.get(toId);

    if (from && to) {
      if (!from.dependencies.includes(toId)) {
        from.dependencies.push(toId);
      }
      if (!to.dependents.includes(fromId)) {
        to.dependents.push(fromId);
      }
    }
  }

  /**
   * Обновление значения узла
   */
  updateNode(id: string, value: any) {
    const node = this.graph.get(id);
    if (node) {
      node.value = value;
      this.logEvent({
        type: node.type,
        name: node.name,
        value,
      });
    }
  }

  /**
   * Получение графа состояний
   */
  getGraph(): StateGraphNode[] {
    return Array.from(this.graph.values());
  }

  /**
   * Получение событий
   */
  getEvents(): DevToolsEvent[] {
    return [...this.events];
  }

  /**
   * Очистка данных
   */
  clear() {
    this.events = [];
    this.graph.clear();
  }

  /**
   * Экспорт данных для DevTools расширения
   */
  export() {
    return {
      graph: this.getGraph(),
      events: this.getEvents(),
    };
  }
}

// Глобальный экземпляр DevTools
export const devTools = new ViraDevTools();

/**
 * Хелпер для логирования изменений signal
 */
export function trackSignal<T>(name: string, signal: Signal<T>): Signal<T> {
  const originalSignal = signal;
  
  return () => {
    const value = originalSignal();
    devTools.logEvent({
      type: "signal",
      name,
      value,
    });
    return value;
  };
}

/**
 * Интеграция с браузерным DevTools (через window)
 */
if (typeof window !== "undefined") {
  (window as any).__VIRA_DEVTOOLS__ = {
    enable: () => devTools.enable(),
    disable: () => devTools.disable(),
    getGraph: () => devTools.getGraph(),
    getEvents: () => devTools.getEvents(),
    export: () => devTools.export(),
    clear: () => devTools.clear(),
  };
}

