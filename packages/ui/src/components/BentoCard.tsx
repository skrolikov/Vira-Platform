import React from "react";
import { DesignProps } from "../types";
import { mergeDesign, getDesignClass, applyDesignClass } from "../utils/design-utils";

export interface BentoCardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "as"> {
  design?: DesignProps;
  as?: keyof JSX.IntrinsicElements;
  children: React.ReactNode;
  onClick?: () => void;
  interactive?: boolean;
  gridArea?: string;
  gradient?: string;
  glassEffect?: boolean;
}

export const BentoCard: React.FC<BentoCardProps> = ({ 
  design, 
  as,
  children, 
  className,
  onClick,
  interactive = false,
  gridArea,
  gradient,
  glassEffect = false,
  ...props 
}) => {
  // Базовые стили для BentoCard
  const baseDesign: DesignProps = {
    padding: 3,
    borderRadius: "radius.md",
    bg: gradient || "color.bg.primary",
    position: "relative",
    overflow: "hidden",
    transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
    border: "1px solid",
    borderColor: "rgba(255, 255, 255, 0.5)",
    ...(interactive && {
      cursor: "pointer",
      hover: {
        transform: "translateY(-4px)",
        shadow: "0 20px 40px rgba(0, 0, 0, 0.15)",
        borderColor: "rgba(255, 255, 255, 0.2)",
      },
      active: {
        transform: "translateY(-2px)",
      },
    }),
    ...(gridArea && { gridArea }),
  };
  
  // Объединяем базовый дизайн с пользовательским
  const finalDesign = design ? mergeDesign(baseDesign, design) : baseDesign;
  
  const designClass = finalDesign ? getDesignClass(finalDesign) : "";
  const finalClassName = applyDesignClass(className, designClass);
  
  const Component = (as || "div") as keyof JSX.IntrinsicElements;
  
  return (
    <Component 
      className={finalClassName}
      onClick={onClick}
      {...(finalDesign && { "data-design": JSON.stringify(finalDesign) })}
      {...(props as any)}
      style={{
        ...(props as any)?.style,
        ...(gradient && { background: gradient }),
        ...(gridArea && { gridArea }),
      }}
    >
      {children}
    </Component>
  );
};
