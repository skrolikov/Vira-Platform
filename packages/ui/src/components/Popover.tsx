import React, { useState, useRef, useEffect } from "react";
import { DesignProps } from "../types";
import { mergeDesign, getDesignClass, applyDesignClass, getDataDesignAttribute } from "../utils/design-utils";
import { Card } from "./Card";
import { Flex } from "./Flex";

export type PopoverPlacement =
  | "top"
  | "top-start"
  | "top-end"
  | "bottom"
  | "bottom-start"
  | "bottom-end"
  | "left"
  | "left-start"
  | "left-end"
  | "right"
  | "right-start"
  | "right-end";

export interface PopoverProps {
  content: React.ReactNode;
  children: React.ReactElement;
  placement?: PopoverPlacement;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: "hover" | "click" | "focus";
  disabled?: boolean;
  offset?: number;
  design?: DesignProps;
  /** z-index контейнера контента (чтобы меню было поверх drawer и т.д.) */
  contentZIndex?: number;
}

/**
 * Popover - Компонент всплывающего окна
 * 
 * Поддерживает:
 * - 12 позиций размещения
 * - Разные триггеры
 * - Кастомный дизайн
 */
export const Popover: React.FC<PopoverProps> = ({
  content,
  children,
  placement = "bottom",
  isOpen: externalIsOpen,
  onOpenChange,
  trigger = "click",
  disabled = false,
  offset = 8,
  design,
}) => {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  const isControlled = externalIsOpen !== undefined;
  const isOpen = isControlled ? externalIsOpen : internalIsOpen;

  const setIsOpen = (open: boolean) => {
    if (!isControlled) {
      setInternalIsOpen(open);
    }
    onOpenChange?.(open);
  };

  const calculatePosition = () => {
    if (!triggerRef.current || !popoverRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const popoverRect = popoverRef.current.getBoundingClientRect();

    let top = 0;
    let left = 0;

    const [primary, secondary] = placement.split("-");

    // Для position: fixed используем только getBoundingClientRect (без scroll)
    switch (primary) {
      case "top":
        top = triggerRect.top - popoverRect.height - offset;
        left = triggerRect.left + triggerRect.width / 2 - popoverRect.width / 2;
        if (secondary === "start") left = triggerRect.left;
        if (secondary === "end") left = triggerRect.right - popoverRect.width;
        break;
      case "bottom":
        top = triggerRect.bottom + offset;
        left = triggerRect.left + triggerRect.width / 2 - popoverRect.width / 2;
        if (secondary === "start") left = triggerRect.left;
        if (secondary === "end") left = triggerRect.right - popoverRect.width;
        break;
      case "left":
        left = triggerRect.left - popoverRect.width - offset;
        top = triggerRect.top + triggerRect.height / 2 - popoverRect.height / 2;
        if (secondary === "start") top = triggerRect.top;
        if (secondary === "end") top = triggerRect.bottom - popoverRect.height;
        break;
      case "right":
        left = triggerRect.right + offset;
        top = triggerRect.top + triggerRect.height / 2 - popoverRect.height / 2;
        if (secondary === "start") top = triggerRect.top;
        if (secondary === "end") top = triggerRect.bottom - popoverRect.height;
        break;
    }

    // Проверяем границы viewport и корректируем
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    if (left < 0) left = 8;
    if (left + popoverRect.width > viewportWidth) left = viewportWidth - popoverRect.width - 8;
    if (top < 0) top = 8;
    if (top + popoverRect.height > viewportHeight) top = viewportHeight - popoverRect.height - 8;

    setPosition({ top, left });
  };

  useEffect(() => {
    if (isOpen) {
      calculatePosition();
      window.addEventListener("scroll", calculatePosition, true);
      window.addEventListener("resize", calculatePosition);
      return () => {
        window.removeEventListener("scroll", calculatePosition, true);
        window.removeEventListener("resize", calculatePosition);
      };
    }
  }, [isOpen, placement]);

  const handleClickOutside = (e: MouseEvent) => {
    if (
      trigger === "click" &&
      triggerRef.current &&
      popoverRef.current &&
      !triggerRef.current.contains(e.target as Node) &&
      !popoverRef.current.contains(e.target as Node)
    ) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    if (isOpen && trigger === "click") {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen, trigger]);

  const popoverDesign: DesignProps = mergeDesign(
    {
      position: "fixed",
      zIndex: 1000,
      padding: 0,
      bg: "transparent",
      border: "none",
      opacity: isOpen ? 1 : 0,
      visibility: isOpen ? "visible" : "hidden",
      transition: "opacity 0.15s ease, visibility 0.15s ease",
      pointerEvents: isOpen ? "auto" : "none",
    },
    design
  );

  const mergedDesign = popoverDesign;
  const popoverClass = getDesignClass(mergedDesign);

  const triggerProps: any = {
    ref: triggerRef,
  };

  if (trigger === "hover") {
    triggerProps.onMouseEnter = () => !disabled && setIsOpen(true);
    triggerProps.onMouseLeave = () => setIsOpen(false);
  } else if (trigger === "click") {
    triggerProps.onClick = () => !disabled && setIsOpen(!isOpen);
  } else if (trigger === "focus") {
    triggerProps.onFocus = () => !disabled && setIsOpen(true);
    triggerProps.onBlur = () => setIsOpen(false);
  }

  return (
    <>
      {React.cloneElement(children, triggerProps)}
      {isOpen && (
        <div
          ref={popoverRef}
          className={popoverClass}
          {...(getDataDesignAttribute(mergedDesign) && { "data-design": getDataDesignAttribute(mergedDesign) })}
          style={{
            ...position,
            position: "fixed",
          }}
        >
          {content}
        </div>
      )}
    </>
  );
};

