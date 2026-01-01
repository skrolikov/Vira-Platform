import React, { useState, useCallback, useRef } from "react";
import { DesignProps } from "../types";
import { mergeDesign, getDesignClass, applyDesignClass, getDataDesignAttribute } from "../utils/design-utils";
import { presets, PresetName } from "../presets";
import { ChevronUp, ChevronDown } from "lucide-react";

/**
 * Input - Универсальный компонент ввода
 * 
 * Поддерживает:
 * - design prop для стилей
 * - preset для предустановленных стилей
 * - controlled/uncontrolled режим
 * 
 * @example
 * // Обычное использование
 * <Input preset="input" placeholder="Enter text..." />
 * 
 * // Controlled
 * <Input value={value} onChange={(e) => setValue(e.target.value)} />
 * 
 * // Uncontrolled
 * <Input defaultValue="initial" />
 */

export interface InputProps 
  extends React.InputHTMLAttributes<HTMLInputElement> {
  preset?: PresetName;
  design?: DesignProps;
  modelValue?: string;
  onUpdateModelValue?: (value: string) => void;
}

export const Input: React.FC<InputProps> = ({ 
  design, 
  preset,
  modelValue,
  onUpdateModelValue,
  value: externalValue,
  onChange: externalOnChange,
  defaultValue,
  className,
  type,
  min,
  max,
  step = 1,
  ...props 
}) => {

  // If this input is bound via BindingRuntime using data-model, we should NOT render it as
  // React-controlled (value=...) unless the caller explicitly controls it (modelValue/value).
  // Otherwise React will keep overwriting DOM value updates and typed characters can appear "invisible".
  const hasDataModel = (props as any)["data-model"] != null;
  const isExternallyControlled = modelValue !== undefined || externalValue !== undefined;
  const runtimeControlsValue = hasDataModel && !isExternallyControlled;

  // ============================================
  // STATE для uncontrolled режима
  // ============================================
  const [internalValue, setInternalValue] = useState<string>(
    defaultValue ? String(defaultValue) : ""
  );

  // ============================================
  // COMPUTED VALUE
  // ============================================
  let computedValue: string = "";
  if (modelValue !== undefined) {
    computedValue = modelValue;
  } else if (externalValue !== undefined) {
    computedValue = String(externalValue);
  } else {
    computedValue = internalValue;
  }

  // ============================================
  // CHANGE HANDLER
  // ============================================
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;

      // Обновляем внутренний стейт для uncontrolled режима
      setInternalValue(newValue);

      // Вызываем внешний onChange
      if (externalOnChange) {
        externalOnChange(e);
      }

      // Вызываем onUpdateModelValue
      if (onUpdateModelValue) {
        onUpdateModelValue(newValue);
      }
    },
    [externalOnChange, onUpdateModelValue]
  );

  // ============================================
  // DESIGN MERGING
  // ============================================
  // Маппинг старых пресетов на новые (для обратной совместимости)
  const presetMapping: Record<string, PresetName> = {
    default: "input",
    soft: "inputSoft",
    outline: "inputOutline",
  };
  
  const mappedPreset = preset && presetMapping[preset as string] 
    ? presetMapping[preset as string] 
    : preset;
  
  const presetDesign = mappedPreset ? presets[mappedPreset] : undefined;
  
  // Красивые стили по умолчанию (как у SearchInput)
  const defaultDesign: DesignProps = {
    padding: "12px 16px",
    bg: "color.bg.tertiary",
    border: "1px solid",
    borderColor: "color.bg.tertiary",
    radius: "radius.md",
    color: "color.text.primary",
    fontSize: "typography.fontSize.md",
    transition: "all 0.2s ease",
    outline: "none",
    width: "100%",
    minWidth: 0,
    boxSizing: "border-box",
    hover: {
      borderColor: "color.bg.tertiary",
    },
    focus: {
      borderColor: "color.primary",
      shadow: "shadow.sm",
    },
  };
  
  // Если preset не указан, используем defaultDesign
  // Если preset указан, используем его, но мержим с defaultDesign как базой (если нужно)
  let mergedDesign: DesignProps | undefined;
  
  if (presetDesign) {
    // Если есть preset, используем его
    mergedDesign = presetDesign && design 
      ? mergeDesign(presetDesign, design) 
      : (presetDesign || design);
  } else {
    // Если preset нет, используем defaultDesign как основу
    mergedDesign = design 
      ? mergeDesign(defaultDesign, design) 
      : defaultDesign;
  }
  
  const designClass = mergedDesign ? getDesignClass(mergedDesign) : "";
  const finalClassName = applyDesignClass(className, designClass);
  
  const isNumberInput = type === "number";
  const inputRef = useRef<HTMLInputElement>(null);

  const setNativeInputValue = useCallback((el: HTMLInputElement, next: string) => {
    // Use native setter so React's internal value tracker (when present) can observe changes.
    const desc = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value");
    const setter = desc?.set;
    if (setter) setter.call(el, next);
    else el.value = next;
  }, []);
  
  // Обработчики для кнопок увеличения/уменьшения
  const handleStepUp = useCallback(() => {
    if (!isNumberInput || !inputRef.current) return;
    
    const currentValue = runtimeControlsValue
      ? (parseFloat(inputRef.current.value) || 0)
      : (parseFloat(computedValue) || 0);
    const stepValue = typeof step === "string" ? parseFloat(step) : (step || 1);
    let newValue = currentValue + stepValue;
    
    if (max !== undefined) {
      const maxValue = typeof max === "string" ? parseFloat(max) : max;
      newValue = Math.min(newValue, maxValue);
    }
    
    if (runtimeControlsValue) {
      setNativeInputValue(inputRef.current, String(newValue));
      inputRef.current.dispatchEvent(new Event("input", { bubbles: true }));
      inputRef.current.focus();
      return;
    }

    // Создаём синтетическое событие
    const syntheticEvent = {
      target: { value: String(newValue) },
    } as React.ChangeEvent<HTMLInputElement>;
    
    handleChange(syntheticEvent);
    inputRef.current?.focus();
  }, [isNumberInput, runtimeControlsValue, computedValue, step, max, handleChange, setNativeInputValue]);
  
  const handleStepDown = useCallback(() => {
    if (!isNumberInput || !inputRef.current) return;
    
    const currentValue = runtimeControlsValue
      ? (parseFloat(inputRef.current.value) || 0)
      : (parseFloat(computedValue) || 0);
    const stepValue = typeof step === "string" ? parseFloat(step) : (step || 1);
    let newValue = currentValue - stepValue;
    
    if (min !== undefined) {
      const minValue = typeof min === "string" ? parseFloat(min) : min;
      newValue = Math.max(newValue, minValue);
    }
    
    if (runtimeControlsValue) {
      setNativeInputValue(inputRef.current, String(newValue));
      inputRef.current.dispatchEvent(new Event("input", { bubbles: true }));
      inputRef.current.focus();
      return;
    }

    // Создаём синтетическое событие
    const syntheticEvent = {
      target: { value: String(newValue) },
    } as React.ChangeEvent<HTMLInputElement>;
    
    handleChange(syntheticEvent);
    inputRef.current?.focus();
  }, [isNumberInput, runtimeControlsValue, computedValue, step, min, handleChange, setNativeInputValue]);
  
  // Если это number input, оборачиваем в контейнер со стрелками
  if (isNumberInput) {
    // Стили для контейнера
    const containerDesign: DesignProps = {
      position: "relative",
      display: "flex",
      alignItems: "stretch",
      width: "100%",
    };
    
    // Стили для input (добавляем padding справа для стрелок)
    const inputWithArrowsDesign: DesignProps = mergeDesign(mergedDesign || {}, {
      paddingRight: "40px", // Место для стрелок
    });
    
    const containerClass = getDesignClass(containerDesign);
    const inputWithArrowsClass = getDesignClass(inputWithArrowsDesign);
    const finalInputClassName = applyDesignClass(className, inputWithArrowsClass);
    
    // Стили для кнопок стрелок
    const arrowButtonsDesign: DesignProps = {
      position: "absolute",
      right: "4px",
      top: "50%",
      transform: "translateY(-50%)",
      display: "flex",
      flexDirection: "column",
      gap: 0,
      zIndex: 1,
    };
    
    const arrowButtonDesign: DesignProps = {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "2px",
      border: "none",
      background: "transparent",
      cursor: "pointer",
      color: "color.text.secondary",
      transition: "color 0.2s ease",
      hover: {
        color: "color.primary",
        bg: "color.bg.tertiary",
      },
      focus: {
        outline: "none",
      },
    };
    
    const arrowButtonsClass = getDesignClass(arrowButtonsDesign);
    
    return (
      <>
        {/* Скрываем стандартные стрелки браузера */}
        <style>{`
          input[type="number"]::-webkit-inner-spin-button,
          input[type="number"]::-webkit-outer-spin-button {
            -webkit-appearance: none;
            margin: 0;
          }
          input[type="number"] {
            -moz-appearance: textfield;
          }
        `}</style>
        <div className={containerClass} {...(containerDesign && { "data-design": getDataDesignAttribute(containerDesign) })}>
          <input 
            ref={inputRef}
            type="number"
            className={finalInputClassName}
            {...(!runtimeControlsValue && { value: computedValue })}
            onChange={handleChange}
            min={min}
            max={max}
            step={step}
            {...(inputWithArrowsDesign && getDataDesignAttribute(inputWithArrowsDesign) && { "data-design": getDataDesignAttribute(inputWithArrowsDesign) })}
            {...(preset && { "data-preset": preset })}
            {...props}
          />
          <div className={arrowButtonsClass} {...(arrowButtonsDesign && { "data-design": getDataDesignAttribute(arrowButtonsDesign) })}>
            <button
              type="button"
              onClick={handleStepUp}
              className={getDesignClass(arrowButtonDesign)}
              {...(arrowButtonDesign && { "data-design": getDataDesignAttribute(arrowButtonDesign) })}
              aria-label="Увеличить"
              tabIndex={-1}
            >
              <ChevronUp size={16} />
            </button>
            <button
              type="button"
              onClick={handleStepDown}
              className={getDesignClass(arrowButtonDesign)}
              {...(arrowButtonDesign && { "data-design": getDataDesignAttribute(arrowButtonDesign) })}
              aria-label="Уменьшить"
              tabIndex={-1}
            >
              <ChevronDown size={16} />
            </button>
          </div>
        </div>
      </>
    );
  }
  
  // Обычный input без стрелок
  return (
    <input 
      ref={inputRef}
      type={type}
      className={finalClassName}
      {...(!runtimeControlsValue && { value: computedValue })}
      onChange={handleChange}
      {...(mergedDesign && getDataDesignAttribute(mergedDesign) && { "data-design": getDataDesignAttribute(mergedDesign) })}
      {...(preset && { "data-preset": preset })}
      {...props}
    />
  );
};
