import React from "react";
import { DesignProps } from "../types";
import { mergeDesign, getDesignClass, applyDesignClass } from "../utils/design-utils";

export interface CodeProps extends React.HTMLAttributes<HTMLElement> {
  design?: DesignProps;
  block?: boolean;
  children: React.ReactNode;
}

/**
 * Code - Компонент для отображения кода (inline или block)
 * 
 * @example
 * <Code>const x = 1;</Code> // inline code
 * 
 * <Code block>
 *   const x = 1;
 *   const y = 2;
 * </Code> // block code
 */
export const Code: React.FC<CodeProps> = ({ 
  design,
  block = false,
  children,
  className,
  ...props 
}) => {
  const defaultDesign: DesignProps = block
    ? {
        display: "block",
        padding: 3,
        borderRadius: 2,
        backgroundColor: "#f5f5f5",
        fontFamily: "monospace",
        fontSize: "14px",
        lineHeight: 1.5,
        overflow: "auto",
        border: "1px solid #e0e0e0",
      }
    : {
        display: "inline",
        padding: "2px 4px",
        borderRadius: 1,
        backgroundColor: "#f5f5f5",
        fontFamily: "monospace",
        fontSize: "0.9em",
        border: "1px solid #e0e0e0",
      };
  
  const mergedDesign = mergeDesign(defaultDesign, design);
  const designClass = getDesignClass(mergedDesign);
  const finalClassName = applyDesignClass(className, designClass);
  
  const Element = block ? "pre" : "code";
  
  return React.createElement(
    Element,
    {
      className: finalClassName,
      ...(mergedDesign && { "data-design": JSON.stringify(mergedDesign) }),
      ...props,
    },
    children
  );
};

