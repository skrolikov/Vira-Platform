export const vintage = {
  color: {
    primary: "#8b4513", // Saddle Brown
    secondary: "#cd853f", // Peru
    danger: "#a0522d", // Sienna
    success: "#6b8e23", // Olive Drab
    warning: "#daa520", // Goldenrod
    text: {
      primary: "#3d2817", // Dark brown
      secondary: "#5c4033", // Medium brown
      inverse: "#f5e6d3", // Cream
    },
    bg: {
      primary: "#f5e6d3", // Cream
      secondary: "#e8d5b7", // Light beige
      tertiary: "#d4c4a8", // Medium beige
    },
  },
  radius: {
    sm: "2px",
    md: "4px",
    lg: "8px",
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
    sm: "0 2px 4px rgba(139, 69, 19, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
    md: "0 4px 8px rgba(139, 69, 19, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
    lg: "0 8px 16px rgba(139, 69, 19, 0.4), inset 0 2px 0 rgba(255, 255, 255, 0.1)",
  },
  effect: {
    sepia: "filter: sepia(30%) saturate(120%)",
    aged: "background: linear-gradient(135deg, rgba(139, 69, 19, 0.1) 0%, rgba(205, 133, 63, 0.1) 100%)",
    paper: "background-image: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(139, 69, 19, 0.03) 2px, rgba(139, 69, 19, 0.03) 4px)",
    vintage: "box-shadow: inset 0 0 20px rgba(139, 69, 19, 0.1), 0 0 10px rgba(139, 69, 19, 0.2)",
    worn: "background: linear-gradient(135deg, rgba(139, 69, 19, 0.05) 25%, transparent 25%, transparent 50%, rgba(139, 69, 19, 0.05) 50%, rgba(139, 69, 19, 0.05) 75%, transparent 75%)",
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
  presets: {
    soft: {
      bg: "color.bg.secondary",
      color: "color.text.primary",
      shadow: "shadow.sm",
      border: "1px solid",
      borderColor: "rgba(139, 69, 19, 0.2)",
      hover: {
        bg: "color.bg.tertiary",
        shadow: "shadow.md",
        borderColor: "rgba(139, 69, 19, 0.4)",
      },
    },
    aged: {
      bg: "color.bg.primary",
      color: "color.text.primary",
      border: "1px solid",
      borderColor: "rgba(139, 69, 19, 0.3)",
      shadow: "shadow.md",
      hover: {
        shadow: "shadow.lg",
        borderColor: "rgba(139, 69, 19, 0.5)",
      },
    },
    paper: {
      bg: "color.bg.primary",
      color: "color.text.primary",
      border: "1px solid",
      borderColor: "rgba(139, 69, 19, 0.2)",
      shadow: "shadow.sm",
      hover: {
        bg: "color.bg.secondary",
        shadow: "shadow.md",
      },
    },
    sepia: {
      bg: "color.bg.secondary",
      color: "color.text.primary",
      border: "2px solid",
      borderColor: "color.primary",
      shadow: "shadow.md",
      hover: {
        borderColor: "color.secondary",
        shadow: "shadow.lg",
      },
    },
  },
} as const;

export type VintageTheme = typeof vintage;

