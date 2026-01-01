/**
 * Token resolution cache
 * Prevents re-resolving the same tokens multiple times
 */

const tokenCache = new Map<string, string | null>();

/**
 * Clear token cache (useful for testing or memory management)
 */
export function clearTokenCache(): void {
  tokenCache.clear();
}

/**
 * Get cache size (for debugging)
 */
export function getTokenCacheSize(): number {
  return tokenCache.size;
}

/**
 * Get cached token or resolve and cache it
 */
export function getCachedToken(
  path: string,
  resolveFn: (path: string) => string | null
): string | null {
  // Проверяем кеш
  if (tokenCache.has(path)) {
    return tokenCache.get(path)!;
  }
  
  // Резолвим токен
  const value = resolveFn(path);
  
  // Кешируем результат (даже если null)
  tokenCache.set(path, value);
  
  return value;
}

