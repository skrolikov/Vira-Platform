/**
 * Расширенные возможности для моделей
 * Async validation, conditional fields, field dependencies
 */

import type { FieldDefinition, ModelInstance } from "./models";

export interface AsyncValidator {
  (value: any, field: string, model: ModelInstance): Promise<boolean | string>;
}

export interface ConditionalFieldRule {
  field: string;
  condition: (model: ModelInstance) => boolean;
  show?: boolean; // Показывать/скрывать
  required?: boolean; // Становится обязательным
  disabled?: boolean; // Становится disabled
}

export interface FieldDependency {
  sourceField: string;
  targetField: string;
  transform: (sourceValue: any) => any;
}

/**
 * Расширенная модель с async validation и conditional fields
 */
export interface AdvancedModelOptions {
  asyncValidators?: Record<string, AsyncValidator[]>;
  conditionalFields?: ConditionalFieldRule[];
  fieldDependencies?: FieldDependency[];
}

/**
 * Добавить async validator к полю
 */
export function addAsyncValidator(
  model: ModelInstance,
  fieldName: string,
  validator: AsyncValidator
): void {
  if (!(model as any).__asyncValidators__) {
    (model as any).__asyncValidators__ = {};
  }
  if (!(model as any).__asyncValidators__[fieldName]) {
    (model as any).__asyncValidators__[fieldName] = [];
  }
  (model as any).__asyncValidators__[fieldName].push(validator);
}

/**
 * Валидация поля с async validators
 */
export async function validateFieldAsync(
  model: ModelInstance,
  fieldName: string
): Promise<boolean> {
  const value = (model as any).data[fieldName];
  const validators = (model as any).__asyncValidators__?.[fieldName] || [];

  for (const validator of validators) {
    const result = await validator(value, fieldName, model);
    if (result !== true) {
      const errorMessage = typeof result === "string" ? result : "Ошибка валидации";
      (model as any).errors[fieldName] = errorMessage;
      return false;
    }
  }

  return true;
}

/**
 * Валидация всех полей с async validators
 */
export async function validateAsync(model: ModelInstance): Promise<boolean> {
  let isValid = true;

  // Сначала синхронная валидация
  if (!model.validate()) {
    isValid = false;
  }

  // Затем async валидация
  const asyncValidators = (model as any).__asyncValidators__ || {};
  for (const fieldName of Object.keys(asyncValidators)) {
    const fieldValid = await validateFieldAsync(model, fieldName);
    if (!fieldValid) {
      isValid = false;
    }
  }

  return isValid;
}

/**
 * Применить conditional rules к модели
 */
export function applyConditionalRules(
  model: ModelInstance,
  rules: ConditionalFieldRule[]
): void {
  rules.forEach(rule => {
    const shouldShow = rule.condition(model);
    
    if (rule.show !== undefined) {
      (model as any).__fieldVisibility__ = (model as any).__fieldVisibility__ || {};
      (model as any).__fieldVisibility__[rule.field] = rule.show ? shouldShow : !shouldShow;
    }

    if (rule.required !== undefined) {
      // Обновляем required статус поля
      const fieldDef = (model as any).__definition__?.[rule.field];
      if (fieldDef) {
        fieldDef.required = rule.required ? shouldShow : false;
      }
    }

    if (rule.disabled !== undefined) {
      (model as any).__fieldDisabled__ = (model as any).__fieldDisabled__ || {};
      (model as any).__fieldDisabled__[rule.field] = rule.disabled ? shouldShow : false;
    }
  });
}

/**
 * Применить field dependencies
 */
export function applyFieldDependencies(
  model: ModelInstance,
  dependencies: FieldDependency[]
): void {
  dependencies.forEach(dep => {
    const sourceValue = (model as any).data[dep.sourceField];
    if (sourceValue !== undefined && sourceValue !== null) {
      const transformedValue = dep.transform(sourceValue);
      (model as any).data[dep.targetField] = transformedValue;
    }
  });
}

/**
 * Проверить видимость поля
 */
export function isFieldVisible(model: ModelInstance, fieldName: string): boolean {
  const visibility = (model as any).__fieldVisibility__?.[fieldName];
  return visibility !== undefined ? visibility : true;
}

/**
 * Проверить disabled статус поля
 */
export function isFieldDisabled(model: ModelInstance, fieldName: string): boolean {
  const disabled = (model as any).__fieldDisabled__?.[fieldName];
  return disabled !== undefined ? disabled : false;
}

