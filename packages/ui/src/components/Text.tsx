import React from "react";
import { DesignProps } from "../types";
import { getDesignClass, applyDesignClass, getDataDesignAttribute } from "../utils/design-utils";

export interface TextProps extends React.HTMLAttributes<HTMLElement> {
  design?: DesignProps;
  as?: keyof JSX.IntrinsicElements;
  children: React.ReactNode;
  truncate?: boolean; // <-- обрезать текст с многоточием
  size?: "xs" | "sm" | "base" | "md" | "lg" | "xl"; // <-- размеры текста
}

const sizeMap: Record<string, string> = {
  xs: "typography.fontSize.xs",
  sm: "typography.fontSize.sm",
  base: "typography.fontSize.base",
  md: "typography.fontSize.md",
  lg: "typography.fontSize.lg",
  xl: "typography.fontSize.xl",
};

export const Text: React.FC<TextProps> = ({ 
  design,
  as = "p",
  children,
  truncate,
  size = "md",
  className,
  ...props 
}) => {
  let textDesign: DesignProps = { ...design };

  // Применяем truncate
  if (truncate) {
    textDesign = {
      ...textDesign,
      overflow: "hidden",
      whiteSpace: "nowrap",
      textOverflow: "ellipsis",
    };
  }

  // Применяем размер
  if (size) {
    textDesign = {
      ...textDesign,
      fontSize: sizeMap[size] || sizeMap.md,
    };
  }

  const designClass = getDesignClass(textDesign);
  const finalClassName = applyDesignClass(className, designClass);

  const elementType = (as || "p") as keyof JSX.IntrinsicElements;

  return React.createElement(
    elementType,
    {
      className: finalClassName,
      ...(design && getDataDesignAttribute(design) && { "data-design": getDataDesignAttribute(design) }),
      ...props,
    },
    children
  );
};
