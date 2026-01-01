import React, { useState, useRef, useEffect } from "react";
import { DesignProps } from "../types";
import { mergeDesign, getDesignClass, applyDesignClass, getDataDesignAttribute } from "../utils/design-utils";
import { Card } from "./Card";
import { Flex } from "./Flex";
import { Box } from "./Box";
import { Text } from "./Text";

export interface ContextMenuItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  divider?: boolean;
  onClick?: () => void;
  design?: DesignProps;
  variant?: "default" | "danger";
}

export interface ContextMenuProps {
  items: ContextMenuItem[];
  onItemClick?: (item: ContextMenuItem) => void;
  children: React.ReactElement;
  disabled?: boolean;
  design?: DesignProps;
  onOpenChange?: (open: boolean) => void;
}

/**
 * ContextMenu - Компонент контекстного меню (правый клик)
 * 
 * Поддерживает:
 * - Автоматическое позиционирование рядом с курсором
 * - Иконки в элементах
 * - Разделители
 * - Отключенные элементы
 * - Варианты элементов (danger, default)
 * - Design props для стилизации через тему
 */
export const ContextMenu: React.FC<ContextMenuProps> = ({
  items,
  onItemClick,
  children,
  disabled = false,
  design,
  onOpenChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const contextMenuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLElement>(null);

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    onOpenChange?.(open);
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    if (disabled) return;

    e.preventDefault();
    e.stopPropagation();

    // Вычисляем позицию относительно viewport
    const x = e.clientX;
    const y = e.clientY;

    setPosition({ top: y, left: x });
    handleOpenChange(true);
  };

  const handleItemClick = (item: ContextMenuItem) => {
    if (item.disabled) return;
    item.onClick?.();
    onItemClick?.(item);
    handleOpenChange(false);
  };

  // Закрытие при клике вне меню
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      
      // Проверяем, что клик был вне меню
      const clickedInsideMenu = contextMenuRef.current?.contains(target);
      
      // Проверяем, что клик был вне триггера (если он существует)
      const clickedInsideTrigger = triggerRef.current?.contains(target);
      
      // Закрываем меню, если клик был вне меню и (вне триггера или триггер отсутствует)
      if (!clickedInsideMenu && (!triggerRef.current || !clickedInsideTrigger)) {
        handleOpenChange(false);
      }
    };

    // Используем capture фазу для более быстрого закрытия
    // Небольшая задержка, чтобы избежать закрытия при открытии через contextmenu
    const timeoutId = setTimeout(() => {
      document.addEventListener("mousedown", handleClickOutside, true);
      document.addEventListener("click", handleClickOutside, true);
      document.addEventListener("contextmenu", handleClickOutside, true);
    }, 0);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener("mousedown", handleClickOutside, true);
      document.removeEventListener("click", handleClickOutside, true);
      document.removeEventListener("contextmenu", handleClickOutside, true);
    };
  }, [isOpen]);

  // Закрытие при нажатии Escape
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleOpenChange(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen]);

  // Корректировка позиции, чтобы меню не выходило за границы viewport
  useEffect(() => {
    if (!isOpen || !contextMenuRef.current) return;

    const adjustPosition = () => {
      if (!contextMenuRef.current) return;

      const menuRect = contextMenuRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      let { top, left } = position;

      // Корректировка по горизонтали
      if (left + menuRect.width > viewportWidth) {
        left = viewportWidth - menuRect.width - 8;
      }
      if (left < 8) {
        left = 8;
      }

      // Корректировка по вертикали
      if (top + menuRect.height > viewportHeight) {
        top = viewportHeight - menuRect.height - 8;
      }
      if (top < 8) {
        top = 8;
      }

      if (top !== position.top || left !== position.left) {
        setPosition({ top, left });
      }
    };

    // Используем requestAnimationFrame для точной позиции после рендера
    requestAnimationFrame(adjustPosition);
  }, [isOpen, position]);

  const menuDesign: DesignProps = mergeDesign(
    {
      padding: 0,
      minWidth: "200px",
      maxWidth: "320px",
      maxHeight: "400px",
      overflowY: "auto",
      bg: "color.bg.primary",
      border: "1px solid",
      borderColor: "color.bg.tertiary",
      radius: "radius.md",
      shadow: "shadow.xl",
    },
    design
  );

  const defaultItemDesign: DesignProps = {
    padding: "10px 12px",
    bg: "transparent",
    color: "color.text.primary",
    fontSize: "typography.fontSize.sm",
    cursor: "pointer",
    transition: "all 0.15s ease",
    hover: {
      bg: "color.bg.tertiary",
    },
  };

  const dangerItemDesign: DesignProps = mergeDesign(defaultItemDesign, {
    color: "color.danger",
    hover: {
      bg: "color.bg.tertiary",
      color: "color.danger",
    },
  });

  const dividerDesign: DesignProps = {
    height: "1px",
    bg: "color.bg.tertiary",
    margin: "4px 0",
  };

  const menuClass = getDesignClass(menuDesign);

  return (
    <>
      {React.cloneElement(children, {
        ref: triggerRef,
        onContextMenu: handleContextMenu,
      })}
      {isOpen && (
        <div
          ref={contextMenuRef}
          className={menuClass}
          {...(getDataDesignAttribute(menuDesign) && { "data-design": getDataDesignAttribute(menuDesign) })}
          style={{
            position: "fixed",
            top: `${position.top}px`,
            left: `${position.left}px`,
            zIndex: 1000,
            pointerEvents: "auto",
          }}
          onContextMenu={(e) => e.preventDefault()}
        >
          <Card design={menuDesign}>
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
                  item.variant === "danger" ? dangerItemDesign : defaultItemDesign,
                  mergeDesign(
                    item.design,
                    item.disabled
                      ? {
                          cursor: "not-allowed",
                          opacity: 0.5,
                          hover: {
                            bg: "transparent",
                          },
                        }
                      : {}
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
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      width: "100%",
                      textAlign: "left",
                      border: "none",
                      outline: "none",
                    }}
                  >
                    {item.icon && (
                      <Box
                        design={{
                          display: "flex",
                          alignItems: "center",
                          color: item.variant === "danger" ? "color.danger" : "color.text.secondary",
                          flexShrink: 0,
                        }}
                      >
                        {item.icon}
                      </Box>
                    )}
                    <Text
                      design={{
                        fontSize: "typography.fontSize.sm",
                        color:
                          item.disabled
                            ? "color.text.secondary"
                            : item.variant === "danger"
                            ? "color.danger"
                            : "color.text.primary",
                        flex: 1,
                      }}
                    >
                      {item.label}
                    </Text>
                  </Box>
                );
              })}
            </Flex>
          </Card>
        </div>
      )}
    </>
  );
};

