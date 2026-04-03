export const typography = {
  color: {
    primary: "#000000", // Black
    secondary: "#333333", // Dark gray
    danger: "#000000",
    success: "#000000",
    warning: "#000000",
    text: {
      primary: "#000000",
      secondary: "#666666",
      inverse: "#ffffff",
    },
    bg: {
      primary: "#ffffff",
      secondary: "#fafafa",
      tertiary: "#f0f0f0",
    },
  },
  radius: {
    sm: "0px",
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
    sm: "none",
    md: "none",
    lg: "0 0 0 1px rgba(0, 0, 0, 0.1)", // Text shadow effect
  },
  effect: {
    underline: "text-decoration: underline; text-underline-offset: 4px",
    strike: "text-decoration: line-through",
    highlight: "background: linear-gradient(transparent 60%, rgba(0, 0, 0, 0.1) 60%)",
    letterSpacing: "letter-spacing: 0.1em",
    wordSpacing: "word-spacing: 0.2em",
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
      extrabold: "800",
      black: "900",
    },
    lineHeight: {
      tight: "0.9",
      normal: "1.0",
      relaxed: "1.2",
    },
    letterSpacing: {
      tight: "-0.05em",
      normal: "0",
      wide: "0.1em",
      wider: "0.2em",
    },
  },
  presets: {
    soft: {
      bg: "color.bg.secondary",
      color: "color.text.primary",
      border: "none",
      hover: {
        bg: "color.bg.tertiary",
      },
    },
    bold: {
      bg: "color.bg.primary",
      color: "color.text.primary",
      fontWeight: "bold",
      border: "none",
      hover: {
        color: "color.text.secondary",
      },
    },
    minimal: {
      bg: "transparent",
      color: "color.text.primary",
      border: "none",
      hover: {
        color: "color.text.secondary",
      },
    },
    outlined: {
      bg: "transparent",
      color: "color.text.primary",
      border: "2px solid",
      borderColor: "color.primary",
      hover: {
        bg: "color.primary",
        color: "color.text.inverse",
      },
    },
    text: {
      bg: "transparent",
      color: "color.text.primary",
      border: "none",
      textDecoration: "underline",
      textUnderlineOffset: "4px",
      hover: {
        color: "color.text.secondary",
      },
    },
  },
} as const;

export type TypographyTheme = typeof typography;

