import React, { useEffect } from "react";
import { DesignProps } from "../types";
import { mergeDesign, getDesignClass, applyDesignClass } from "../utils/design-utils";

export interface BackdropProps {
  isOpen: boolean;
  onClick?: () => void;
  zIndex?: number;
  design?: DesignProps;
  children?: React.ReactNode;
}

/**
 * Backdrop - Компонент затемнения фона
 * 
 * Поддерживает:
 * - Клик для закрытия
 * - Кастомный z-index
 * - Дочерние элементы
 */
export const Backdrop: React.FC<BackdropProps> = ({
  isOpen,
  onClick,
  zIndex = 1000,
  design,
  children,
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    const styleId = "vira-backdrop-animation";
    if (!document.getElementById(styleId)) {
      const style = document.createElement("style");
      style.id = styleId;
      style.textContent = `
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  if (!isOpen) return null;

  const backdropDesign: DesignProps = {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    bg: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: zIndex,
    animation: "fadeIn 0.2s ease",
    ...design,
  };

  const mergedDesign = mergeDesign(backdropDesign, design);
  const designClass = getDesignClass(mergedDesign);

  return (
    <div
      className={designClass}
      data-design={JSON.stringify(mergedDesign)}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex,
      }}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

