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
    full: "9999px",
  },
  shadow: {
    sm: "0 1px 3px rgba(0,0,0,.0)",
    md: "0 2px 4px rgba(0,0,0,.0)",
    lg: "0 1px 3px rgba(0,0,0,.2)",
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

