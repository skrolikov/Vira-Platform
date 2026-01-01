import React, { useRef, useEffect, useState } from "react";
import { DesignProps } from "../types";
import { mergeDesign, getDesignClass, applyDesignClass } from "../utils/design-utils";
import { Box } from "./Box";

export interface ScrollAreaProps {
  children: React.ReactNode;
  maxHeight?: number | string;
  showScrollbar?: boolean;
  design?: DesignProps;
  className?: string;
}

/**
 * ScrollArea - Компонент области прокрутки с кастомным скроллбаром
 * 
 * Поддерживает:
 * - Кастомный скроллбар
 * - Максимальная высота
 * - Показ/скрытие скроллбара
 */
export const ScrollArea: React.FC<ScrollAreaProps> = ({
  children,
  maxHeight,
  showScrollbar = true,
  design,
  className,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hasScroll, setHasScroll] = useState(false);

  useEffect(() => {
    const checkScroll = () => {
      if (containerRef.current) {
        const hasVerticalScroll =
          containerRef.current.scrollHeight > containerRef.current.clientHeight;
        setHasScroll(hasVerticalScroll);
      }
    };

    checkScroll();
    window.addEventListener("resize", checkScroll);
    const observer = new ResizeObserver(checkScroll);
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      window.removeEventListener("resize", checkScroll);
      observer.disconnect();
    };
  }, [children]);

  useEffect(() => {
    const styleId = "vira-scrollarea-styles";
    if (!document.getElementById(styleId)) {
      const style = document.createElement("style");
      style.id = styleId;
      style.textContent = `
        .vira-scrollarea {
          overflow-y: auto;
          scrollbar-width: thin;
          scrollbar-color: #d1d5db transparent;
        }
        .vira-scrollarea::-webkit-scrollbar {
          width: 8px;
        }
        .vira-scrollarea::-webkit-scrollbar-track {
          background: transparent;
        }
        .vira-scrollarea::-webkit-scrollbar-thumb {
          background-color: #d1d5db;
          border-radius: 4px;
        }
        .vira-scrollarea::-webkit-scrollbar-thumb:hover {
          background-color: #9ca3af;
        }
        .vira-scrollarea-hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .vira-scrollarea-hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  const containerDesign: DesignProps = {
    overflowY: "auto",
    ...(maxHeight && { maxHeight }),
    ...design,
  };

  const mergedDesign = mergeDesign(containerDesign, design);
  const designClass = getDesignClass(mergedDesign);
  const scrollbarClass = showScrollbar ? "vira-scrollarea" : "vira-scrollarea-hide-scrollbar";
  const finalClassName = applyDesignClass(className, `${designClass} ${scrollbarClass}`.trim());

  return (
    <Box
      ref={containerRef}
      className={finalClassName}
      data-design={JSON.stringify(mergedDesign)}
      style={{
        maxHeight: maxHeight,
        ...(design as any),
      }}
    >
      {children}
    </Box>
  );
};

