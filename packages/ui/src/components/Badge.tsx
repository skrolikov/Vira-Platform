import React from "react";
import { DesignProps } from "../types";
import {
  mergeDesign,
  getDesignClass,
  applyDesignClass,
  getDataDesignAttribute,
} from "../utils/design-utils";
import { presets, PresetName } from "../presets";

export type BadgePreset =
  | "default"
  | "primary"
  | "success"
  | "warning"
  | "danger"
  | "secondary"
  | "info"
  | "soft"
  | "outline"
  | PresetName;

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  design?: DesignProps;
  preset?: BadgePreset;
  children: React.ReactNode;
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  (
    {
      design,
      preset = "default",
      children,
      className,
      ...props
    },
    ref
  ) => {
    /** Привязка human preset → design preset */
    const badgePresetMap: Record<string, PresetName> = {
      default: "badge",
      primary: "badgePrimary",
      success: "badgeSuccess",
      warning: "badgeWarning",
      danger: "badgeDanger",
      secondary: "badgeSecondary",
      info: "badgeInfo",
      soft: "badgeSoft",
      outline: "badgeOutline",
    };

    const presetName =
      typeof preset === "string" && badgePresetMap[preset]
        ? badgePresetMap[preset]
        : preset;

    const presetDesign =
      presetName && presets[presetName as PresetName]
        ? presets[presetName as PresetName]
        : {};

    /** БАЗОВЫЙ ВИД БЕЙДЖА — ВСЕГДА */
    const baseDesign: DesignProps = {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",

      padding: 3,
      minHeight: "20px",

      fontSize: "typography.fontSize.xs",
      lineHeight: 1,

      borderRadius: "radius.full",
      whiteSpace: "nowrap",
      userSelect: "none",

      boxSizing: "border-box",
    };

    const mergedDesign = mergeDesign(
      mergeDesign(baseDesign, presetDesign),
      design
    );

    const designClass = getDesignClass(mergedDesign);
    const finalClassName = applyDesignClass(className, designClass);

    return (
      <span
        ref={ref}
        className={finalClassName}
        {...(getDataDesignAttribute(mergedDesign) && {
          "data-design": getDataDesignAttribute(mergedDesign),
        })}
        {...props}
      >
        {children}
      </span>
    );
  }
);

Badge.displayName = "Badge";
