import React from "react";
import { DesignProps } from "../types";
import { mergeDesign, getDesignClass, applyDesignClass } from "../utils/design-utils";
import { presets, PresetName } from "../presets";

export interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  external?: boolean;
  design?: DesignProps;
  preset?: PresetName;
  underline?: boolean;
}

/**
 * Link - Компонент ссылки
 * 
 * Поддерживает:
 * - Внешние ссылки (external)
 * - Подчеркивание
 * - Пресеты
 */
export const Link: React.FC<LinkProps> = ({
  href,
  external = false,
  design,
  preset,
  underline = false,
  children,
  className,
  ...props
}) => {
  const presetDesign = preset ? presets[preset] : undefined;
  const finalDesign = presetDesign ? mergeDesign(presetDesign, design) : design;

  const linkDesign: DesignProps = {
    color: "#3b82f6",
    textDecoration: underline ? "underline" : "none",
    cursor: "pointer",
    transition: "color 0.2s ease",
    hover: {
      color: "#2563eb",
      textDecoration: underline ? "underline" : "none",
    },
    ...finalDesign,
  };

  const mergedDesign = mergeDesign(linkDesign, design);
  const designClass = getDesignClass(mergedDesign);
  const finalClassName = applyDesignClass(className, designClass);

  return (
    <a
      href={href}
      className={finalClassName}
      data-design={JSON.stringify(mergedDesign)}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      {...props}
    >
      {children}
    </a>
  );
};

