import { useMemo } from "react";
import { generateAriaAttributes, mergeAriaAttributes, AriaAttributes } from "../accessibility";

/**
 * Hook для генерации ARIA атрибутов
 */
export function useAriaAttributes(props: {
  label?: string;
  labelledBy?: string;
  describedBy?: string;
  disabled?: boolean;
  hidden?: boolean;
  expanded?: boolean;
  selected?: boolean;
  checked?: boolean | "mixed";
  required?: boolean;
  invalid?: boolean;
  busy?: boolean;
  live?: "off" | "polite" | "assertive";
  controls?: string;
  owns?: string;
  hasPopup?: boolean | "menu" | "listbox" | "tree" | "grid" | "dialog";
  current?: boolean | "page" | "step" | "location" | "date" | "time";
  orientation?: "horizontal" | "vertical";
  role?: string;
  customAria?: Partial<AriaAttributes>;
  [key: string]: any;
}): AriaAttributes {
  return useMemo(() => {
    const defaultAria = generateAriaAttributes(props);
    return props.customAria ? mergeAriaAttributes(defaultAria, props.customAria) : defaultAria;
  }, [
    props.label,
    props.labelledBy,
    props.describedBy,
    props.disabled,
    props.hidden,
    props.expanded,
    props.selected,
    props.checked,
    props.required,
    props.invalid,
    props.busy,
    props.live,
    props.controls,
    props.owns,
    props.hasPopup,
    props.current,
    props.orientation,
    props.role,
    props.customAria,
  ]);
}

