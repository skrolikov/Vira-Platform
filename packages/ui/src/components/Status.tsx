import React, { useState } from "react";
import { Badge } from "./Badge";
import { Dropdown } from "./Dropdown";
import { ChevronDown, ChevronRight } from "lucide-react";
import { DesignProps } from "../types";
import { mergeDesign, getDesignClass, applyDesignClass, getDataDesignAttribute } from "../utils/design-utils";

export type StatusValue = "success" | "warning" | "danger" | "info" | "default";

export interface StatusOption {
  value: StatusValue;
  label: string;
  color?: string;
  children?: StatusOption[]; // Поддержка дочерних статусов
}

export interface StatusProps {
  value: StatusValue;
  options?: StatusOption[];
  onChange?: (value: StatusValue) => void;
  design?: DesignProps;
  className?: string;
}

const defaultOptions: StatusOption[] = [
  { value: "success", label: "Оплачен" },
  { value: "warning", label: "В обработке" },
  { value: "danger", label: "Отменен" },
  { value: "info", label: "Новый" },
  { value: "default", label: "Неизвестно" },
];

export const Status: React.FC<StatusProps> = ({
  value,
  options = defaultOptions,
  onChange,
  design,
  className,
}) => {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const findOption = (options: StatusOption[], targetValue: StatusValue): StatusOption | undefined => {
    for (const option of options) {
      if (option.value === targetValue) return option;
      if (option.children) {
        const found = findOption(option.children, targetValue);
        if (found) return found;
      }
    }
    return undefined;
  };

  const currentOption = findOption(options, value) || options[0];

  const badgePresetMap: Record<StatusValue, "success" | "warning" | "danger" | "primary" | "default"> = {
    success: "success",
    warning: "warning",
    danger: "danger",
    info: "primary",
    default: "default",
  };

  const defaultDesign: DesignProps = {
    display: "inline-flex",
    alignItems: "center",
    gap: 1,
    cursor: onChange ? "pointer" : "default",
  };

  const mergedDesign = mergeDesign(defaultDesign, design);
  const designClass = getDesignClass(mergedDesign);
  const finalClassName = applyDesignClass(className, designClass);

  if (!onChange) {
    // Просто отображаем Badge без возможности изменения
    return (
      <Badge preset={badgePresetMap[value]}>
        {currentOption.label}
      </Badge>
    );
  }

  // Функция для рендеринга опций с поддержкой дочерних элементов
  const renderOption = (option: StatusOption, level: number = 0): any => {
    const hasChildren = option.children && option.children.length > 0;
    const isExpanded = expandedItems.has(option.value);
    const isSelected = option.value === value;

    return {
      id: option.value,
      label: option.label,
      onClick: hasChildren 
        ? () => {
            const newExpanded = new Set(expandedItems);
            if (newExpanded.has(option.value)) {
              newExpanded.delete(option.value);
            } else {
              newExpanded.add(option.value);
            }
            setExpandedItems(newExpanded);
          }
        : () => {
            onChange(option.value);
            setExpandedItems(new Set()); // Закрываем все при выборе
          },
      icon: hasChildren ? (
        <ChevronRight 
          size={14} 
          style={{ 
            transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)",
            transition: "transform 0.2s ease",
            marginRight: level > 0 ? `${level * 8}px` : undefined,
          }} 
        />
      ) : level > 0 ? (
        <span style={{ width: 14, marginRight: `${level * 8}px`, display: "inline-block" }} />
      ) : undefined,
      design: {
        padding: "8px 12px",
        bg: isSelected ? "color.primary" : "transparent",
        color: isSelected ? "color.text.inverse" : "color.text.primary",
        hover: {
          bg: isSelected ? "color.primary" : "color.bg.tertiary",
        },
      } as DesignProps,
    };
  };

  // Рекурсивно собираем все опции с учетом вложенности
  const flattenOptions = (optionsList: StatusOption[], level: number = 0): any[] => {
    const result: any[] = [];
    
    for (const option of optionsList) {
      const item = renderOption(option, level);
      result.push(item);
      
      // Если элемент раскрыт и есть дети, добавляем их
      if (option.children && expandedItems.has(option.value)) {
        result.push(...flattenOptions(option.children, level + 1));
      }
    }
    
    return result;
  };

  const dropdownItems = flattenOptions(options);

  return (
    <div
      className={finalClassName}
      style={{ position: "relative", display: "inline-block" }}
      {...(getDataDesignAttribute(mergedDesign) && { "data-design": getDataDesignAttribute(mergedDesign) })}
    >
      <Dropdown
        trigger={
          <Badge
            preset={badgePresetMap[value]}
            design={{
              display: "inline-flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            {currentOption.label}
            <ChevronDown size={12} />
          </Badge>
        }
        items={dropdownItems}
        placement="bottom-start"
        onItemClick={(item) => {
          // Сбрасываем раскрытые элементы при выборе элемента (dropdown закроется автоматически)
          setExpandedItems(new Set());
        }}
      />
    </div>
  );
};
