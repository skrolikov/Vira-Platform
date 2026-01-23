import React, { useEffect, useState, useRef } from "react";
import { DesignProps } from "../types";
import { mergeDesign, getDesignClass } from "../utils/design-utils";
import { Backdrop } from "./Backdrop";
import { Card } from "./Card";
import { Flex } from "./Flex";
import { Text } from "./Text";
import { Button } from "./Button";
import { X } from "lucide-react";

export interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  showCloseButton?: boolean;
  closeOnBackdrop?: boolean;
  closeOnEscape?: boolean;
  /**
   * Высота drawer'а. Если не указано, подстраивается под контент
   */
  height?: number | string;
  /**
   * Максимальная высота в процентах от viewport
   * @default 90
   */
  maxHeightPercent?: number;
  footer?: React.ReactNode;
  design?: DesignProps;
  headerDesign?: DesignProps;
  bodyDesign?: DesignProps;
  footerDesign?: DesignProps;
  className?: string;
  /**
   * Включает возможность свайпа вниз для закрытия
   * @default true
   */
  swipeable?: boolean;
  /**
   * Показывать ли "ручку" для свайпа
   * @default true
   */
  showHandle?: boolean;
}

/**
 * BottomSheet - Drawer снизу экрана
 * 
 * Идеально подходит для:
 * - Подтверждений действий (удаление, сохранение)
 * - Быстрых форм (укажите стоимость, введите комментарий)
 * - Action sheets (выбор действия)
 * - Мобильных интерфейсов
 * 
 * Особенности:
 * - Выезжает снизу вверх
 * - Поддержка свайпа для закрытия
 * - Минимальная высота под контент
 * - "Ручка" для свайпа (как на iOS)
 * - Автоматически подстраивается под контент
 * 
 * @example
 * <BottomSheet
 *   isOpen={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   title="Удалить контакт?"
 *   subtitle="Это действие нельзя отменить"
 * >
 *   <Button preset="danger">Удалить</Button>
 * </BottomSheet>
 */
export const BottomSheet: React.FC<BottomSheetProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  showCloseButton = true,
  closeOnBackdrop = true,
  closeOnEscape = true,
  height,
  maxHeightPercent = 90,
  footer,
  design,
  headerDesign,
  bodyDesign,
  footerDesign,
  className,
  swipeable = true,
  showHandle = true,
}) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const startYRef = useRef(0);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setIsAnimating(true);
    } else {
      document.body.style.overflow = "";
      const timer = setTimeout(() => {
        setIsAnimating(false);
        setDragOffset(0);
      }, 300);
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

  // Обработка свайпов
  useEffect(() => {
    if (!swipeable || !isOpen) return;

    const handleTouchStart = (e: TouchEvent) => {
      if (!contentRef.current) return;
      
      // Проверяем, что свайп начался в области header или handle
      const target = e.target as HTMLElement;
      const isHeaderOrHandle = target.closest('[data-bottomsheet-draggable]');
      
      if (!isHeaderOrHandle) return;

      startYRef.current = e.touches[0].clientY;
      setIsDragging(true);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging) return;

      const currentY = e.touches[0].clientY;
      const diff = currentY - startYRef.current;

      // Только свайп вниз
      if (diff > 0) {
        setDragOffset(diff);
      }
    };

    const handleTouchEnd = () => {
      if (!isDragging) return;

      setIsDragging(false);

      // Если свайп больше 100px, закрываем
      if (dragOffset > 100) {
        onClose();
      } else {
        setDragOffset(0);
      }
    };

    document.addEventListener("touchstart", handleTouchStart);
    document.addEventListener("touchmove", handleTouchMove);
    document.addEventListener("touchend", handleTouchEnd);

    return () => {
      document.removeEventListener("touchstart", handleTouchStart);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
    };
  }, [swipeable, isOpen, isDragging, dragOffset, onClose]);

  // Добавляем CSS анимации
  useEffect(() => {
    const styleId = "vira-bottomsheet-animations";
    if (!document.getElementById(styleId)) {
      const style = document.createElement("style");
      style.id = styleId;
      style.textContent = `
        @keyframes bottomsheet-slide-in {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .vira-bottomsheet-content {
          animation: bottomsheet-slide-in 0.35s cubic-bezier(0.16, 1, 0.3, 1);
          animation-fill-mode: both;
        }
        .vira-bottomsheet-handle {
          width: 40px;
          height: 4px;
          background: rgba(0, 0, 0, 0.2);
          border-radius: 2px;
          margin: 0 auto;
          cursor: grab;
          transition: background 0.2s ease;
        }
        .vira-bottomsheet-handle:hover {
          background: rgba(0, 0, 0, 0.3);
        }
        .vira-bottomsheet-handle:active {
          cursor: grabbing;
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  const getHeight = () => {
    if (height) return typeof height === "number" ? `${height}px` : height;
    return "auto";
  };

  const sheetDesign: DesignProps = {
    position: "fixed",
    bottom: 0,
    left: 0,
    right: 0,
    display: "flex",
    flexDirection: "column",
    height: getHeight(),
    maxHeight: `${maxHeightPercent}vh`,
    overflow: "hidden",
    borderTopLeftRadius: "24px",
    borderTopRightRadius: "24px",
    zIndex: 1001,
    ...design,
  };

  const headerDesignMerged: DesignProps = {
    padding: 3,
    paddingTop: showHandle ? 2 : 3,
    borderBottomWidth: title || subtitle ? "1px" : "0px",
    borderBottomStyle: "solid",
    borderBottomColor: "color.bg.tertiary",
    flexShrink: 0,
    cursor: swipeable ? "grab" : "default",
    ...headerDesign,
  };

  const bodyDesignMerged: DesignProps = {
    flex: 1,
    overflowY: "auto",
    overflowX: "hidden",
    padding: 3,
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

  const mergedDesign = mergeDesign(sheetDesign, design);
  const sheetClass = getDesignClass(mergedDesign);

  if (!isOpen && !isAnimating) return null;

  const transformStyle = isDragging
    ? { transform: `translateY(${dragOffset}px)` }
    : {};

  return (
    <Backdrop isOpen={isOpen} onClick={closeOnBackdrop ? onClose : undefined}>
      <div
        ref={contentRef}
        style={{
          ...transformStyle,
          transition: isDragging ? "none" : "transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <Card
          className={`${sheetClass} vira-bottomsheet-content ${className || ""}`.trim()}
          data-design={JSON.stringify(mergedDesign)}
          style={{
            ...(design as any),
          }}
          design={{ padding: 0 }}
        >
        {/* Handle + Header */}
        <div data-bottomsheet-draggable="true">
          {showHandle && (
            <Flex
              justify="center"
              design={{
                paddingTop: 2,
                paddingBottom: 1,
              }}
            >
              <div className="vira-bottomsheet-handle" />
            </Flex>
          )}

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
                      fontSize: "20px",
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
        </div>

        {/* Body */}
        <Flex design={bodyDesignMerged} data-design={JSON.stringify(bodyDesignMerged)}>
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
      </div>
    </Backdrop>
  );
};
