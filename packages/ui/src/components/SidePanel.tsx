import React, { useEffect, useState } from "react";
import { DesignProps } from "../types";
import { mergeDesign, getDesignClass } from "../utils/design-utils";
import { Card } from "./Card";
import { Flex } from "./Flex";
import { Text } from "./Text";
import { Box } from "./Box";
import { Button } from "./Button";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

export type SidePanelPlacement = "left" | "right";

export interface SidePanelProps {
    isOpen: boolean;
    onClose: () => void;
    placement?: SidePanelPlacement;
    title?: string;
    subtitle?: string;
    children: React.ReactNode;
    showCloseButton?: boolean;
    closeOnEscape?: boolean;
    size?: number | string;
    footer?: React.ReactNode;
    design?: DesignProps;
    headerDesign?: DesignProps;
    bodyDesign?: DesignProps;
    footerDesign?: DesignProps;
    containerDesign?: DesignProps; // Design для контейнера, который сдвигается
    className?: string;
    /**
     * Включает режим "толкания" контента вместо overlay
     * @default true
     */
    pushContent?: boolean;
    /**
     * Селектор для контейнера, который будет сдвигаться
     * @default "[data-layout-content]" (ищет контент внутри Layout, не затрагивая sidebar)
     */
    targetSelector?: string;
}

/**
 * SidePanel - Боковая панель, которая сдвигает контент страницы
 * 
 * Отличия от Drawer:
 * - Не использует Backdrop (опционально)
 * - Сдвигает основной контент страницы вместо наложения
 * - Создаёт ощущение отдельной страницы/раздела
 * - Идеально для больших форм, деталей и расширенных интерфейсов
 * 
 * Поддерживает:
 * - 2 позиции: left, right
 * - Заголовок, подзаголовок и футер
 * - Плавные анимации сдвига
 * - Закрытие по Escape
 * - Кастомный дизайн для каждой секции
 * 
 * @example
 * <SidePanel
 *   isOpen={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   placement="right"
 *   title="Детали контакта"
 *   subtitle="Вся информация о клиенте"
 * >
 *   <ContactDetails />
 * </SidePanel>
 */
