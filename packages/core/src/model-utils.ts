/**
 * Утилиты для работы с моделями
 * Computed поля, трансформеры, вложенные модели
 */

import type { ModelInstance, ModelDefinition, FieldDefinition } from "./models";

/**
 * Computed поле для модели - вычисляется на лету
 */
export interface ComputedFieldDefinition {
  type: "computed";
  compute: (data: any) => any;
  dependencies?: string[]; // Поля, от которых зависит computed поле
}

/**
 * Добавить computed поле в модель
 */
export function addComputedField<T>(
  modelInstance: ModelInstance<T>,
  fieldName: string,
  definition: ComputedFieldDefinition
): void {
  const getter = () => {
    return definition.compute(modelInstance.toJSON());
  };

  Object.defineProperty((modelInstance as any).data, fieldName, {
    get: getter,
    enumerable: true,
    configurable: true,
  });
}

/**
 * Трансформер - преобразует данные перед валидацией/сохранением
 */
export interface Transformer {
  transform: (value: any) => any;
  reverse?: (value: any) => any; // Обратное преобразование
}

/**
 * Добавить трансформер к полю модели
 */
export function addFieldTransformer(
  modelInstance: ModelInstance,
  fieldName: string,
  transformer: Transformer
): void {
  const originalData = (modelInstance as any).data[fieldName];
  
  // Трансформируем значение
  (modelInstance as any).data[fieldName] = transformer.transform(originalData);

  // Переопределяем setter для автоматической трансформации
  Object.defineProperty((modelInstance as any).data, fieldName, {
    get: () => {
      const value = (modelInstance as any).data[`_${fieldName}`];
      return transformer.reverse ? transformer.reverse(value) : value;
    },
    set: (newValue: any) => {
      (modelInstance as any).data[`_${fieldName}`] = transformer.transform(newValue);
    },
    enumerable: true,
    configurable: true,
  });
}

/**
 * Вложенная модель - модель внутри модели
 */
export function createNestedModel<T>(
  parentModel: ModelInstance,
  fieldName: string,
  nestedDefinition: ModelDefinition
): ModelInstance<T> {
  // Импортируем defineModel динамически
  const { defineModel } = require("./models");
  const nestedModel = defineModel(nestedDefinition);

  Object.defineProperty((parentModel as any).data, fieldName, {
    get: () => nestedModel(),
    enumerable: true,
    configurable: true,
  });

  return nestedModel();
}

/**
 * Массовая валидация массива моделей
 */
export function validateMany<T>(
  models: ModelInstance<T>[]
): { valid: ModelInstance<T>[]; invalid: Array<{ model: ModelInstance<T>; errors: Record<string, string> }> } {
  const valid: ModelInstance<T>[] = [];
  const invalid: Array<{ model: ModelInstance<T>; errors: Record<string, string> }> = [];

  models.forEach(model => {
    if (model.validate()) {
      valid.push(model);
    } else {
      invalid.push({ model, errors: model.errors });
    }
  });

  return { valid, invalid };
}

/**
 * Создание модели из JSON схемы
 */
export function modelFromSchema(schema: any): ModelDefinition {
  // Простая конвертация JSON Schema в ModelDefinition
  // Можно расширить для поддержки полной JSON Schema
  const definition: ModelDefinition = {};

  if (schema.properties) {
    Object.entries(schema.properties).forEach(([key, value]: [string, any]) => {
      definition[key] = {
        type: mapJsonSchemaType(value.type),
        required: schema.required?.includes(key),
        ...(value.minLength && { min: value.minLength }),
        ...(value.maxLength && { max: value.maxLength }),
        ...(value.pattern && { pattern: new RegExp(value.pattern) }),
        label: value.title || key,
        placeholder: value.description,
      };
    });
  }

  return definition;
}

function mapJsonSchemaType(type: string): string {
  const mapping: Record<string, string> = {
    string: "string",
    number: "number",
    integer: "number",
    boolean: "boolean",
    array: "array",
    object: "object",
  };

  return mapping[type] || "string";
}

