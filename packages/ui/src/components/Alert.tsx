import React from "react";
import { DesignProps } from "../types";
import { mergeDesign, getDesignClass, applyDesignClass } from "../utils/design-utils";
import { Card } from "./Card";
import { Text } from "./Text";
import { Flex } from "./Flex";
import { Button } from "./Button";
import { X, AlertCircle, CheckCircle, Info, AlertTriangle } from "lucide-react";

export type AlertType = "info" | "success" | "warning" | "error";

export interface AlertProps {
  type?: AlertType;
  title?: string;
  children: React.ReactNode;
  closable?: boolean;
  onClose?: () => void;
  icon?: React.ReactNode;
  design?: DesignProps;
}

/**
 * Alert - Компонент уведомления/оповещения
 * 
 * Поддерживает:
 * - 4 типа: info, success, warning, error
 * - Закрытие
 * - Кастомная иконка
 */
export const Alert: React.FC<AlertProps> = ({
  type = "info",
  title,
  children,
  closable = false,
  onClose,
  icon,
  design,
}) => {
  const icons = {
    info: Info,
    success: CheckCircle,
    warning: AlertTriangle,
    error: AlertCircle,
  };

  const colorSchemes = {
    info: {
      bg: "#eff6ff",
      border: "#93c5fd",
      icon: "#3b82f6",
      title: "#1e40af",
      text: "#1e3a8a",
    },
    success: {
      bg: "#ecfdf5",
      border: "#6ee7b7",
      icon: "#10b981",
      title: "#065f46",
      text: "#047857",
    },
    warning: {
      bg: "#fffbeb",
      border: "#fcd34d",
      icon: "#f59e0b",
      title: "#78350f",
      text: "#92400e",
    },
    error: {
      bg: "#fef2f2",
      border: "#fca5a5",
      icon: "#ef4444",
      title: "#991b1b",
      text: "#b91c1c",
    },
  };

  const Icon = icons[type];
  const colors = colorSchemes[type];
  const displayIcon = icon || <Icon size={20} color={colors.icon} />;

  const containerDesign: DesignProps = {
    padding: 4,
    bg: colors.bg,
    border: `1px solid ${colors.border}`,
    borderRadius: "radius.md",
    display: "flex",
    gap: 3,
    shadow: "shadow.sm",
    ...design,
  };

  const mergedDesign = mergeDesign(containerDesign, design);
  const designClass = getDesignClass(mergedDesign);

  return (
    <Card className={designClass} data-design={JSON.stringify(mergedDesign)}>
      <Flex design={{ alignItems: "flex-start", gap: 3, flex: 1 }}>
        <Flex
          design={{
            flexShrink: 0,
            marginTop: "2px",
          }}
        >
          {displayIcon}
        </Flex>
        <Flex design={{ flexDirection: "column", gap: 1, flex: 1 }}>
          {title && (
            <Text
              design={{
                fontSize: "16px",
                fontWeight: "600",
                color: colors.title,
              }}
            >
              {title}
            </Text>
          )}
          <Text
            design={{
              fontSize: "14px",
              color: colors.text,
              lineHeight: "1.6",
            }}
          >
            {children}
          </Text>
        </Flex>
        {closable && onClose && (
          <Button
            preset="ghost"
            design={{
              padding: 1,
              minWidth: "auto",
              hover: { bg: "rgba(0,0,0,0.05)" },
            }}
            onClick={onClose}
          >
            <X size={16} color={colors.icon} />
          </Button>
        )}
      </Flex>
    </Card>
  );
};

