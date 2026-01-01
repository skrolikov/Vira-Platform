import { DesignProps } from "../types";

// Базовый дизайн для компонента
export interface ComponentBase {
  [key: string]: any;
}

// Варианты компонента
export interface ComponentVariants {
  [variantName: string]: DesignProps;
}

// Объединяет base и variant
export function mergeVariant(
  base: ComponentBase | undefined,
  variant: DesignProps | undefined
): DesignProps {
  return {
    ...base,
    ...variant,
    // Правильно мержим hover, focus, active
    hover: {
      ...(base?.hover || {}),
      ...(variant?.hover || {}),
    },
    focus: {
      ...(base?.focus || {}),
      ...(variant?.focus || {}),
    },
    active: {
      ...(base?.active || {}),
      ...(variant?.active || {}),
    },
    // Мержим вложенные селекторы
    "&": {
      ...(base?.["&"] || {}),
      ...(variant?.["&"] || {}),
    },
  };
}

// Примеры базовых стилей и вариантов для Button
export const buttonBase: ComponentBase = {
  padding: 2,
  radius: "radius.md",
  fontSize: "typography.fontSize.md",
  fontWeight: "typography.fontWeight.medium",
  transition: "all 0.2s",
  cursor: "pointer",
  border: "none",
  outline: "none",
};

export const buttonVariants: ComponentVariants = {
  solid: {
    bg: "color.primary",
    color: "color.text.inverse",
    hover: {
      opacity: 0.9,
      transform: "translateY(-1px)",
      shadow: "shadow.md",
    },
    active: {
      transform: "translateY(0)",
      shadow: "shadow.sm",
    },
    focus: {
      outline: "none",
    },
  },
  outline: {
    border: "2px solid",
    borderColor: "color.primary",
    bg: "transparent",
    color: "color.primary",
    hover: {
      bg: "color.primary",
      color: "color.text.inverse",
      transform: "translateY(-1px)",
      shadow: "shadow.sm",
    },
    active: {
      transform: "translateY(0)",
    },
    focus: {
      outline: "none",
    },
  },
  ghost: {
    bg: "transparent",
    color: "color.primary",
    hover: {
      bg: "color.bg.secondary",
      transform: "translateY(-1px)",
    },
    active: {
      transform: "translateY(0)",
    },
    focus: {
      outline: "none",
    },
  },
  soft: {
    bg: "color.bg.secondary",
    color: "color.primary",
    hover: {
      bg: "color.bg.tertiary",
      transform: "translateY(-1px)",
    },
    active: {
      transform: "translateY(0)",
    },
    focus: {
      outline: "none",
    },
  },
};

