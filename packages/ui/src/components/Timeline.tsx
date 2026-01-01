import React from "react";
import { DesignProps } from "../types";
import { mergeDesign, getDesignClass, applyDesignClass } from "../utils/design-utils";
import { Flex } from "./Flex";
import { Text } from "./Text";
import { Card } from "./Card";

export interface TimelineItem {
  id: string;
  title: string;
  description?: string;
  time?: string;
  icon?: React.ReactNode;
  color?: string;
}

export interface TimelineProps {
  items: TimelineItem[];
  orientation?: "vertical" | "horizontal";
  design?: DesignProps;
}

/**
 * Timeline - Компонент временной линии событий
 * 
 * Поддерживает:
 * - Вертикальную и горизонтальную ориентацию
 * - Кастомные иконки и цвета
 * - Время события
 */
export const Timeline: React.FC<TimelineProps> = ({
  items,
  orientation = "vertical",
  design,
}) => {
  const containerDesign: DesignProps = {
    display: "flex",
    flexDirection: orientation === "horizontal" ? "row" : "column",
    gap: 4,
    position: "relative",
    ...design,
  };

  const mergedDesign = mergeDesign(containerDesign, design);
  const designClass = getDesignClass(mergedDesign);

  if (orientation === "horizontal") {
    return (
      <Flex className={designClass} design={mergedDesign} data-design={JSON.stringify(mergedDesign)}>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const defaultColor = item.color || "#3b82f6";

          return (
            <React.Fragment key={item.id}>
              <Flex design={{ flexDirection: "column" as any, alignItems: "center", gap: 2, flex: 1 }}>
                <Flex
                  design={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    bg: defaultColor,
                    color: "#ffffff",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  {item.icon || (
                    <Text design={{ fontSize: "16px", fontWeight: "600", color: "#ffffff" }}>
                      {index + 1}
                    </Text>
                  )}
                </Flex>
                <Flex design={{ flexDirection: "column" as any, alignItems: "center", gap: 1 }}>
                  <Text design={{ fontSize: "14px", fontWeight: "600", color: "#111827", textAlign: "center" }}>
                    {item.title}
                  </Text>
                  {item.description && (
                    <Text design={{ fontSize: "12px", color: "#6b7280", textAlign: "center" }}>
                      {item.description}
                    </Text>
                  )}
                  {item.time && (
                    <Text design={{ fontSize: "11px", color: "#9ca3af", textAlign: "center" }}>
                      {item.time}
                    </Text>
                  )}
                </Flex>
              </Flex>
              {!isLast && (
                <div
                  style={{
                    flex: 1,
                    height: "2px",
                    backgroundColor: "#e5e7eb",
                    marginTop: "20px",
                    minWidth: "50px",
                  }}
                />
              )}
            </React.Fragment>
          );
        })}
      </Flex>
    );
  }

  return (
    <div className={designClass} data-design={JSON.stringify(mergedDesign)}>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        const defaultColor = item.color || "#3b82f6";

        return (
          <Flex key={item.id} design={{ flexDirection: "row" as any, gap: 3, position: "relative" }}>
            {/* Линия */}
            <Flex design={{ flexDirection: "column" as any, alignItems: "center", flexShrink: 0 }}>
              {/* Иконка/точка */}
              <Flex
                design={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  bg: defaultColor,
                  color: "#ffffff",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  zIndex: 1,
                }}
              >
                {item.icon || (
                  <Text design={{ fontSize: "16px", fontWeight: "600", color: "#ffffff" }}>
                    {index + 1}
                  </Text>
                )}
              </Flex>
              {!isLast && (
                <div
                  style={{
                    width: "2px",
                    flex: 1,
                    backgroundColor: "#e5e7eb",
                    minHeight: "50px",
                    marginTop: "8px",
                  }}
                />
              )}
            </Flex>

            {/* Контент */}
            <Flex design={{ flexDirection: "column" as any, gap: 1, flex: 1, paddingBottom: isLast ? 0 : 4 }}>
              <Text design={{ fontSize: "16px", fontWeight: "600", color: "#111827" }}>
                {item.title}
              </Text>
              {item.description && (
                <Text design={{ fontSize: "14px", color: "#6b7280", lineHeight: "1.6" }}>
                  {item.description}
                </Text>
              )}
              {item.time && (
                <Text design={{ fontSize: "12px", color: "#9ca3af" }}>
                  {item.time}
                </Text>
              )}
            </Flex>
          </Flex>
        );
      })}
    </div>
  );
};

