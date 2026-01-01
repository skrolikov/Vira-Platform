import { tokens } from "./tokens/default";

export type TokenPath = 
  | `color.${keyof typeof tokens.color}`
  | `color.text.${keyof typeof tokens.color.text}`
  | `color.bg.${keyof typeof tokens.color.bg}`
  | `radius.${keyof typeof tokens.radius}`
  | `space.${keyof typeof tokens.space}`
  | `shadow.${keyof typeof tokens.shadow}`
  | `typography.fontSize.${keyof typeof tokens.typography.fontSize}`
  | `typography.fontWeight.${keyof typeof tokens.typography.fontWeight}`;

export type DesignValue = 
  | string 
  | number 
  | TokenPath
  | { [key: string]: DesignValue };

export type ResponsiveValue<T> = T | {
  base?: T;
  sm?: T;
  md?: T;
  lg?: T;
  xl?: T;
};

export interface NestedStyles {
  [selector: string]: Omit<DesignProps, "hover" | "focus" | "active">;
}

export interface DesignProps {
  // Colors
  color?: TokenPath | string;
  bg?: TokenPath | string;
  border?: string;
  borderColor?: TokenPath | string;
  
  // Spacing
  padding?: ResponsiveValue<keyof typeof tokens.space | number | string>;
  margin?: ResponsiveValue<keyof typeof tokens.space | number | string>;
  marginBottom?: ResponsiveValue<keyof typeof tokens.space | number | string>;
  marginTop?: ResponsiveValue<keyof typeof tokens.space | number | string>;
  marginLeft?: ResponsiveValue<keyof typeof tokens.space | number | string>;
  marginRight?: ResponsiveValue<keyof typeof tokens.space | number | string>;
  gap?: ResponsiveValue<keyof typeof tokens.space | number | string>;
  
  // Layout
  width?: ResponsiveValue<string | number>;
  height?: ResponsiveValue<string | number>;
  maxWidth?: ResponsiveValue<string | number>;
  minWidth?: ResponsiveValue<string | number>;
  maxHeight?: ResponsiveValue<string | number>;
  minHeight?: ResponsiveValue<string | number>;
  display?: ResponsiveValue<"flex" | "grid" | "block" | "inline" | "inline-block" | "inline-flex" | "none">;
  flexDirection?: ResponsiveValue<"row" | "column">;
  alignItems?: ResponsiveValue<"flex-start" | "flex-end" | "center" | "stretch">;
  justifyContent?: ResponsiveValue<"flex-start" | "flex-end" | "center" | "space-between" | "space-around">;
  flexWrap?: ResponsiveValue<"wrap" | "nowrap" | "wrap-reverse">;
  gridTemplateColumns?: ResponsiveValue<string>;
  
  // Typography
  fontSize?: ResponsiveValue<TokenPath | string>;
  fontWeight?: ResponsiveValue<TokenPath | string>;
  lineHeight?: ResponsiveValue<string | number>;
  textAlign?: ResponsiveValue<"left" | "center" | "right" | "justify">;
  
  // Visual
  radius?: ResponsiveValue<TokenPath | string>;
  shadow?: ResponsiveValue<TokenPath | string>;
  opacity?: ResponsiveValue<number>;
  backdropFilter?: ResponsiveValue<string>;
  
  // Effects
  transition?: string;
  cursor?: string;
  transform?: string;
  
  // Pseudo-states
  hover?: Omit<DesignProps, "hover" | "focus" | "active">;
  focus?: Omit<DesignProps, "hover" | "focus" | "active">;
  active?: Omit<DesignProps, "hover" | "focus" | "active">;
  
  // Index signature для вложенных селекторов и других свойств
  // Можно писать напрямую "& .icon", "& .child" и т.д.
  [key: string]: any;
}

