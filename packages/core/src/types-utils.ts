/**
 * TypeScript утилиты для улучшенной типизации
 */

/**
 * Deep Readonly - делает все поля объекта readonly рекурсивно
 */
export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};

/**
 * Deep Partial - делает все поля объекта опциональными рекурсивно
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * Deep Required - делает все поля объекта обязательными рекурсивно
 */
export type DeepRequired<T> = {
  [P in keyof T]-?: T[P] extends object ? DeepRequired<T[P]> : T[P];
};

/**
 * Extract keys of specific type
 */
export type KeysOfType<T, U> = {
  [K in keyof T]: T[K] extends U ? K : never;
}[keyof T];

/**
 * Omit by type
 */
export type OmitByType<T, U> = Omit<T, KeysOfType<T, U>>;

/**
 * Pick by type
 */
export type PickByType<T, U> = Pick<T, KeysOfType<T, U>>;

/**
 * Make specific keys optional
 */
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/**
 * Make specific keys required
 */
export type Required<T, K extends keyof T> = T & { [P in K]-?: T[P] };

/**
 * Extract function parameters
 */
export type Parameters<T extends (...args: any) => any> = T extends (...args: infer P) => any ? P : never;

/**
 * Extract function return type
 */
export type ReturnType<T extends (...args: any) => any> = T extends (...args: any) => infer R ? R : any;

/**
 * Async function return type
 */
export type Awaited<T> = T extends Promise<infer U> ? U : T;

/**
 * Extract promise type
 */
export type PromiseType<T> = T extends Promise<infer U> ? U : never;

/**
 * Function with specific parameters
 */
export type FunctionWithParams<TParams extends any[], TReturn> = (...args: TParams) => TReturn;

/**
 * Async function type
 */
export type AsyncFunction<TParams extends any[] = any[], TReturn = any> = FunctionWithParams<TParams, Promise<TReturn>>;

/**
 * Constructor type
 */
export type Constructor<T = {}> = new (...args: any[]) => T;

/**
 * Instance type of constructor
 */
export type InstanceType<T extends Constructor> = T extends Constructor<infer R> ? R : any;

/**
 * Branded type - создаёт уникальный тип из базового
 */
export type Brand<T, B> = T & { __brand: B };

/**
 * Nominal type helper
 */
export type Nominal<T, B> = T & { readonly __nominal: B };

/**
 * Prettify type - делает тип читаемым в IDE
 */
export type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

/**
 * Keys as string array
 */
export type StringKeys<T> = Extract<keyof T, string>;

/**
 * Values type
 */
export type Values<T> = T[keyof T];

/**
 * Entries type
 */
export type Entries<T> = {
  [K in keyof T]: [K, T[K]];
}[keyof T][];

/**
 * Non-empty array
 */
export type NonEmptyArray<T> = [T, ...T[]];

/**
 * AtLeastOne - хотя бы одно поле должно быть
 */
export type AtLeastOne<T, U = { [K in keyof T]: Pick<T, K> }> = Partial<T> & U[keyof U];

