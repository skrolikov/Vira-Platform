export const virstakdark = {
  color: {
    primary: "#d4a843",
    secondary: "#b8860b",
    danger: "#8b3a1a",
    success: "#c8a96e",
    warning: "#b8860b",
    text: {
      primary: "#f0e6cc",
      secondary: "#c8a96e",
      inverse: "#0a0804",
    },
    bg: {
      primary: "#0f0905",
      secondary: "#1d130a",
      tertiary: "#2a1b0f",
    },
  },
  radius: {
    sm: "8px",
    md: "12px",
    lg: "18px",
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
    sm: "0 2px 8px rgba(6, 4, 2, 0.35)",
    md: "0 6px 20px rgba(6, 4, 2, 0.45)",
    lg: "0 12px 32px rgba(6, 4, 2, 0.55)",
  },
} as const;

export type VirstakDarkTheme = typeof virstakdark;
