import React, { useState } from "react";
import { DesignProps } from "../types";
import { mergeDesign, getDesignClass, applyDesignClass, getDataDesignAttribute } from "../utils/design-utils";
import { Popover } from "./Popover";
import { Card } from "./Card";
import { Flex } from "./Flex";
import { Box } from "./Box";
import { Text } from "./Text";
import { EffectCard } from "./EffectCard";

export interface DropdownItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  divider?: boolean;
  onClick?: () => void;
  design?: DesignProps; // Поддержка кастомного дизайна для элементов
}

export interface DropdownProps {
  trigger: React.ReactElement;
  items: DropdownItem[];
  placement?: "bottom-start" | "bottom-end" | "top-start" | "top-end";
  onItemClick?: (item: DropdownItem) => void;
  design?: DesignProps;
}

/**
 * Dropdown - Компонент выпадающего меню
 * 
 * Поддерживает:
 * - Кастомный триггер
 * - Иконки в элементах
 * - Разделители
 * - Отключенные элементы
 * - Design props для стилизации через тему
 */
export const Dropdown: React.FC<DropdownProps> = ({
  trigger,
  items,
  placement = "bottom-start",
  onItemClick,
  design,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleItemClick = (item: DropdownItem) => {
    if (item.disabled) return;
    item.onClick?.();
    onItemClick?.(item);
    setIsOpen(false);
  };

  const menuDesign: DesignProps = mergeDesign(
    {
      padding: 2,
      minWidth: "200px",
      maxHeight: "300px",
      overflowY: "auto",
      bg: "color.bg.primary",
      border: "1px solid",
      borderColor: "color.bg.tertiary",
      radius: "radius.md",
      shadow: "shadow.lg",
    },
    design
  );

  const defaultItemDesign: DesignProps = {
    padding: 2,
    display: "flex",
    alignItems: "center",
    gap: 2,
    width: "100%",
    textAlign: "left",
    border: "none",
    bg: "transparent",
    color: "color.text.primary",
    fontSize: "typography.fontSize.sm",
    cursor: "pointer",
    transition: "all 0.2s ease",
    hover: {
      bg: "color.bg.tertiary",
    },
  };

  const dividerDesign: DesignProps = {
    height: "1px",
    bg: "color.bg.tertiary",
    margin: "4px 0",
  };

  return (
    <Popover
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      trigger="click"
      placement={placement}
      content={
        <EffectCard design={menuDesign}>
          <Flex design={{ flexDirection: "column", gap: 0 }}>
            {items.map((item, index) => {
              if (item.divider) {
                return (
                  <Box
                    key={`divider-${index}`}
                    design={dividerDesign}
                  />
                );
              }

              const itemDesign = mergeDesign(
                defaultItemDesign,
                mergeDesign(
                  item.design,
                  item.disabled ? {
                    cursor: "not-allowed",
                    opacity: 0.5,
                  } : {}
                )
              );

              const itemClass = getDesignClass(itemDesign);

              return (
                <Box
                  key={item.id}
                  as="button"
                  className={itemClass}
                  design={itemDesign}
                  onClick={() => handleItemClick(item)}
                  {...(item.disabled && { disabled: true } as any)}
                >
                  {item.icon && (
                    <Box
                      design={{
                        display: "flex",
                        alignItems: "center",
                        color: "color.text.secondary",
                      }}
                    >
                      {item.icon}
                    </Box>
                  )}
                  <Text
                    design={{
                      fontSize: "typography.fontSize.sm",
                      color: item.disabled ? "color.text.secondary" : "color.text.primary",
                      flex: 1,
                    }}
                  >
                    {item.label}
                  </Text>
                </Box>
              );
            })}
          </Flex>
        </EffectCard>
      }
    >
      {trigger}
    </Popover>
  );
};
