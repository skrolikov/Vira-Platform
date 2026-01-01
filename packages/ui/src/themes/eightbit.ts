export const eightbit = {
  color: {
    primary: "#00ff00", // Яркий зеленый (классический 8-bit)
    secondary: "#00ffff", // Голубой (cyan)
    danger: "#ff0000", // Яркий красный
    success: "#00ff00", // Зеленый
    warning: "#ffff00", // Яркий желтый
    accent: "#ff00ff", // Пурпурный (magenta)
    text: {
      primary: "#ffffff", // Белый для контраста
      secondary: "#c0c0c0", // Светло-серый
      inverse: "#000000", // Черный
    },
    bg: {
      primary: "#000000", // Черный фон
      secondary: "#1a1a2e", // Темно-синий
      tertiary: "#2d2d44", // Средний темно-синий
    },
  },
  radius: {
    sm: "0px", // Острые углы (пиксельный стиль)
    md: "0px", // Острые углы
    lg: "0px", // Острые углы
    full: "9999px",
  },
  space: {
    1: "4px",
    2: "8px",
    3: "16px",
    4: "24px",
    5: "32px",
    6: "48px",
  },
  shadow: {
    sm: "4px 4px 0px #00ff00, 8px 8px 0px rgba(0, 255, 0, 0.3)", // Пиксельная тень с неоновым эффектом
    md: "6px 6px 0px #00ffff, 12px 12px 0px rgba(0, 255, 255, 0.3)", // Двойная пиксельная тень
    lg: "8px 8px 0px #00ff00, 16px 16px 0px rgba(0, 255, 0, 0.4)", // Большая пиксельная тень
    pixel: "4px 4px 0px #00ff00", // Классическая пиксельная тень
    neon: "0 0 10px #00ff00, 0 0 20px #00ff00, 4px 4px 0px #00ff00", // Комбинация неона и пиксельной тени
  },
  effect: {
    glow: "0 0 10px #00ff00, 0 0 20px #00ff00, 0 0 30px rgba(0, 255, 0, 0.5)", // Неоновое свечение
    neon: "0 0 5px #00ffff, 0 0 10px #00ffff, 0 0 15px rgba(0, 255, 255, 0.8)", // Неоновый эффект
    neonRed: "0 0 5px #ff0000, 0 0 10px #ff0000, 0 0 15px rgba(255, 0, 0, 0.8)", // Красное неоновое свечение
    neonPurple: "0 0 5px #ff00ff, 0 0 10px #ff00ff, 0 0 15px rgba(255, 0, 255, 0.8)", // Пурпурное неоновое свечение
    pixelGrid: "linear-gradient(#00ff00 1px, transparent 1px), linear-gradient(90deg, #00ff00 1px, transparent 1px)", // Пиксельная сетка
    pixelGridCyan: "linear-gradient(#00ffff 1px, transparent 1px), linear-gradient(90deg, #00ffff 1px, transparent 1px)", // Голубая пиксельная сетка
    scanline: "repeating-linear-gradient(0deg, rgba(0, 255, 0, 0.15) 0px, transparent 1px, transparent 2px, rgba(0, 255, 0, 0.15) 3px)", // Эффект сканирующей линии
    dither: "radial-gradient(circle, #00ff00 1px, transparent 1px)", // Дизеринг эффект
    pixelBorder: "inset 0 0 0 2px #00ff00, inset 0 0 0 4px #000000", // Пиксельная рамка
    pixelBorderDouble: "inset 0 0 0 2px #00ff00, inset 0 0 0 4px #000000, inset 0 0 0 6px #00ffff", // Двойная пиксельная рамка
    crt: "linear-gradient(transparent 50%, rgba(0, 255, 0, 0.03) 50%), linear-gradient(90deg, rgba(0, 255, 0, 0.03) 50%, transparent 50%)", // Эффект CRT монитора
  },
  typography: {
    fontSize: {
      xs: "10px",
      sm: "12px",
      md: "14px",
      lg: "16px",
      xl: "18px",
      "2xl": "20px",
      "3xl": "24px",
      "4xl": "32px",
    },
    fontWeight: {
      normal: "400",
      medium: "500",
      semibold: "600",
      bold: "700",
    },
  },
  // Переопределения для пресетов в контексте этой темы
  presets: {
    soft: {
      bg: "color.bg.secondary",
      color: "color.text.primary",
      shadow: "shadow.sm",
      border: "2px solid",
      borderColor: "color.primary",
      hover: {
        bg: "color.bg.tertiary",
        shadow: "shadow.md",
        borderColor: "color.secondary",
      },
    },
    neon: {
      bg: "color.bg.primary",
      color: "color.primary",
      border: "2px solid",
      borderColor: "color.primary",
      shadow: "effect.neon",
      hover: {
        shadow: "effect.glow",
        borderColor: "color.secondary",
        color: "color.secondary",
      },
    },
    pixel: {
      bg: "color.bg.secondary",
      backgroundImage: "effect.pixelGrid",
      backgroundSize: "8px 8px",
      color: "color.text.primary",
      border: "2px solid",
      borderColor: "color.primary",
      shadow: "shadow.md",
      hover: {
        borderColor: "color.secondary",
        shadow: "shadow.lg",
        backgroundSize: "4px 4px",
      },
    },
    retro: {
      bg: "color.bg.primary",
      color: "color.primary",
      border: "3px solid",
      borderColor: "color.primary",
      shadow: "4px 4px 0px color.primary",
      hover: {
        shadow: "6px 6px 0px color.secondary",
        borderColor: "color.secondary",
        transform: "translate(-2px, -2px)",
      },
    },
    glitch: {
      bg: "color.bg.primary",
      color: "color.primary",
      border: "2px solid",
      borderColor: "color.primary",
      boxShadow: "effect.glow, 2px 0 0 color.danger, -2px 0 0 color.secondary",
      hover: {
        boxShadow: "effect.neon, 4px 0 0 color.danger, -4px 0 0 color.secondary",
      },
    },
    classic: {
      bg: "color.bg.secondary",
      color: "color.primary",
      border: "3px solid",
      borderColor: "color.primary",
      shadow: "shadow.pixel",
      hover: {
        shadow: "shadow.neon",
        borderColor: "color.secondary",
        color: "color.secondary",
      },
    },
    matrix: {
      bg: "color.bg.primary",
      backgroundImage: "effect.pixelGrid",
      backgroundSize: "4px 4px",
      color: "color.primary",
      border: "2px solid",
      borderColor: "color.primary",
      shadow: "effect.glow",
      hover: {
        backgroundImage: "effect.pixelGridCyan",
        borderColor: "color.secondary",
        shadow: "effect.neon",
      },
    },
    arcade: {
      bg: "color.bg.secondary",
      color: "color.text.primary",
      border: "4px solid",
      borderColor: "color.primary",
      shadow: "6px 6px 0px color.primary, 12px 12px 0px rgba(0, 255, 0, 0.3)",
      hover: {
        shadow: "8px 8px 0px color.secondary, 16px 16px 0px rgba(0, 255, 255, 0.4)",
        borderColor: "color.secondary",
        transform: "translate(-2px, -2px)",
      },
    },
    rainbow: {
      bg: "color.bg.primary",
      color: "color.text.primary",
      border: "2px solid",
      borderColor: "color.primary",
      boxShadow: "effect.glow, 0 0 0 2px color.secondary, 0 0 0 4px color.danger, 0 0 0 6px color.warning",
      hover: {
        boxShadow: "effect.neon, 0 0 0 2px color.secondary, 0 0 0 4px color.danger, 0 0 0 6px color.warning, 0 0 0 8px color.accent",
        borderColor: "color.secondary",
      },
    },
  },
} as const;

export type EightBitTheme = typeof eightbit;

