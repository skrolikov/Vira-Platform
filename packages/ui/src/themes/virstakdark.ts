export const virstakdark = {
  color: {
    primary: "#c4922a",
    secondary: "#4a7fa5",
    danger: "#a04040",
    success: "#4a9e6b",
    warning: "#c4922a",
    text: {
      primary: "#e8e6e1",
      secondary: "#9ea3a8",
      inverse: "#181818",
    },
    bg: {
      primary: "#0a0b0c",
      secondary: "#0d0e0f",
      tertiary: "#1e2228",
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
    sm: "0 2px 8px rgba(6, 4, 2, 0.35)",
    md: "0 6px 20px rgba(6, 4, 2, 0.45)",
    lg: "0 12px 32px rgba(6, 4, 2, 0.55)",
  },
  typography: {
    fontFamily: {
      base: "'Crimson Pro', serif",
      heading: "'Cinzel', serif",
      mono: "JetBrains Mono, monospace",
    },
  },
} as const;

export type VirstakDarkTheme = typeof virstakdark;
