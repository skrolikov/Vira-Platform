import React, { useState } from "react";
import { DesignProps } from "../types";
import { getDesignClass, applyDesignClass } from "../utils/design-utils";
import { Button } from "./Button";
import { Badge } from "./Badge";

export interface FilterOption {
  label: string;
  value: string;
  count?: number;
}

export interface FilterGroupProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  options: FilterOption[];
  activeValue?: string;
  onChange?: (value: string) => void;
  design?: DesignProps;
}

export const FilterGroup: React.FC<FilterGroupProps> = ({ 
  options,
  activeValue,
  onChange,
  design,
  className,
  ...props 
}) => {
  const [selected, setSelected] = useState(activeValue || options[0]?.value);
  
  const mergedDesign = design;
  const containerClass = mergedDesign ? getDesignClass(mergedDesign) : "";
  const finalClassName = applyDesignClass(className, containerClass);
  
  const handleClick = (value: string) => {
    setSelected(value);
    onChange?.(value);
  };
  
  return (
    <div 
      className={finalClassName}
      {...(mergedDesign && { "data-design": JSON.stringify(mergedDesign) })}
      {...props}
    >
      {options.map((option) => {
        const isActive = selected === option.value;
        
        return (
          <Button
            key={option.value}
            preset={isActive ? "primary" : "secondary"}
            onClick={() => handleClick(option.value)}
          >
            <span>{option.label}</span>
            {option.count !== undefined && (
              <Badge preset={isActive ? "primary" : "default"}>
                {option.count}
              </Badge>
            )}
          </Button>
        );
      })}
    </div>
  );
};

