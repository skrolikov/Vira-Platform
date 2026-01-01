import React from "react";
import type { DesignProps } from "@vira-ui/ui";
import { mergeDesign, getDesignClass, applyDesignClass } from "@vira-ui/ui";
import type { ViraComponentProps } from "@vira-ui/core";

/**
 * ViraSkeleton - Компонент для skeleton loading states
 * Показывает плейсхолдеры во время загрузки
 */

export interface ViraSkeletonProps extends ViraComponentProps {
  variant?: "text" | "circular" | "rectangular";
  width?: string | number;
  height?: string | number;
  animation?: "pulse" | "wave" | "none";
  count?: number; // Количество skeleton элементов
  className?: string;
}

export const ViraSkeleton: React.FC<ViraSkeletonProps> = ({
  variant = "text",
  width,
  height,
  animation = "pulse",
  count = 1,
  design,
  className,
  ...props
}) => {
  const baseDesign: DesignProps = {
    bg: "color.bg.tertiary",
    borderRadius: variant === "circular" ? "50%" : variant === "rectangular" ? "radius.md" : "radius.sm",
    ...(width && { width: typeof width === "number" ? `${width}px` : width }),
    ...(height && { height: typeof height === "number" ? `${height}px` : height }),
    ...(!height && variant === "text" && { height: "1em" }),
    ...(!width && variant === "text" && { width: "100%" }),
    ...design,
  };

  const mergedDesign = mergeDesign(baseDesign, design);
  const designClass = getDesignClass(mergedDesign);

  const animationClass = animation !== "none" ? `vira-skeleton-${animation}` : "";

  const finalClassName = applyDesignClass(
    className,
    `${designClass} ${animationClass}`.trim()
  );

  if (count === 1) {
    return (
      <div
        className={finalClassName}
        data-design={JSON.stringify(mergedDesign)}
        data-variant={variant}
        {...props}
      />
    );
  }

  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className={finalClassName}
          data-design={JSON.stringify(mergedDesign)}
          data-variant={variant}
          style={index < count - 1 ? { marginBottom: "0.5rem" } : undefined}
          {...props}
        />
      ))}
    </>
  );
};

