import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createService, useService, clearServices } from '../services';

describe('ViraServiceContainer', () => {
  beforeEach(() => {
    // Очищаем контейнер перед каждым тестом
    clearServices();
  });

  describe('createService', () => {
    it('должен регистрировать сервис', () => {
      class TestService {
        value = 42;
      }

      createService('test', () => new TestService());

      const service = useService<TestService>('test');
      expect(service).toBeInstanceOf(TestService);
      expect(service.value).toBe(42);
    });

    it('должен создавать синглтон по умолчанию', () => {
      class TestService {
        id = Math.random();
      }

      createService('test', () => new TestService());

      const service1 = useService<TestService>('test');
      const service2 = useService<TestService>('test');

      expect(service1).toBe(service2);
      expect(service1.id).toBe(service2.id);
    });

    it('должен создавать новый инстанс для non-singleton', () => {
      class TestService {
        id = Math.random();
      }

      createService('test', () => new TestService(), { singleton: false });

      const service1 = useService<TestService>('test');
      const service2 = useService<TestService>('test');

      expect(service1).not.toBe(service2);
    });

    it('должен выбрасывать ошибку для несуществующего сервиса', () => {
      expect(() => {
        useService('non-existent');
      }).toThrow('Service "non-existent" not found');
    });

    it('должен делать сервис реактивным', () => {
      class TestService {
        _value = 0;
        get value() {
          return this._value;
        }
        set value(v: number) {
          this._value = v;
        }
      }

      createService('test', () => new TestService());
      const service = useService<any>('test');

      // Проверяем наличие реактивных свойств через прямую проверку
      expect(service.__reactive__).toBe(true);
      expect(service.__subscribers__).toBeInstanceOf(Set);
    });
  });

  describe('useService', () => {
    it('должен возвращать зарегистрированный сервис', () => {
      class TestService {
        name = 'Test';
      }

      createService('test', () => new TestService());
      const service = useService<TestService>('test');

      expect(service).toBeDefined();
      expect(service.name).toBe('Test');
    });

    it('должен работать с типами', () => {
      interface ITestService {
        getValue(): number;
      }

      class TestService implements ITestService {
        getValue() {
          return 42;
        }
      }

      createService<ITestService>('test', () => new TestService());
      const service = useService<ITestService>('test');

      expect(service.getValue()).toBe(42);
    });
  });
});

