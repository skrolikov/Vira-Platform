import { describe, it, expect, beforeEach } from 'vitest';
import { parseAction, parseModel, resolveAction, resolveModel } from '../context';
import { getServiceContainer, createService } from '../services';
import { clearServices } from '../services';

describe('Context - Auto-binding', () => {
  beforeEach(() => {
    clearServices();
  });

  describe('parseAction', () => {
    it('должен парсить action строку', () => {
      const result = parseAction('client.create');
      expect(result).toEqual({
        service: 'client',
        method: 'create',
      });
    });

    it('должен обрабатывать простые методы', () => {
      const result = parseAction('client.create');
      expect(result).toEqual({
        service: 'client',
        method: 'create',
      });
    });
  });

  describe('parseModel', () => {
    it('должен парсить model строку', () => {
      const result = parseModel('client.search');
      expect(result).toEqual({
        service: 'client',
        property: 'search',
      });
    });

    it('должен обрабатывать простые свойства', () => {
      const result = parseModel('client.name');
      expect(result).toEqual({
        service: 'client',
        property: 'name',
      });
    });
  });

  describe('resolveAction', () => {
    it('должен резолвить action в функцию', () => {
      class TestService {
        create() {
          return 'created';
        }
      }

      createService('client', () => new TestService());
      const context = { services: getServiceContainer(), currentService: undefined };
      const resolved = resolveAction('client.create', context);
      expect(typeof resolved).toBe('function');
    });

    it('должен выбрасывать ошибку для несуществующего сервиса', () => {
      const context = { services: getServiceContainer(), currentService: undefined };

      expect(() => {
        resolveAction('non-existent.method', context);
      }).toThrow();
    });
  });

  describe('resolveModel', () => {
    it('должен резолвить model в значение и сеттер', () => {
      class TestService {
        _search = 'test query';
        get search() {
          return this._search;
        }
        setSearch(value: string) {
          this._search = value;
        }
      }

      createService('client', () => new TestService());
      const context = { services: getServiceContainer(), currentService: undefined };
      const resolved = resolveModel('client.search', context);
      expect(resolved.value).toBe('test query');
      expect(typeof resolved.setValue).toBe('function');
    });

    it('должен резолвить model с геттером', () => {
      class TestService {
        get search() {
          return 'getter value';
        }
        setSearch(value: string) {
          // Mock setter
        }
      }

      createService('client', () => new TestService());
      const context = { services: getServiceContainer(), currentService: undefined };
      const resolved = resolveModel('client.search', context);
      expect(resolved.value).toBe('getter value');
    });

    it('должен выбрасывать ошибку для несуществующего сервиса', () => {
      const context = { services: getServiceContainer(), currentService: undefined };

      expect(() => {
        resolveModel('non-existent.property', context);
      }).toThrow();
    });
  });
});

