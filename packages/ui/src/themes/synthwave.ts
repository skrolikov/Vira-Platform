export const synthwave = {
  color: {
    primary: "#ff006e", // Hot pink
    secondary: "#00f5ff", // Cyan
    danger: "#ff1744", // Bright red
    success: "#00ff88", // Neon green
    warning: "#ffaa00", // Orange
    text: {
      primary: "#f0f0f0", // Light gray
      secondary: "#b0b0b0", // Medium gray
      inverse: "#0a0a0a", // Near black
    },
    bg: {
      primary: "#1a0033", // Deep purple
      secondary: "#2d1b4e", // Dark purple
      tertiary: "#3d2a5f", // Medium purple
    },
  },
  radius: {
    sm: "4px",
    md: "8px",
    lg: "12px",
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
    sm: "0 0 10px rgba(255, 0, 110, 0.4), 0 0 5px rgba(0, 245, 255, 0.3)",
    md: "0 0 20px rgba(255, 0, 110, 0.5), 0 0 10px rgba(0, 245, 255, 0.4), inset 0 0 10px rgba(255, 0, 110, 0.1)",
    lg: "0 0 40px rgba(255, 0, 110, 0.6), 0 0 20px rgba(0, 245, 255, 0.5), inset 0 0 20px rgba(255, 0, 110, 0.15)",
  },
  effect: {
    glow: "0 0 30px rgba(255, 0, 110, 0.7), 0 0 60px rgba(0, 245, 255, 0.5), 0 0 90px rgba(255, 0, 110, 0.3)",
    neon: "0 0 10px rgba(255, 0, 110, 0.9), 0 0 20px rgba(0, 245, 255, 0.7), 0 0 30px rgba(255, 0, 110, 0.5)",
    grid: "linear-gradient(rgba(255, 0, 110, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 0, 110, 0.1) 1px, transparent 1px)",
    scanline: "repeating-linear-gradient(0deg, rgba(0, 0, 0, 0.1) 0px, transparent 1px, transparent 2px, rgba(0, 0, 0, 0.1) 3px)",
    sunset: "linear-gradient(180deg, rgba(255, 0, 110, 0.2) 0%, rgba(0, 245, 255, 0.2) 100%)",
  },
  typography: {
    fontSize: {
      xs: "10px",
      sm: "12px",
      md: "14px",
      lg: "18px",
      xl: "20px",
      "2xl": "24px",
      "3xl": "30px",
      "4xl": "36px",
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
      border: "1px solid",
      borderColor: "rgba(255, 0, 110, 0.3)",
      hover: {
        bg: "color.bg.tertiary",
        shadow: "shadow.md",
        borderColor: "rgba(255, 0, 110, 0.5)",
      },
    },
    neon: {
      bg: "color.bg.secondary",
      color: "color.primary",
      border: "2px solid",
      borderColor: "color.primary",
      shadow: "effect.neon",
      hover: {
        shadow: "effect.glow",
        borderColor: "color.secondary",
      },
    },
    grid: {
      bg: "color.bg.primary",
      backgroundImage: "effect.grid",
      backgroundSize: "20px 20px",
      color: "color.text.primary",
      border: "1px solid",
      borderColor: "rgba(255, 0, 110, 0.2)",
      shadow: "shadow.md",
      hover: {
        borderColor: "rgba(255, 0, 110, 0.4)",
        shadow: "shadow.lg",
      },
    },
    sunset: {
      bg: "linear-gradient(135deg, rgba(255, 0, 110, 0.2) 0%, rgba(0, 245, 255, 0.2) 100%)",
      color: "color.text.primary",
      border: "1px solid",
      borderColor: "rgba(255, 0, 110, 0.4)",
      shadow: "shadow.md",
      hover: {
        bg: "linear-gradient(135deg, rgba(255, 0, 110, 0.3) 0%, rgba(0, 245, 255, 0.3) 100%)",
        shadow: "shadow.lg",
        borderColor: "rgba(255, 0, 110, 0.6)",
      },
    },
  },
} as const;

export type SynthwaveTheme = typeof synthwave;

