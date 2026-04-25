// Foundation tokens - минимальный набор для максимальной производительности
import { generateAllColorPalettes } from "../utils/color-generator";

// Генерируем все цветовые палитры автоматически
const colorPalettes = generateAllColorPalettes();

// Преобразуем палитры в плоскую структуру для токенов
const flatColorPalettes: Record<string, string> = {};
Object.entries(colorPalettes).forEach(([colorName, shades]) => {
  Object.entries(shades).forEach(([shade, value]) => {
    flatColorPalettes[`${colorName}.${shade}`] = value;
  });
});

export const foundationTokens = {
  color: {
    primary: "#007aff",
    secondary: "#5856d6",
    success: "#34c759",
    warning: "#ff9500",
    danger: "#ff3b30",
    text: "#1d1d1f",
    "text.primary": "#1d1d1f",
    "text.inverse": "#ffffff",
    "text.secondary": "#86868b",
    bg: "#ffffff",
    "bg.primary": "#ffffff",
    "bg.secondary": "#fafafa",
    "bg.tertiary": "#f0f0f0",
    // Автоматически сгенерированные цветовые палитры (blue.100, red.500, green.900 и т.д.)
    ...flatColorPalettes,
  },
  radius: {
    sm: "8px",
    md: "12px",
    lg: "18px",
    xl: "24px",
    full: "9999px",
  },
  shadow: {
    sm: "0 1px 3px rgba(0,0,0,.06)",
    md: "0 4px 16px rgba(0,0,0,.08)",
    lg: "0 12px 32px rgba(0,0,0,.12)",
  },
  /** Elevation: тени для имитации глубины слоёв (используется в glass-системе) */
  depth: {
    1: "0 2px 8px rgba(0,0,0,0.08)",
    2: "0 6px 20px rgba(0,0,0,0.15)",
    3: "0 12px 40px rgba(0,0,0,0.25)",
    4: "0 24px 80px rgba(0,0,0,0.35)",
  },
  /** Blur-радиусы для backdrop-filter и filter */
  blur: {
    sm: "8px",
    md: "16px",
    lg: "24px",
    xl: "40px",
  },
  /**
   * Glass tokens — переменные системы матового стекла.
   * В default-теме имитируют glass без backdrop-filter (быстро).
   * В apple-теме активируют настоящий blur.
   */
  glass: {
    bg: "rgba(255, 255, 255, 0.06)",
    border: "rgba(255, 255, 255, 0.14)",
    highlight: "rgba(255, 255, 255, 0.22)",
    "noise-opacity": "0.04",
    blur: "none",
    /** Тёмный вариант */
    "dark-bg": "rgba(0, 0, 0, 0.20)",
    "dark-border": "rgba(255, 255, 255, 0.08)",
    /** Popup/dropdown вариант (Card-like) */
    "popup-bg": "var(--color-bg-primary, #ffffff)",
    "popup-border": "var(--color-bg-tertiary, #e5e5e7)",
    "popup-blur": "none",
  },
  /** Motion: тайминги и easing-функции */
  motion: {
    duration: {
      fast: "120ms",
      normal: "240ms",
      slow: "400ms",
    },
    ease: {
      /** Стандартный плавный ease — подходит для большинства переходов */
      default: "cubic-bezier(0.2, 0.8, 0.2, 1)",
      /** Spring — слегка пружинит, как у Apple */
      spring: "cubic-bezier(0.16, 1, 0.3, 1)",
      /** Decelerate — вход элемента */
      out: "cubic-bezier(0, 0, 0.2, 1)",
      /** Accelerate — уход элемента */
      in: "cubic-bezier(0.4, 0, 1, 1)",
    },
  },
  spacing: {
    1: "4px",
    2: "8px",
    3: "12px",
    4: "16px",
    5: "20px",
    6: "24px",
    7: "32px",
    8: "40px",
    9: "48px",
    10: "64px",
  },
  typography: {
    fontFamily: {
      base: "Inter, system-ui, sans-serif",
      heading: "Inter, system-ui, sans-serif",
      mono: "JetBrains Mono, monospace",
    },
    xs: "10px",
    sm: "12px",
    md: "14px",
    lg: "18px",
    xl: "20px",
    "2xl": "24px",
    weight: {
      normal: "400",
      medium: "500",
      semibold: "600",
      bold: "700",
    },
  },
} as const;

export type FoundationTokens = typeof foundationTokens;

