import React, { useState, useRef, useEffect } from "react";
import { DesignProps } from "../types";
import { mergeDesign, getDesignClass, applyDesignClass } from "../utils/design-utils";
import { Text } from "./Text";
import { Flex } from "./Flex";

export interface SliderProps {
  value?: number;
  defaultValue?: number;
  min?: number;
  max?: number;
  step?: number;
  onChange?: (value: number) => void;
  onChangeEnd?: (value: number) => void;
  disabled?: boolean;
  showValue?: boolean;
  label?: string;
  marks?: { value: number; label: string }[];
  design?: DesignProps;
}

/**
 * Slider - Компонент слайдера для выбора числового значения
 * 
 * Поддерживает:
 * - Диапазон значений
 * - Шаг изменения
 * - Метки (marks)
 * - Отображение значения
 */
export const Slider: React.FC<SliderProps> = ({
  value: externalValue,
  defaultValue = 50,
  min = 0,
  max = 100,
  step = 1,
  onChange,
  onChangeEnd,
  disabled = false,
  showValue = false,
  label,
  marks,
  design,
}) => {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const [isDragging, setIsDragging] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);

  const isControlled = externalValue !== undefined;
  const value = isControlled ? externalValue : internalValue;

  const percentage = ((value - min) / (max - min)) * 100;

  const updateValue = (newValue: number, end = false) => {
    const clampedValue = Math.max(min, Math.min(max, Math.round(newValue / step) * step));
    if (!isControlled) {
      setInternalValue(clampedValue);
    }
    onChange?.(clampedValue);
    if (end) {
      onChangeEnd?.(clampedValue);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (disabled) return;
    setIsDragging(true);
    handleMouseMove(e);
  };

  const handleMouseMove = (e: React.MouseEvent | MouseEvent) => {
    if (!sliderRef.current || disabled) return;
    const rect = sliderRef.current.getBoundingClientRect();
    // React.MouseEvent имеет nativeEvent, MouseEvent (DOM) - нет
    const clientX = 'nativeEvent' in e ? e.nativeEvent.clientX : e.clientX;
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, x / rect.width));
    const newValue = min + percentage * (max - min);
    updateValue(newValue, false);
  };

  const handleMouseUp = () => {
    if (disabled) return;
    setIsDragging(false);
    onChangeEnd?.(value);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging, value]);

  const containerDesign: DesignProps = {
    width: "100%",
    ...design,
  };

  const trackDesign: DesignProps = {
    position: "relative",
    width: "100%",
    height: "6px",
    bg: disabled ? "#e5e7eb" : "#e5e7eb",
    borderRadius: "radius.full",
    cursor: disabled ? "not-allowed" : "pointer",
    ...design,
  };

  const fillDesign: DesignProps = {
    position: "absolute",
    left: 0,
    top: 0,
    height: "100%",
    width: `${percentage}%`,
    bg: disabled ? "#9ca3af" : "#3b82f6",
    borderRadius: "radius.full",
    transition: isDragging ? "none" : "width 0.1s ease",
  };

  const thumbDesign: DesignProps = {
    position: "absolute",
    left: `${percentage}%`,
    top: "50%",
    transform: "translate(-50%, -50%)",
    width: "20px",
    height: "20px",
    bg: disabled ? "#9ca3af" : "#ffffff",
    border: `2px solid ${disabled ? "#9ca3af" : "#3b82f6"}`,
    borderRadius: "50%",
    cursor: disabled ? "not-allowed" : "grab",
    boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
    ...(isDragging && {
      cursor: "grabbing",
      transform: "translate(-50%, -50%) scale(1.1)",
    }),
  };

  const mergedContainerDesign = mergeDesign(containerDesign, design);
  const containerClass = getDesignClass(mergedContainerDesign);

  return (
    <div className={containerClass} data-design={JSON.stringify(mergedContainerDesign)}>
      {(label || showValue) && (
        <Flex
          design={{
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 2,
          }}
        >
          {label && (
            <Text
              design={{
                fontSize: "14px",
                fontWeight: "500",
                color: "#374151",
              }}
            >
              {label}
            </Text>
          )}
          {showValue && (
            <Text
              design={{
                fontSize: "14px",
                color: "#6b7280",
                fontWeight: "500",
              }}
            >
              {value}
            </Text>
          )}
        </Flex>
      )}

      <div
        ref={sliderRef}
        className={getDesignClass(trackDesign)}
        data-design={JSON.stringify(trackDesign)}
        onMouseDown={handleMouseDown}
        style={{ userSelect: "none" }}
      >
        <div
          className={getDesignClass(fillDesign)}
          data-design={JSON.stringify(fillDesign)}
        />
        <div
          className={getDesignClass(thumbDesign)}
          data-design={JSON.stringify(thumbDesign)}
        />

        {marks && marks.map((mark) => {
          const markPercentage = ((mark.value - min) / (max - min)) * 100;
          return (
            <div
              key={mark.value}
              style={{
                position: "absolute",
                left: `${markPercentage}%`,
                top: "100%",
                marginTop: "8px",
                transform: "translateX(-50%)",
                fontSize: "12px",
                color: "#6b7280",
              }}
            >
              {mark.label}
            </div>
          );
        })}
      </div>
    </div>
  );
};

