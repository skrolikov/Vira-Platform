/**
 * Breakpoints configuration for responsive design
 * 
 * Can be customized for different breakpoint systems
 */

export interface Breakpoints {
  sm: string;
  md: string;
  lg: string;
  xl: string;
}

/**
 * Default breakpoints (mobile-first)
 */
export const defaultBreakpoints: Breakpoints = {
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
};

let currentBreakpoints: Breakpoints = defaultBreakpoints;

/**
 * Set custom breakpoints
 * 
 * @example
 * setBreakpoints({
 *   sm: "576px",
 *   md: "768px",
 *   lg: "992px",
 *   xl: "1200px"
 * });
 */
export function setBreakpoints(breakpoints: Breakpoints): void {
  currentBreakpoints = breakpoints;
}

/**
 * Get current breakpoints
 */
export function getBreakpoints(): Breakpoints {
  return currentBreakpoints;
}

/**
 * Get breakpoint value by name
 */
export function getBreakpoint(name: keyof Breakpoints): string {
  return currentBreakpoints[name];
}

