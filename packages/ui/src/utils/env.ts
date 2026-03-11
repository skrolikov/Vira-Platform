/**
 * Environment utilities for Vira UI
 * 
 * Handles dev/prod mode detection and feature flags
 */

/**
 * Check if we're in dev mode
 * Can be controlled via VIRA_DEV env variable, NODE_ENV, or Vite import.meta.env.PROD
 */
export function isDevMode(): boolean {
  // Check explicit flag first
  if (typeof process !== "undefined" && process.env.VIRA_DEV === "true") {
    return true;
  }
  if (typeof process !== "undefined" && process.env.VIRA_DEV === "false") {
    return false;
  }
  // Vite production build: import.meta.env.PROD is true in prod
  if (typeof import.meta !== "undefined" && (import.meta as any).env?.PROD === true) {
    return false;
  }
  // Fallback to NODE_ENV (e.g. when bundled by Vite, NODE_ENV is replaced)
  if (typeof process !== "undefined" && process.env.NODE_ENV === "production") {
    return false;
  }
  // Default to dev mode
  return true;
}

/**
 * Check if we're in production mode
 */
export function isProdMode(): boolean {
  return !isDevMode();
}

/**
 * Check if we should enable dev tools (MutationObserver, debug logs, etc.)
 */
export function shouldEnableDevTools(): boolean {
  return isDevMode();
}

/**
 * Check if we should include data-design attributes
 */
export function shouldIncludeDataDesign(): boolean {
  return isDevMode();
}

