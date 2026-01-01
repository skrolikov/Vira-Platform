import React, { useState } from "react";
import { DesignProps } from "../types";
import { mergeDesign, getDesignClass, applyDesignClass } from "../utils/design-utils";
import { Star } from "lucide-react";

export interface RatingProps {
  value?: number;
  defaultValue?: number;
  max?: number;
  onChange?: (value: number) => void;
  readonly?: boolean;
  size?: "sm" | "md" | "lg" | number;
  allowHalf?: boolean;
  design?: DesignProps;
  className?: string;
}

/**
 * Rating - Компонент рейтинга со звездами
 * 
 * Поддерживает:
 * - Половинчатые звезды
 * - Только чтение
 * - Разные размеры
 * - Кастомный дизайн
 */
export const Rating: React.FC<RatingProps> = ({
  value: externalValue,
  defaultValue = 0,
  max = 5,
  onChange,
  readonly = false,
  size = "md",
  allowHalf = false,
  design,
  className,
}) => {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const [hoverValue, setHoverValue] = useState<number | null>(null);

  const isControlled = externalValue !== undefined;
  const value = isControlled ? externalValue : internalValue;
  const displayValue = hoverValue ?? value;

  const sizeMap: Record<string, number> = {
    sm: 16,
    md: 20,
    lg: 24,
  };

  const starSize = typeof size === "number" ? size : sizeMap[size] || sizeMap.md;

  const handleClick = (newValue: number) => {
    if (readonly) return;
    if (!isControlled) {
      setInternalValue(newValue);
    }
    onChange?.(newValue);
  };

  const handleMouseMove = (newValue: number) => {
    if (readonly) return;
    setHoverValue(newValue);
  };

  const handleMouseLeave = () => {
    setHoverValue(null);
  };

  const containerDesign: DesignProps = {
    display: "inline-flex",
    alignItems: "center",
    gap: 1,
    ...design,
  };

  const mergedDesign = mergeDesign(containerDesign, design);
  const designClass = getDesignClass(mergedDesign);
  const finalClassName = applyDesignClass(className, designClass);

  return (
    <div
      className={finalClassName}
      data-design={JSON.stringify(mergedDesign)}
      onMouseLeave={handleMouseLeave}
    >
      {Array.from({ length: max }, (_, index) => {
        const starValue = index + 1;
        const isFilled = displayValue >= starValue;
        const isHalfFilled = allowHalf && displayValue >= starValue - 0.5 && displayValue < starValue;
        const isEmpty = !isFilled && !isHalfFilled;

        return (
          <div
            key={index}
            style={{
              position: "relative",
              display: "inline-block",
              cursor: readonly ? "default" : "pointer",
            }}
            onClick={() => handleClick(starValue)}
            onMouseMove={() => handleMouseMove(starValue)}
          >
            <Star
              size={starSize}
              fill={isFilled || isHalfFilled ? "#fbbf24" : "none"}
              color={isFilled || isHalfFilled ? "#fbbf24" : "#d1d5db"}
              style={{
                transition: "all 0.2s ease",
              }}
            />
            {allowHalf && isHalfFilled && (
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "50%",
                  height: "100%",
                  overflow: "hidden",
                }}
              >
                <Star
                  size={starSize}
                  fill="#fbbf24"
                  color="#fbbf24"
                  style={{
                    position: "absolute",
                    left: 0,
                  }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

