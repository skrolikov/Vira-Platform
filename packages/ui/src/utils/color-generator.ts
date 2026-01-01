/**
 * Генератор цветовых градаций (100-900)
 * Автоматически генерирует палитру цветов от светлого к темному
 */

// Функция для преобразования HEX в RGB
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

// Функция для преобразования RGB в HEX
function rgbToHex(r: number, g: number, b: number): string {
  return `#${[r, g, b].map((x) => Math.round(x).toString(16).padStart(2, "0")).join("")}`;
}

// Функция для интерполяции между двумя цветами
function interpolateColor(
  startColor: string,
  endColor: string,
  factor: number
): string {
  const start = hexToRgb(startColor);
  const end = hexToRgb(endColor);

  if (!start || !end) return startColor;

  const r = start.r + (end.r - start.r) * factor;
  const g = start.g + (end.g - start.g) * factor;
  const b = start.b + (end.b - start.b) * factor;

  return rgbToHex(r, g, b);
}

// Функция для осветления цвета
function lightenColor(hex: string, amount: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;

  const r = Math.min(255, rgb.r + amount);
  const g = Math.min(255, rgb.g + amount);
  const b = Math.min(255, rgb.b + amount);

  return rgbToHex(r, g, b);
}

// Функция для затемнения цвета
function darkenColor(hex: string, amount: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;

  const r = Math.max(0, rgb.r - amount);
  const g = Math.max(0, rgb.g - amount);
  const b = Math.max(0, rgb.b - amount);

  return rgbToHex(r, g, b);
}

// Функция для создания цветовых градаций
export function generateColorScale(
  baseColor: string,
  options: {
    lightest?: string; // Цвет для 50 (самый светлый)
    darkest?: string; // Цвет для 950 (самый темный)
    useInterpolation?: boolean; // Использовать интерполяцию или просто осветление/затемнение
  } = {}
): Record<number, string> {
  const {
    lightest,
    darkest,
    useInterpolation = true,
  } = options;

  const scale: Record<number, string> = {};

  if (useInterpolation && lightest && darkest) {
    // Используем интерполяцию между lightest и darkest
    const steps = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];
    
    steps.forEach((step) => {
      if (step === 500) {
        // 500 - это базовый цвет
        scale[step] = baseColor;
      } else if (step === 50) {
        scale[step] = lightest;
      } else if (step === 950) {
        scale[step] = darkest;
      } else if (step < 500) {
        // Интерполируем между lightest и baseColor
        // step 100 -> factor 0.9, step 400 -> factor 0.2
        const factor = (500 - step) / 450; // 0.9 для 100, 0.2 для 400
        scale[step] = interpolateColor(lightest, baseColor, factor);
      } else {
        // Интерполируем между baseColor и darkest
        // step 600 -> factor 0.2, step 900 -> factor 0.9
        const factor = (step - 500) / 450; // 0.2 для 600, 0.9 для 900
        scale[step] = interpolateColor(baseColor, darkest, factor);
      }
    });
  } else {
    // Простая генерация через осветление/затемнение
    scale[500] = baseColor; // Базовый цвет
    
    // Осветление (100-400)
    scale[100] = lightenColor(baseColor, 180);
    scale[200] = lightenColor(baseColor, 140);
    scale[300] = lightenColor(baseColor, 100);
    scale[400] = lightenColor(baseColor, 50);
    
    // Затемнение (600-900)
    scale[600] = darkenColor(baseColor, 30);
    scale[700] = darkenColor(baseColor, 60);
    scale[800] = darkenColor(baseColor, 90);
    scale[900] = darkenColor(baseColor, 120);
    
    // Экстремальные значения
    scale[50] = lightenColor(baseColor, 220);
    scale[950] = darkenColor(baseColor, 150);
  }

  return scale;
}

// Предустановленные цветовые схемы
export const colorPresets = {
  blue: {
    base: "#3b82f6",
    lightest: "#eff6ff",
    darkest: "#1e3a8a",
  },
  red: {
    base: "#ef4444",
    lightest: "#fef2f2",
    darkest: "#991b1b",
  },
  green: {
    base: "#10b981",
    lightest: "#ecfdf5",
    darkest: "#065f46",
  },
  yellow: {
    base: "#f59e0b",
    lightest: "#fffbeb",
    darkest: "#78350f",
  },
  purple: {
    base: "#8b5cf6",
    lightest: "#f5f3ff",
    darkest: "#581c87",
  },
  pink: {
    base: "#ec4899",
    lightest: "#fdf2f8",
    darkest: "#831843",
  },
  indigo: {
    base: "#6366f1",
    lightest: "#eef2ff",
    darkest: "#312e81",
  },
  teal: {
    base: "#14b8a6",
    lightest: "#f0fdfa",
    darkest: "#134e4a",
  },
  orange: {
    base: "#f97316",
    lightest: "#fff7ed",
    darkest: "#7c2d12",
  },
  gray: {
    base: "#6b7280",
    lightest: "#f9fafb",
    darkest: "#111827",
  },
  slate: {
    base: "#64748b",
    lightest: "#f8fafc",
    darkest: "#0f172a",
  },
  zinc: {
    base: "#71717a",
    lightest: "#fafafa",
    darkest: "#18181b",
  },
  neutral: {
    base: "#737373",
    lightest: "#fafafa",
    darkest: "#171717",
  },
  stone: {
    base: "#78716c",
    lightest: "#fafaf9",
    darkest: "#1c1917",
  },
} as const;

// Генерация всех цветовых палитр
export function generateAllColorPalettes(): Record<string, Record<number, string>> {
  const palettes: Record<string, Record<number, string>> = {};

  Object.entries(colorPresets).forEach(([name, preset]) => {
    palettes[name] = generateColorScale(preset.base, {
      lightest: preset.lightest,
      darkest: preset.darkest,
      useInterpolation: true,
    });
  });

  return palettes;
}

// Функция для получения цвета из палитры
export function getColorFromPalette(
  colorName: string,
  shade: number
): string | null {
  const palettes = generateAllColorPalettes();
  const palette = palettes[colorName.toLowerCase()];
  
  if (!palette) return null;
  
  return palette[shade] || null;
}

