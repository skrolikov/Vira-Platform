import React from "react";
import { DesignProps } from "../types";
import { mergeDesign, getDesignClass, applyDesignClass, getDataDesignAttribute } from "../utils/design-utils";
// Note: ViraComponentProps removed - component works independently
import { Button } from "./Button";
import { Heading } from "./Heading";
import { Text } from "./Text";
import { Flex } from "./Flex";
import { Badge } from "./Badge";
import { Spinner } from "./Spinner";
import { Upload, Download } from "lucide-react";

/**
 * ContentHeader - Универсальный заголовок контента с поддержкой Vira Framework
 * 
 * Поддерживает:
 * - design prop для стилей
 * - action prop для auto-binding кнопки (опционально)
 * - model prop для badge (опционально)
 * - все стандартные функции ContentHeader
 */

export interface ContentHeaderAction {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  preset?: "primary" | "soft" | "secondary" | "ghost" | "danger";
  title?: string;
  disabled?: boolean;
}

export interface ContentHeaderProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  title: string;
  description?: string;
  badge?: string | number;
  badgeModel?: string; // Note: Requires Vira Framework (moved to bindings package)
  design?: DesignProps;
  onImport?: () => void;
  onExport?: () => void;
  onButtonClick?: () => void;
  buttonText?: string;
  buttonIcon?: React.ReactNode;
  buttonAction?: string;
  buttonVariant?: "primary" | "secondary" | "danger";
  actions?: ContentHeaderAction[]; // Массив дополнительных действий
  children?: React.ReactNode;
  loading?: boolean;
}

export const ContentHeader: React.FC<ContentHeaderProps> = ({
  title,
  description,
  badge,
  badgeModel,
  onImport,
  onExport,
  onButtonClick,
  buttonText = "Add New",
  buttonIcon,
  buttonAction,
  buttonVariant = "primary",
  actions = [],
  children,
  loading = false,
  design,
  className,
  ...props
}) => {
  // Default design для контейнера: всегда flex, wrap, gap, margin
  // На мобилке - по центру, на десктопе - как обычно
  const defaultDesign: DesignProps = {
    display: "flex",
    flexDirection: {
      base: "column",
      md: "row",
    },
    alignItems: {
      base: "center",
      md: "flex-start",
    },
    justifyContent: {
      base: "center",
      md: "space-between",
    },
    flexWrap: "wrap",
    gap: 3,
  };

  // Мержим default design с переданным design
  const mergedDesign = mergeDesign(defaultDesign, design);
  const containerClass = getDesignClass(mergedDesign);
  const finalClassName = applyDesignClass(className, containerClass);

  // Получаем badge из модели если указан badgeModel
  const computedBadge = badgeModel ? undefined : badge;

  // Автоматически добавляем Импорт и Экспорт в actions, если указаны onImport/onExport
  const allActions: ContentHeaderAction[] = [...(actions || [])];
  
  if (onImport && !allActions.find(a => a.label === "Импорт")) {
    allActions.push({
      label: "Импорт",
      icon: <Upload size={20} />,
      onClick: onImport,
      preset: "soft",
      title: "Импорт данных",
    });
  }
  
  if (onExport && !allActions.find(a => a.label === "Экспорт")) {
    allActions.push({
      label: "Экспорт",
      icon: <Download size={20} />,
      onClick: onExport,
      preset: "soft",
      title: "Экспорт данных",
    });
  }

  return (
    <div
      className={finalClassName}
      {...(mergedDesign && { "data-design": getDataDesignAttribute(mergedDesign) })}
      {...props}
    >
      {/* Info секция */}
      <Flex design={{ 
        flex: {
          base: "none",
          md: 1,
        },
        minWidth: {
          base: "100%",
          md: "300px",
        },
        flexDirection: "column",
        gap: 2,
        alignItems: {
          base: "center",
          md: "flex-start",
        },
        textAlign: {
          base: "center",
          md: "left",
        },
      }}>
        <Flex design={{ 
          alignItems: "center", 
          gap: 3, 
          flexWrap: "wrap",
          justifyContent: {
            base: "center",
            md: "flex-start",
          },
        }}>
          <Heading level={1} design={{ margin: 0 }}>
            {title}
          </Heading>
          {computedBadge !== undefined && (
            <Badge design={{ bg: "color.primary", color: "color.text.inverse" }}>
              {String(computedBadge)}
            </Badge>
          )}
          {loading && <Spinner size={16} />}
        </Flex>
        {description && (
          <Text design={{ 
            color: "color.text.secondary", 
            fontSize: "typography.fontSize.lg",
            textAlign: {
              base: "center",
              md: "left",
            },
          }}>
            {description}
          </Text>
        )}
      </Flex>

      {/* Actions секция */}
      <Flex design={{ 
        alignItems: "center", 
        gap: 2, 
        flexWrap: "wrap",
        justifyContent: {
          base: "center",
          md: "flex-end",
        },
      }}>
        {children}

        {/* Дополнительные действия из массива actions */}
        {allActions.length > 0 && (
          <Flex wrap design={{ gap: 2 }}>
            {allActions.map((action, index) => (
              <Button
                key={index}
                onClick={action.onClick}
                preset={action.preset || "secondary"}
                disabled={action.disabled}
                title={action.title || action.label}
                design={{
                  padding: {
                    base: 3,
                    md: 2,
                  },
                }}
              >
                {action.icon && <span className="vira-button-icon">{action.icon}</span>}
                <span className="vira-button-text" style={{ display: action.icon ? "none" : "inline" }}>
                  {action.label}
                </span>
                {action.icon && (
                  <style>{`
                    @media (min-width: 640px) {
                      .vira-button-text { display: inline !important; }
                      .vira-button-icon { margin-right: 8px; }
                    }
                  `}</style>
                )}
              </Button>
            ))}
          </Flex>
        )}

        {/* Основная кнопка */}
        {(buttonAction || onButtonClick) && (
          <Button
            onClick={onButtonClick || (buttonAction ? () => {
              // Note: buttonAction requires Vira Framework (moved to bindings package)
              console.warn("buttonAction requires Vira Framework");
            } : undefined)}
            preset={buttonVariant}
            loading={loading}
            title={buttonText}
            design={{
              padding: {
                base: 3,
                md: 2,
              },
            }}
          >
            {buttonIcon && <span className="vira-button-icon">{buttonIcon}</span>}
            <span className="vira-button-text" style={{ display: buttonIcon ? "none" : "inline" }}>
              {buttonText}
            </span>
            {buttonIcon && (
              <style>{`
                @media (min-width: 640px) {
                  .vira-button-text { display: inline !important; }
                  .vira-button-icon { margin-right: 8px; }
                }
              `}</style>
            )}
          </Button>
        )}
      </Flex>
    </div>
  );
};

// Note: ViraContentHeader moved to @vira-ui/bindings-react (planned)
