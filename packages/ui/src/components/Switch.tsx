import React from "react";
import { DesignProps } from "../types";
import { mergeDesign, getDesignClass, applyDesignClass } from "../utils/design-utils";

export interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size" | "onChange"> {
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
  size?: "sm" | "md" | "lg";
  label?: string;
  description?: string;
  design?: DesignProps;
}

/**
 * Switch - Компонент переключателя
 * 
 * Поддерживает:
 * - Разные размеры
 * - Лейбл и описание
 * - Кастомный дизайн
 */
export const Switch: React.FC<SwitchProps> = ({
  checked,
  defaultChecked,
  onChange,
  size = "md",
  label,
  description,
  design,
  className,
  ...props
}) => {
  const [internalChecked, setInternalChecked] = React.useState(defaultChecked || false);
  const isControlled = checked !== undefined;
  const isChecked = isControlled ? checked : internalChecked;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newChecked = e.target.checked;
    if (!isControlled) {
      setInternalChecked(newChecked);
    }
    onChange?.(newChecked);
  };

  const sizeMap = {
    sm: { width: "32px", height: "18px", thumb: "14px" },
    md: { width: "44px", height: "24px", thumb: "20px" },
    lg: { width: "56px", height: "30px", thumb: "26px" },
  };

  const dimensions = sizeMap[size];

  const containerDesign: DesignProps = {
    display: "inline-flex",
    alignItems: "center",
    gap: 3,
    ...design,
  };

  const switchDesign: DesignProps = {
    position: "relative",
    display: "inline-block",
    width: dimensions.width,
    height: dimensions.height,
    ...design,
  };

  const inputDesign: DesignProps = {
    opacity: 0,
    width: 0,
    height: 0,
  };

  const sliderDesign: DesignProps = {
    position: "absolute",
    cursor: "pointer",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    bg: isChecked ? "#10b981" : "#d1d5db",
    transition: "0.3s",
    borderRadius: "radius.full",
    ...(props.disabled && {
      opacity: 0.5,
      cursor: "not-allowed",
    }),
  };

  const thumbDesign: DesignProps = {
    position: "absolute",
    content: '""',
    height: dimensions.thumb,
    width: dimensions.thumb,
    left: isChecked ? `calc(100% - ${dimensions.thumb} - 2px)` : "2px",
    bottom: "2px",
    bg: "#ffffff",
    transition: "0.3s",
    borderRadius: "50%",
    boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
  };

  const mergedContainerDesign = mergeDesign(containerDesign, design);
  const containerClass = getDesignClass(mergedContainerDesign);
  const finalContainerClassName = applyDesignClass(className, containerClass);

  const switchClass = getDesignClass(switchDesign);
  const sliderClass = getDesignClass(sliderDesign);
  const thumbClass = getDesignClass(thumbDesign);

  const switchElement = (
    <label className={switchClass} data-design={JSON.stringify(switchDesign)}>
      <input
        type="checkbox"
        checked={isChecked}
        onChange={handleChange}
        className={getDesignClass(inputDesign)}
        {...props}
      />
      <span className={sliderClass} data-design={JSON.stringify(sliderDesign)} />
      <span className={thumbClass} data-design={JSON.stringify(thumbDesign)} />
    </label>
  );

  if (label || description) {
    return (
      <div className={finalContainerClassName} data-design={JSON.stringify(mergedContainerDesign)}>
        {switchElement}
        {(label || description) && (
          <div>
            {label && (
              <div
                style={{
                  fontSize: size === "sm" ? "14px" : size === "md" ? "16px" : "18px",
                  fontWeight: "500",
                  color: "#111827",
                  marginBottom: description ? "4px" : "0",
                }}
              >
                {label}
              </div>
            )}
            {description && (
              <div
                style={{
                  fontSize: "12px",
                  color: "#6b7280",
                }}
              >
                {description}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  return switchElement;
};

