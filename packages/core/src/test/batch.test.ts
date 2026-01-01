import { describe, it, expect, vi } from 'vitest';
import { batch, isBatchingUpdates, scheduleUpdate } from '../batch';

describe('Batch Updates', () => {
  describe('batch', () => {
    it('должен группировать обновления', () => {
      const update1 = vi.fn();
      const update2 = vi.fn();

      batch(() => {
        scheduleUpdate(update1);
        scheduleUpdate(update2);
      });

      // Обе функции должны быть вызваны
      expect(update1).toHaveBeenCalled();
      expect(update2).toHaveBeenCalled();
    });

    it('должен устанавливать флаг isBatchingUpdates', () => {
      batch(() => {
        expect(isBatchingUpdates()).toBe(true);
      });

      expect(isBatchingUpdates()).toBe(false);
    });

    it('должен обрабатывать ошибки и сбрасывать флаг', () => {
      expect(() => {
        batch(() => {
          expect(isBatchingUpdates()).toBe(true);
          throw new Error('Test error');
        });
      }).toThrow('Test error');

      expect(isBatchingUpdates()).toBe(false);
    });
  });

  describe('scheduleUpdate', () => {
    it('должен вызывать update сразу если не в batch', () => {
      const update = vi.fn();
      scheduleUpdate(update);
      expect(update).toHaveBeenCalledTimes(1);
    });

    it('должен откладывать update если в batch', () => {
      const update = vi.fn();

      batch(() => {
        scheduleUpdate(update);
        expect(update).not.toHaveBeenCalled();
      });

      expect(update).toHaveBeenCalledTimes(1);
    });
  });
});

