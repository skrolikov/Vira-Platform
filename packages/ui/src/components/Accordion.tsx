import React, { useState } from "react";
import { DesignProps } from "../types";
import { mergeDesign, getDesignClass, applyDesignClass } from "../utils/design-utils";
import { Card } from "./Card";
import { Text } from "./Text";
import { Flex } from "./Flex";
import { ChevronDown } from "lucide-react";

export interface AccordionItem {
  id: string;
  title: string;
  content: React.ReactNode;
  defaultOpen?: boolean;
}

export interface AccordionProps {
  items: AccordionItem[];
  allowMultiple?: boolean;
  design?: DesignProps;
  itemDesign?: DesignProps;
}

/**
 * Accordion - Компонент аккордеона
 * 
 * Поддерживает:
 * - Множественное открытие (allowMultiple)
 * - Кастомный дизайн для каждого элемента
 * - Плавные анимации
 */
export const Accordion: React.FC<AccordionProps> = ({
  items,
  allowMultiple = false,
  design,
  itemDesign,
}) => {
  const [openItems, setOpenItems] = useState<Set<string>>(
    new Set(items.filter((item) => item.defaultOpen).map((item) => item.id))
  );

  const toggleItem = (id: string) => {
    setOpenItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        if (!allowMultiple) {
          newSet.clear();
        }
        newSet.add(id);
      }
      return newSet;
    });
  };

  const containerDesign: DesignProps = {
    display: "flex",
    flexDirection: "column",
    gap: 2,
    ...design,
  };

  const mergedDesign = mergeDesign(containerDesign, design);
  const containerClass = getDesignClass(mergedDesign);

  return (
    <div className={containerClass} data-design={JSON.stringify(mergedDesign)}>
      {items.map((item) => {
        const isOpen = openItems.has(item.id);

        const headerDesign: DesignProps = {
          padding: 4,
          bg: "#ffffff",
          border: "1px solid #e5e7eb",
          borderRadius: "8px",
          cursor: "pointer",
          userSelect: "none",
          hover: {
            bg: "#f9fafb",
          },
          ...itemDesign,
        };

        const contentDesign: DesignProps = {
          padding: 4,
          bg: "#ffffff",
          border: "1px solid #e5e7eb",
          borderTop: "none",
          borderRadius: "0 0 8px 8px",
          maxHeight: isOpen ? "1000px" : "0",
          overflow: "hidden",
          transition: "max-height 0.3s ease, padding 0.3s ease",
          ...(isOpen ? {} : { padding: "0 16px" }),
        };

        return (
          <Flex key={item.id} design={{ flexDirection: "column", gap: 0 }}>
            <Card
              onClick={() => toggleItem(item.id)}
              design={headerDesign}
            >
              <Flex
                design={{
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 3,
                }}
              >
                <Text
                  design={{
                    fontSize: "16px",
                    fontWeight: "600",
                    color: "#111827",
                  }}
                >
                  {item.title}
                </Text>
                <ChevronDown
                  size={20}
                  style={{
                    transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                    transition: "transform 0.3s ease",
                    color: "#6b7280",
                    flexShrink: 0,
                  }}
                />
              </Flex>
            </Card>
            {isOpen && (
              <Card design={contentDesign}>
                {item.content}
              </Card>
            )}
          </Flex>
        );
      })}
    </div>
  );
};

