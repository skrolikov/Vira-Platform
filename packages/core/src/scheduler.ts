/**
 * Vira DOM Scheduler - Умный рендер с приоритетами
 * 
 * Как React Fiber, но проще
 * 
 * - batch обновления
 * - requestIdleCallback для тяжёлых операций
 * - приоритеты "sync", "low", "transition"
 */

export type UpdatePriority = "sync" | "low" | "transition" | "idle";

export interface ScheduledUpdate {
  fn: () => void;
  priority: UpdatePriority;
  id: number;
}

class ViraScheduler {
  private syncQueue: ScheduledUpdate[] = [];
  private lowQueue: ScheduledUpdate[] = [];
  private transitionQueue: ScheduledUpdate[] = [];
  private idleQueue: ScheduledUpdate[] = [];
  private isFlushing = false;
  private updateId = 0;
  private idleCallbackId: number | null = null;

  /**
   * Планирование обновления
   */
  schedule(update: () => void, priority: UpdatePriority = "sync"): number {
    const id = ++this.updateId;
    const scheduled: ScheduledUpdate = { fn: update, priority, id };

    switch (priority) {
      case "sync":
        this.syncQueue.push(scheduled);
        this.flushSync();
        break;
      case "low":
        this.lowQueue.push(scheduled);
        this.flushLow();
        break;
      case "transition":
        this.transitionQueue.push(scheduled);
        this.flushTransition();
        break;
      case "idle":
        this.idleQueue.push(scheduled);
        this.flushIdle();
        break;
    }

    return id;
  }

  /**
   * Синхронные обновления (высокий приоритет)
   */
  private flushSync() {
    if (this.isFlushing) return;
    this.isFlushing = true;

    while (this.syncQueue.length > 0) {
      const update = this.syncQueue.shift();
      if (update) {
        try {
          update.fn();
        } catch (error) {
          console.error("Error in sync update:", error);
        }
      }
    }

    this.isFlushing = false;
  }

  /**
   * Низкоприоритетные обновления
   */
  private flushLow() {
    if (this.isFlushing) return;

    requestAnimationFrame(() => {
      this.isFlushing = true;

      while (this.lowQueue.length > 0) {
        const update = this.lowQueue.shift();
        if (update) {
          try {
            update.fn();
          } catch (error) {
            console.error("Error in low priority update:", error);
          }
        }
      }

      this.isFlushing = false;
    });
  }

  /**
   * Transition обновления (не блокируют UI)
   */
  private flushTransition() {
    if (this.isFlushing) return;

    // Используем requestIdleCallback если доступен
    if (typeof requestIdleCallback !== "undefined") {
      requestIdleCallback(() => {
        this.isFlushing = true;

        while (this.transitionQueue.length > 0) {
          const update = this.transitionQueue.shift();
          if (update) {
            try {
              update.fn();
            } catch (error) {
              console.error("Error in transition update:", error);
            }
          }
        }

        this.isFlushing = false;
      }, { timeout: 5000 });
    } else {
      // Fallback для браузеров без requestIdleCallback
      setTimeout(() => {
        this.isFlushing = true;

        while (this.transitionQueue.length > 0) {
          const update = this.transitionQueue.shift();
          if (update) {
            try {
              update.fn();
            } catch (error) {
              console.error("Error in transition update:", error);
            }
          }
        }

        this.isFlushing = false;
      }, 0);
    }
  }

  /**
   * Idle обновления (самый низкий приоритет)
   */
  private flushIdle() {
    if (this.idleCallbackId !== null) return;

    if (typeof requestIdleCallback !== "undefined") {
      this.idleCallbackId = requestIdleCallback(() => {
        this.isFlushing = true;

        while (this.idleQueue.length > 0) {
          const update = this.idleQueue.shift();
          if (update) {
            try {
              update.fn();
            } catch (error) {
              console.error("Error in idle update:", error);
            }
          }
        }

        this.isFlushing = false;
        this.idleCallbackId = null;
      }, { timeout: 10000 });
    } else {
      // Fallback
      setTimeout(() => {
        this.isFlushing = true;

        while (this.idleQueue.length > 0) {
          const update = this.idleQueue.shift();
          if (update) {
            try {
              update.fn();
            } catch (error) {
              console.error("Error in idle update:", error);
            }
          }
        }

        this.isFlushing = false;
      }, 100);
    }
  }

  /**
   * Отмена запланированного обновления
   */
  cancel(id: number) {
    const queues = [
      this.syncQueue,
      this.lowQueue,
      this.transitionQueue,
      this.idleQueue,
    ];

    for (const queue of queues) {
      const index = queue.findIndex(u => u.id === id);
      if (index !== -1) {
        queue.splice(index, 1);
        return true;
      }
    }

    return false;
  }

  /**
   * Очистка всех очередей
   */
  clear() {
    this.syncQueue = [];
    this.lowQueue = [];
    this.transitionQueue = [];
    this.idleQueue = [];
  }
}

// Глобальный scheduler
export const scheduler = new ViraScheduler();

/**
 * Планирование обновления с приоритетом
 * 
 * @example
 * scheduleUpdate(() => {
 *   updateDOM();
 * }, "sync");
 */
export function scheduleUpdate(
  update: () => void,
  priority: UpdatePriority = "sync"
): number {
  return scheduler.schedule(update, priority);
}

/**
 * startTransition - для неблокирующих обновлений
 * 
 * @example
 * startTransition(() => {
 *   counter.set(counter() + 1);
 *   // UI не будет лагать
 * });
 */
export function startTransition(update: () => void) {
  return scheduler.schedule(update, "transition");
}

/**
 * startIdle - для фоновых обновлений
 */
export function startIdle(update: () => void) {
  return scheduler.schedule(update, "idle");
}

