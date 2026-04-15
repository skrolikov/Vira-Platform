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

  // Добавляем position: relative для loading анимации, если нужно
  if (loading && mergedDesign) {
    mergedDesign = mergeDesign(mergedDesign, { position: "relative" });
  } else if (loading) {
    mergedDesign = { position: "relative" };
  }

  const designClass = mergedDesign ? getDesignClass(mergedDesign) : "";
  const finalClassName = applyDesignClass(className, designClass);

  const Component = (as || "button") as keyof JSX.IntrinsicElements;
  const isDisabled = disabled || loading;

  return (
    <>
      {React.createElement(
        Component,
        {
          ref: ref as any,
          className: `${finalClassName}`,
          onClick,
          disabled: isDisabled,
          ...(props.style && { style: props.style }),
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

