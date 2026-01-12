import React from "react";
import { DesignProps } from "../types";
import { mergeDesign, getDesignClass, applyDesignClass } from "../utils/design-utils";
import { Card } from "./Card";
import { Flex } from "./Flex";
import { Text } from "./Text";
import { Heading } from "./Heading";
import { Badge } from "./Badge";

export interface StatCardProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  value: string | number;
  subtext?: string | React.ReactNode;
  icon?: React.ReactNode;
  iconColor?: "primary" | "success" | "warning" | "danger" | "info" | "secondary" | string;
  badge?: string | React.ReactNode;
  size?: "sm" | "md" | "lg";
  colored?: boolean;
  color?: "primary" | "success" | "warning" | "danger" | "info" | "secondary";
  design?: DesignProps;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  subtext,
  icon,
  iconColor,
  badge,
  size = "md",
  colored = false,
  color = "primary",
  design,
  className,
  ...props
}) => {
  // Размеры
  const sizeConfig = {
    sm: {
      padding: 3,
      iconSize: 20,
      labelSize: "typography.fontSize.xs",
      valueSize: "1.5rem",
      subtextSize: "typography.fontSize.xs",
      gap: 2,
    },
    md: {
      padding: 4,
      iconSize: 24,
      labelSize: "typography.fontSize.sm",
      valueSize: "2rem",
      subtextSize: "typography.fontSize.sm",
      gap: 2,
    },
    lg: {
      padding: 5,
      iconSize: 28,
      labelSize: "typography.fontSize.base",
      valueSize: "2.5rem",
      subtextSize: "typography.fontSize.base",
      gap: 3,
    },
  };

  const config = sizeConfig[size];

  // Цвета для colored режима
  const colorConfig: Record<string, { bg: string; text: string; textOpacity: number; subtextOpacity: number }> = {
    primary: {
      bg: "color.primary",
      text: "color.text.inverse",
      textOpacity: 0.9,
      subtextOpacity: 0.8,
    },
    success: {
      bg: "color.success",
      text: "color.text.inverse",
      textOpacity: 0.9,
      subtextOpacity: 0.8,
    },
    warning: {
      bg: "color.warning",
      text: "color.text.inverse",
      textOpacity: 0.9,
      subtextOpacity: 0.8,
    },
    danger: {
      bg: "color.danger",
      text: "color.text.inverse",
      textOpacity: 0.9,
      subtextOpacity: 0.8,
    },
    info: {
      bg: "color.info",
      text: "color.text.inverse",
      textOpacity: 0.9,
      subtextOpacity: 0.8,
    },
    secondary: {
      bg: "color.secondary",
      text: "color.text.inverse",
      textOpacity: 0.9,
      subtextOpacity: 0.8,
    },
  };

  const colorStyles = colored ? colorConfig[color] : null;

  // Базовый дизайн карточки
  const baseCardDesign: DesignProps = {
    padding: config.padding,
    ...(colored && colorStyles
      ? {
          border: "none",
          background: colorStyles.bg,
        }
      : {}),
  };

  const finalCardDesign = design ? mergeDesign(baseCardDesign, design) : baseCardDesign;
  const finalClassName = applyDesignClass(className, getDesignClass(finalCardDesign));

  // Цвета текста
  const labelColor = colored && colorStyles ? colorStyles.text : "color.text.secondary";
  const valueColor = colored && colorStyles ? colorStyles.text : "color.text.primary";
  const subtextColor = colored && colorStyles ? colorStyles.text : "color.text.secondary";

  const labelOpacity = colored && colorStyles ? colorStyles.textOpacity : 0.7;
  const subtextOpacityValue = colored && colorStyles ? colorStyles.subtextOpacity : 0.6;

  // Цвет иконки
  const getIconColorValue = () => {
    if (colored) {
      return "var(--color-text-inverse)";
    }
    if (iconColor) {
      const colorMap: Record<string, string> = {
        primary: "var(--color-primary)",
        success: "var(--color-success)",
        warning: "var(--color-warning)",
        danger: "var(--color-danger)",
        info: "var(--color-info)",
        secondary: "var(--color-secondary)",
      };
      return colorMap[iconColor] || iconColor;
    }
    return undefined;
  };

  const iconColorValue = getIconColorValue();

  return (
    <Card design={finalCardDesign} className={finalClassName} {...props}>
      <Flex direction="column" gap={config.gap}>
        {/* Header: Icon + Label */}
        <Flex align="center" gap={1}>
          {icon && (
            <Flex
              design={{
                flexShrink: 0,
              }}
            >
              {React.isValidElement(icon)
                ? React.cloneElement(icon as React.ReactElement, {
                    size: config.iconSize,
                    ...(iconColorValue && { color: iconColorValue }),
                  })
                : icon}
            </Flex>
          )}
          <Text
            size={size === "sm" ? "xs" : size === "lg" ? "base" : "sm"}
            design={{
              color: labelColor,
              opacity: labelOpacity,
            }}
          >
            {label}
          </Text>
        </Flex>

        {/* Value */}
        <Heading
          level={2}
          design={{
            fontSize: config.valueSize,
            margin: 0,
            color: valueColor,
            fontWeight: "typography.fontWeight.bold",
          }}
        >
          {typeof value === "number" ? value.toLocaleString("ru-RU") : value}
        </Heading>

        {/* Footer: Subtext or Badge */}
        {(subtext || badge) && (
          <Flex align="center" gap={2}>
            {subtext && (
              <Text
                size={size === "sm" ? "xs" : size === "lg" ? "base" : "sm"}
                design={{
                  color: subtextColor,
                  opacity: subtextOpacityValue,
                }}
              >
                {subtext}
              </Text>
            )}
            {badge && (
              <Badge
                preset={
                  colored
                    ? "default"
                    : typeof badge === "string" && badge.toLowerCase().includes("успех")
                    ? "success"
                    : "default"
                }
              >
                {badge}
              </Badge>
            )}
          </Flex>
        )}
      </Flex>
    </Card>
  );
};
