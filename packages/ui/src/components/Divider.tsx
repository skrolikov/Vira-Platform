import React from "react";
import { DesignProps } from "../types";
import { mergeDesign, getDesignClass, applyDesignClass } from "../utils/design-utils";
import { Flex } from "./Flex";
import { Text } from "./Text";

export interface DividerProps {
  orientation?: "horizontal" | "vertical";
  label?: string;
  design?: DesignProps;
  className?: string;
}

/**
 * Divider - Компонент разделителя
 * 
 * Поддерживает:
 * - Горизонтальную и вертикальную ориентацию
 * - Текст посередине
 */
export const Divider: React.FC<DividerProps> = ({
  orientation = "horizontal",
  label,
  design,
  className,
}) => {
  if (orientation === "vertical") {
    const verticalDesign: DesignProps = {
      width: "1px",
      height: "100%",
      bg: "#e5e7eb",
      ...design,
    };

    const mergedDesign = mergeDesign(verticalDesign, design);
    const designClass = getDesignClass(mergedDesign);
    const finalClassName = applyDesignClass(className, designClass);

    return (
      <div
        className={finalClassName}
        data-design={JSON.stringify(mergedDesign)}
        style={{ minHeight: "20px" }}
      />
    );
  }

  const containerDesign: DesignProps = {
    display: "flex",
    alignItems: "center",
    width: "100%",
    ...design,
  };

  const lineDesign: DesignProps = {
    flex: 1,
    height: "1px",
    bg: "#e5e7eb",
    ...design,
  };

  const mergedContainerDesign = mergeDesign(containerDesign, design);
  const containerClass = getDesignClass(mergedContainerDesign);
  const finalClassName = applyDesignClass(className, containerClass);

  const lineClass = getDesignClass(lineDesign);

  if (label) {
    return (
      <Flex
        className={finalClassName}
        design={mergedContainerDesign}
        data-design={JSON.stringify(mergedContainerDesign)}
      >
        <div className={lineClass} data-design={JSON.stringify(lineDesign)} />
        <Text
          design={{
            padding: "0 16px",
            fontSize: "14px",
            color: "#6b7280",
            whiteSpace: "nowrap",
          }}
        >
          {label}
        </Text>
        <div className={lineClass} data-design={JSON.stringify(lineDesign)} />
      </Flex>
    );
  }

  return (
    <div
      className={lineClass}
      data-design={JSON.stringify(lineDesign)}
      style={{
        width: "100%",
        ...(design as any),
      }}
    />
  );
};

