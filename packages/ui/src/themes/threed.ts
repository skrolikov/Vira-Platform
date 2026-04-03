export const threed = {
  color: {
    primary: "#007aff", // Apple Blue
    secondary: "#5856d6", // Apple Purple
    danger: "#ff3b30", // Apple Red
    success: "#34c759", // Apple Green
    warning: "#ff9500", // Apple Orange
    text: {
      primary: "#1d1d1f", // Almost black
      secondary: "#86868b", // Gray
      inverse: "#ffffff", // White
    },
    bg: {
      primary: "rgba(255, 255, 255, 0.5)", // Semi-transparent white for glass effect
      secondary: "rgba(242, 242, 247, 0.5)", // Light gray glass
      tertiary: "rgba(229, 229, 234, 0.5)", // Lighter gray glass
    },
    gradient: {
      primary: "linear-gradient(45deg, var(--color-primary), var(--color-secondary))",
    }
  },
  radius: {
    sm: "15px",
    md: "30px",
    lg: "40px",
    full: "9999px",
  },
  space: {
    1: "5px",
    2: "10px",
    3: "15px",
    4: "24px",
    5: "32px",
    6: "48px",
  },
  shadow: {
    sm: "0 2px 8px rgba(0, 0, 0, 0.08), 0 1px 4px rgba(0, 0, 0, 0.04)",
    md: "0 5px 5px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.08)",
    lg: "0 8px 32px rgba(0, 0, 0, 0.16), 0 4px 16px rgba(0, 0, 0, 0.12)",
  },
  effect: {
    glass: {
      background: "rgba(255,255,255,0.7)",
      backdropFilter: "blur(20px) saturate(180%)",
      WebkitBackdropFilter: "blur(20px) saturate(180%)",
      border: "1px solid",
      borderColor: "rgb(255 255 255 / 30%)",
      shadow: "shadow.md",
    },

    glassLight: {
      background: "rgba(255,255,255,0.55)",
      backdropFilter: "blur(10px) saturate(140%)",
      WebkitBackdropFilter: "blur(10px) saturate(140%)",
      border: "1px solid",
      borderColor: "rgb(255 255 255 / 50%)",
      shadow: "0 4px 16px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.08), inset 0px 1px 3px 0px rgb(255 255 255)",
    },

    glassHeavy: {
      background: "rgba(255,255,255,0.85)",
      backdropFilter: "blur(40px) saturate(200%)",
      WebkitBackdropFilter: "blur(40px) saturate(200%)",
      border: "1px solid",
      borderColor: "rgb(255 255 255 / 70%)",
      shadow: "shadow.md",
    },

    glow: {
      boxShadow:
        "0 0 20px rgba(0,122,255,0.35), 0 0 40px rgba(0,122,255,0.15)",
    },

    liquid: {
      background:
        "linear-gradient(135deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.06) 100%)",
    },

    shimmer: {
      background:
        "linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent)",
    },
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
  // Переопределения для пресетов в контексте этой темы
  presets: {
    soft: {
      bg: "rgba(242, 242, 247, 0.6)",
      color: "color.text.primary",
      shadow: "shadow.sm",
      border: "1px solid",
      borderColor: "rgba(0, 0, 0, 0.1)",
      hover: {
        bg: "rgba(242, 242, 247, 0.8)",
        shadow: "shadow.md",
      },
    },
    glass: {
      bg: "rgba(255, 255, 255, 0.7)",
      color: "color.text.primary",
      border: "1px solid",
      borderColor: "rgba(255, 255, 255, 0.3)",
      shadow: "shadow.md",
      backdropFilter: "blur(20px) saturate(180%)",
      WebkitBackdropFilter: "blur(20px) saturate(180%)",
      hover: {
        bg: "rgba(255, 255, 255, 0.85)",
        shadow: "shadow.lg",
        borderColor: "rgba(255, 255, 255, 0.5)",
      },
    },
    liquid: {
      bg: "linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.05) 100%)",
      color: "color.text.primary",
      border: "1px solid",
      borderColor: "rgba(255, 255, 255, 0.2)",
      shadow: "shadow.md",
      backdropFilter: "blur(30px) saturate(200%)",
      WebkitBackdropFilter: "blur(30px) saturate(200%)",
      hover: {
        bg: "linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.1) 100%)",
        shadow: "shadow.lg",
        borderColor: "rgba(255, 255, 255, 0.4)",
      },
    },
    elevated: {
      bg: "rgba(255, 255, 255, 0.9)",
      color: "color.text.primary",
      shadow: "shadow.lg",
      border: "1px solid",
      borderColor: "rgba(0, 0, 0, 0.05)",
      hover: {
        shadow: "0 12px 48px rgba(0, 0, 0, 0.2), 0 6px 24px rgba(0, 0, 0, 0.15)",
      },
    },
    outlined: {
      bg: "transparent",
      color: "color.primary",
      border: "1.5px solid",
      borderColor: "color.primary",
      hover: {
        bg: "rgba(0, 122, 255, 0.08)",
      },
    },
  },
} as const;

export type ThreedTheme = typeof threed;

