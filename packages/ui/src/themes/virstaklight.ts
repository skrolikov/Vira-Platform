export const virstaklight = {
  color: {
    primary: "#b6811a",
    secondary: "#a67a1d",
    danger: "#9c4a2b",
    success: "#8c6430",
    warning: "#a67a1d",
    text: {
      primary: "#3f2d1f",
      secondary: "#8c6430",
      inverse: "#f9f2e4",
    },
    bg: {
      primary: "#f7ebd9",
      secondary: "#eed8b8",
      tertiary: "#e2bf8f",
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
    sm: "0 2px 8px rgba(94, 67, 43, 0.12)",
    md: "0 6px 20px rgba(94, 67, 43, 0.2)",
    lg: "0 12px 32px rgba(94, 67, 43, 0.28)",
  },
} as const;

export type VirstakLightTheme = typeof virstaklight;
