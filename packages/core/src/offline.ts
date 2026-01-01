/**
 * Offline Support для REST Client
 * Кэширование запросов и автосинхронизация при восстановлении сети
 */

import { getRestClient } from "./rest";
import { devTools } from "./devtools";

interface QueuedRequest {
  id: string;
  method: string;
  url: string;
  body?: any;
  timestamp: number;
  retries: number;
}

class OfflineManager {
  private queue: QueuedRequest[] = [];
  private maxRetries = 3;
  private retryDelay = 5000;
  private isOnline = typeof navigator !== "undefined" ? navigator.onLine : true;
  private listeners: Set<(isOnline: boolean) => void> = new Set();
  private syncInterval: NodeJS.Timeout | null = null;

  constructor() {
    if (typeof window !== "undefined") {
      window.addEventListener("online", () => this.handleOnline());
      window.addEventListener("offline", () => this.handleOffline());
    }
  }

  /**
   * Проверка онлайн статуса
   */
  isOnlineNow(): boolean {
    return this.isOnline;
  }

  /**
   * Подписка на изменения статуса
   */
  onStatusChange(listener: (isOnline: boolean) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Обработка перехода в онлайн
   */
  private handleOnline(): void {
    if (!this.isOnline) {
      this.isOnline = true;
      this.notifyListeners();
      devTools.emit("offline:online", {});
      this.startSync();
    }
  }

  /**
   * Обработка перехода в оффлайн
   */
  private handleOffline(): void {
    if (this.isOnline) {
      this.isOnline = false;
      this.notifyListeners();
      devTools.emit("offline:offline", {});
      this.stopSync();
    }
  }

  /**
   * Уведомление слушателей
   */
  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      try {
        listener(this.isOnline);
      } catch (err) {
        console.error("Offline listener error:", err);
      }
    });
  }

  /**
   * Добавить запрос в очередь
   */
  queueRequest(method: string, url: string, body?: any): string {
    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const request: QueuedRequest = {
      id,
      method,
      url,
      body,
      timestamp: Date.now(),
      retries: 0,
    };

    this.queue.push(request);
    devTools.emit("offline:queued", { request });

    // Если онлайн - пытаемся выполнить сразу
    if (this.isOnline) {
      this.processQueue();
    }

    return id;
  }

  /**
   * Обработка очереди запросов
   */
  private async processQueue(): Promise<void> {
    if (!this.isOnline || this.queue.length === 0) return;

    const requests = [...this.queue];
    this.queue = [];

    for (const request of requests) {
      try {
        await this.executeRequest(request);
        devTools.emit("offline:synced", { request });
      } catch (error: any) {
        request.retries++;
        if (request.retries < this.maxRetries) {
          this.queue.push(request);
          devTools.emit("offline:retry", { request, error: error.message });
        } else {
          devTools.emit("offline:failed", { request, error: error.message });
        }
      }
    }
  }

  /**
   * Выполнение запроса
   */
  private async executeRequest(request: QueuedRequest): Promise<void> {
    const client = getRestClient();
    // Используем внутренний метод request через рефлексию или публичный API
    // Здесь упрощенная версия - нужно адаптировать под реальный REST client
    const response = await fetch(request.url, {
      method: request.method,
      headers: { "Content-Type": "application/json" },
      body: request.body ? JSON.stringify(request.body) : undefined,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
  }

  /**
   * Запустить автосинхронизацию
   */
  startSync(interval: number = 30000): void {
    this.stopSync();
    this.syncInterval = setInterval(() => {
      if (this.isOnline) {
        this.processQueue();
      }
    }, interval);
  }

  /**
   * Остановить автосинхронизацию
   */
  stopSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  /**
   * Получить очередь
   */
  getQueue(): QueuedRequest[] {
    return [...this.queue];
  }

  /**
   * Очистить очередь
   */
  clearQueue(): void {
    this.queue = [];
  }
}

export const offlineManager = new OfflineManager();

/**
 * React hook для отслеживания онлайн статуса
 */
import { useState, useEffect } from "react";

export function useOnlineStatus(): boolean {
  const [isOnline, setIsOnline] = useState(() => offlineManager.isOnlineNow());

  useEffect(() => {
    const unsubscribe = offlineManager.onStatusChange(setIsOnline);
    return unsubscribe;
  }, []);

  return isOnline;
}

