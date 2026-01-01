import { foundationTokens } from "../tokens/foundation";

/**
 * Resolve a color value into a HEX string.
 * Supports:
 * - "#rrggbb"
 * - "blue.500" (and other palette keys from foundationTokens.color)
 */
export function resolveColorHex(value: string): string | null {
  const v = String(value || "").trim();
  if (!v) return null;
  if (v.startsWith("#")) return v;
  const map: any = (foundationTokens as any).color || {};
  return typeof map[v] === "string" ? map[v] : null;
}

/**
 * Pick a readable text color for a given background hex.
 * Defaults to dark "#111827" vs white "#ffffff".
 */
export function contrastText(
  backgroundHex: string,
  options?: { dark?: string; light?: string; threshold?: number }
): string {
  const dark = options?.dark ?? "#111827";
  const light = options?.light ?? "#ffffff";
  const threshold = options?.threshold ?? 0.6;

  const h = String(backgroundHex || "").trim().replace("#", "");
  if (h.length !== 6) return dark;

  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return lum < threshold ? light : dark;
}


