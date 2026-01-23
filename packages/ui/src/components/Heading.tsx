import React from "react";
import { DesignProps } from "../types";
import { mergeDesign, getDesignClass, applyDesignClass } from "../utils/design-utils";

export interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  design?: DesignProps;
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  children: React.ReactNode;
}

export const Heading: React.FC<HeadingProps> = ({ 
  design,
  level = 1,
  children,
  className,
  ...props 
}) => {
  const levelDesigns: Record<number, DesignProps> = {
    1: {
      fontSize: "typography.fontSize.2xl",
      fontWeight: "typography.fontWeight.bold",
    },
    2: {
      fontSize: "typography.fontSize.xl",
      fontWeight: "typography.fontWeight.semibold",
    },
    3: {
      fontSize: "typography.fontSize.lg",
      fontWeight: "typography.fontWeight.semibold",
    },
    4: {
      fontSize: "typography.fontSize.md",
      fontWeight: "typography.fontWeight.medium",
    },
    5: {
      fontSize: "typography.fontSize.sm",
      fontWeight: "typography.fontWeight.medium",
    },
    6: {
      fontSize: "typography.fontSize.xs",
      fontWeight: "typography.fontWeight.medium",
    },
  };
  
  const defaultDesign = levelDesigns[level] || {};
  const mergedDesign = mergeDesign(defaultDesign, design);
  const designClass = getDesignClass(mergedDesign);
  const finalClassName = applyDesignClass(className, designClass);
  
  const commonProps = {
    className: finalClassName,
    "data-design": JSON.stringify(mergedDesign),
    ...props,
  };
  
  switch (level) {
    case 1:
      return <h1 {...commonProps}>{children}</h1>;
    case 2:
      return <h2 {...commonProps}>{children}</h2>;
    case 3:
      return <h3 {...commonProps}>{children}</h3>;
    case 4:
      return <h4 {...commonProps}>{children}</h4>;
    case 5:
      return <h5 {...commonProps}>{children}</h5>;
    case 6:
      return <h6 {...commonProps}>{children}</h6>;
    default:
      return <h1 {...commonProps}>{children}</h1>;
  }
};

