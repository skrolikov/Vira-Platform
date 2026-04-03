export const aurora = {
  color: {
    primary: "#00d9ff", // Cyan blue
    secondary: "#7c3aed", // Purple
    danger: "#ef4444", // Red
    success: "#10b981", // Emerald
    warning: "#f59e0b", // Amber
    text: {
      primary: "#f0f9ff", // Ice blue white
      secondary: "#94a3b8", // Slate gray
      inverse: "#0f172a", // Deep navy
    },
    bg: {
      primary: "#0a0e27", // Deep space blue
      secondary: "#1e293b", // Dark slate
      tertiary: "#334155", // Medium slate
    },
  },
  radius: {
    sm: "6px",
    md: "12px",
    lg: "18px",
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
    sm: "0 2px 8px rgba(0, 217, 255, 0.15), 0 0 4px rgba(124, 58, 237, 0.1)",
    md: "0 4px 20px rgba(0, 217, 255, 0.25), 0 0 12px rgba(124, 58, 237, 0.2)",
    lg: "0 8px 40px rgba(0, 217, 255, 0.35), 0 0 24px rgba(124, 58, 237, 0.3), inset 0 0 20px rgba(0, 217, 255, 0.05)",
  },
  effect: {
    glow: "0 0 30px rgba(0, 217, 255, 0.6), 0 0 60px rgba(124, 58, 237, 0.4), 0 0 90px rgba(0, 217, 255, 0.2)",
    neon: "0 0 10px rgba(0, 217, 255, 0.8), 0 0 20px rgba(124, 58, 237, 0.6), 0 0 30px rgba(0, 217, 255, 0.4)",
    shimmer: "linear-gradient(90deg, transparent, rgba(0, 217, 255, 0.1), rgba(124, 58, 237, 0.1), transparent)",
    aurora: "linear-gradient(135deg, rgba(0, 217, 255, 0.1) 0%, rgba(124, 58, 237, 0.1) 50%, rgba(0, 217, 255, 0.1) 100%)",
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
      borderColor: "rgba(0, 217, 255, 0.2)",
      hover: {
        bg: "color.bg.tertiary",
        shadow: "shadow.md",
        borderColor: "rgba(0, 217, 255, 0.4)",
      },
    },
    aurora: {
      bg: "linear-gradient(135deg, rgba(0, 217, 255, 0.1) 0%, rgba(124, 58, 237, 0.15) 50%, rgba(0, 217, 255, 0.1) 100%)",
      color: "color.primary",
      border: "1px solid",
      borderColor: "rgba(0, 217, 255, 0.3)",
      shadow: "shadow.md",
      hover: {
        bg: "linear-gradient(135deg, rgba(0, 217, 255, 0.15) 0%, rgba(124, 58, 237, 0.2) 50%, rgba(0, 217, 255, 0.15) 100%)",
        shadow: "shadow.lg",
        borderColor: "rgba(0, 217, 255, 0.5)",
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
  },
} as const;

export type AuroraTheme = typeof aurora;

