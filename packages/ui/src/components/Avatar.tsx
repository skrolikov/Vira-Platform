import React from "react";
import { DesignProps } from "../types";
import { mergeDesign, getDesignClass, applyDesignClass } from "../utils/design-utils";
import { Text } from "./Text";

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  name?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl" | number;
  variant?: "circle" | "square" | "rounded";
  status?: "online" | "away" | "busy" | "offline";
  initials?: string;
  design?: DesignProps;
}

/**
 * Avatar - Компонент для отображения аватаров пользователей
 * 
 * Поддерживает:
 * - Изображения (src)
 * - Инициалы (initials или автоматически из name)
 * - Статусы (online, away, busy, offline)
 * - Разные размеры и формы
 */
export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt,
  name,
  size = "md",
  variant = "circle",
  status,
  initials,
  design,
  className,
  ...props
}) => {
  // Размеры
  const sizeMap: Record<string, number> = {
    xs: 24,
    sm: 32,
    md: 40,
    lg: 56,
    xl: 80,
  };

  const avatarSize = typeof size === "number" ? size : sizeMap[size] || sizeMap.md;
  const statusSize = avatarSize * 0.3;
  const statusOffset = avatarSize * 0.85;

  // Генерация инициалов
  const getInitials = (): string => {
    if (initials) return initials.substring(0, 2).toUpperCase();
    if (name) {
      const parts = name.trim().split(/\s+/);
      if (parts.length >= 2) {
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
      }
      return name.substring(0, 2).toUpperCase();
    }
    return "?";
  };

  // Цвета статусов
  const statusColors: Record<string, string> = {
    online: "#10b981",
    away: "#f59e0b",
    busy: "#ef4444",
    offline: "#6b7280",
  };

  const containerDesign: DesignProps = {
    position: "relative",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: `${avatarSize}px`,
    height: `${avatarSize}px`,
    flexShrink: 0,
    ...design,
  };

  const avatarDesign: DesignProps = {
    width: "100%",
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    bg: variant === "circle" ? "#e5e7eb" : "#f3f4f6",
    ...(variant === "circle" && { borderRadius: "50%" }),
    ...(variant === "square" && { borderRadius: "4px" }),
    ...(variant === "rounded" && { borderRadius: "12px" }),
    ...(design || {}),
  };

  const mergedContainerDesign = mergeDesign(containerDesign, design);
  const containerClass = getDesignClass(mergedContainerDesign);
  const finalContainerClassName = applyDesignClass(className, containerClass);

  const avatarClass = getDesignClass(avatarDesign);

  return (
    <div
      className={finalContainerClassName}
      data-design={JSON.stringify(mergedContainerDesign)}
      {...props}
    >
      <div className={avatarClass} data-design={JSON.stringify(avatarDesign)}>
        {src ? (
          <img
            src={src}
            alt={alt || name || "Avatar"}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        ) : (
          <Text
            design={{
              fontSize: `${avatarSize * 0.4}px`,
              fontWeight: "600",
              color: "#6b7280",
              userSelect: "none",
            }}
          >
            {getInitials()}
          </Text>
        )}
      </div>

      {/* Статус индикатор */}
      {status && (
        <div
          style={{
            position: "absolute",
            bottom: 0,
            right: 0,
            width: `${statusSize}px`,
            height: `${statusSize}px`,
            borderRadius: "50%",
            backgroundColor: statusColors[status] || statusColors.offline,
            border: `2px solid #ffffff`,
            boxSizing: "border-box",
          }}
        />
      )}
    </div>
  );
};

