import React from "react";
import { DesignProps } from "../types";
import { mergeDesign, getDesignClass, applyDesignClass } from "../utils/design-utils";

export interface StackProps extends React.HTMLAttributes<HTMLDivElement> {
  design?: DesignProps;
  direction?: "row" | "column";
  space?: number | string;
  align?: "flex-start" | "flex-end" | "center" | "stretch";
  justify?: "flex-start" | "flex-end" | "center" | "space-between" | "space-around";
  wrap?: boolean;
  children: React.ReactNode;
}

/**
 * Stack - Вертикальный/горизонтальный контейнер с равномерными отступами между элементами
 * 
 * @example
 * <Stack space={3}> // вертикальный стек с отступом 3
 *   <div>Item 1</div>
 *   <div>Item 2</div>
 * </Stack>
 * 
 * <Stack direction="row" space={2}> // горизонтальный стек
 *   <div>Item 1</div>
 *   <div>Item 2</div>
 * </Stack>
 */
export const Stack: React.FC<StackProps> = ({ 
  design,
  direction = "column",
  space = 3,
  align,
  justify,
  wrap = false,
  children,
  className,
  ...props 
}) => {
  const defaultDesign: DesignProps = {
    display: "flex",
    flexDirection: direction,
    gap: space,
    ...(align && { alignItems: align }),
    ...(justify && { justifyContent: justify }),
    ...(wrap && { flexWrap: "wrap" }),
  };
  
  const mergedDesign = mergeDesign(defaultDesign, design);
  const designClass = getDesignClass(mergedDesign);
  const finalClassName = applyDesignClass(className, designClass);
  
  return (
    <div 
      className={finalClassName}
      data-design={JSON.stringify(mergedDesign)}
      {...props}
    >
      {children}
    </div>
  );
};

