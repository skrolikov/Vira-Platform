export const swiss = {
  color: {
    primary: "#dc143c", // Crimson Red (Swiss red)
    secondary: "#000000", // Black
    danger: "#dc143c",
    success: "#000000",
    warning: "#000000",
    text: {
      primary: "#000000",
      secondary: "#333333",
      inverse: "#ffffff",
    },
    bg: {
      primary: "#ffffff",
      secondary: "#f5f5f5",
      tertiary: "#e0e0e0",
    },
  },
  radius: {
    sm: "0px", // Sharp corners (Swiss design)
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
    sm: "none", // No shadows in Swiss design
    md: "none",
    lg: "none",
  },
  effect: {
    grid: "linear-gradient(#000000 1px, transparent 1px), linear-gradient(90deg, #000000 1px, transparent 1px)",
    gridRed: "linear-gradient(#dc143c 1px, transparent 1px), linear-gradient(90deg, #dc143c 1px, transparent 1px)",
    geometric: "background: repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0, 0, 0, 0.05) 10px, rgba(0, 0, 0, 0.05) 20px)",
    minimal: "border: 2px solid #000000",
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
    lineHeight: {
      tight: "1.0",
      normal: "1.2",
      relaxed: "1.5",
    },
  },
  presets: {
    soft: {
      bg: "color.bg.secondary",
      color: "color.text.primary",
      border: "1px solid",
      borderColor: "color.secondary",
      hover: {
        bg: "color.bg.tertiary",
        borderColor: "color.primary",
      },
    },
    minimal: {
      bg: "color.bg.primary",
      color: "color.text.primary",
      border: "2px solid",
      borderColor: "color.secondary",
      hover: {
        borderColor: "color.primary",
        color: "color.primary",
      },
    },
    bold: {
      bg: "color.secondary",
      color: "color.text.inverse",
      border: "none",
      hover: {
        bg: "color.primary",
      },
    },
    outlined: {
      bg: "transparent",
      color: "color.primary",
      border: "2px solid",
      borderColor: "color.primary",
      hover: {
        bg: "color.primary",
        color: "color.text.inverse",
      },
    },
    grid: {
      bg: "color.bg.primary",
      backgroundImage: "effect.grid",
      backgroundSize: "20px 20px",
      color: "color.text.primary",
      border: "1px solid",
      borderColor: "color.secondary",
      hover: {
        backgroundImage: "effect.gridRed",
        borderColor: "color.primary",
      },
    },
  },
} as const;

export type SwissTheme = typeof swiss;

