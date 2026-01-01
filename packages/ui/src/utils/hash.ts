import { hash as advancedHash, initHashFunction, setHashFunction, type HashFunction, fnv1aHash } from "./hash-advanced";

// Initialize hash function on module load
initHashFunction();

/**
 * Generate hash from string
 * Uses advanced hash functions in production (can be configured)
 */
export function generateHash(str: string): string {
  return advancedHash(str);
}

// Re-export for convenience
export { setHashFunction, fnv1aHash, type HashFunction } from "./hash-advanced";

/**
 * Configure hash function for production
 * 
 * @example
 * // In your app initialization:
 * import { setHashFunction, fnv1aHash } from "@vira-ui/ui";
 * 
 * if (process.env.NODE_ENV === "production") {
 *   setHashFunction(fnv1aHash); // Better distribution for large projects
 * }
 */

