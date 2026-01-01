import { foundationTokens } from "../tokens/foundation";
import { tokens } from "../tokens/default";

/**
 * Рекурсивный поиск токена в объекте
 * Работает с глубоко вложенными структурами (например, color.blue.100)
 */
function findTokenRecursive(obj: any, path: string[]): string | null {
  if (path.length === 0) {
    return typeof obj === "string" ? obj : null;
  }
  
  const [first, ...rest] = path;
  
  // Прямое совпадение
  if (first in obj) {
    const value = obj[first];
    if (rest.length === 0) {
      return typeof value === "string" ? value : null;
    }
    if (typeof value === "object" && value !== null) {
      return findTokenRecursive(value, rest);
    }
  }
  
  // Пробуем найти как ключ с точками (например, "blue.100")
  if (rest.length > 0) {
    const joinedKey = path.join(".");
    if (joinedKey in obj) {
      const value = obj[joinedKey];
      return typeof value === "string" ? value : null;
    }
    
    // Пробуем частичный путь (например, для "blue.100" ищем "blue.100" как ключ)
    const partialKey = rest.join(".");
    if (partialKey in obj) {
      const value = obj[partialKey];
      return typeof value === "string" ? value : null;
    }
  }
  
  return null;
}

// Поддержка как новых foundation токенов, так и старых для обратной совместимости
export function resolveToken(path: string): string | null {
  // Поддержка foundation токенов с точками в ключах (например "text.inverse", "blue.100")
  // Сначала пробуем найти точное совпадение в foundation
  if (path in foundationTokens.color) {
    return foundationTokens.color[path as keyof typeof foundationTokens.color] as string;
  }
  
  // Если путь в формате "color.blue.100", пробуем найти "blue.100" в color
  if (path.startsWith("color.")) {
    const colorKey = path.replace("color.", "");
    if (colorKey in foundationTokens.color) {
      return foundationTokens.color[colorKey as keyof typeof foundationTokens.color] as string;
    }
  }
  if (path in foundationTokens.radius) {
    return foundationTokens.radius[path as keyof typeof foundationTokens.radius] as string;
  }
  if (path in foundationTokens.shadow) {
    return foundationTokens.shadow[path as keyof typeof foundationTokens.shadow] as string;
  }
  if (path in foundationTokens.spacing) {
    return foundationTokens.spacing[path as unknown as keyof typeof foundationTokens.spacing] as string;
  }
  if (path in foundationTokens.typography) {
    const value = foundationTokens.typography[path as keyof typeof foundationTokens.typography];
    if (typeof value === "string") {
      return value;
    }
  }
  
  // Если не нашли точное совпадение, пробуем разобрать путь
  const parts = path.split(".");
  let current: any = foundationTokens;
  
  for (const part of parts) {
    if (current && typeof current === "object" && part in current) {
      current = current[part];
    } else {
      // Если не нашли в foundation, пробуем старые токены
      current = tokens;
      for (const p of parts) {
        if (current && typeof current === "object" && p in current) {
          current = current[p];
        } else {
          return null;
        }
      }
      break;
    }
  }
  
  return typeof current === "string" ? current : null;
}

export function resolveDesignValue(value: string | number | undefined): string | null {
  if (value === undefined) return null;
  
  if (typeof value === "number") {
    return `${value}px`;
  }
  
  if (typeof value === "string") {
    const tokenValue = resolveToken(value);
    if (tokenValue) {
      return tokenValue;
    }
    return value;
  }
  
  return null;
}

