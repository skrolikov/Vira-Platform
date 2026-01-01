import React from "react";
import { DesignProps } from "../types";
import { mergeDesign, getDesignClass, applyDesignClass } from "../utils/design-utils";
import { Flex } from "./Flex";
import { Text } from "./Text";

export interface RadioProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  label?: string;
  description?: string;
  size?: "sm" | "md" | "lg";
  design?: DesignProps;
}

/**
 * Radio - Компонент радио-кнопки
 * 
 * Поддерживает:
 * - Разные размеры
 * - Лейбл и описание
 */
export const Radio: React.FC<RadioProps> = ({
  label,
  description,
  size = "md",
  design,
  className,
  ...props
}) => {
  const sizeMap = {
    sm: { radio: "16px", dot: "6px" },
    md: { radio: "20px", dot: "8px" },
    lg: { radio: "24px", dot: "10px" },
  };

  const dimensions = sizeMap[size];

  const containerDesign: DesignProps = {
    display: "inline-flex",
    alignItems: "flex-start",
    gap: 2,
    cursor: props.disabled ? "not-allowed" : "pointer",
    ...design,
  };

  const radioDesign: DesignProps = {
    position: "relative",
    display: "inline-block",
    width: dimensions.radio,
    height: dimensions.radio,
    ...design,
  };

  const mergedContainerDesign = mergeDesign(containerDesign, design);
  const containerClass = getDesignClass(mergedContainerDesign);

  return (
    <label className={containerClass} data-design={JSON.stringify(mergedContainerDesign)}>
      <input
        type="radio"
        className={className}
        style={{
          position: "absolute",
          opacity: 0,
          cursor: "inherit",
          width: dimensions.radio,
          height: dimensions.radio,
        }}
        {...props}
      />
      <div
        style={{
          position: "relative",
          width: dimensions.radio,
          height: dimensions.radio,
          borderRadius: "50%",
          border: `2px solid ${props.checked ? "#3b82f6" : "#d1d5db"}`,
          backgroundColor: props.checked ? "#3b82f6" : "#ffffff",
          flexShrink: 0,
          transition: "all 0.2s ease",
          ...(props.disabled && {
            opacity: 0.5,
            cursor: "not-allowed",
          }),
        }}
      >
        {props.checked && (
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: dimensions.dot,
              height: dimensions.dot,
              borderRadius: "50%",
              backgroundColor: "#ffffff",
            }}
          />
        )}
      </div>
      {(label || description) && (
        <Flex design={{ flexDirection: "column", gap: 0 }}>
          {label && (
            <Text
              design={{
                fontSize: size === "sm" ? "14px" : size === "md" ? "16px" : "18px",
                fontWeight: "500",
                color: props.disabled ? "#9ca3af" : "#374151",
              }}
            >
              {label}
            </Text>
          )}
          {description && (
            <Text
              design={{
                fontSize: "12px",
                color: "#6b7280",
              }}
            >
              {description}
            </Text>
          )}
        </Flex>
      )}
    </label>
  );
};

export interface RadioGroupProps {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  options: Array<{ value: string; label: string; description?: string; disabled?: boolean }>;
  direction?: "horizontal" | "vertical";
  size?: "sm" | "md" | "lg";
  design?: DesignProps;
}

/**
 * RadioGroup - Группа радио-кнопок
 */
export const RadioGroup: React.FC<RadioGroupProps> = ({
  value: externalValue,
  defaultValue,
  onChange,
  options,
  direction = "vertical",
  size = "md",
  design,
}) => {
  const [internalValue, setInternalValue] = React.useState(defaultValue || "");

  const isControlled = externalValue !== undefined;
  const value = isControlled ? externalValue : internalValue;

  const handleChange = (optionValue: string) => {
    if (!isControlled) {
      setInternalValue(optionValue);
    }
    onChange?.(optionValue);
  };

  const containerDesign: DesignProps = {
    display: "flex",
    flexDirection: direction === "horizontal" ? "row" : "column",
    gap: 3,
    ...design,
  };

  const mergedDesign = mergeDesign(containerDesign, design);
  const designClass = getDesignClass(mergedDesign);

  return (
    <div className={designClass} data-design={JSON.stringify(mergedDesign)}>
      {options.map((option) => (
        <Radio
          key={option.value}
          checked={value === option.value}
          onChange={() => handleChange(option.value)}
          label={option.label}
          description={option.description}
          disabled={option.disabled}
          size={size}
        />
      ))}
    </div>
  );
};

