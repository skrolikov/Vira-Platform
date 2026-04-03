export const retro = {
  color: {
    primary: "#ff6b35", // Retro Orange
    secondary: "#004e89", // Retro Blue
    danger: "#d62828", // Retro Red
    success: "#06a77d", // Retro Teal
    warning: "#f77f00", // Retro Amber
    text: {
      primary: "#2d3142", // Dark slate
      secondary: "#4f5d75", // Medium slate
      inverse: "#ffffff", // White
    },
    bg: {
      primary: "#fef9e7", // Cream
      secondary: "#f5e6d3", // Light beige
      tertiary: "#e8dcc6", // Medium beige
    },
  },
  radius: {
    sm: "0px", // Sharp corners
    md: "4px", // Slightly rounded
    lg: "8px", // More rounded
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
    sm: "4px 4px 0px rgba(45, 49, 66, 0.2)",
    md: "6px 6px 0px rgba(45, 49, 66, 0.3)",
    lg: "8px 8px 0px rgba(45, 49, 66, 0.4)",
  },
  effect: {
    glow: "0 0 10px rgba(255, 107, 53, 0.5)",
    neon: "0 0 5px rgba(255, 107, 53, 0.8)",
    scanline: "repeating-linear-gradient(0deg, rgba(0, 0, 0, 0.03) 0px, transparent 1px, transparent 2px, rgba(0, 0, 0, 0.03) 3px)",
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
} as const;

export type RetroTheme = typeof retro;

