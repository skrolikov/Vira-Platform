// Neomorphism theme - мягкие тени, светлые тона, эффект объема
export const neomorph = {
  color: {
    primary: "#6c7ae0",
    secondary: "#8e9aff",
    success: "#51cf66",
    warning: "#ffd43b",
    danger: "#ff6b6b",
    text: {
      primary: "#546e7a",
      secondary: "#636e72",
      inverse: "#ffffff",
    },
    bg: {
      primary: "#e0e5ec",
      secondary: "#d1d9e6",
      tertiary: "#c4ced8",
    },
  },
  radius: {
    sm: "12px",
    md: "16px",
    lg: "24px",
    full: "9999px",
  },
  spacing: {
    1: "4px",
    2: "8px",
    3: "12px",
    4: "16px",
    5: "20px",
    6: "24px",
    7: "32px",
    8: "40px",
    9: "48px",
    10: "64px",
  },
  shadow: {
    sm: "6px 6px 12px #b8bec5, -6px -6px 12px #ffffff",
    md: "6px 6px 12px rgba(163, 177, 198, 0.6), -6px -6px 12px rgba(255, 255, 255, 0.5)",
    lg: "12px 12px 24px #b8bec5, -12px -12px 24px #ffffff",
    // Вдавленный эффект (inset)
    inset: "inset 6px 6px 12px #b8bec5, inset -6px -6px 12px #ffffff",
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
    glass: {
      padding: 7, // 32px через spacing.7
      radius: "32px", // 32px напрямую
    },
    // Переопределения для карточек
    cardDefault: {
      padding: 7, // 32px
      radius: "32px", // 32px
    },
    // Переопределения для кнопок в neomorph
    primary: {
      bg: "color.bg.primary",
      shadow: "shadow.md",
      hover: {
        bg: "color.primary", // Будет использован с rgba(..., 0.1)
      },
      active: {
        shadow: "shadow.inset",
      },
    },
    secondary: {
      bg: "color.bg.primary",
      shadow: "shadow.md",
      color: "color.text.primary",
      hover: {
        bg: "color.secondary",
      },
      active: {
        shadow: "shadow.inset",
      },
    },
    danger: {
      bg: "color.bg.primary",
      shadow: "shadow.md",
      color: "color.danger",
      hover: {
        bg: "color.danger",
      },
      active: {
        shadow: "shadow.inset",
      },
    },
    success: {
      bg: "color.bg.primary",
      shadow: "shadow.md",
      hover: {
        bg: "color.success",
      },
      active: {
        shadow: "shadow.inset",
      },
    },
    outline: {
      bg: "color.bg.primary",
      shadow: "shadow.md",
      active: {
        shadow: "shadow.inset",
      },
    },
    soft: {
      bg: "color.bg.secondary",
      color: "color.text.primary",
      shadow: "shadow.sm",
      hover: {
        bg: "color.bg.tertiary",
        shadow: "shadow.md",
      },
      active: {
        shadow: "shadow.inset",
      },
    },
    // Переопределения для инпутов в neomorph
    inputDefault: {
      shadow: "shadow.inset",
    },
    inputSoft: {
      shadow: "shadow.inset",
    },
    inputOutline: {
      shadow: "shadow.inset",
    },
  },
} as const;

export type NeomorphTheme = typeof neomorph;

