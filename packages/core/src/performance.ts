/**
 * Performance Monitoring для Vira Framework
 * Отслеживание производительности компонентов и сервисов
 */

import React, { useEffect, useRef } from "react";
import { devTools } from "./devtools";

export interface PerformanceMetric {
  name: string;
  duration: number;
  timestamp: number;
  metadata?: Record<string, any>;
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private marks: Map<string, number> = new Map();
  private maxMetrics = 1000;
  private enabled = process.env.NODE_ENV === "development";

  /**
   * Включить/выключить мониторинг
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  /**
   * Начать измерение
   */
  mark(name: string): void {
    if (!this.enabled) return;
    this.marks.set(name, performance.now());
  }

  /**
   * Завершить измерение и записать метрику
   */
  measure(name: string, metadata?: Record<string, any>): number {
    if (!this.enabled) return 0;

    const startTime = this.marks.get(name);
    if (!startTime) {
      console.warn(`Performance mark "${name}" not found`);
      return 0;
    }

    const duration = performance.now() - startTime;
    const metric: PerformanceMetric = {
      name,
      duration,
      timestamp: Date.now(),
      metadata,
    };

    this.metrics.push(metric);

    // Ограничиваем размер массива метрик
    if (this.metrics.length > this.maxMetrics) {
      this.metrics.shift();
    }

    // Логируем в DevTools
    devTools.emit("performance:metric", metric);

    // Удаляем mark
    this.marks.delete(name);

    return duration;
  }

  /**
   * Измерить выполнение функции
   */
  async measureAsync<T>(
    name: string,
    fn: () => T | Promise<T>,
    metadata?: Record<string, any>
  ): Promise<T> {
    this.mark(name);
    try {
      const result = await fn();
      this.measure(name, { ...metadata, success: true });
      return result;
    } catch (error: any) {
      this.measure(name, { ...metadata, success: false, error: error.message });
      throw error;
    }
  }

  /**
   * Получить все метрики
   */
  getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  /**
   * Получить метрики по имени
   */
  getMetricsByName(name: string): PerformanceMetric[] {
    return this.metrics.filter(m => m.name === name);
  }

  /**
   * Получить среднюю длительность по имени
   */
  getAverageDuration(name: string): number {
    const metrics = this.getMetricsByName(name);
    if (metrics.length === 0) return 0;
    return metrics.reduce((sum, m) => sum + m.duration, 0) / metrics.length;
  }

  /**
   * Очистить метрики
   */
  clear(): void {
    this.metrics = [];
    this.marks.clear();
  }

  /**
   * Получить статистику
   */
  getStats(): {
    total: number;
    averages: Record<string, number>;
    slowest: PerformanceMetric[];
  } {
    const averages: Record<string, number> = {};
    const metricsByName = new Map<string, PerformanceMetric[]>();

    this.metrics.forEach(metric => {
      if (!metricsByName.has(metric.name)) {
        metricsByName.set(metric.name, []);
      }
      metricsByName.get(metric.name)!.push(metric);
    });

    metricsByName.forEach((metrics, name) => {
      averages[name] = metrics.reduce((sum, m) => sum + m.duration, 0) / metrics.length;
    });

    const slowest = [...this.metrics]
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 10);

    return {
      total: this.metrics.length,
      averages,
      slowest,
    };
  }
}

export const performanceMonitor = new PerformanceMonitor();

/**
 * React hook для измерения производительности компонента
 */
export function usePerformance(name: string, enabled: boolean = true): void {
  const renderStartRef = useRef<number>(0);

  useEffect(() => {
    if (!enabled) return;

    renderStartRef.current = performance.now();

    return () => {
      const duration = performance.now() - renderStartRef.current;
      performanceMonitor.getMetrics().push({
        name: `render:${name}`,
        duration,
        timestamp: Date.now(),
      });
    };
  }, [name, enabled]);
}

/**
 * HOC для измерения производительности компонента
 */

export function withPerformanceMonitoring<T extends React.ComponentType<any>>(
  Component: T,
  componentName: string
): T {
  return ((props: React.ComponentProps<T>) => {
    usePerformance(componentName);
    return React.createElement(Component, props);
  }) as T;
}

