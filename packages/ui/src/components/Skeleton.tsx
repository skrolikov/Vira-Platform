import React, { useEffect } from "react";
import { DesignProps } from "../types";
import { mergeDesign, getDesignClass, applyDesignClass } from "../utils/design-utils";
import { Box } from "./Box";

export interface SkeletonProps {
  variant?: "text" | "circular" | "rectangular";
  width?: number | string;
  height?: number | string;
  animation?: "pulse" | "wave" | "none";
  design?: DesignProps;
  className?: string;
  count?: number; // Количество skeleton элементов
}

/**
 * Skeleton - Компонент скелетона для отображения загрузки
 * 
 * Поддерживает:
 * - Разные варианты: text, circular, rectangular
 * - Анимации: pulse, wave, none
 * - Кастомные размеры
 */
export const Skeleton: React.FC<SkeletonProps> = ({
  variant = "rectangular",
  width,
  height,
  animation = "pulse",
  design,
  className,
  count = 1,
}) => {
  useEffect(() => {
    const styleId = "vira-skeleton-animation";
    if (!document.getElementById(styleId) && animation !== "none") {
      const style = document.createElement("style");
      style.id = styleId;
      style.textContent = `
        @keyframes skeleton-pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.4;
          }
        }
        @keyframes skeleton-wave {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        .vira-skeleton-pulse {
          animation: skeleton-pulse 1.5s ease-in-out infinite;
        }
        .vira-skeleton-wave {
          position: relative;
          overflow: hidden;
        }
        .vira-skeleton-wave::after {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.4),
            transparent
          );
          animation: skeleton-wave 1.6s ease-in-out infinite;
        }
      `;
      document.head.appendChild(style);
    }
  }, [animation]);

  const baseDesign: DesignProps = {
    bg: "#e5e7eb",
    ...(variant === "text" && {
      height: height || "1em",
      borderRadius: "4px",
      ...(width && { width }),
    }),
    ...(variant === "circular" && {
      borderRadius: "50%",
      width: width || height || "40px",
      height: height || width || "40px",
    }),
    ...(variant === "rectangular" && {
      width: width || "100%",
      height: height || "20px",
      borderRadius: "4px",
    }),
    ...design,
  };

  const mergedDesign = mergeDesign(baseDesign, design);
  const designClass = getDesignClass(mergedDesign);
  
  const animationClass =
    animation === "pulse"
      ? "vira-skeleton-pulse"
      : animation === "wave"
      ? "vira-skeleton-wave"
      : "";

  const finalClassName = applyDesignClass(className, `${designClass} ${animationClass}`.trim());

  if (count === 1) {
    return (
      <Box
        className={finalClassName}
        data-design={JSON.stringify(mergedDesign)}
        data-variant={variant}
      />
    );
  }

  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <Box
          key={index}
          className={finalClassName}
          design={{
            ...mergedDesign,
            ...(index < count - 1 && { marginBottom: "0.5rem" }),
          }}
          data-variant={variant}
        />
      ))}
    </>
  );
};