export const SidePanel: React.FC<SidePanelProps> = ({
    isOpen,
    onClose,
    placement = "right",
    title,
    subtitle,
    children,
    showCloseButton = true,
    closeOnEscape = true,
    size,
    footer,
    design,
    headerDesign,
    bodyDesign,
    footerDesign,
    containerDesign,
    className,
    pushContent = true,
    targetSelector = "[data-layout-content]",
}) => {
    const [isAnimating, setIsAnimating] = useState(false);

    // Сдвигаем контент страницы
    useEffect(() => {
        if (!pushContent) return;

        const targetElement = document.querySelector(targetSelector) as HTMLElement;
        if (!targetElement) return;

        const panelSize = getSize();

        if (isOpen) {
            setIsAnimating(true);
            targetElement.style.transition = "margin 0.4s cubic-bezier(0.16, 1, 0.3, 1)";
            if (placement === "left") {
                targetElement.style.marginLeft = panelSize;
                targetElement.style.marginRight = "0px";
            } else {
                targetElement.style.marginRight = panelSize;
                targetElement.style.marginLeft = "0px";
            }
        } else {
            targetElement.style.marginLeft = "0px";
            targetElement.style.marginRight = "0px";
            const timer = setTimeout(() => setIsAnimating(false), 400);
            return () => clearTimeout(timer);
        }

        return () => {
            if (targetElement) {
                targetElement.style.marginLeft = "0px";
                targetElement.style.marginRight = "0px";
            }
        };
    }, [isOpen, placement, pushContent, targetSelector, size]);

    // Закрытие по Escape
    useEffect(() => {
        if (!closeOnEscape || !isOpen) return;

        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                onClose();
            }
        };

        window.addEventListener("keydown", handleEscape);
        return () => window.removeEventListener("keydown", handleEscape);
    }, [isOpen, closeOnEscape, onClose]);

    // Добавляем CSS анимации
    useEffect(() => {
        const styleId = "vira-sidepanel-animations";
        if (!document.getElementById(styleId)) {
            const style = document.createElement("style");
            style.id = styleId;
            style.textContent = `
        @keyframes sidepanel-slide-in-right {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
        @keyframes sidepanel-slide-in-left {
          from {
            transform: translateX(-100%);
          }
          to {
            transform: translateX(0);
          }
        }
        .vira-sidepanel-content {
          animation-fill-mode: both;
        }
        .vira-sidepanel-content[data-placement="right"] {
          animation: sidepanel-slide-in-right 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .vira-sidepanel-content[data-placement="left"] {
          animation: sidepanel-slide-in-left 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
      `;
            document.head.appendChild(style);
        }
    }, []);

    function getSize() {
        if (size) return typeof size === "number" ? `${size}px` : size;
        return "500px";
    }

    const getPositionStyles = (): React.CSSProperties => {
        const actualSize = getSize();
        const baseStyles: React.CSSProperties = {
            position: "fixed",
            zIndex: 999, // Ниже чем у Drawer (1001), так как это часть layout
            top: 0,
            bottom: 0,
            width: actualSize,
            maxWidth: "90vw",
        };

        switch (placement) {
            case "left":
                return {
                    ...baseStyles,
                    left: 0,
                };
            case "right":
                return {
                    ...baseStyles,
                    right: 0,
                };
        }
    };

    const panelDesign: DesignProps = {
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        overflow: "hidden",
        boxShadow: placement === "left"
            ? "4px 0 24px rgba(0, 0, 0, 0.12)"
            : "-4px 0 24px rgba(0, 0, 0, 0.12)",
        ...design,
    };

    const headerDesignMerged: DesignProps = {
        padding: 4,
        borderBottomWidth: "1px",
        borderBottomStyle: "solid",
        borderBottomColor: "color.bg.tertiary",
        flexShrink: 0,
        ...headerDesign,
    };

    const bodyDesignMerged: DesignProps = {
        overflowY: "auto",
        overflowX: "hidden",
        ...bodyDesign,
    };

    const footerDesignMerged: DesignProps = {
        padding: 3,
        borderTopWidth: "1px",
        borderTopStyle: "solid",
        borderTopColor: "color.bg.tertiary",
        flexShrink: 0,
        ...footerDesign,
    };

    const mergedDesign = mergeDesign(panelDesign, design);
    const panelClass = getDesignClass(mergedDesign);

    if (!isOpen && !isAnimating) return null;

    return (
        <Card
            className={`${panelClass} vira-sidepanel-content ${className || ""}`.trim()}
            data-design={JSON.stringify(mergedDesign)}
            data-placement={placement}
            style={{
                ...getPositionStyles(),
                ...(design as any),
            }}
            design={{ padding: 0 }}
        >
            {/* Header */}
            {(title || subtitle || showCloseButton) && (
                <Flex
                    justify="space-between"
                    align="center"
                    design={headerDesignMerged}
                    data-design={JSON.stringify(headerDesignMerged)}
                >
                    <Flex
                        design={{
                            flexDirection: "column",
                            gap: 1,
                            flex: 1,
                        }}
                    >
                        {title && (
                            <Text
                                design={{
                                    fontSize: "24px",
                                    fontWeight: "700",
                                    color: "color.text.primary",
                                    lineHeight: "1.3",
                                }}
                            >
                                {title}
                            </Text>
                        )}
                        {subtitle && (
                            <Text
                                design={{
                                    fontSize: "14px",
                                    color: "color.text.secondary",
                                    lineHeight: "1.5",
                                }}
                            >
                                {subtitle}
                            </Text>
                        )}
                    </Flex>
                    {showCloseButton && (
                        <Flex gap={1}>
                            <Button
                                preset="ghost"
                                design={{
                                    padding: 2,
                                    minWidth: "auto",
                                    width: "36px",
                                    height: "36px",
                                    borderRadius: "8px",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    hover: {
                                        bg: "#f3f4f6",
                                        transform: "scale(1.05)",
                                    },
                                    active: {
                                        transform: "scale(0.95)",
                                    },
                                    transition: "all 0.2s ease",
                                }}
                                onClick={onClose}
                                aria-label="Закрыть панель"
                            >
                                {placement === "left" ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
                            </Button>
                        </Flex>
                    )}
                </Flex>
            )}

            {/* Body */}
            <Box
                design={bodyDesignMerged}
                data-design={JSON.stringify(bodyDesignMerged)}
            >
                {children}
            </Box>

            {/* Footer */}
            {footer && (
                <Flex
                    align="center"
                    justify="flex-end"
                    gap={3}
                    design={footerDesignMerged}
                    data-design={JSON.stringify(footerDesignMerged)}
                >
                    {footer}
                </Flex>
            )}
        </Card>
    );
};
