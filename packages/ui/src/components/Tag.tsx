import React from "react";
import { DesignProps } from "../types";
import { mergeDesign, getDesignClass, applyDesignClass } from "../utils/design-utils";
import { Text } from "./Text";
import { Flex } from "./Flex";
import { X } from "lucide-react";

export interface TagProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
  onClose?: () => void;
  closable?: boolean;
  color?: "default" | "primary" | "success" | "warning" | "danger";
  size?: "sm" | "md" | "lg";
  variant?: "solid" | "outline" | "soft";
  design?: DesignProps;
}

/**
 * Tag - Компонент тега/чипа
 * 
 * Поддерживает:
 * - Разные цвета и варианты
 * - Возможность закрытия
 * - Разные размеры
 */
export const Tag: React.FC<TagProps> = ({
  children,
  onClose,
  closable = false,
  color = "default",
  size = "md",
  variant = "solid",
  design,
  className,
  ...props
}) => {
  const colorMap = {
    default: {
      solid: { bg: "#f3f4f6", color: "#374151", border: "transparent" },
      outline: { bg: "transparent", color: "#374151", border: "#d1d5db" },
      soft: { bg: "#f9fafb", color: "#374151", border: "transparent" },
    },
    primary: {
      solid: { bg: "#3b82f6", color: "#ffffff", border: "transparent" },
      outline: { bg: "transparent", color: "#3b82f6", border: "#3b82f6" },
      soft: { bg: "#eff6ff", color: "#1e40af", border: "transparent" },
    },
    success: {
      solid: { bg: "#10b981", color: "#ffffff", border: "transparent" },
      outline: { bg: "transparent", color: "#10b981", border: "#10b981" },
      soft: { bg: "#ecfdf5", color: "#065f46", border: "transparent" },
    },
    warning: {
      solid: { bg: "#f59e0b", color: "#ffffff", border: "transparent" },
      outline: { bg: "transparent", color: "#f59e0b", border: "#f59e0b" },
      soft: { bg: "#fffbeb", color: "#78350f", border: "transparent" },
    },
    danger: {
      solid: { bg: "#ef4444", color: "#ffffff", border: "transparent" },
      outline: { bg: "transparent", color: "#ef4444", border: "#ef4444" },
      soft: { bg: "#fef2f2", color: "#991b1b", border: "transparent" },
    },
  };

  const sizeMap = {
    sm: { padding: "2px 8px", fontSize: "12px", iconSize: 12 },
    md: { padding: "4px 12px", fontSize: "14px", iconSize: 14 },
    lg: { padding: "6px 16px", fontSize: "16px", iconSize: 16 },
  };

  const currentSize = sizeMap[size];
  const colorScheme = colorMap[color][variant];

  const containerDesign: DesignProps = {
    display: "inline-flex",
    alignItems: "center",
    gap: 1,
    padding: currentSize.padding,
    bg: colorScheme.bg,
    color: colorScheme.color,
    border: variant === "outline" ? `1px solid ${colorScheme.border}` : "none",
    borderRadius: "radius.full",
    fontSize: currentSize.fontSize,
    fontWeight: "500",
    ...design,
  };

  const mergedDesign = mergeDesign(containerDesign, design);
  const designClass = getDesignClass(mergedDesign);
  const finalClassName = applyDesignClass(className, designClass);

  return (
    <span
      className={finalClassName}
      data-design={JSON.stringify(mergedDesign)}
      {...props}
    >
      <Text
        design={{
          fontSize: currentSize.fontSize,
          color: colorScheme.color,
        }}
      >
        {children}
      </Text>
      {closable && onClose && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "0",
            marginLeft: "4px",
            color: colorScheme.color,
            opacity: 0.7,
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.7")}
        >
          <X size={currentSize.iconSize} />
        </button>
      )}
    </span>
  );
};

