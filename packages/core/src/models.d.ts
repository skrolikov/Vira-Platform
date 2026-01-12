/**
 * Модели как формальные структуры с валидацией
 * defineModel() создаёт типизированную модель с автоматической валидацией
 */
export type FieldType = "string" | "number" | "boolean" | "email" | "url" | "date" | "array" | "object";
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
/**
 * Создание модели с типизацией и валидацией
 */
export declare function defineModel<T extends Record<string, any>>(definition: ModelDefinition): () => ModelInstance<T>;
/**
 * Получение метаданных модели (для автогенерации форм)
 */
export declare function getModelMetadata(definition: ModelDefinition): Record<string, FieldDefinition>;
//# sourceMappingURL=models.d.ts.map