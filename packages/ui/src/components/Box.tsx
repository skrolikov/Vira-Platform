import React from "react";
import { DesignProps } from "../types";
import { mergeDesign, getDesignClass, applyDesignClass, getDataDesignAttribute } from "../utils/design-utils";
import { presets, PresetName } from "../presets";

/**
 * Box - Простой контейнер (div) с поддержкой design props и пресетов
 * Используется когда Flex или Card избыточны
 */
export interface BoxProps extends React.HTMLAttributes<HTMLDivElement> {
  design?: DesignProps;
  preset?: PresetName;
  as?: keyof JSX.IntrinsicElements;
}

export const Box = React.forwardRef<HTMLDivElement, BoxProps>(({
  design,
  preset,
  className,
  as = "div",
  children,
  ...props
}, ref) => {
  // Пресет применяется только если указан явно
  const presetDesign = preset ? presets[preset] : undefined;
  
  // Объединяем пресет и design (design имеет приоритет)
  const finalDesign = presetDesign ? mergeDesign(presetDesign, design) : design;
  
  const designClass = finalDesign ? getDesignClass(finalDesign) : "";
  const finalClassName = applyDesignClass(className, designClass);

  const Element = as as any;

  return (
    <Element
      ref={ref}
      className={finalClassName}
      {...(finalDesign && getDataDesignAttribute(finalDesign) && { "data-design": getDataDesignAttribute(finalDesign) })}
      {...(preset && { "data-preset": preset })}
      {...props}
    >
      {children}
    </Element>
  );
});

Box.displayName = "Box";

