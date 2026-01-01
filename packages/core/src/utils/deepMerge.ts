/**
 * Deep merge utility for nested objects.
 * Merges source into target, preserving nested object structures.
 */
export function deepMerge<T extends Record<string, any>>(
  target: T,
  source: Partial<T> | T
): T {
  if (!source || typeof source !== 'object') {
    return source as T;
  }

  if (!target || typeof target !== 'object') {
    return source as T;
  }

  // Handle arrays - replace entirely (no merge for arrays)
  if (Array.isArray(source)) {
    return source as T;
  }

  // Handle null
  if (source === null) {
    return source as T;
  }

  // Create a copy of target
  const result = { ...target };

  // Iterate over source keys
  for (const key in source) {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      const sourceValue = source[key];
      const targetValue = target[key];

      // If both are objects (and not arrays/null), merge recursively
      if (
        sourceValue !== null &&
        typeof sourceValue === 'object' &&
        !Array.isArray(sourceValue) &&
        targetValue !== null &&
        typeof targetValue === 'object' &&
        !Array.isArray(targetValue)
      ) {
        result[key] = deepMerge(targetValue, sourceValue);
      } else {
        // Otherwise, replace with source value
        result[key] = sourceValue as any;
      }
    }
  }

  return result;
}

