import React from "react";
import { DesignProps } from "../types";
import { mergeDesign, getDesignClass, applyDesignClass, getDataDesignAttribute } from "../utils/design-utils";
import { Card } from "./Card";
import { Grid } from "./Grid";
import { Flex } from "./Flex";
import { Text } from "./Text";
import { Heading } from "./Heading";
import { Button } from "./Button";
import { EmptyState } from "./EmptyState";

export interface CardViewColumn<T = any> {
  key: string;
  label: string;
  render?: (value: any, row: T) => React.ReactNode;
  primary?: boolean; // Основное поле, которое будет в заголовке карточки
}

export interface CardViewProps<T = any> extends React.HTMLAttributes<HTMLDivElement> {
  columns: CardViewColumn<T>[];
  data?: T[];
  design?: DesignProps;

  // Card settings
  columnsPerRow?: number | { sm?: number; md?: number; lg?: number; xl?: number };
  cardDesign?: DesignProps;

  // Actions
  onCardClick?: (row: T) => void;
  cardActions?: (row: T) => React.ReactNode;

  // State
  loading?: boolean;
  emptyMessage?: string;
}

export const CardView = <T extends Record<string, any>>({
  columns,
  data: externalData,
  design,
  columnsPerRow = { sm: 1, md: 2, lg: 3, xl: 4 },
  cardDesign,
  onCardClick,
  cardActions,
  loading: externalLoading,
  emptyMessage = "Нет данных",
  className,
  ...props
}: CardViewProps<T>) => {
  const data = externalData !== undefined ? externalData : [];
  const isLoading = externalLoading !== undefined ? externalLoading : false;

  const defaultDesign: DesignProps = {
    gap: 3,
    ...design,
  };

  const mergedDesign = mergeDesign(defaultDesign, design);
  const containerClass = getDesignClass(mergedDesign);
  const finalClassName = applyDesignClass(className, containerClass);

  // Определяем primary колонку
  const primaryColumn = columns.find(col => col.primary) || columns[0];

  // Остальные колонки
  const otherColumns = columns.filter(col => !col.primary);

  // Вычисляем grid columns
  const getGridColumns = () => {
    if (typeof columnsPerRow === "number") {
      return columnsPerRow;
    }
    // Для responsive используем CSS Grid с медиа-запросами
    return "repeat(auto-fill, minmax(300px, 1fr))";
  };

  if (isLoading) {
    return (
      <Flex direction="column" align="center" justify="center" design={{ padding: 10 }}>
        <div style={{ width: "32px", height: "32px", border: "3px solid var(--color-bg-tertiary)", borderTop: "3px solid var(--color-primary)", borderRadius: "50%", marginBottom: "12px", animation: "spin 1s linear infinite" }} />
        <Text>Загрузка данных...</Text>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </Flex>
    );
  }

  if (data.length === 0) {
    return (
      <EmptyState
        title={emptyMessage}
      />
    );
  }

  const defaultCardDesign: DesignProps = mergeDesign(
    {
      padding: 4,
      bg: "color.bg.secondary",
      cursor: onCardClick ? "pointer" : "default",
      transition: "all 0.2s ease",
      hover: onCardClick ? {
        transform: "translateY(-2px)",
        shadow: "shadow.md",
      } : {},
    },
    cardDesign
  );

  return (
    <Grid
      className={finalClassName}
      columns={getGridColumns()}
      design={mergedDesign}
      {...(getDataDesignAttribute(mergedDesign) && { "data-design": getDataDesignAttribute(mergedDesign) })}
      {...props}
    >
      {data.map((row, index) => {
        const primaryValue = primaryColumn.render
          ? primaryColumn.render(row[primaryColumn.key], row)
          : row[primaryColumn.key];

        const isPrimaryText =
          typeof primaryValue === "string" ||
          typeof primaryValue === "number";

        return (
          <Card
            key={(row as any).id || index}
            design={defaultCardDesign}
            onClick={() => onCardClick?.(row)}
          >
            {/* Заголовок карточки */}
            <Flex design={{ flexDirection: "column", gap: 3 }}>
              <Flex design={{ justifyContent: "space-between", alignItems: "flex-start" }}>
                {isPrimaryText ? (
                  <Heading level={3} design={{ margin: 0, fontSize: "typography.fontSize.lg", fontWeight: "typography.fontWeight.semibold" }}>
                    {primaryValue}
                  </Heading>
                ) : (
                  // If primaryValue is a ReactNode (e.g. custom component), don't put it inside a heading tag
                  <div>
                    {primaryValue}
                  </div>
                )}
                {cardActions && (
                  <Flex design={{ gap: 1 }}>
                    {cardActions(row)}
                  </Flex>
                )}
              </Flex>

              {/* Остальные поля */}
              <Flex design={{ flexDirection: "column", gap: 2 }}>
                {otherColumns.map((column) => {
                  const value = column.render
                    ? column.render(row[column.key], row)
                    : row[column.key];

                  if (value === null || value === undefined || value === "") {
                    return null;
                  }

                  return (
                    <Flex key={column.key} design={{ flexDirection: "column", gap: 1 }}>
                      <Text design={{ fontSize: "typography.fontSize.xs", color: "color.text.secondary", fontWeight: "typography.fontWeight.medium" }}>
                        {column.label}
                      </Text>
                      {/* Use a non-<p> wrapper to avoid invalid nesting when value is a <Text/> or any block element */}
                      <Text as="div" design={{ fontSize: "typography.fontSize.sm", color: "color.text.primary" }}>
                        {value}
                      </Text>
                    </Flex>
                  );
                })}
              </Flex>
            </Flex>
          </Card>
        );
      })}
    </Grid>
  );
};

