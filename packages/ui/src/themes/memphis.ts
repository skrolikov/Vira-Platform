export const memphis = {
  color: {
    primary: "#ff6b9d", // Hot Pink
    secondary: "#4ecdc4", // Turquoise
    danger: "#ff6b9d",
    success: "#95e1d3",
    warning: "#fce38a",
    accent: "#ffd93d", // Yellow
    text: {
      primary: "#2c3e50", // Dark blue-gray
      secondary: "#34495e",
      inverse: "#ffffff",
    },
    bg: {
      primary: "#ffffff",
      secondary: "#f8f9fa",
      tertiary: "#e9ecef",
    },
  },
  radius: {
    sm: "0px", // Sharp corners with geometric shapes
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
    sm: "4px 4px 0px #ff6b9d, 8px 8px 0px rgba(255, 107, 157, 0.3)",
    md: "6px 6px 0px #4ecdc4, 12px 12px 0px rgba(78, 205, 196, 0.3)",
    lg: "8px 8px 0px #ff6b9d, 16px 16px 0px rgba(255, 107, 157, 0.4)",
  },
  effect: {
    gradient: "linear-gradient(135deg, #ff6b9d 0%, #4ecdc4 50%, #fce38a 100%)",
    gradientVertical: "linear-gradient(180deg, #ff6b9d 0%, #4ecdc4 100%)",
    zigzag: "background: repeating-linear-gradient(45deg, #ff6b9d, #ff6b9d 10px, #4ecdc4 10px, #4ecdc4 20px)",
    dots: "radial-gradient(circle, #ff6b9d 2px, transparent 2px)",
    stripes: "repeating-linear-gradient(90deg, #ff6b9d 0px, #ff6b9d 10px, #4ecdc4 10px, #4ecdc4 20px)",
    geometric: "polygon(0% 0%, 100% 0%, 100% 75%, 75% 75%, 75% 100%, 50% 75%, 0% 75%)",
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
        borderColor: "color.secondary",
        shadow: "shadow.md",
      },
    },
    gradient: {
      bg: "linear-gradient(135deg, color.primary 0%, color.secondary 100%)",
      color: "color.text.inverse",
      border: "none",
      shadow: "shadow.md",
      hover: {
        bg: "linear-gradient(135deg, color.secondary 0%, color.primary 100%)",
        shadow: "shadow.lg",
      },
    },
    geometric: {
      bg: "color.primary",
      color: "color.text.inverse",
      border: "4px solid",
      borderColor: "color.secondary",
      shadow: "shadow.md",
      hover: {
        bg: "color.secondary",
        borderColor: "color.primary",
        shadow: "shadow.lg",
      },
    },
    playful: {
      bg: "color.bg.primary",
      color: "color.primary",
      border: "3px solid",
      borderColor: "color.primary",
      shadow: "4px 4px 0px color.secondary",
      hover: {
        shadow: "6px 6px 0px color.accent",
        borderColor: "color.secondary",
        transform: "translate(-2px, -2px)",
      },
    },
    bold: {
      bg: "color.primary",
      color: "color.text.inverse",
      border: "none",
      shadow: "shadow.md",
      hover: {
        bg: "color.secondary",
        shadow: "shadow.lg",
      },
    },
  },
} as const;

export type MemphisTheme = typeof memphis;

