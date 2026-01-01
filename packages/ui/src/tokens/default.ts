export const tokens = {
  color: {
    primary: "#3b82f6",
    secondary: "#8b5cf6",
    danger: "#ef4444",
    success: "#10b981",
    warning: "#f59e0b",
    text: {
      primary: "#1f2937",
      secondary: "#6b7280",
      inverse: "#ffffff",
    },
    bg: {
      primary: "#ffffff",
      secondary: "#f9fafb",
      tertiary: "#f3f4f6",
    },
  },
  radius: {
    sm: "6px",
    md: "10px",
    lg: "16px",
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
    sm: "0 1px 2px rgba(0,0,0,.05)",
    md: "0 4px 12px rgba(0,0,0,.1)",
    lg: "0 10px 25px rgba(0,0,0,.15)",
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
} as const;

export type Tokens = typeof tokens;

