import React from "react";
import { DesignProps } from "../types";
import { mergeDesign, getDesignClass, applyDesignClass } from "../utils/design-utils";
import { presets, PresetName } from "../presets";

export interface CardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "as"> {
  design?: DesignProps;
  preset?: PresetName;
  as?: keyof JSX.IntrinsicElements;
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ 
  design, 
  preset,
  as,
  children, 
  className,
  ...props 
}) => {
  // Дефолтные стили для Card
  const defaultDesign: DesignProps = {
    padding: 3,
    radius: "radius.md",
    bg: "color.bg.primary",
  };
  
  // Пресет применяется только если указан явно
  const presetDesign = preset ? presets[preset] : undefined;
  
  // Объединяем: default -> preset -> design (design имеет наивысший приоритет)
  let finalDesign = defaultDesign;
  if (presetDesign) {
    finalDesign = mergeDesign(finalDesign, presetDesign);
  }
  if (design) {
    finalDesign = mergeDesign(finalDesign, design);
  }
  
  const designClass = finalDesign ? getDesignClass(finalDesign) : "";
  const finalClassName = applyDesignClass(className, designClass);
  
  const Component = (as || "div") as keyof JSX.IntrinsicElements;
  
  return (
    <Component 
      className={finalClassName}
      {...(finalDesign && { "data-design": JSON.stringify(finalDesign) })}
      {...(preset && { "data-preset": preset })}
      {...(props as any)}
    >
      {children}
    </Component>
  );
};

