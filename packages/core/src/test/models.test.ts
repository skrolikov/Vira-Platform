import { describe, it, expect } from 'vitest';
import { defineModel, getModelMetadata } from '../models';

describe('Models', () => {
  describe('defineModel', () => {
    it('должен создавать модель с полями', () => {
      const UserModel = defineModel({
        name: { type: 'string', required: true },
        email: { type: 'email', required: true },
      });

      const user = UserModel();
      expect(user).toBeDefined();
      expect(user.data).toEqual({ name: '', email: '' });
    });

    it('должен валидировать required поля', () => {
      const UserModel = defineModel({
        name: { type: 'string', required: true },
        email: { type: 'email', required: true },
      });

      const user = UserModel();
      const isValid = user.validate();

      expect(isValid).toBe(false);
      expect(user.errors.name).toBeDefined();
      expect(user.errors.email).toBeDefined();
    });

    it('должен валидировать min/max для строк', () => {
      const UserModel = defineModel({
        name: { type: 'string', min: 2, max: 10 },
      });

      const user = UserModel();
      user.setField('name', 'A'); // Слишком короткое

      const isValid = user.validate();
      expect(isValid).toBe(false);
      expect(user.errors.name).toBeDefined();

      user.setField('name', 'Valid Name');
      expect(user.validate()).toBe(true);
    });

    it('должен валидировать min/max для чисел', () => {
      const ProductModel = defineModel({
        price: { type: 'number', min: 0, max: 1000 },
      });

      const product = ProductModel();
      product.setField('price', -10);

      expect(product.validate()).toBe(false);
      expect(product.errors.price).toBeDefined();

      product.setField('price', 100);
      expect(product.validate()).toBe(true);
    });

    it('должен валидировать email формат', () => {
      const UserModel = defineModel({
        email: { type: 'email', required: true },
      });

      const user = UserModel();
      user.setField('email', 'invalid-email');

      expect(user.validate()).toBe(false);
      expect(user.errors.email).toBeDefined();

      user.setField('email', 'valid@example.com');
      expect(user.validate()).toBe(true);
    });

    it('должен валидировать по pattern', () => {
      const PhoneModel = defineModel({
        phone: {
          type: 'string',
          pattern: /^\+7\s\d{3}\s\d{3}-\d{2}-\d{2}$/,
          message: 'Неверный формат телефона',
        },
      });

      const phone = PhoneModel();
      phone.setField('phone', '123');

      expect(phone.validate()).toBe(false);
      expect(phone.errors.phone).toBe('Неверный формат телефона');

      phone.setField('phone', '+7 900 123-45-67');
      expect(phone.validate()).toBe(true);
    });

    it('должен возвращать данные через toJSON', () => {
      const UserModel = defineModel({
        name: { type: 'string' },
        email: { type: 'email' },
      });

      const user = UserModel();
      user.setField('name', 'John');
      user.setField('email', 'john@example.com');

      const json = user.toJSON();
      expect(json).toEqual({
        name: 'John',
        email: 'john@example.com',
      });
    });
  });

  describe('getModelMetadata', () => {
    it('должен возвращать метаданные модели', () => {
      const modelDefinition = {
        name: { type: 'string' as const, required: true, label: 'Имя' },
        email: { type: 'email' as const, required: true, label: 'Email' },
      };

      const metadata = getModelMetadata(modelDefinition);

      expect(metadata).toBeDefined();
      expect(metadata.name).toBeDefined();
      expect(metadata.name.type).toBe('string');
      expect(metadata.name.required).toBe(true);
      expect(metadata.name.label).toBe('Имя');
    });
  });
});

