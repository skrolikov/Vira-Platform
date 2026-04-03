export const monochrome = {
  color: {
    primary: "#000000", // Black
    secondary: "#333333", // Dark gray
    danger: "#000000",
    success: "#000000",
    warning: "#000000",
    text: {
      primary: "#000000",
      secondary: "#555555",
      inverse: "#ffffff",
    },
    bg: {
      primary: "#ffffff",
      secondary: "#f5f5f5",
      tertiary: "#e5e5e5",
    },
    border: {
      primary: "#000000",
      secondary: "#999999",
      subtle: "#cccccc",
    },
  },

  radius: {
    sm: "0px",
    md: "0px",
    lg: "0px",
    full: "0px",
  },

  space: {
    1: "4px",
    2: "8px",
    3: "16px",
    4: "24px",
    5: "32px",
    6: "48px",
  },

  border: {
    width: {
      sm: "1px",
      md: "2px",
      lg: "3px",
    },
    style: "solid",
  },

  shadow: {
    sm: "none",
    md: "none",
    lg: "none",
  },

  effect: {
    none: "none",
  },

  typography: {
    fontFamily: {
      base: "Inter, system-ui, sans-serif",
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
    lineHeight: {
      tight: "1.2",
      normal: "1.5",
      relaxed: "1.7",
    },
  },
} as const;

export type MonochromeTheme = typeof monochrome;
