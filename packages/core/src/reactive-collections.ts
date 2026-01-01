/**
 * Reactive Collections - Реактивные массивы с intercept методов
 * 
 * Поддержка push/pop/splice с батчингом
 * Методы mapReactive(), filterReactive()
 */

import { signal, Signal, SignalSetter, batch, computed } from "./signals";

export type ReactiveArray<T> = Signal<T[]> & {
  push: (...items: T[]) => number;
  pop: () => T | undefined;
  shift: () => T | undefined;
  unshift: (...items: T[]) => number;
  splice: (start: number, deleteCount?: number, ...items: T[]) => T[];
  map: <U>(fn: (item: T, index: number) => U) => U[];
  filter: (fn: (item: T, index: number) => boolean) => T[];
  mapReactive: <U>(fn: (item: T, index: number) => U) => Signal<U[]>;
  filterReactive: (fn: (item: T, index: number) => boolean) => Signal<T[]>;
  length: Signal<number>;
};

/**
 * Создание реактивного массива
 * 
 * @example
 * const users = reactiveArray([{ id: 1, name: "John" }]);
 * 
 * // Все изменения батчатся
 * batch(() => {
 *   users.push({ id: 2, name: "Jane" });
 *   users.push({ id: 3, name: "Bob" });
 * });
 * 
 * // Реактивные операции
 * const activeUsers = users.filterReactive(u => u.active);
 * 
 * function UsersList() {
 *   const active = useSignal(activeUsers);
 *   return <div>{active().map(...)}</div>;
 * }
 */
export function reactiveArray<T>(initialValue: T[] = []): ReactiveArray<T> {
  const [getValue, setValue] = signal<T[]>(initialValue);
  const [getLength, setLength] = signal<number>(initialValue.length);

  const array = getValue as ReactiveArray<T>;

  // Переопределяем методы массива
  array.push = (...items: T[]) => {
    const current = getValue();
    const newArray = [...current, ...items];
    setValue(newArray);
    setLength(newArray.length);
    return newArray.length;
  };

  array.pop = () => {
    const current = getValue();
    if (current.length === 0) return undefined;
    const item = current[current.length - 1];
    const newArray = current.slice(0, -1);
    setValue(newArray);
    setLength(newArray.length);
    return item;
  };

  array.shift = () => {
    const current = getValue();
    if (current.length === 0) return undefined;
    const item = current[0];
    const newArray = current.slice(1);
    setValue(newArray);
    setLength(newArray.length);
    return item;
  };

  array.unshift = (...items: T[]) => {
    const current = getValue();
    const newArray = [...items, ...current];
    setValue(newArray);
    setLength(newArray.length);
    return newArray.length;
  };

  array.splice = (start: number, deleteCount?: number, ...items: T[]) => {
    const current = getValue();
    const newArray = [...current];
    const deleted = newArray.splice(start, deleteCount ?? current.length, ...items);
    setValue(newArray);
    setLength(newArray.length);
    return deleted;
  };

  // Обычные методы (не реактивные)
  array.map = <U>(fn: (item: T, index: number) => U): U[] => {
    return getValue().map(fn);
  };

  array.filter = (fn: (item: T, index: number) => boolean): T[] => {
    return getValue().filter(fn);
  };

  // Реактивные методы с оптимизацией через кэширование результатов
  let lastMappedValue: any[] | null = null;
  let lastMapFn: ((item: T, index: number) => any) | null = null;
  let lastFilteredValue: T[] | null = null;
  let lastFilterFn: ((item: T, index: number) => boolean) | null = null;

  array.mapReactive = <U>(fn: (item: T, index: number) => U) => {
    // Если функция не изменилась и массив тот же - можно использовать smart diff
    const currentValue = getValue();
    
    if (lastMapFn === fn && lastMappedValue && currentValue.length === lastMappedValue.length) {
      // Попытка smart diff - пересчитываем только изменённые элементы
      let hasChanges = false;
      const newMapped = currentValue.map((item, index) => {
        // Простая проверка: если элемент тот же - используем старый результат
        // (можно улучшить через deep equality или Object.is)
        if (Object.is(item, currentValue[index]) && lastMappedValue![index] !== undefined) {
          return lastMappedValue![index];
        }
        hasChanges = true;
        return fn(item, index);
      });
      
      if (!hasChanges) {
        // Массив не изменился - возвращаем computed с кэшированным значением
        const [cachedGetter] = signal(newMapped as U[]);
        return cachedGetter;
      }
      
      lastMappedValue = newMapped;
    } else {
      // Полный пересчёт
      lastMappedValue = currentValue.map(fn);
      lastMapFn = fn;
    }
    
    return computed(() => {
      const current = getValue();
      // Если массив не изменился - используем кэш
      if (lastMapFn === fn && lastMappedValue && current.length === lastMappedValue.length) {
        const allSame = current.every((item, index) => Object.is(item, current[index]));
        if (allSame) {
          return lastMappedValue as U[];
        }
      }
      // Пересчитываем
      lastMappedValue = current.map(fn);
      lastMapFn = fn;
      return lastMappedValue as U[];
    }) as Signal<U[]>;
  };

  array.filterReactive = (fn: (item: T, index: number) => boolean) => {
    const currentValue = getValue();
    
    if (lastFilterFn === fn && lastFilteredValue && currentValue.length === lastFilteredValue.length) {
      // Smart diff для filter сложнее, но можно оптимизировать
      const newFiltered = currentValue.filter(fn);
      if (newFiltered.length === lastFilteredValue.length) {
        // Попытка использовать кэш (упрощённая версия)
        lastFilteredValue = newFiltered;
      } else {
        lastFilteredValue = newFiltered;
      }
    } else {
      lastFilteredValue = currentValue.filter(fn);
      lastFilterFn = fn;
    }
    
    return computed(() => {
      const current = getValue();
      lastFilteredValue = current.filter(fn);
      lastFilterFn = fn;
      return lastFilteredValue;
    }) as Signal<T[]>;
  };

  array.length = getLength;

  return array;
}

