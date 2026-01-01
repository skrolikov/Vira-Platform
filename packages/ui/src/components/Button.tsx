import React from "react";
import { DesignProps } from "../types";
import { mergeDesign, getDesignClass, applyDesignClass, getDataDesignAttribute } from "../utils/design-utils";
import { presets, PresetName } from "../presets";
import { mergeVariant, ComponentBase } from "../utils/variants";

/**
 * Button - Универсальный компонент кнопки
 * 
 * Поддерживает:
 * - design prop для стилей
 * - preset для предустановленных стилей
 * - base и variant для вариантов
 * - as prop для рендеринга как другого элемента
 * 
 * @example
 * // Обычное использование
 * <Button preset="primary">Click me</Button>
 * 
 * // С кастомным дизайном
 * <Button design={{ bg: "color.primary", padding: 3 }}>
 *   Кастомная кнопка
 * </Button>
 * 
 * // Как ссылка
 * <Button as="a" href="/page">Link</Button>
 */

export interface ButtonProps 
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "as"> {
  preset?: PresetName;
  loading?: boolean;
  base?: ComponentBase;
  variant?: DesignProps;
  design?: DesignProps;
  as?: keyof JSX.IntrinsicElements;
}

export const Button = React.forwardRef<HTMLElement, ButtonProps>(({ 
  design, 
  preset,
  base,
  variant,
  as,
  loading,
  children, 
  className,
  onClick,
  disabled,
  ...props 
}, ref) => {

  // ============================================
  // DESIGN MERGING
  // ============================================
  // Применяем пресет только если указан явно
  const presetDesign = preset ? presets[preset] : undefined;
  
  // Применяем variant только если указан base
  const variantDesign = variant && base ? mergeVariant(base, variant) : undefined;
  
  // Объединяем: preset -> variant -> design (design имеет наивысший приоритет)
  let mergedDesign = presetDesign;
  if (variantDesign) {
    mergedDesign = mergedDesign ? mergeDesign(mergedDesign, variantDesign) : variantDesign;
  }
  if (design) {
    mergedDesign = mergedDesign ? mergeDesign(mergedDesign, design) : design;
  }
  
  const designClass = mergedDesign ? getDesignClass(mergedDesign) : "";
  const finalClassName = applyDesignClass(className, designClass);
  
  const Component = (as || "button") as keyof JSX.IntrinsicElements;
  const isDisabled = disabled || loading;
  
  return (
    <>
      <style>{`
        button:disabled,
        button[disabled],
        [data-preset]:disabled,
        [data-preset][disabled] {
          opacity: 0.6 !important;
          cursor: not-allowed !important;
          pointer-events: none !important;
        }
        button:disabled:hover,
        button[disabled]:hover,
        [data-preset]:disabled:hover,
        [data-preset][disabled]:hover {
          transform: none !important;
          opacity: 0.6 !important;
        }
        @keyframes vira-button-shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        .vira-button-loading {
          position: relative;
          overflow: hidden;
        }
        .vira-button-loading > * {
          opacity: 0.7;
        }
        .vira-button-loading::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(255, 255, 255, 0.4) 30%,
            rgba(255, 255, 255, 0.6) 50%,
            rgba(255, 255, 255, 0.4) 70%,
            transparent 100%
          );
          animation: vira-button-shimmer 2s infinite;
          pointer-events: none;
          z-index: 1;
        }
      `}</style>
      {React.createElement(
        Component,
        {
          ref: ref as any,
          className: `${finalClassName} ${loading ? "vira-button-loading" : ""}`,
          onClick,
          disabled: isDisabled,
          style: {
            position: loading ? "relative" : undefined,
            ...props.style,
          },
          ...(mergedDesign && { "data-design": getDataDesignAttribute(mergedDesign) }),
          ...(preset && { "data-preset": preset }),
          "aria-busy": loading,
          "aria-disabled": isDisabled,
          ...(props as any),
        },
        children
      )}
    </>
  );
});

Button.displayName = "Button";

