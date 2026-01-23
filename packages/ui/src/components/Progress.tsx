import React from "react";
import { DesignProps } from "../types";
import { mergeDesign, getDesignClass, applyDesignClass } from "../utils/design-utils";
import { Text } from "./Text";
import { Flex } from "./Flex";

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number; // 0-100
  max?: number;
  label?: string;
  showValue?: boolean;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "gradient" | "striped" | "animated";
  color?: string;
  design?: DesignProps;
}

/**
 * Progress - Компонент индикатора прогресса
 * 
 * Поддерживает:
 * - Разные размеры
 * - Варианты отображения (градиент, полосы, анимация)
 * - Кастомные цвета
 * - Отображение значения
 */
export const Progress: React.FC<ProgressProps> = ({
  value,
  max = 100,
  label,
  showValue = false,
  size = "md",
  variant = "default",
  color,
  design,
  className,
  ...props
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  const sizeMap = {
    sm: { height: "4px", fontSize: "12px" },
    md: { height: "8px", fontSize: "14px" },
    lg: { height: "12px", fontSize: "16px" },
  };

  const currentSize = sizeMap[size];

  const containerDesign: DesignProps = {
    width: "100%",
    ...design,
  };

  const trackDesign: DesignProps = {
    width: "100%",
    height: currentSize.height,
    bg: "#e5e7eb",
    borderRadius: "radius.full",
    overflow: "hidden",
    position: "relative",
  };

  const fillColor = color || "#3b82f6";

  const fillDesign: DesignProps = {
    height: "100%",
    width: `${percentage}%`,
    bg: variant === "gradient"
      ? `linear-gradient(90deg, ${fillColor} 0%, ${fillColor}dd 100%)`
      : fillColor,
    borderRadius: "radius.full",
    transition: "width 0.3s ease",
    ...(variant === "striped" && {
      backgroundImage: `repeating-linear-gradient(
        45deg,
        transparent,
        transparent 10px,
        rgba(255, 255, 255, 0.1) 10px,
        rgba(255, 255, 255, 0.1) 20px
      )`,
    }),
    ...(variant === "animated" && {
      animation: "progress-pulse 2s ease-in-out infinite",
    }),
  };

  const mergedContainerDesign = mergeDesign(containerDesign, design);
  const containerClass = getDesignClass(mergedContainerDesign);
  const finalContainerClassName = applyDesignClass(className, containerClass);

  const trackClass = getDesignClass(trackDesign);
  const fillClass = getDesignClass(fillDesign);

  // Добавляем CSS анимацию при необходимости
  React.useEffect(() => {
    if (variant === "animated") {
      const styleId = "vira-progress-animation";
      if (!document.getElementById(styleId)) {
        const style = document.createElement("style");
        style.id = styleId;
        style.textContent = `
          @keyframes progress-pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.7; }
          }
        `;
        document.head.appendChild(style);
      }
    }
  }, [variant]);

  return (
    <div
      className={finalContainerClassName}
      data-design={JSON.stringify(mergedContainerDesign)}
      {...props}
    >
      {(label || showValue) && (
        <Flex
          design={{
            justifyContent: "space-between",
            alignItems: "center",
            
          }}
        >
          {label && (
            <Text
              design={{
                fontSize: currentSize.fontSize,
                color: "#374151",
                fontWeight: "500",
              }}
            >
              {label}
            </Text>
          )}
          {showValue && (
            <Text
              design={{
                fontSize: currentSize.fontSize,
                color: "#6b7280",
                fontWeight: "500",
              }}
            >
              {Math.round(percentage)}%
            </Text>
          )}
        </Flex>
      )}
      <div className={trackClass} data-design={JSON.stringify(trackDesign)}>
        <div className={fillClass} data-design={JSON.stringify(fillDesign)} />
      </div>
    </div>
  );
};

