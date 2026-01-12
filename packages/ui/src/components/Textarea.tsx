import React from "react";
import { DesignProps } from "../types";
import { mergeDesign, getDesignClass, applyDesignClass, getDataDesignAttribute } from "../utils/design-utils";
import { presets, PresetName } from "../presets";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  design?: DesignProps;
  preset?: PresetName;
  resize?: "none" | "both" | "horizontal" | "vertical";
}

/**
 * Textarea - Компонент многострочного текстового ввода
 * 
 * Поддерживает:
 * - Пресеты для стилизации
 * - Кастомный дизайн
 * - Настройка resize
 */
export const Textarea: React.FC<TextareaProps> = ({
  design,
  preset,
  resize = "vertical",
  className,
  ...props
}) => {
  const presetDesign = preset ? presets[preset] : undefined;

  // Красивые стили по умолчанию — как у Input
  const defaultDesign: DesignProps = {
    width: "100%",
    padding: 3,
    bg: "color.bg.tertiary",
    border: "1px solid",
    borderColor: "color.bg.tertiary",
    radius: "radius.md",
    color: "color.text.primary",
    fontSize: "typography.fontSize.md",
    lineHeight: "1.5",
    transition: "all 0.2s ease",
    outline: "none",
    // resize поддерживаем через inline style ниже (чтобы точно работало во всех браузерах)
    hover: {
      borderColor: "color.bg.tertiary",
    },
    focus: {
      borderColor: "color.primary",
      shadow: "shadow.sm",
    },
  };

  const mergedDesign = presetDesign
    ? (design ? mergeDesign(presetDesign, design) : presetDesign)
    : (design ? mergeDesign(defaultDesign, design) : defaultDesign);
  const designClass = getDesignClass(mergedDesign);
  const finalClassName = applyDesignClass(className, designClass);

  return (
    <textarea
      className={finalClassName}
      {...(mergedDesign && getDataDesignAttribute(mergedDesign) && { "data-design": getDataDesignAttribute(mergedDesign) })}
      {...(preset && { "data-preset": preset })}
      style={{ resize }}
      {...props}
    />
  );
};

