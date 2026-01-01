/**
 * Модели как формальные структуры с валидацией
 * defineModel() создаёт типизированную модель с автоматической валидацией
 */

// ============================================
// MODEL TYPES
// ============================================

export type FieldType = 
  | "string"
  | "number"
  | "boolean"
  | "email"
  | "url"
  | "date"
  | "array"
  | "object";

export interface FieldDefinition {
  type: FieldType;
  required?: boolean;
  default?: any;
  min?: number;
  max?: number;
  pattern?: RegExp | string;
  validator?: (value: any) => boolean | string;
  message?: string;
  label?: string;
  placeholder?: string;
}

export interface ModelDefinition {
  [fieldName: string]: FieldDefinition | FieldType;
}

export interface ModelInstance<T = any> {
  data: T;
  errors: Record<string, string>;
  isValid: boolean;
  setField: (field: string, value: any) => void;
  setData: (data: Partial<T>) => void;
  validate: () => boolean;
  validateField: (field: string) => boolean;
  reset: () => void;
  toJSON: () => T;
}

// ============================================
// VALIDATORS
// ============================================

const validators: Record<string, (value: any, def: FieldDefinition) => boolean | string> = {
  required: (value: any) => {
    if (value === null || value === undefined || value === "") {
      return "Это поле обязательно для заполнения";
    }
    return true;
  },

  type: (value: any, def: FieldDefinition) => {
    if (value === null || value === undefined || value === "") {
      return true; // Пустые значения проверяет required
    }

    switch (def.type) {
      case "string":
        if (typeof value !== "string") {
          return "Должно быть строкой";
        }
        break;

      case "number":
        if (typeof value !== "number" || isNaN(value)) {
          return "Должно быть числом";
        }
        break;

      case "boolean":
        if (typeof value !== "boolean") {
          return "Должно быть булевым значением";
        }
        break;

      case "email":
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          return "Некорректный email адрес";
        }
        break;

      case "url":
        try {
          new URL(value);
        } catch {
          return "Некорректный URL";
        }
        break;

      case "date":
        if (!(value instanceof Date) && isNaN(Date.parse(value))) {
          return "Некорректная дата";
        }
        break;

      case "array":
        if (!Array.isArray(value)) {
          return "Должно быть массивом";
        }
        break;
    }

    return true;
  },

  min: (value: any, def: FieldDefinition) => {
    if (def.min !== undefined) {
      if (typeof value === "string" && value.length < def.min) {
        return `Минимум ${def.min} символов`;
      }
      if (typeof value === "number" && value < def.min) {
        return `Минимум ${def.min}`;
      }
    }
    return true;
  },

  max: (value: any, def: FieldDefinition) => {
    if (def.max !== undefined) {
      if (typeof value === "string" && value.length > def.max) {
        return `Максимум ${def.max} символов`;
      }
      if (typeof value === "number" && value > def.max) {
        return `Максимум ${def.max}`;
      }
    }
    return true;
  },

  pattern: (value: any, def: FieldDefinition) => {
    if (def.pattern && typeof value === "string") {
      const regex = typeof def.pattern === "string" 
        ? new RegExp(def.pattern) 
        : def.pattern;
      
      if (!regex.test(value)) {
        return def.message || "Значение не соответствует формату";
      }
    }
    return true;
  },

  custom: (value: any, def: FieldDefinition) => {
    if (def.validator) {
      const result = def.validator(value);
      if (result !== true) {
        return typeof result === "string" ? result : def.message || "Неверное значение";
      }
    }
    return true;
  },
};

// ============================================
// DEFINE MODEL
// ============================================

/**
 * Создание модели с типизацией и валидацией
 */
export function defineModel<T extends Record<string, any>>(
  definition: ModelDefinition
): () => ModelInstance<T> {
  // Нормализуем definition (превращаем строки в объекты)
  const normalizedDef: Record<string, FieldDefinition> = {};
  
  for (const [key, value] of Object.entries(definition)) {
    if (typeof value === "string") {
      normalizedDef[key] = { type: value as FieldType };
    } else {
      normalizedDef[key] = value;
    }
  }

  return () => {
    // Инициализируем данные с дефолтными значениями
    const data = {} as T;
    const errors: Record<string, string> = {};

    for (const [key, def] of Object.entries(normalizedDef)) {
      if (def.default !== undefined) {
        data[key as keyof T] = def.default;
      } else {
        // Устанавливаем значение по умолчанию в зависимости от типа
        switch (def.type) {
          case "string":
          case "email":
          case "url":
            data[key as keyof T] = "" as any;
            break;
          case "number":
            data[key as keyof T] = 0 as any;
            break;
          case "boolean":
            data[key as keyof T] = false as any;
            break;
          case "array":
            data[key as keyof T] = [] as any;
            break;
          case "object":
            data[key as keyof T] = {} as any;
            break;
        }
      }
    }

    // Валидация одного поля
    const validateField = (field: string): boolean => {
      const def = normalizedDef[field];
      if (!def) return true;

      const value = data[field as keyof T];
      delete errors[field];

      // Проверяем все валидаторы
      for (const [name, validator] of Object.entries(validators)) {
        if (name === "required" && !def.required) continue;
        if (name === "type" && !def.type) continue;
        if (name === "min" && def.min === undefined) continue;
        if (name === "max" && def.max === undefined) continue;
        if (name === "pattern" && !def.pattern) continue;
        if (name === "custom" && !def.validator) continue;

        const result = validator(value, def);
        if (result !== true) {
          errors[field] = result as string;
          return false;
        }
      }

      return true;
    };

    // Валидация всех полей
    const validate = (): boolean => {
      let isValid = true;
      for (const field of Object.keys(normalizedDef)) {
        if (!validateField(field)) {
          isValid = false;
        }
      }
      return isValid;
    };

    // Установка значения поля
    const setField = (field: string, value: any): void => {
      data[field as keyof T] = value;
      validateField(field);
    };

    // Установка данных
    const setData = (newData: Partial<T>): void => {
      Object.assign(data, newData);
      // Валидируем все изменённые поля
      for (const field of Object.keys(newData)) {
        validateField(field);
      }
    };

    // Сброс модели
    const reset = (): void => {
      for (const [key, def] of Object.entries(normalizedDef)) {
        if (def.default !== undefined) {
          data[key as keyof T] = def.default;
        } else {
          switch (def.type) {
            case "string":
            case "email":
            case "url":
              data[key as keyof T] = "" as any;
              break;
            case "number":
              data[key as keyof T] = 0 as any;
              break;
            case "boolean":
              data[key as keyof T] = false as any;
              break;
            case "array":
              data[key as keyof T] = [] as any;
              break;
            case "object":
              data[key as keyof T] = {} as any;
              break;
          }
        }
      }
      Object.keys(errors).forEach(key => delete errors[key]);
    };

    return {
      data,
      errors,
      get isValid() {
        return Object.keys(errors).length === 0 && validate();
      },
      setField,
      setData,
      validate,
      validateField,
      reset,
      toJSON: () => ({ ...data }),
    };
  };
}

/**
 * Получение метаданных модели (для автогенерации форм)
 */
export function getModelMetadata(definition: ModelDefinition): Record<string, FieldDefinition> {
  const metadata: Record<string, FieldDefinition> = {};

  for (const [key, value] of Object.entries(definition)) {
    if (typeof value === "string") {
      metadata[key] = { type: value as FieldType };
    } else {
      metadata[key] = value;
    }
  }

  return metadata;
}

