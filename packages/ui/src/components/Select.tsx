import React, { useState, useCallback, useMemo } from "react";
import { DesignProps } from "../types";
import {
  mergeDesign,
  getDesignClass,
  applyDesignClass,
  getDataDesignAttribute,
} from "../utils/design-utils";

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

export interface SelectProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "value" | "onChange"> {
  design?: DesignProps;
  modelValue?: string | number;
  onUpdateModelValue?: (value: string | number) => void;
  options?: SelectOption[];
  placeholder?: string;
  value?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

export const Select: React.FC<SelectProps> = ({
  design,
  modelValue,
  onUpdateModelValue,
  options = [],
  placeholder,
  value: externalValue,
  onChange: externalOnChange,
  className,
  ...props
}) => {
  /** 🧠 Runtime binding (data-model) */
  const hasDataModel = (props as any)["data-model"] != null;
  const isExternallyControlled =
    modelValue !== undefined || externalValue !== undefined;
  const runtimeControlsValue = hasDataModel && !isExternallyControlled;

  /** 🧠 Internal state */
  const [internalValue, setInternalValue] = useState<string | number>("");

  /** 🧠 Computed value (one source of truth) */
  const computedValue = useMemo(() => {
    if (modelValue !== undefined) return modelValue;
    if (externalValue !== undefined) return externalValue;
    return internalValue;
  }, [modelValue, externalValue, internalValue]);

  /** 🎯 Change handler */
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const newValue = e.target.value;

      if (!isExternallyControlled) {
        setInternalValue(newValue);
      }

      onUpdateModelValue?.(newValue);
      externalOnChange?.(e);
    },
    [isExternallyControlled, onUpdateModelValue, externalOnChange]
  );

  /** 🎨 Default design */
  const defaultDesign: DesignProps = {
    display: "block",
    width: "100%",
    padding: "12px 16px",
    bg: "color.bg.tertiary",
    border: "1px solid",
    borderColor: "color.bg.tertiary",
    radius: "radius.md",
    color: "color.text.primary",
    fontSize: "typography.fontSize.md",
    transition: "all 0.2s ease",
    outline: "none",
    appearance: "none",
    hover: {
      borderColor: "color.bg.secondary",
    },
    focus: {
      borderColor: "color.primary",
      shadow: "shadow.sm",
    },
    focusVisible: {
      borderColor: "color.primary",
      shadow: "shadow.sm",
    },
  };

  const mergedDesign = design
    ? mergeDesign(defaultDesign, design)
    : defaultDesign;

  const designClass = mergedDesign
    ? getDesignClass(mergedDesign)
    : "";

  const finalClassName = applyDesignClass(className, designClass);

  /** 🧼 Safe value */
  const safeValue =
    typeof computedValue === "string" || typeof computedValue === "number"
      ? String(computedValue)
      : "";

  return (
    <select
      className={finalClassName}
      onChange={handleChange}
      {...(!runtimeControlsValue && { value: safeValue })}
      {...(mergedDesign &&
        getDataDesignAttribute(mergedDesign) && {
          "data-design": getDataDesignAttribute(mergedDesign),
        })}
      {...props}
    >
      {placeholder && (
        <option value="" disabled>
          {placeholder}
        </option>
      )}

      {options.map((option) => (
        <option
          key={option.value}
          value={option.value}
          disabled={option.disabled}
        >
          {option.label}
        </option>
      ))}
    </select>
  );
};
