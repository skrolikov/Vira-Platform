export const material = {
  color: {
    primary: "#1976d2", // Material Blue
    secondary: "#dc004e", // Material Pink
    danger: "#d32f2f", // Material Red
    success: "#388e3c", // Material Green
    warning: "#f57c00", // Material Orange
    text: {
      primary: "rgba(0, 0, 0, 0.87)", // 87% black
      secondary: "rgba(0, 0, 0, 0.60)", // 60% black
      inverse: "#ffffff", // White
    },
    bg: {
      primary: "#ffffff", // White
      secondary: "#f5f5f5", // Light gray
      tertiary: "#eeeeee", // Lighter gray
    },
  },
  radius: {
    sm: "4px",
    md: "8px",
    lg: "16px",
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
    sm: "0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)",
    md: "0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23)",
    lg: "0 10px 20px rgba(0, 0, 0, 0.19), 0 6px 6px rgba(0, 0, 0, 0.23)",
  },
  effect: {
    glow: "0 0 8px rgba(25, 118, 210, 0.4)",
    neon: "0 0 4px rgba(25, 118, 210, 0.6)",
    ripple: "radial-gradient(circle, rgba(25, 118, 210, 0.3) 0%, transparent 70%)",
  },
  typography: {
    fontFamily: {
      base: "'Roboto', sans-serif",
      heading: "'Roboto', sans-serif",
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
      semibold: "500",
      bold: "700",
    },
  },
  // Переопределения для пресетов в контексте этой темы
  presets: {
    soft: {
      bg: "color.bg.secondary",
      color: "color.text.primary",
      shadow: "shadow.sm",
      hover: {
        bg: "color.bg.tertiary",
        shadow: "shadow.md",
      },
    },
    elevated: {
      bg: "color.bg.primary",
      color: "color.text.primary",
      shadow: "shadow.md",
      hover: {
        shadow: "shadow.lg",
      },
    },
    outlined: {
      bg: "transparent",
      color: "color.primary",
      border: "1px solid",
      borderColor: "color.primary",
      hover: {
        bg: "rgba(25, 118, 210, 0.04)",
      },
    },
  },
} as const;

export type MaterialTheme = typeof material;

