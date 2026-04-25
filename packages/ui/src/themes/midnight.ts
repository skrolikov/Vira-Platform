export const midnight = {
  color: {
    primary: "#8b5cf6", // Vibrant purple
    secondary: "#06b6d4", // Cyan
    danger: "#f43f5e", // Rose red
    success: "#22c55e", // Emerald
    warning: "#f59e0b", // Amber
    text: {
      primary: "#f8fafc", // Almost white
      secondary: "#cbd5e1", // Slate 300
      inverse: "#0f172a", // Slate 900
    },
    bg: {
      primary: "#0a0a0f", // Deep black-blue
      secondary: "#1a1a2e", // Dark navy
      tertiary: "#16213e", // Darker navy
    },
  },
  radius: {
    sm: "8px",
    md: "12px",
    lg: "20px",
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
    sm: "0 2px 12px rgba(139, 92, 246, 0.15), 0 0 4px rgba(6, 182, 212, 0.1)",
    md: "0 4px 24px rgba(139, 92, 246, 0.25), 0 0 12px rgba(6, 182, 212, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.05)",
    lg: "0 8px 48px rgba(139, 92, 246, 0.35), 0 0 24px rgba(6, 182, 212, 0.2), inset 0 2px 0 rgba(255, 255, 255, 0.08)",
  },
  effect: {
    glow: "0 0 40px rgba(139, 92, 246, 0.5), 0 0 80px rgba(6, 182, 212, 0.3), 0 0 120px rgba(139, 92, 246, 0.2)",
    neon: "0 0 15px rgba(139, 92, 246, 0.8), 0 0 30px rgba(6, 182, 212, 0.6), 0 0 45px rgba(139, 92, 246, 0.4)",
    shimmer: "linear-gradient(90deg, transparent, rgba(139, 92, 246, 0.1), rgba(6, 182, 212, 0.1), transparent)",
    gradient: "linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(6, 182, 212, 0.2) 50%, rgba(139, 92, 246, 0.2) 100%)",
    glass: "rgba(255, 255, 255, 0.05) backdrop-filter: blur(10px)",
  },
  typography: {
    fontFamily: {
      base: "'Manrope', sans-serif",
      heading: "'Montserrat', sans-serif",
      mono: "JetBrains Mono, monospace",
    },
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
      borderColor: "rgba(139, 92, 246, 0.2)",
      hover: {
        bg: "color.bg.tertiary",
        shadow: "shadow.md",
        borderColor: "rgba(139, 92, 246, 0.4)",
      },
    },
    glass: {
      bg: "rgba(26, 26, 46, 0.6)",
      color: "color.text.primary",
      border: "1px solid",
      borderColor: "rgba(139, 92, 246, 0.3)",
      shadow: "shadow.md",
      backdropFilter: "blur(10px)",
      hover: {
        bg: "rgba(26, 26, 46, 0.8)",
        shadow: "shadow.lg",
        borderColor: "rgba(139, 92, 246, 0.5)",
      },
    },
    gradient: {
      bg: "linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(6, 182, 212, 0.15) 50%, rgba(139, 92, 246, 0.15) 100%)",
      color: "color.primary",
      border: "1px solid",
      borderColor: "rgba(139, 92, 246, 0.4)",
      shadow: "shadow.md",
      hover: {
        bg: "linear-gradient(135deg, rgba(139, 92, 246, 0.25) 0%, rgba(6, 182, 212, 0.25) 50%, rgba(139, 92, 246, 0.25) 100%)",
        shadow: "shadow.lg",
        borderColor: "rgba(139, 92, 246, 0.6)",
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

export type MidnightTheme = typeof midnight;

