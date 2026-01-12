import React, { useState, useRef, useEffect } from "react";
import { DesignProps } from "../types";
import { mergeDesign, getDesignClass, applyDesignClass, getDataDesignAttribute } from "../utils/design-utils";
// Note: ViraComponentProps removed - component works independently
import { Search, X } from "lucide-react";
import { Button } from "./Button";

export interface SearchInputProps 
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "onChange" | "size"> {
  design?: DesignProps;
  containerDesign?: DesignProps;
  iconDesign?: DesignProps;
  clearButtonDesign?: DesignProps;
  onSearch?: (value: string) => void;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  showClearButton?: boolean;
  size?: "sm" | "md" | "lg";
}

export const SearchInput: React.FC<SearchInputProps> = ({ 
  design,
  containerDesign,
  iconDesign,
  clearButtonDesign,
  onSearch,
  className,
  onChange,
  showClearButton = true,
  size = "md",
  value: externalValue,
  defaultValue,
  placeholder = "Поиск...",
  ...props 
}) => {
  const [internalValue, setInternalValue] = useState<string>(defaultValue as string || "");
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const value = externalValue !== undefined ? externalValue : internalValue;
  const hasValue = value && String(value).length > 0;

  // Размеры
  const sizeStyles: Record<string, { container: DesignProps; input: DesignProps; icon: DesignProps }> = {
    sm: {
      container: { padding: 2, minHeight: "36px" },
      input: { fontSize: "typography.fontSize.sm", padding: "0 8px" },
      icon: { width: "16px", height: "16px" },
    },
    md: {
      container: { padding: 2, minHeight: "44px" },
      input: { fontSize: "typography.fontSize.md", padding: "0 12px" },
      icon: { width: "20px", height: "20px" },
    },
    lg: {
      container: { padding: 2, minHeight: "52px" },
      input: { fontSize: "typography.fontSize.lg", padding: "0 16px" },
      icon: { width: "24px", height: "24px" },
    },
  };

  const currentSize = sizeStyles[size];

  // Базовые стили контейнера
  const defaultContainerDesign: DesignProps = {
    display: "flex",
    alignItems: "center",
    gap: 2,
    position: "relative",
    bg: "color.bg.tertiary",
    border: "1px solid",
    borderColor: isFocused ? "color.primary" : "color.bg.tertiary",
    radius: "radius.md",
    transition: "all 0.2s ease",
    width: "100%",
    ...currentSize.container,
    hover: {
      borderColor: isFocused ? "color.primary" : "color.bg.tertiary",
      shadow: isFocused ? "shadow.sm" : undefined,
    },
    focusWithin: {
      borderColor: "color.primary",
      shadow: "shadow.sm",
    },
  };

  // Базовые стили иконки поиска
  const defaultIconDesign: DesignProps = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: isFocused ? "color.primary" : "color.text.secondary",
    transition: "color 0.2s ease",
    flexShrink: 0,
    ...currentSize.icon,
  };

  // Базовые стили инпута
  const defaultInputDesign: DesignProps = {
    flex: 1,
    border: "none",
    outline: "none",
    background: "transparent",
    color: "color.text.primary",
    ...currentSize.input,
    placeholder: {
      color: "color.text.secondary",
    },
  };

  // Базовые стили кнопки очистки
  const defaultClearButtonDesign: DesignProps = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "4px",
    background: "none",
    border: "none",
    color: "color.text.secondary",
    cursor: "pointer",
    radius: "radius.sm",
    transition: "all 0.2s ease",
    flexShrink: 0,
    ...currentSize.icon,
    hover: {
      bg: "color.bg.tertiary",
      color: "color.text.primary",
    },
  };

  // Объединяем дизайны
  const mergedContainerDesign = mergeDesign(defaultContainerDesign, containerDesign || {});
  const mergedIconDesign = mergeDesign(defaultIconDesign, iconDesign || {});
  const mergedInputDesign = mergeDesign(defaultInputDesign, design || {});
  const mergedClearButtonDesign = mergeDesign(defaultClearButtonDesign, clearButtonDesign || {});

  const containerClass = getDesignClass(mergedContainerDesign);
  const iconClass = getDesignClass(mergedIconDesign);
  const inputClass = getDesignClass(mergedInputDesign);
  const clearButtonClass = getDesignClass(mergedClearButtonDesign);
  const finalInputClassName = applyDesignClass(className, inputClass);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    
    if (externalValue === undefined) {
      setInternalValue(newValue);
    }
    
    onChange?.(e);
    onSearch?.(newValue);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (externalValue === undefined) {
      setInternalValue("");
    }
    
    // Создаём синтетическое событие для очистки
    const syntheticEvent = {
      target: { value: "" },
    } as React.ChangeEvent<HTMLInputElement>;
    
    onChange?.(syntheticEvent);
    onSearch?.("");
    
    // Фокус на инпут после очистки
    inputRef.current?.focus();
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    props.onFocus?.(e);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    props.onBlur?.(e);
  };

  return (
    <div 
      className={containerClass}
      {...(mergedContainerDesign && { "data-design": getDataDesignAttribute(mergedContainerDesign) })}
      onClick={() => inputRef.current?.focus()}
    >
      {/* Иконка поиска */}
      <div 
        className={iconClass}
        {...(mergedIconDesign && { "data-design": getDataDesignAttribute(mergedIconDesign) })}
      >
        <Search size={size === "sm" ? 16 : size === "lg" ? 24 : 20} />
      </div>

      {/* Input */}
      <input 
        ref={inputRef}
        type="search"
        className={finalInputClassName}
        {...(mergedInputDesign && { "data-design": getDataDesignAttribute(mergedInputDesign) })}
        value={value}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder}
        {...props}
      />

      {/* Кнопка очистки */}
      {showClearButton && hasValue && (
        <button
          type="button"
          className={clearButtonClass}
          {...(mergedClearButtonDesign && { "data-design": getDataDesignAttribute(mergedClearButtonDesign) })}
          onClick={handleClear}
          aria-label="Очистить поиск"
          title="Очистить"
        >
          <X size={size === "sm" ? 16 : size === "lg" ? 24 : 20} />
        </button>
      )}
    </div>
  );
};
