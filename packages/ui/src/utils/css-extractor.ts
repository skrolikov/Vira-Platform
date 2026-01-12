/**
 * CSS Extractor for build-time CSS generation
 * 
 * This module allows extracting all registered CSS at build time
 * for production builds, avoiding runtime CSS injection.
 */

import { designRegistry } from "./design-registry";
import type { DesignProps } from "../types";

/**
 * Extract all CSS from registered designs
 * Used for build-time CSS generation
 * 
 * @param designs - Array of all designs used in the app
 * @param prefix - CSS class prefix (default: "vi-")
 * @returns Combined CSS string
 */
export function extractCSS(
  designs: DesignProps[],
  prefix: string = "vi-"
): string {
  // Register all designs to generate CSS
  const cssRules: string[] = [];
  
  for (const design of designs) {
    if (!design || Object.keys(design).length === 0) {
      continue;
    }
    
    // Register design (generates CSS)
    designRegistry.register(design, prefix);
  }
  
  // Get all generated CSS
  return designRegistry.getAllCSS();
}

/**
 * Extract CSS from a single design
 */
export function extractCSSFromDesign(
  design: DesignProps,
  prefix: string = "vi-"
): string {
  const hash = designRegistry.register(design, prefix);
  return designRegistry.getCSS(hash) || "";
}

/**
 * Get all currently registered CSS (for SSR or build-time extraction)
 */
export function getAllRegisteredCSS(): string {
  return designRegistry.getAllCSS();
}

/**
 * Clear registry (useful for testing or re-extraction)
 */
export function clearCSSRegistry(): void {
  designRegistry.clear();
}

