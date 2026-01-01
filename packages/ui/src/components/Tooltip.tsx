import React, { useState, useRef, useEffect } from "react";
import { DesignProps } from "../types";
import { mergeDesign, getDesignClass, applyDesignClass } from "../utils/design-utils";
import { Card } from "./Card";
import { Text } from "./Text";

export type TooltipPlacement =
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

export interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactElement;
  placement?: TooltipPlacement;
  delay?: number;
  trigger?: "hover" | "click" | "focus";
  disabled?: boolean;
  design?: DesignProps;
  offset?: number;
}

/**
 * Tooltip - Компонент всплывающих подсказок
 * 
 * Поддерживает:
 * - 12 позиций размещения
 * - Разные триггеры (hover, click, focus)
 * - Задержку показа
 * - Кастомный дизайн
 */
export const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  placement = "top",
  delay = 200,
  trigger = "hover",
  disabled = false,
  design,
  offset = 8,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const calculatePosition = () => {
    if (!triggerRef.current || !tooltipRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

    let top = 0;
    let left = 0;

    const [primary, secondary] = placement.split("-");

    switch (primary) {
      case "top":
        top = triggerRect.top + scrollTop - tooltipRect.height - offset;
        left = triggerRect.left + scrollLeft + triggerRect.width / 2 - tooltipRect.width / 2;
        if (secondary === "start") left = triggerRect.left + scrollLeft;
        if (secondary === "end") left = triggerRect.left + scrollLeft + triggerRect.width - tooltipRect.width;
        break;
      case "bottom":
        top = triggerRect.bottom + scrollTop + offset;
        left = triggerRect.left + scrollLeft + triggerRect.width / 2 - tooltipRect.width / 2;
        if (secondary === "start") left = triggerRect.left + scrollLeft;
        if (secondary === "end") left = triggerRect.left + scrollLeft + triggerRect.width - tooltipRect.width;
        break;
      case "left":
        left = triggerRect.left + scrollLeft - tooltipRect.width - offset;
        top = triggerRect.top + scrollTop + triggerRect.height / 2 - tooltipRect.height / 2;
        if (secondary === "start") top = triggerRect.top + scrollTop;
        if (secondary === "end") top = triggerRect.top + scrollTop + triggerRect.height - tooltipRect.height;
        break;
      case "right":
        left = triggerRect.right + scrollLeft + offset;
        top = triggerRect.top + scrollTop + triggerRect.height / 2 - tooltipRect.height / 2;
        if (secondary === "start") top = triggerRect.top + scrollTop;
        if (secondary === "end") top = triggerRect.top + scrollTop + triggerRect.height - tooltipRect.height;
        break;
    }

    setPosition({ top, left });
  };

  const showTooltip = () => {
    if (disabled) return;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
      setTimeout(calculatePosition, 0);
    }, delay);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsVisible(false);
  };

  const handleClick = (e: MouseEvent) => {
    if (trigger === "click") {
      if (!triggerRef.current?.contains(e.target as Node)) {
        hideTooltip();
      }
    }
  };

  useEffect(() => {
    if (isVisible) {
      calculatePosition();
      window.addEventListener("scroll", calculatePosition, true);
      window.addEventListener("resize", calculatePosition);
      if (trigger === "click") {
        document.addEventListener("click", handleClick);
      }
      return () => {
        window.removeEventListener("scroll", calculatePosition, true);
        window.removeEventListener("resize", calculatePosition);
        if (trigger === "click") {
          document.removeEventListener("click", handleClick);
        }
      };
    }
  }, [isVisible, trigger]);

  const tooltipDesign: DesignProps = {
    ...design,
  };

  const tooltipClass = getDesignClass(tooltipDesign);

  const triggerProps: any = {
    ref: triggerRef,
  };

  if (trigger === "hover") {
    triggerProps.onMouseEnter = showTooltip;
    triggerProps.onMouseLeave = hideTooltip;
  } else if (trigger === "click") {
    triggerProps.onClick = () => {
      isVisible ? hideTooltip() : showTooltip();
    };
  } else if (trigger === "focus") {
    triggerProps.onFocus = showTooltip;
    triggerProps.onBlur = hideTooltip;
  }

  return (
    <>
      {React.cloneElement(children, triggerProps)}
      {isVisible && (
        <div
          ref={tooltipRef}
          className={tooltipClass}
          data-design={JSON.stringify(tooltipDesign)}
          style={{
            ...position,
            position: "fixed",
            zIndex: 9999,
            padding: "6px 12px",
            backgroundColor: "#1f2937",
            color: "#ffffff",
            borderRadius: "6px",
            fontSize: "13px",
            lineHeight: "1.4",
            maxWidth: "200px",
            pointerEvents: "none",
            opacity: isVisible ? 1 : 0,
            visibility: isVisible ? "visible" : "hidden",
            transition: "opacity 0.2s ease, visibility 0.2s ease",
            ...(design as any),
          }}
        >
          {typeof content === "string" ? (
            <Text
              design={{
                color: "#ffffff",
                fontSize: "13px",
                margin: 0,
              }}
            >
              {content}
            </Text>
          ) : (
            content
          )}
        </div>
      )}
    </>
  );
};

