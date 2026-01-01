import React, { useState, useCallback } from "react";
import { Flex } from "./Flex";
import { Text } from "./Text";
import { Check } from "lucide-react";
import { DesignProps } from "../types";
import { mergeDesign, getDesignClass, applyDesignClass } from "../utils/design-utils";

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  label?: string;
  description?: string;
  size?: "sm" | "md" | "lg";
  indeterminate?: boolean;
  modelValue?: boolean;
  onUpdateModelValue?: (value: boolean) => void;
  design?: DesignProps;
}

/**
 * Checkbox - Компонент чекбокса с поддержкой пресетов
 * 
 * Поддерживает:
 * - Разные размеры (sm, md, lg)
 * - Лейбл и описание
 * - Indeterminate состояние
 * - Использует только пресеты и минимальные стили
 */
export const Checkbox: React.FC<CheckboxProps> = ({
  label,
  description,
  size = "md",
  indeterminate = false,
  className,
  checked: externalChecked,
  onChange: externalOnChange,
  modelValue,
  onUpdateModelValue,
  design,
  ...props
}) => {
  const [internalChecked, setInternalChecked] = useState<boolean>(false);

  // COMPUTED VALUE
  let computedChecked: boolean = false;
  if (modelValue !== undefined) {
    computedChecked = modelValue;
  } else if (externalChecked !== undefined) {
    computedChecked = externalChecked;
  } else {
    computedChecked = internalChecked;
  }

  // CHANGE HANDLER
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.checked;

      setInternalChecked(newValue);

      if (externalOnChange) {
        externalOnChange(e);
      }

      if (onUpdateModelValue) {
        onUpdateModelValue(newValue);
      }
    },
    [externalOnChange, onUpdateModelValue]
  );

  const sizeMap = {
    sm: { checkbox: 16, icon: 10, labelSize: "14px" },
    md: { checkbox: 20, icon: 14, labelSize: "16px" },
    lg: { checkbox: 24, icon: 18, labelSize: "18px" },
  };

  const dimensions = sizeMap[size];
  const isChecked = computedChecked || indeterminate;

  return (
    <label
      style={{
        display: "inline-flex",
        alignItems: "flex-start",
        gap: "8px",
        cursor: props.disabled ? "not-allowed" : "pointer",
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <input
        type="checkbox"
        className={className}
        checked={computedChecked}
        onChange={handleChange}
        style={{
          position: "absolute",
          opacity: 0,
          cursor: "inherit",
          width: 0,
          height: 0,
        }}
        ref={(el) => {
          if (el) {
            el.indeterminate = indeterminate;
          }
        }}
        {...props}
      />
      <div
        style={{
          position: "relative",
          width: `${dimensions.checkbox}px`,
          height: `${dimensions.checkbox}px`,
          borderRadius: "4px",
          border: `2px solid ${isChecked ? "var(--color-primary, #3b82f6)" : "var(--color-bg-tertiary, #d1d5db)"}`,
          backgroundColor: isChecked ? "var(--color-primary, #3b82f6)" : "var(--color-bg-primary, #ffffff)",
          flexShrink: 0,
          transition: "all 0.2s ease",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          ...(props.disabled && {
            opacity: 0.5,
            cursor: "not-allowed",
          }),
        }}
      >
        {isChecked && (
          <Check
            size={dimensions.icon}
            color="#ffffff"
            style={{
              strokeWidth: 3,
            }}
          />
        )}
      </div>
      {(label || description) && (
        <Flex direction="column" gap={0}>
          {label && (
            <Text
              style={{
                fontSize: dimensions.labelSize,
                fontWeight: 500,
                color: props.disabled ? "var(--color-text-secondary, #9ca3af)" : "var(--color-text-primary, #374151)",
                margin: 0,
              }}
            >
              {label}
            </Text>
          )}
          {description && (
            <Text
              style={{
                fontSize: "12px",
                color: "var(--color-text-secondary, #6b7280)",
                margin: 0,
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