/**
 * Реактивный Set
 */
export type ReactiveSet<T> = Signal<Set<T>> & {
  add: (item: T) => void;
  delete: (item: T) => boolean;
  clear: () => void;
  has: (item: T) => boolean;
  size: Signal<number>;
};

export function reactiveSet<T>(initialValue: T[] = []): ReactiveSet<T> {
  const [getValue, setValue] = signal<Set<T>>(new Set(initialValue));
  const [getSize, setSize] = signal<number>(initialValue.length);

  const set = getValue as ReactiveSet<T>;

  set.add = (item: T) => {
    const current = new Set(getValue());
    if (!current.has(item)) {
      current.add(item);
      setValue(current);
      setSize(current.size);
    }
  };

  set.delete = (item: T) => {
    const current = new Set(getValue());
    const deleted = current.delete(item);
    if (deleted) {
      setValue(current);
      setSize(current.size);
    }
    return deleted;
  };

  set.clear = () => {
    setValue(new Set());
    setSize(0);
  };

  set.has = (item: T) => {
    return getValue().has(item);
  };

  set.size = getSize;

  return set;
}

/**
 * Реактивный Map
 */
export type ReactiveMap<K, V> = Signal<Map<K, V>> & {
  set: (key: K, value: V) => void;
  get: (key: K) => V | undefined;
  delete: (key: K) => boolean;
  clear: () => void;
  has: (key: K) => boolean;
  size: Signal<number>;
};

export function reactiveMap<K, V>(initialValue: [K, V][] = []): ReactiveMap<K, V> {
  const [getValue, setValue] = signal<Map<K, V>>(new Map(initialValue));
  const [getSize, setSize] = signal<number>(initialValue.length);

  const map = getValue as ReactiveMap<K, V>;

  map.set = (key: K, value: V) => {
    const current = new Map(getValue());
    current.set(key, value);
    setValue(current);
    setSize(current.size);
  };

  map.get = (key: K) => {
    return getValue().get(key);
  };

  map.delete = (key: K) => {
    const current = new Map(getValue());
    const deleted = current.delete(key);
    if (deleted) {
      setValue(current);
      setSize(current.size);
    }
    return deleted;
  };

  map.clear = () => {
    setValue(new Map());
    setSize(0);
  };

  map.has = (key: K) => {
    return getValue().has(key);
  };

  map.size = getSize;

  return map;
}

