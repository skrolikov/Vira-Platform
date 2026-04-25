export const cyberpunk = {
  color: {
    primary: "#ed1e79",
    secondary: "#0cffe1",
    danger: "#ed1e79",
    success: "#0cffe1",
    warning: "#ed1e79",
    text: {
      primary: "#f5f5f5",
      secondary: "#e0e0e0",
      inverse: "#181818",
    },
    bg: {
      primary: "#181818",
      secondary: "#2a2a2a",
      tertiary: "#3a3a3a",
    },
  },
  radius: {
    sm: "0px",
    md: "0px",
    lg: "0px",
    full: "999px",
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
    fontFamily: {
      base: "'Exo 2', sans-serif",
      heading: "'Russo One', sans-serif",
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
      hover: {
        bg: "color.bg.tertiary",
        shadow: "shadow.md",
      },
    },
  },
} as const;

export type CyberpunkTheme = typeof cyberpunk;

