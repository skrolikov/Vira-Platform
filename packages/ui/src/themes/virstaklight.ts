export const virstaklight = {
  color: {
    primary: "#9a6e141f",
    secondary: "#f7f4ee",
    danger: "#c43a3a",
    success: "#2c6e42",
    warning: "#c4922a",
    text: {
      primary: "#1c1a14",
      secondary: "#aca090",
      inverse: "#e5e6eb",
    },
    bg: {
      primary: "#faf8f4",
      secondary: "#f7f4ee",
      tertiary: "#f2efe8",
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
    sm: "0 1px 4px rgba(26,23,16,0.08)",
    md: "0 4px 16px rgba(26,23,16,0.1), 0 1px 4px rgba(26,23,16,0.06)",
    lg: "0 12px 40px rgba(26,23,16,0.14), 0 4px 12px rgba(26,23,16,0.08)",
  },
  typography: {
    fontFamily: {
      base: "'Crimson Pro', serif",
      heading: "'Cinzel', serif",
      mono: "JetBrains Mono, monospace",
    },
  },
} as const;

export type VirstakLightTheme = typeof virstaklight;
