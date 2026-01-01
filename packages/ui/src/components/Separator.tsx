import React from "react";
import { DesignProps } from "../types";
import { mergeDesign, getDesignClass, applyDesignClass } from "../utils/design-utils";

export interface SeparatorProps {
  orientation?: "horizontal" | "vertical";
  decorative?: boolean;
  design?: DesignProps;
  className?: string;
}

/**
 * Separator - Компонент разделителя (аналог Divider, но более простой)
 * 
 * Поддерживает:
 * - Горизонтальную и вертикальную ориентацию
 * - Декоративный вариант (без семантической роли)
 */
export const Separator: React.FC<SeparatorProps> = ({
  orientation = "horizontal",
  decorative = true,
  design,
  className,
}) => {
  const separatorDesign: DesignProps = {
    ...(orientation === "horizontal" && {
      width: "100%",
      height: "1px",
    }),
    ...(orientation === "vertical" && {
      width: "1px",
      height: "100%",
    }),
    bg: "#e5e7eb",
    flexShrink: 0,
    ...design,
  };

  const mergedDesign = mergeDesign(separatorDesign, design);
  const designClass = getDesignClass(mergedDesign);
  const finalClassName = applyDesignClass(className, designClass);

  const Component = decorative ? "div" : "hr";

  return (
    <Component
      className={finalClassName}
      data-design={JSON.stringify(mergedDesign)}
      role={decorative ? "presentation" : undefined}
      style={{
        ...(orientation === "horizontal" && {
          width: "100%",
          height: "1px",
          border: "none",
          margin: 0,
          padding: 0,
        }),
        ...(orientation === "vertical" && {
          width: "1px",
          height: "100%",
          border: "none",
          margin: 0,
          padding: 0,
        }),
        backgroundColor: "#e5e7eb",
        ...(design as any),
      }}
    />
  );
};

