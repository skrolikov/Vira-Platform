import React from "react";
import { DesignProps } from "../types";
import { mergeDesign, getDesignClass, applyDesignClass } from "../utils/design-utils";
import { presets, PresetName } from "../presets";

export interface SectionProps
  extends Omit<React.HTMLAttributes<HTMLElement>, "as"> {
  design?: DesignProps;
  preset?: PresetName;
  as?: keyof JSX.IntrinsicElements;
  children: React.ReactNode;
}

export const Section: React.FC<SectionProps> = ({
  design,
  preset,
  as,
  children,
  className,
  ...props
}) => {
  const defaultDesign: DesignProps = {
    marginBottom: 3,
  };

  const presetDesign = preset ? presets[preset] : undefined;

  let finalDesign = defaultDesign;

  if (presetDesign) {
    finalDesign = mergeDesign(finalDesign, presetDesign);
  }

  if (design) {
    finalDesign = mergeDesign(finalDesign, design);
  }

  const designClass = finalDesign ? getDesignClass(finalDesign) : "";
  const finalClassName = applyDesignClass(className, designClass);

  const Component = (as || "section") as keyof JSX.IntrinsicElements;

  return (
    <Component
      className={finalClassName}
      {...(finalDesign && { "data-design": JSON.stringify(finalDesign) })}
      {...(preset && { "data-preset": preset })}
      {...(props as any)}
    >
      {children}
    </Component>
  );
};
