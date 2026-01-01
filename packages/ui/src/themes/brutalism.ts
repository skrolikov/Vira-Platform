export const brutalism = {
  color: {
    primary: "#000000", // Black
    secondary: "#ffffff", // White
    danger: "#ff0000", // Red
    success: "#00ff00", // Green
    warning: "#ffff00", // Yellow
    text: {
      primary: "#000000",
      secondary: "#333333",
      inverse: "#ffffff",
    },
    bg: {
      primary: "#ffffff",
      secondary: "#f0f0f0",
      tertiary: "#e0e0e0",
    },
  },
  radius: {
    sm: "0px", // Sharp, brutal corners
    md: "0px",
    lg: "0px",
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
    sm: "4px 4px 0px #000000", // Hard shadows
    md: "6px 6px 0px #000000",
    lg: "8px 8px 0px #000000",
    colored: "4px 4px 0px #ff0000, 8px 8px 0px #000000", // Multi-color shadow
  },
  effect: {
    hard: "border: 4px solid #000000",
    double: "border: 4px solid #000000; box-shadow: inset 0 0 0 2px #ffffff",
    brutal: "background: #000000; color: #ffffff; border: 4px solid #000000",
    contrast: "background: #ffffff; color: #000000; border: 4px solid #000000",
  },
  typography: {
    fontSize: {
      xs: "12px",
      sm: "14px",
      md: "16px",
      lg: "20px",
      xl: "24px",
      "2xl": "32px",
      "3xl": "48px",
      "4xl": "64px",
    },
    fontWeight: {
      normal: "400",
      medium: "500",
      semibold: "600",
      bold: "700",
      extrabold: "800",
      black: "900",
    },
  },
  presets: {
    soft: {
      bg: "color.bg.secondary",
      color: "color.text.primary",
      border: "3px solid",
      borderColor: "color.primary",
      shadow: "shadow.sm",
      hover: {
        shadow: "shadow.md",
        borderColor: "color.danger",
      },
    },
    brutal: {
      bg: "color.primary",
      color: "color.text.inverse",
      border: "4px solid",
      borderColor: "color.primary",
      shadow: "shadow.md",
      hover: {
        bg: "color.secondary",
        color: "color.primary",
        shadow: "shadow.lg",
      },
    },
    outlined: {
      bg: "transparent",
      color: "color.primary",
      border: "4px solid",
      borderColor: "color.primary",
      hover: {
        bg: "color.primary",
        color: "color.text.inverse",
        shadow: "shadow.sm",
      },
    },
    hard: {
      bg: "color.bg.primary",
      color: "color.text.primary",
      border: "4px solid",
      borderColor: "color.primary",
      shadow: "shadow.md",
      hover: {
        borderColor: "color.danger",
        shadow: "shadow.colored",
      },
    },
    contrast: {
      bg: "color.secondary",
      color: "color.primary",
      border: "4px solid",
      borderColor: "color.primary",
      shadow: "shadow.lg",
      hover: {
        bg: "color.primary",
        color: "color.secondary",
        shadow: "shadow.md",
      },
    },
  },
} as const;

export type BrutalismTheme = typeof brutalism;

