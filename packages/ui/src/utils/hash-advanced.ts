/**
 * Advanced hash functions for production use
 * 
 * For large projects, consider using one of these instead of simple hash:
 * - murmurhash3: Fast, good distribution, no collisions in practice
 * - xxhash: Extremely fast, good for large strings
 * - fnv1a: Simple, fast, good distribution
 */

/**
 * FNV-1a hash algorithm (32-bit)
 * Fast, simple, good distribution for CSS class names
 * 
 * @param str - String to hash
 * @returns Hash as base36 string (8 chars)
 */
export function fnv1aHash(str: string): string {
  const FNV_OFFSET_BASIS = 2166136261;
  const FNV_PRIME = 16777619;
  
  let hash = FNV_OFFSET_BASIS;
  
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
    hash = hash >>> 0; // Convert to unsigned 32-bit
  }
  
  return Math.abs(hash).toString(36).substring(0, 8);
}

/**
 * Simple but fast hash (current default)
 * Good for small to medium projects
 */
export function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36).substring(0, 8);
}

/**
 * Hash function factory
 * Allows switching hash algorithms based on environment or config
 */
export type HashFunction = (str: string) => string;

let currentHashFunction: HashFunction = simpleHash;

/**
 * Set the hash function to use
 * Call this before any design registration
 */
export function setHashFunction(fn: HashFunction): void {
  currentHashFunction = fn;
}

/**
 * Get the current hash function
 */
export function getHashFunction(): HashFunction {
  return currentHashFunction;
}

/**
 * Hash a string using the current hash function
 */
export function hash(str: string): string {
  return currentHashFunction(str);
}

/**
 * Initialize hash function based on environment
 * In production, automatically uses fnv1aHash for better distribution
 */
export function initHashFunction(): void {
  // В проде автоматически используем fnv1aHash для лучшей дистрибуции
  if (typeof process !== "undefined" && process.env.NODE_ENV === "production") {
    setHashFunction(fnv1aHash);
  }
  
  // В dev используем простую hash (быстрее для отладки)
  // Можно вручную переключить: setHashFunction(fnv1aHash)
}

