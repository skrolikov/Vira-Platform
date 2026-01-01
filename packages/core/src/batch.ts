/**
 * Batch Updates - Группировка обновлений для оптимизации производительности
 * Предотвращает множественные ре-рендеры при множественных изменениях
 */

type UpdateCallback = () => void;
type BatchCallback = () => void;

let isBatching = false;
let pendingUpdates = new Set<UpdateCallback>();
let scheduledFlush: number | null = null;

/**
 * Batch update - группирует обновления в один цикл
 * 
 * @example
 * batch(() => {
 *   service.name = "Иван";
 *   service.email = "ivan@example.com";
 *   // Компоненты обновятся только один раз
 * });
 */
export function batch(callback: BatchCallback): void {
  if (isBatching) {
    callback();
    return;
  }

  isBatching = true;
  pendingUpdates.clear();

  try {
    callback();
  } finally {
    isBatching = false;
    flushUpdates();
  }
}

/**
 * Запланировать обновление (используется внутри реактивной системы)
 */
export function scheduleUpdate(update: UpdateCallback): void {
  if (isBatching) {
    pendingUpdates.add(update);
    
    if (!scheduledFlush) {
      scheduledFlush = requestAnimationFrame(() => {
        scheduledFlush = null;
        flushUpdates();
      });
    }
  } else {
    update();
  }
}

/**
 * Применить все запланированные обновления
 */
function flushUpdates(): void {
  if (pendingUpdates.size === 0) return;

  const updates = Array.from(pendingUpdates);
  pendingUpdates.clear();

  updates.forEach(update => {
    try {
      update();
    } catch (error) {
      console.error("Error in batched update:", error);
    }
  });
}

/**
 * Проверка, идёт ли сейчас batch
 */
export function isBatchingUpdates(): boolean {
  return isBatching;
}

