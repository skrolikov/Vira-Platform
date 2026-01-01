/**
 * Environment utilities for Vira UI
 * 
 * Handles dev/prod mode detection and feature flags
 */

/**
 * Check if we're in dev mode
 * Can be controlled via VIRA_DEV env variable or NODE_ENV
 */
export function isDevMode(): boolean {
  // Check explicit flag first
  if (typeof process !== "undefined" && process.env.VIRA_DEV === "true") {
    return true;
  }
  
  if (typeof process !== "undefined" && process.env.VIRA_DEV === "false") {
    return false;
  }
  
  // Fallback to NODE_ENV
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

