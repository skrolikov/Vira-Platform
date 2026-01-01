export const cyberpunk = {
  color: {
    primary: "#ff0099",
    secondary: "#00eaff",
    danger: "#ff0066",
    success: "#00ff88",
    warning: "#ffaa00",
    text: {
      primary: "#e0e0e0",
      secondary: "#a0a0a0",
      inverse: "#0d0221",
    },
    bg: {
      primary: "#0d0221",
      secondary: "#1a0442",
      tertiary: "#2a0663",
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
    sm: "0 0 4px rgba(255,0,153,0.3)",
    md: "0 0 12px rgba(255,0,153,0.5)",
    lg: "0 0 20px rgba(0,234,255,0.6)",
  },
  effect: {
    glow: "0 0 12px #ff0099",
    neon: "0 0 4px #00eaff",
  },
  typography: {
    fontSize: {
      xs: "12px",
      sm: "14px",
      md: "16px",
      lg: "18px",
      xl: "20px",
      "2xl": "24px",
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
      hover: {
        bg: "color.bg.tertiary",
        shadow: "shadow.md",
      },
    },
  },
} as const;

export type CyberpunkTheme = typeof cyberpunk;

