import React from "react";
import { DesignProps } from "../types";
import { mergeDesign, getDesignClass, applyDesignClass } from "../utils/design-utils";

export interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
  design?: DesignProps;
  columns?: number | string;
  gap?: number | string;
  children: React.ReactNode;
}

export const Grid: React.FC<GridProps> = ({ 
  design,
  columns,
  gap = 3,
  children,
  className,
  ...props 
}) => {
  const defaultDesign: DesignProps = {
    display: "grid",
    gap: typeof gap === "number" ? gap : gap,
    ...(columns && {
      gridTemplateColumns: typeof columns === "number" 
        ? `repeat(${columns}, 1fr)` 
        : columns,
    }),
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

