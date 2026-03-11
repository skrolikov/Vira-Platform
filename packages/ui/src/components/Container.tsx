import React from "react";
import { DesignProps } from "../types";
import { mergeDesign, getDesignClass, applyDesignClass, getDataDesignAttribute } from "../utils/design-utils";
import { Flex } from "./Flex";

export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  design?: DesignProps;
  maxWidth?: string | number;
  children: React.ReactNode;
}

export const Container: React.FC<ContainerProps> = ({
  design,
  maxWidth,
  children,
  className,
  ...props
}) => {
  // Применяем maxWidth только если указан
  const propsDesign = maxWidth
    ? { maxWidth: typeof maxWidth === "number" ? `${maxWidth}px` : maxWidth }
    : undefined;

  const finalDesign = propsDesign && design
    ? mergeDesign(propsDesign, design)
    : (propsDesign || design);

  const designClass = finalDesign ? getDesignClass(finalDesign) : "";
  const finalClassName = applyDesignClass(className, designClass);

  return (
    <Flex
      direction="column"
      gap={3}
      className={finalClassName}
      {...(finalDesign && { "data-design": JSON.stringify(finalDesign) })}
      {...props}
    >
      {children}
    </Flex>
  );
};

