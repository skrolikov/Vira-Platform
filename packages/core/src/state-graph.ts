/**
 * StateGraph - Глобальное дерево сервисов для визуализации и дебага
 * Аналог Redux DevTools, но для сервисов
 */

import { ServiceContainer } from "./types";

// ============================================
// STATE GRAPH TYPES
// ============================================

export interface ServiceNode {
  name: string;
  type: "service" | "model" | "form" | "resource";
  properties: string[];
  methods: string[];
  dependencies: string[];
  state: Record<string, any>;
  metadata?: Record<string, any>;
}

export interface StateGraph {
  nodes: Map<string, ServiceNode>;
  edges: Array<{ from: string; to: string; type: string }>;
  events: Array<{ timestamp: number; service: string; action: string; data?: any }>;
}

// ============================================
// STATE GRAPH
// ============================================

class ViraStateGraph {
  private graph: StateGraph = {
    nodes: new Map(),
    edges: [],
    events: [],
  };

  private maxEvents = 1000;

  /**
   * Регистрация сервиса в графе
   */
  registerService(
    name: string,
    type: ServiceNode["type"],
    service: any
  ): void {
    const properties: string[] = [];
    const methods: string[] = [];

    // Анализируем сервис
    for (const key of Object.keys(service)) {
      if (typeof service[key] === "function") {
        methods.push(key);
      } else {
        properties.push(key);
      }
    }

    const node: ServiceNode = {
      name,
      type,
      properties,
      methods,
      dependencies: [],
      state: this.extractState(service),
      metadata: {
        registeredAt: Date.now(),
      },
    };

    this.graph.nodes.set(name, node);
    this.logEvent(name, "registered", { type });
  }

  /**
   * Обновление состояния сервиса
   */
  updateServiceState(name: string, service: any): void {
    const node = this.graph.nodes.get(name);
    if (node) {
      node.state = this.extractState(service);
      node.properties = Object.keys(service).filter(
        key => typeof service[key] !== "function"
      );
      node.methods = Object.keys(service).filter(
        key => typeof service[key] === "function"
      );
      this.logEvent(name, "state_updated", { state: node.state });
    }
  }

  /**
   * Добавление зависимости между сервисами
   */
  addDependency(from: string, to: string, type: string = "uses"): void {
    const fromNode = this.graph.nodes.get(from);
    if (fromNode && !fromNode.dependencies.includes(to)) {
      fromNode.dependencies.push(to);
    }

    this.graph.edges.push({ from, to, type });
    this.logEvent(from, "dependency_added", { to, type });
  }

  /**
   * Логирование события
   */
  logEvent(service: string, action: string, data?: any): void {
    this.graph.events.push({
      timestamp: Date.now(),
      service,
      action,
      data,
    });

    // Ограничиваем количество событий
    if (this.graph.events.length > this.maxEvents) {
      this.graph.events = this.graph.events.slice(-this.maxEvents);
    }
  }

  /**
   * Извлечение состояния из сервиса
   */
  private extractState(service: any): Record<string, any> {
    const state: Record<string, any> = {};

    for (const key of Object.keys(service)) {
      if (typeof service[key] !== "function" && !key.startsWith("__")) {
        try {
          // Пытаемся сериализовать значение
          JSON.stringify(service[key]);
          state[key] = service[key];
        } catch {
          // Если не сериализуется - сохраняем тип
          state[key] = `[${typeof service[key]}]`;
        }
      }
    }

    return state;
  }

  /**
   * Получение полного графа
   */
  getGraph(): StateGraph {
    return {
      nodes: new Map(this.graph.nodes),
      edges: [...this.graph.edges],
      events: [...this.graph.events],
    };
  }

  /**
   * Получение узла
   */
  getNode(name: string): ServiceNode | undefined {
    return this.graph.nodes.get(name);
  }

  /**
   * Получение зависимостей сервиса
   */
  getDependencies(name: string): string[] {
    return this.graph.nodes.get(name)?.dependencies || [];
  }

  /**
   * Получение последних событий
   */
  getRecentEvents(limit: number = 50): StateGraph["events"] {
    return this.graph.events.slice(-limit);
  }

  /**
   * Очистка графа
   */
  clear(): void {
    this.graph = {
      nodes: new Map(),
      edges: [],
      events: [],
    };
  }

  /**
   * Экспорт графа в JSON
   */
  toJSON(): any {
    return {
      nodes: Array.from(this.graph.nodes.entries()).map(([nodeName, node]) => ({
        ...node,
        name: nodeName,
      })),
      edges: this.graph.edges,
      events: this.graph.events.slice(-100), // Последние 100 событий
    };
  }
}

// ============================================
// GLOBAL INSTANCE
// ============================================

const globalStateGraph = new ViraStateGraph();

/**
 * Регистрация сервиса в графе
 */
export function registerServiceInGraph(
  name: string,
  type: ServiceNode["type"],
  service: any
): void {
  globalStateGraph.registerService(name, type, service);
}

/**
 * Обновление состояния сервиса
 */
export function updateServiceInGraph(name: string, service: any): void {
  globalStateGraph.updateServiceState(name, service);
}

/**
 * Добавление зависимости
 */
export function addDependencyToGraph(
  from: string,
  to: string,
  type?: string
): void {
  globalStateGraph.addDependency(from, to, type);
}

/**
 * Логирование события
 */
export function logStateGraphEvent(
  service: string,
  action: string,
  data?: any
): void {
  globalStateGraph.logEvent(service, action, data);
}

/**
 * Получение графа
 */
export function getStateGraph(): StateGraph {
  return globalStateGraph.getGraph();
}

/**
 * Получение узла
 */
export function getStateGraphNode(name: string): ServiceNode | undefined {
  return globalStateGraph.getNode(name);
}

/**
 * Экспорт графа в JSON
 */
export function exportStateGraph(): any {
  return globalStateGraph.toJSON();
}

/**
 * Очистка графа
 */
export function clearStateGraph(): void {
  globalStateGraph.clear();
}

