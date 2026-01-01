/**
 * Hash memoization cache
 * Prevents re-computing hash for the same design object
 */

const hashCache = new Map<string, string>();

/**
 * Clear hash cache (useful for testing or memory management)
 */
export function clearHashCache(): void {
  hashCache.clear();
}

/**
 * Get cache size (for debugging)
 */
export function getHashCacheSize(): number {
  return hashCache.size;
}

/**
 * Memoized hash generation
 * Caches results to avoid recomputing hash for identical design objects
 */
export function memoizedHash(normalizedDesign: string, hashFn: (str: string) => string): string {
  // Проверяем кеш
  if (hashCache.has(normalizedDesign)) {
    return hashCache.get(normalizedDesign)!;
  }
  
  // Вычисляем hash
  const hash = hashFn(normalizedDesign);
  
  // Кешируем результат
  hashCache.set(normalizedDesign, hash);
  
  return hash;
}

