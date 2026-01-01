import React from "react";
import { DesignProps } from "../types";
import { mergeDesign, getDesignClass, applyDesignClass } from "../utils/design-utils";
import { Card } from "./Card";
import { Flex } from "./Flex";
import { Text } from "./Text";

export interface StatCardProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  value: string | number;
  valueModel?: string; // optional, for Vira bindings
  design?: DesignProps;
  icon?: React.ReactNode;
  iconColor?: "primary" | "success" | "warning" | "danger" | "secondary" | string;
  change?: {
    value: string;
    trend: "up" | "down" | "neutral";
  };
  changeModel?: string;
  secondaryValue?: string | number;
  secondaryLabel?: string;
  preset?: "default" | "colored" | "interactive";
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  valueModel,
  icon,
  iconColor = "primary",
  change,
  changeModel,
  secondaryValue,
  secondaryLabel,
  preset = "default",
  design,
  className,
  ...props
}) => {
  const computedValue = valueModel ?? value;
  const computedChange = changeModel ? undefined : change;

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case "up":
        return "color.success";
      case "down":
        return "color.danger";
      default:
        return "color.text.secondary";
    }
  };

  const getIconBgColor = () => {
    switch (iconColor) {
      case "primary": return "color.primary";
      case "success": return "color.success";
      case "warning": return "color.warning";
      case "danger": return "color.danger";
      case "secondary": return "color.secondary";
      default: return iconColor;
    }
  };

  // Базовый дизайн карточки
  const baseCardDesign: DesignProps = {
    padding: { base: 2, md: 3 },
    radius: "radius.md",
    display: "flex",
    flexDirection: "row",
    alignItems: { base: "center", md: "flex-start" },
    gap: 2,
  };

  const presetDesign: Record<string, DesignProps> = {
    default: {},
    colored: {
      bg: "color.bg.tertiary",
    },
    interactive: {
      cursor: "pointer",
      transition: "all 0.2s ease",
      hover: { transform: "translateY(-2px)" },
    },
  };

  const presetMerged = mergeDesign(baseCardDesign, presetDesign[preset]);
  const finalCardDesign = design ? mergeDesign(presetMerged, design) : presetMerged;  
  const finalClassName = applyDesignClass(className, getDesignClass(finalCardDesign));

  // Дизайн иконки
  const iconDesign: DesignProps = {
    width: { base: "32px", md: "56px" },
    height: { base: "32px", md: "56px" },
    radius: "radius.sm",
    bg: getIconBgColor(),
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "color.text.inverse",
    flexShrink: 0,
  };

  // Контейнер контента (label, value, change, secondary)
  const contentDesign: DesignProps = {
    flex: { base: 1, md: "none" },
    display: "flex",
    flexDirection: { base: "column", md: "column" },
    gap: 1,
    alignItems: { base: "flex-start", md: "flex-start" },
  };

  return (
    <Card design={finalCardDesign} className={finalClassName} {...props}>
      {icon && <Flex design={iconDesign}>{icon}</Flex>}

      <Flex design={contentDesign}>
        {/* Label */}
        <Text
          design={{
            fontSize: "typography.fontSize.xs",
            fontWeight: "typography.fontWeight.semibold",
            color: "color.text.secondary",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
          }}
        >
          {label}
        </Text>

        {/* Value */}
        <Text
          design={{
            fontSize: { base: "24px", md: "32px" },
            fontWeight: "typography.fontWeight.bold",
            color: "color.text.primary",
            lineHeight: "1.2",
          }}
        >
          {computedValue}
        </Text>

        {/* Change */}
        {computedChange && (
          <Flex
            design={{
              fontSize: "typography.fontSize.sm",
              fontWeight: "typography.fontWeight.medium",
              color: getTrendColor(computedChange.trend),
              gap: 1,
              alignItems: "center",
            }}
          >
            <Text>{computedChange.trend === "up" ? "↑" : computedChange.trend === "down" ? "↓" : "→"}</Text>
            <Text>{computedChange.value}</Text>
          </Flex>
        )}

        {/* Secondary */}
        {secondaryValue && secondaryLabel && (
          <Text
            design={{
              fontSize: "typography.fontSize.sm",
              fontWeight: "typography.fontWeight.normal",
              color: "color.text.secondary",
              lineHeight: "1.4",
            }}
          >
            {secondaryLabel}: {secondaryValue}
          </Text>
        )}
      </Flex>
    </Card>
  );
};
