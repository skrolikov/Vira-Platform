/**
 * Vira Native Layer - Поддержка React Native
 * 
 * Реактивность работает так же, компоненты адаптированы под RN
 */

/**
 * Типы для React Native
 */
export interface ViraNativeStyle {
  [key: string]: any;
}

/**
 * Адаптер для StyleSheet (React Native)
 */
export interface StyleSheetAdapter {
  create: (styles: Record<string, ViraNativeStyle>) => Record<string, any>;
  flatten: (style: any) => ViraNativeStyle;
}

/**
 * Конфигурация для Vira Native
 */
export interface ViraNativeConfig {
  StyleSheet?: StyleSheetAdapter;
  Platform?: {
    OS: "ios" | "android" | "web";
    select: <T>(spec: { ios?: T; android?: T; default?: T }) => T;
  };
}

let nativeConfig: ViraNativeConfig = {};

/**
 * Инициализация Vira Native
 */
export function initViraNative(config: ViraNativeConfig) {
  nativeConfig = config;
}

/**
 * Адаптер для дизайн-токенов в React Native
 */
export function adaptDesignToNative(design: Record<string, any>): ViraNativeStyle {
  const nativeStyle: ViraNativeStyle = {};

  // Преобразуем CSS свойства в React Native стили
  const propertyMap: Record<string, string> = {
    padding: "padding",
    margin: "margin",
    width: "width",
    height: "height",
    backgroundColor: "backgroundColor",
    color: "color",
    fontSize: "fontSize",
    fontWeight: "fontWeight",
    borderRadius: "borderRadius",
    borderWidth: "borderWidth",
    borderColor: "borderColor",
    // И т.д.
  };

  for (const [key, value] of Object.entries(design)) {
    const nativeKey = propertyMap[key] || key;
    
    // Преобразуем значения
    if (typeof value === "string") {
      // CSS значения в RN значения
      if (value.endsWith("px")) {
        nativeStyle[nativeKey] = parseFloat(value);
      } else if (value === "flex") {
        nativeStyle.flex = 1;
      } else {
        nativeStyle[nativeKey] = value;
      }
    } else {
      nativeStyle[nativeKey] = value;
    }
  }

  return nativeStyle;
}

/**
 * Создание StyleSheet для React Native
 */
export function createNativeStyleSheet(styles: Record<string, Record<string, any>>) {
  if (nativeConfig.StyleSheet) {
    return nativeConfig.StyleSheet.create(styles);
  }
  
  // Fallback для веба
  return styles;
}

/**
 * Платформо-специфичные стили
 */
export function platformStyle(styles: {
  ios?: Record<string, any>;
  android?: Record<string, any>;
  default?: Record<string, any>;
}): Record<string, any> {
  if (nativeConfig.Platform) {
    return nativeConfig.Platform.select(styles) || styles.default || {};
  }
  
  return styles.default || {};
}

/**
 * Хелперы для React Native компонентов
 */
export const ViraNative = {
  /**
   * Проверка платформы
   */
  isIOS: () => nativeConfig.Platform?.OS === "ios",
  isAndroid: () => nativeConfig.Platform?.OS === "android",
  isWeb: () => nativeConfig.Platform?.OS === "web",
  
  /**
   * Адаптация значений для платформы
   */
  select: <T>(spec: { ios?: T; android?: T; web?: T; default?: T }): T | undefined => {
    if (!nativeConfig.Platform) {
      return spec.default;
    }
    
    const platform = nativeConfig.Platform.OS;
    return spec[platform] || spec.default;
  },
};

/**
 * Пример использования в React Native:
 * 
 * import { initViraNative, adaptDesignToNative } from "@vira-ui/core";
 * import { StyleSheet, Platform } from "react-native";
 * 
 * initViraNative({
 *   StyleSheet,
 *   Platform,
 * });
 * 
 * const design = {
 *   padding: "16px",
 *   backgroundColor: "#ffffff",
 * };
 * 
 * const nativeStyle = adaptDesignToNative(design);
 * // { padding: 16, backgroundColor: "#ffffff" }
 */

