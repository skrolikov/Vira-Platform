import React from "react";
import { DesignProps } from "../types";
import { mergeDesign, getDesignClass, applyDesignClass } from "../utils/design-utils";
import { Flex } from "./Flex";
import { Text } from "./Text";
import { ChevronRight, Home } from "lucide-react";

export interface BreadcrumbItem {
  label: string;
  href?: string;
  onClick?: () => void;
  icon?: React.ReactNode;
}

export interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  separator?: React.ReactNode;
  showHome?: boolean;
  homeHref?: string;
  design?: DesignProps;
}

/**
 * Breadcrumbs - Компонент навигационных крошек
 * 
 * Поддерживает:
 * - Кастомные разделители
 * - Иконка дома
 * - Кликабельные элементы
 */
export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({
  items,
  separator,
  showHome = true,
  homeHref = "/",
  design,
}) => {
  const containerDesign: DesignProps = {
    display: "flex",
    alignItems: "center",
    gap: 2,
    flexWrap: "wrap",
    ...design,
  };

  const mergedDesign = mergeDesign(containerDesign, design);
  const designClass = getDesignClass(mergedDesign);
  const defaultSeparator = separator || <ChevronRight size={20} color="#9ca3af" />;

  const allItems = showHome
    ? [{ label: "Главная", href: homeHref, icon: <Home size={20} /> }, ...items]
    : items;

  return (
    <nav className={designClass} data-design={JSON.stringify(mergedDesign)}>
      <Flex design={{ alignItems: "center" as any, gap: 2, flexWrap: "wrap" }}>
        {allItems.map((item, index) => {
          const breadcrumbItem = item as BreadcrumbItem;
          const isLast = index === allItems.length - 1;
          const isClickable = breadcrumbItem.href || breadcrumbItem.onClick;

          const content = (
            <>
              {breadcrumbItem.icon && <span style={{ display: "flex", alignItems: "center" }}>{breadcrumbItem.icon}</span>}
              <Text
                design={{
                  fontSize: "14px",
                  color: isLast ? "#111827" : "#6b7280",
                  fontWeight: isLast ? "600" : "400",
                }}
              >
                {item.label}
              </Text>
            </>
          );

          return (
            <React.Fragment key={index}>
              {breadcrumbItem.href ? (
                <a
                  href={breadcrumbItem.href}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    cursor: "pointer",
                    textDecoration: "none",
                    color: isLast ? "#111827" : "#6b7280",
                    fontWeight: isLast ? "600" : "400",
                  }}
                >
                  {content}
                </a>
              ) : (
                <Flex
                  design={{
                    alignItems: "center" as any,
                    gap: 1,
                    cursor: breadcrumbItem.onClick ? "pointer" : "default",
                  }}
                  onClick={breadcrumbItem.onClick}
                  style={{
                    textDecoration: "none",
                    color: isLast ? "#111827" : "#6b7280",
                    fontWeight: isLast ? "600" : "400",
                  }}
                >
                  {content}
                </Flex>
              )}
              {!isLast && <span style={{ display: "flex", alignItems: "center" }}>{defaultSeparator}</span>}
            </React.Fragment>
          );
        })}
      </Flex>
    </nav>
  );
};

