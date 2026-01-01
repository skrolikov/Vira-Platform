import React, { useEffect } from "react";
import { DesignProps } from "../types";
import { mergeDesign, getDesignClass, applyDesignClass } from "../utils/design-utils";

export interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  design?: DesignProps;
  preset?: "default" | "primary" | "small" | "large";
  size?: number;
  color?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({ 
  design, 
  preset,
  size,
  color,
  className,
  ...props 
}) => {
  const presetDesign = preset ? getPresetDesign(preset, size) : {};
  
  // Если size указан напрямую, переопределяем
  const sizeDesign = size ? {
    width: `${size}px`,
    height: `${size}px`,
  } : {};
  
  // Объединяем сначала preset и size, затем с design
  const baseDesign = mergeDesign(presetDesign, sizeDesign);
  const finalDesign = mergeDesign(baseDesign, design);
  const designClass = getDesignClass(finalDesign);
  const finalClassName = applyDesignClass(className, designClass);
  
  // Добавляем CSS для анимации при первом использовании
  useEffect(() => {
    const styleId = "vira-spinner-styles";
    if (!document.getElementById(styleId)) {
      const style = document.createElement("style");
      style.id = styleId;
      style.textContent = `
        @keyframes vira-spinner-rotate {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        .v-spinner-inner {
          width: 100%;
          height: 100%;
          border: 2px solid transparent;
          border-top-color: currentColor;
          border-radius: 50%;
          animation: vira-spinner-rotate 0.8s linear infinite;
          box-sizing: border-box;
        }
      `;
      document.head.appendChild(style);
    }
  }, []);
  
  const spinnerColor = color || design?.color || "#3b82f6";
  
  // Определяем финальный размер
  const spinnerSize = size || (preset === "small" ? 16 : preset === "large" ? 48 : 24);
  const borderWidth = Math.max(2, Math.floor(spinnerSize / 12));
  
  // Убеждаемся, что размеры всегда заданы
  const containerStyle: React.CSSProperties = {
    display: "inline-block",
    position: "relative",
    width: `${spinnerSize}px`,
    height: `${spinnerSize}px`,
    color: spinnerColor,
    flexShrink: 0, // Предотвращаем растягивание
  };
  
  return (
    <div 
      className={finalClassName}
      data-design={JSON.stringify(finalDesign)}
      style={containerStyle}
      {...props}
    >
      <div 
        className="v-spinner-inner"
        style={{
          width: "100%",
          height: "100%",
          border: `${borderWidth}px solid transparent`,
          borderTopColor: "currentColor",
          borderRadius: "50%",
          animation: "vira-spinner-rotate 0.8s linear infinite",
          boxSizing: "border-box",
        }}
      />
    </div>
  );
};

function getPresetDesign(preset: string, size?: number): DesignProps {
  const baseSize = size || (preset === "small" ? 16 : preset === "large" ? 48 : 24);
  
  const baseDesign: DesignProps = {
    width: `${baseSize}px`,
    height: `${baseSize}px`,
    display: "inline-block",
    position: "relative",
  };
  
  switch (preset) {
    case "default":
      return {
        ...baseDesign,
      };
    case "primary":
      return {
        ...baseDesign,
      };
    case "small":
      return {
        ...baseDesign,
        width: "16px",
        height: "16px",
      };
    case "large":
      return {
        ...baseDesign,
        width: "48px",
        height: "48px",
      };
    default:
      return baseDesign;
  }
}

