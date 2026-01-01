import React from "react";
import { DesignProps } from "../types";
import { mergeDesign, getDesignClass, applyDesignClass } from "../utils/design-utils";
import { Flex } from "./Flex";
import { Text } from "./Text";
import { Button } from "./Button";
import { Inbox } from "lucide-react";

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  design?: DesignProps;
}

/**
 * EmptyState - Компонент пустого состояния
 * 
 * Поддерживает:
 * - Кастомную иконку
 * - Заголовок и описание
 * - Действие (кнопка)
 */
export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  design,
}) => {
  const containerDesign: DesignProps = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: 6,
    textAlign: "center",
    ...design,
  };

  const mergedDesign = mergeDesign(containerDesign, design);
  const designClass = getDesignClass(mergedDesign);

  const defaultIcon = icon || <Inbox size={64} color="#d1d5db" />;

  return (
    <Flex className={designClass} design={mergedDesign} data-design={JSON.stringify(mergedDesign)}>
      <Flex
        design={{
          marginBottom: 4,
          color: "#9ca3af",
        }}
      >
        {defaultIcon}
      </Flex>
      <Text
        design={{
          fontSize: "20px",
          fontWeight: "600",
          color: "#111827",
          marginBottom: 2,
        }}
      >
        {title}
      </Text>
      {description && (
        <Text
          design={{
            fontSize: "14px",
            color: "#6b7280",
            marginBottom: action ? 4 : 0,
            maxWidth: "400px",
            lineHeight: "1.6",
          }}
        >
          {description}
        </Text>
      )}
      {action && (
        <Button onClick={action.onClick} preset="primary">
          {action.label}
        </Button>
      )}
    </Flex>
  );
};

