import React, { useEffect, useState } from "react";
import { DesignProps } from "../types";
import { mergeDesign, getDesignClass, applyDesignClass } from "../utils/design-utils";
import { Backdrop } from "./Backdrop";
import { Card } from "./Card";
import { Flex } from "./Flex";
import { Text } from "./Text";
import { Button } from "./Button";
import { X } from "lucide-react";

export type DrawerPlacement = "left" | "right" | "top" | "bottom";

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  placement?: DrawerPlacement;
  title?: string;
  subtitle?: string;
  description?: string; // Синоним для subtitle, добавлено для совместимости с ViraDrawer
  children: React.ReactNode;
  showCloseButton?: boolean;
  closeOnBackdrop?: boolean;
  closeOnEscape?: boolean;
  size?: number | string;
  width?: string; // Синоним для size, добавлено для совместимости с ViraDrawer
  footer?: React.ReactNode;
  design?: DesignProps;
  headerDesign?: DesignProps;
  bodyDesign?: DesignProps;
  footerDesign?: DesignProps;
  className?: string; // Добавлено для совместимости с ViraDrawer
}

/**
 * Drawer - Компонент выдвижной панели
 * 
 * Поддерживает:
 * - 4 позиции: left, right, top, bottom
 * - Заголовок, подзаголовок и футер
 * - Плавные анимации
 * - Закрытие по Escape
 * - Кастомный дизайн для каждой секции
 */
export const Drawer: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  placement = "right",
  title,
  subtitle,
  description,
  children,
  showCloseButton = true,
  closeOnBackdrop = true,
  closeOnEscape = true,
  size,
  width,
  footer,
  design,
  headerDesign,
  bodyDesign,
  footerDesign,
  className,
}) => {
  // Используем width если указан, иначе size
  const drawerSize = width || size;
  // Используем description если указан, иначе subtitle
  const drawerDescription = description || subtitle;
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setIsAnimating(true);
    } else {
      document.body.style.overflow = "";
      // Задержка для завершения анимации перед размонтированием
      const timer = setTimeout(() => setIsAnimating(false), 300);
      return () => clearTimeout(timer);
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

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
    const styleId = "vira-drawer-animations";
    if (!document.getElementById(styleId)) {
      const style = document.createElement("style");
      style.id = styleId;
      style.textContent = `
        @keyframes drawer-slide-in-right {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        @keyframes drawer-slide-in-left {
          from {
            transform: translateX(-100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        @keyframes drawer-slide-in-top {
          from {
            transform: translateY(-100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        @keyframes drawer-slide-in-bottom {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .vira-drawer-content {
          animation-fill-mode: both;
        }
        .vira-drawer-content[data-placement="right"] {
          animation: drawer-slide-in-right 0.35s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .vira-drawer-content[data-placement="left"] {
          animation: drawer-slide-in-left 0.35s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .vira-drawer-content[data-placement="top"] {
          animation: drawer-slide-in-top 0.35s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .vira-drawer-content[data-placement="bottom"] {
          animation: drawer-slide-in-bottom 0.35s cubic-bezier(0.16, 1, 0.3, 1);
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  const getSize = () => {
    if (drawerSize) return typeof drawerSize === "number" ? `${drawerSize}px` : drawerSize;
    if (placement === "top" || placement === "bottom") return "400px";
    return "420px";
  };

  const getPositionStyles = (): React.CSSProperties => {
    const actualSize = getSize();
    const baseStyles: React.CSSProperties = {
      position: "fixed",
      zIndex: 1001,
    };

    switch (placement) {
      case "left":
        return {
          ...baseStyles,
          left: 0,
          top: 0,
          bottom: 0,
          width: actualSize,
          maxWidth: "90vw",
        };
      case "right":
        return {
          ...baseStyles,
          right: 0,
          top: 0,
          bottom: 0,
          width: actualSize,
          maxWidth: "90vw",
        };
      case "top":
        return {
          ...baseStyles,
          top: 0,
          left: 0,
          right: 0,
          height: actualSize,
          maxHeight: "90vh",
        };
      case "bottom":
        return {
          ...baseStyles,
          bottom: 0,
          left: 0,
          right: 0,
          height: actualSize,
          maxHeight: "90vh",
        };
    }
  };

  const drawerDesign: DesignProps = {
    position: "fixed",
    display: "flex",
    flexDirection: "column",
    height: placement === "top" || placement === "bottom" ? "100%" : "auto",
    maxHeight: "100vh",
    overflow: "hidden",
    ...design,
  };

  const headerDesignMerged: DesignProps = {
    padding: 3,
    borderBottomWidth: "1px",
    borderBottomStyle: "solid",
    borderBottomColor: "color.bg.tertiary",
    flexShrink: 0,
    ...headerDesign,
  };

  const bodyDesignMerged: DesignProps = {
    flex: 1,
    overflowY: "auto",
    overflowX: "hidden",
    padding: 3,
    ...(placement === "left" || placement === "right" ? { flexDirection: "column" } : {}),
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

  const mergedDesign = mergeDesign(drawerDesign, design);
  const drawerClass = getDesignClass(mergedDesign);

  if (!isOpen && !isAnimating) return null;

  return (
    <Backdrop isOpen={isOpen} onClick={closeOnBackdrop ? onClose : undefined} zIndex={1000}>
      <Card
        className={`${drawerClass} vira-drawer-content ${className || ""}`.trim()}
        data-design={JSON.stringify(mergedDesign)}
        data-placement={placement}
        style={{
          ...getPositionStyles(),
          ...(design as any),
        }}
        design={{ padding: 0, }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        {(title || drawerDescription || showCloseButton) && (
          <Flex
            justify="space-around"
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
                    fontSize: "20px",
                    fontWeight: "700",
                    color: "color.text.primary",
                    lineHeight: "1.3",
                  }}
                >
                  {title}
                </Text>
              )}
              {drawerDescription && (
                <Text
                  design={{
                    fontSize: "14px",
                    color: "color.text.secondary",
                    lineHeight: "1.5",
                  }}
                >
                  {drawerDescription}
                </Text>
              )}
            </Flex>
            {showCloseButton && (
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
                aria-label="Закрыть"
              >
                <X size={20} />
              </Button>
            )}
          </Flex>
        )}

        {/* Body */}
        <Flex
          design={bodyDesignMerged}
          data-design={JSON.stringify(bodyDesignMerged)}
        >
          {children}
        </Flex>

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
    </Backdrop>
  );
};

