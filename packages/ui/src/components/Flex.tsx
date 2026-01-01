import React from "react";
import { DesignProps } from "../types";
import { mergeDesign, getDesignClass, applyDesignClass, getDataDesignAttribute } from "../utils/design-utils";

export interface FlexProps extends React.HTMLAttributes<HTMLDivElement> {
  design?: DesignProps;
  direction?: "row" | "column";
  gap?: number | string;
  align?: "flex-start" | "flex-end" | "center" | "stretch";
  justify?: "flex-start" | "flex-end" | "center" | "space-between" | "space-around";
  wrap?: boolean;
  children?: React.ReactNode;
}

export const Flex = React.forwardRef<HTMLDivElement, FlexProps>(
  (
    {
      design,
      direction = "row",
      gap = 3,
      align,
      justify,
      wrap = false,
      children,
      className,
      ...props
    },
    ref
  ) => {
    const defaultDesign: DesignProps = {
      display: "flex",
      flexDirection: direction,
      gap: gap,
      ...(align && { alignItems: align }),
      ...(justify && { justifyContent: justify }),
      ...(wrap && { flexWrap: "wrap" }),
    };

    const mergedDesign = mergeDesign(defaultDesign, design);
    const designClass = getDesignClass(mergedDesign);
    const finalClassName = applyDesignClass(className, designClass);

    return (
      <div
        ref={ref}
        className={finalClassName}
        {...(mergedDesign && { "data-design": getDataDesignAttribute(mergedDesign) })}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Flex.displayName = "Flex";

