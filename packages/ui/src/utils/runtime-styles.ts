// Runtime утилита для генерации CSS из data-design атрибутов
import { foundationTokens } from "../tokens/foundation";
import { tokenToCSSVariable } from "./css-variables";
import { shouldEnableDevTools } from "./env";
import { generateHash } from "./hash";
import { getBreakpoints } from "./breakpoints";
import { resolveToken } from "./token-resolver";
import { getCachedToken } from "./token-cache";
import { resolveColorHex } from "./color-helpers";

const tokens: any = foundationTokens;

// Проверяет, является ли значение responsive объектом
function isResponsiveValue(value: any): boolean {
  return typeof value === "object" && value !== null && !Array.isArray(value) && 
         ("base" in value || "sm" in value || "md" in value || "lg" in value || "xl" in value);
}

// Извлекает base значение из responsive объекта
function getBaseValue(value: any): any {
  if (isResponsiveValue(value)) {
    return value.base;
  }
  return value;
}

// Используем resolveToken из token-resolver с кешированием
function resolveTokenCached(path: string): string | null {
  return getCachedToken(path, resolveToken);
}

function convertToCSSProperty(key: string): string {
  const propertyMap: Record<string, string> = {
    bg: "background-color",
    color: "color",
    padding: "padding",
    margin: "margin",
    marginBottom: "margin-bottom",
    marginTop: "margin-top",
    marginLeft: "margin-left",
    marginRight: "margin-right",
    gap: "gap",
    width: "width",
    height: "height",
    maxWidth: "max-width",
    minWidth: "min-width",
    maxHeight: "max-height",
    minHeight: "min-height",
    display: "display",
    flexDirection: "flex-direction",
    alignItems: "align-items",
    justifyContent: "justify-content",
    flexWrap: "flex-wrap",
    flex: "flex",
    flexShrink: "flex-shrink",
    flexGrow: "flex-grow",
    flexBasis: "flex-basis",
    gridTemplateColumns: "grid-template-columns",
    fontSize: "font-size",
    fontWeight: "font-weight",
    lineHeight: "line-height",
    textAlign: "text-align",
    radius: "border-radius",
    shadow: "box-shadow",
    boxShadow: "box-shadow",
    opacity: "opacity",
    backdropFilter: "backdrop-filter",
    border: "border",
    borderColor: "border-color",
    borderBottom: "border-bottom",
    borderTop: "border-top",
    borderLeft: "border-left",
    borderRight: "border-right",
    outline: "outline",
    transition: "transition",
    overflow: "overflow",
    overflowX: "overflow-x",
    overflowY: "overflow-y",
    textOverflow: "text-overflow",
    whiteSpace: "white-space",
    cursor: "cursor",
    transform: "transform",
  };
  
  // Если не найдено в мапе, конвертируем camelCase в kebab-case
  if (!propertyMap[key]) {
    return key.replace(/([A-Z])/g, "-$1").toLowerCase();
  }
  
  return propertyMap[key];
}

// Конвертирует effect в соответствующие CSS свойства
function convertEffectToCSS(effect: string, useVariables: boolean = true): Record<string, string> | null {
  // Проверяем, является ли effect строкой
  if (typeof effect !== "string") {
    return null;
  }
 
  // Проверяем наличие эффекта через CSS переменные в :root
  // Если переменных нет, эффект не существует в теме
  if (typeof document !== "undefined") {
    const rootStyle = getComputedStyle(document.documentElement);
    const backdropVar = rootStyle.getPropertyValue(`--effect-${effect}-backdrop-filter`).trim();
    const backgroundVar = rootStyle.getPropertyValue(`--effect-${effect}-background`).trim();
    const shadowVar = rootStyle.getPropertyValue(`--effect-${effect}-box-shadow`).trim();
    const borderVar = rootStyle.getPropertyValue(`--effect-${effect}-border`).trim();
    const borderColorVar = rootStyle.getPropertyValue(`--effect-${effect}-border-color`).trim();
    const shadowFieldVar = rootStyle.getPropertyValue(`--effect-${effect}-shadow`).trim();
    
    // Если ни одной переменной эффекта нет, эффект не существует в теме
    if (!backdropVar && !backgroundVar && !shadowVar && !borderVar && !borderColorVar && !shadowFieldVar) {
      return null; // Эффект не существует в теме
    }
  }
  
  // Пытаемся использовать CSS переменные для эффектов из тем
  // CSS переменные генерируются в theme-generator.ts
  const cssProperties: Record<string, string> = {};
  
  // Пробуем найти backdrop-filter для эффекта
  const backdropFilterVar = `--effect-${effect}-backdrop-filter`;
  cssProperties["backdrop-filter"] = `var(${backdropFilterVar})`;
  cssProperties["-webkit-backdrop-filter"] = `var(${backdropFilterVar})`;
  
  // Пробуем найти background для эффекта
  const backgroundVar = `--effect-${effect}-background`;
  cssProperties["background"] = `var(${backgroundVar})`;
  
  // Пробуем найти background-color для эффекта
  const backgroundColorVar = `--effect-${effect}-background-color`;
  cssProperties["background-color"] = `var(${backgroundColorVar})`;
  
  // Пробуем найти box-shadow для эффекта
  const boxShadowVar = `--effect-${effect}-box-shadow`;
  cssProperties["box-shadow"] = `var(${boxShadowVar})`;
  
  // Добавляем поддержку border
  const borderVar = `--effect-${effect}-border`;
  cssProperties["border"] = `var(${borderVar})`;
  
  // Добавляем поддержку border-color
  const borderColorVar = `--effect-${effect}-border-color`;
  cssProperties["border-color"] = `var(${borderColorVar})`;
  
  // Добавляем поддержку shadow (может быть как box-shadow, так и отдельное поле)
  // Если есть поле shadow, оно может быть токеном (например, "shadow.md")
  // или реальным значением
  if (typeof document !== "undefined") {
    const rootStyle = getComputedStyle(document.documentElement);
    const shadowFieldVar = rootStyle.getPropertyValue(`--effect-${effect}-shadow`).trim();
    if (shadowFieldVar) {
      // Если это токен вида "shadow.md", разрешаем его
      if (shadowFieldVar.startsWith("shadow.")) {
        const shadowToken = resolveTokenCached(shadowFieldVar);
        if (shadowToken) {
          cssProperties["box-shadow"] = shadowToken;
        } else {
          // Если не удалось разрешить, используем как есть
          cssProperties["box-shadow"] = shadowFieldVar;
        }
      } else {
        // Если это реальное значение, используем его
        cssProperties["box-shadow"] = shadowFieldVar;
      }
    }
  }
  
  // Возвращаем свойства (даже если некоторые переменные не определены, это нормально)
  return cssProperties;
}

function convertToCSSValue(key: string, value: any, useVariables: boolean = true): string | null {
  if (value === undefined || value === null) {
    return null;
  }
  
  // Обрабатываем responsive значения - base значение
  const baseValue = getBaseValue(value);
  if (baseValue === undefined && isResponsiveValue(value)) {
    const firstValue = value.sm || value.md || value.lg || value.xl;
    if (firstValue !== undefined) {
      return convertToCSSValue(key, firstValue, useVariables);
    }
  }
  
  const actualValue = baseValue !== undefined ? baseValue : value;
  
  if (typeof actualValue === "string") {
    // Для цветовых свойств (bg, backgroundColor, color, borderColor) сначала пробуем resolveColorHex
    // Это позволяет использовать hex-коды напрямую и токены типа "blue.500"
    if (["bg", "backgroundColor", "background-color", "color", "borderColor", "border-color"].includes(key)) {
      const hexColor = resolveColorHex(actualValue);
      if (hexColor) {
        return hexColor; // Возвращаем hex напрямую, не через CSS переменные
      }
    }
    
    const tokenValue = resolveTokenCached(actualValue);
    if (tokenValue) {
      // Используем CSS переменные если включено
      if (useVariables) {
        return `var(${tokenToCSSVariable(actualValue)})`;
      }
      return tokenValue;
    }
    return actualValue;
  }
  
  if (typeof actualValue === "number") {
    // Свойства без единиц измерения
    if (["opacity", "lineHeight", "flexShrink", "flexGrow", "flexBasis", "zIndex", "order"].includes(key)) {
      return actualValue.toString();
    }
    // Для padding, margin, gap и других spacing свойств
    if (["padding", "margin", "gap", "marginBottom", "marginTop", "marginLeft", "marginRight"].includes(key)) {
      const spaceToken = resolveTokenCached(`spacing.${actualValue}`);
      if (spaceToken) {
        if (useVariables) {
          return `var(${tokenToCSSVariable(`spacing.${actualValue}`)})`;
        }
        return spaceToken;
      }
      // Fallback на старый формат
      const oldSpaceToken = resolveTokenCached(`space.${actualValue}`);
      if (oldSpaceToken) {
        return oldSpaceToken;
      }
    }
    return `${actualValue}px`;
  }
  
  return String(actualValue);
}

// Генерирует медиа-запросы для responsive значений
function generateResponsiveCSS(
  className: string,
  key: string,
  value: any,
  useVariables: boolean
): string[] {
  if (!isResponsiveValue(value)) {
    return [];
  }
  
  const rules: string[] = [];
  const cssProperty = convertToCSSProperty(key);
  
  const breakpoints = getBreakpoints();
  
  if (value.sm) {
    let cssValue: string | null;
    let isImportant = false;
    
    if (value.sm && typeof value.sm === "object" && !Array.isArray(value.sm) && "value" in value.sm && "important" in value.sm) {
      cssValue = convertToCSSValue(key, value.sm.value, useVariables);
      isImportant = value.sm.important === true;
    } else {
      cssValue = convertToCSSValue(key, value.sm, useVariables);
    }
    
    if (cssValue) {
      const importantSuffix = isImportant ? " !important" : "";
      rules.push(`@media (min-width: ${breakpoints.sm}) {`);
      rules.push(`  ${className} { ${cssProperty}: ${cssValue}${importantSuffix}; }`);
      rules.push(`}`);
    }
  }
  
  if (value.md) {
    let cssValue: string | null;
    let isImportant = false;
    
    if (value.md && typeof value.md === "object" && !Array.isArray(value.md) && "value" in value.md && "important" in value.md) {
      cssValue = convertToCSSValue(key, value.md.value, useVariables);
      isImportant = value.md.important === true;
    } else {
      cssValue = convertToCSSValue(key, value.md, useVariables);
    }
    
    if (cssValue) {
      const importantSuffix = isImportant ? " !important" : "";
      rules.push(`@media (min-width: ${breakpoints.md}) {`);
      rules.push(`  ${className} { ${cssProperty}: ${cssValue}${importantSuffix}; }`);
      rules.push(`}`);
    }
  }
  
  if (value.lg) {
    let cssValue: string | null;
    let isImportant = false;
    
    if (value.lg && typeof value.lg === "object" && !Array.isArray(value.lg) && "value" in value.lg && "important" in value.lg) {
      cssValue = convertToCSSValue(key, value.lg.value, useVariables);
      isImportant = value.lg.important === true;
    } else {
      cssValue = convertToCSSValue(key, value.lg, useVariables);
    }
    
    if (cssValue) {
      const importantSuffix = isImportant ? " !important" : "";
      rules.push(`@media (min-width: ${breakpoints.lg}) {`);
      rules.push(`  ${className} { ${cssProperty}: ${cssValue}${importantSuffix}; }`);
      rules.push(`}`);
    }
  }
  
  if (value.xl) {
    let cssValue: string | null;
    let isImportant = false;
    
    if (value.xl && typeof value.xl === "object" && !Array.isArray(value.xl) && "value" in value.xl && "important" in value.xl) {
      cssValue = convertToCSSValue(key, value.xl.value, useVariables);
      isImportant = value.xl.important === true;
    } else {
      cssValue = convertToCSSValue(key, value.xl, useVariables);
    }
    
    if (cssValue) {
      const importantSuffix = isImportant ? " !important" : "";
      rules.push(`@media (min-width: ${breakpoints.xl}) {`);
      rules.push(`  ${className} { ${cssProperty}: ${cssValue}${importantSuffix}; }`);
      rules.push(`}`);
    }
  }
  
  return rules;
}

// Генерирует CSS для вложенных селекторов
function generateNestedCSS(
  className: string,
  design: Record<string, any>,
  useVariables: boolean
): string[] {
  const rules: string[] = [];
  
  // Ищем все ключи начинающиеся с &
  for (const [key, value] of Object.entries(design)) {
    if (key.startsWith("&") && typeof value === "object" && value !== null && !Array.isArray(value)) {
      // Заменяем & на текущий класс
      const finalSelector = key.replace(/&/g, className);
      const properties: string[] = [];
      
      for (const [styleKey, styleValue] of Object.entries(value)) {
        // Пропускаем вложенные селекторы (они обработаются рекурсивно)
        if (styleKey.startsWith("&")) {
          continue;
        }
        
        const cssProperty = convertToCSSProperty(styleKey);
        // Проверяем, является ли значение объектом с полем important
        let cssValue: string | null;
        let isImportant = false;
        
        if (styleValue && typeof styleValue === "object" && !Array.isArray(styleValue) && "value" in styleValue && "important" in styleValue) {
          cssValue = convertToCSSValue(styleKey, styleValue.value, useVariables);
          isImportant = styleValue.important === true;
        } else {
          cssValue = convertToCSSValue(styleKey, styleValue, useVariables);
        }
        
        if (cssValue) {
          const importantSuffix = isImportant ? " !important" : "";
          properties.push(`  ${cssProperty}: ${cssValue}${importantSuffix};`);
        }
      }
      
      if (properties.length > 0) {
        rules.push(`${finalSelector} {`);
        rules.push(...properties);
        rules.push(`}`);
      }
      
      // Рекурсивно обрабатываем вложенные селекторы внутри этого селектора
      const nestedRules = generateNestedCSS(finalSelector, value, useVariables);
      rules.push(...nestedRules);
    }
  }
  
  return rules;
}

export function generateCSSFromDesign(design: Record<string, any>, prefix: string = "vi-", useVariables: boolean = true, hash?: string): string {
  // Если hash не передан, генерируем его (для обратной совместимости)
  const designHash = hash || generateHash(JSON.stringify(design));
  const className = `.${prefix}${designHash}`;
  const properties: string[] = [];
  const mediaQueries: string[] = [];
  
  for (const [key, value] of Object.entries(design)) {
    // Пропускаем псевдо-состояния и вложенные селекторы (они обрабатываются отдельно)
    if (key === "hover" || key === "focus" || key === "active" || key === "selected" || key.startsWith("&")) {
      continue;
    }
    
    // Специальная обработка для effect
    if (key === "effect") {
      const effectStyles = convertEffectToCSS(value, useVariables);
      if (effectStyles && Object.keys(effectStyles).length > 0) {
        for (const [cssProp, cssValue] of Object.entries(effectStyles)) {
          // Пропускаем пустые значения
          if (cssValue && cssValue.trim() !== "") {
            properties.push(`  ${cssProp}: ${cssValue};`);
          }
        }
      }
      // Если эффект не найден, просто пропускаем его (не добавляем стили)
      continue;
    }
    
    // Обрабатываем responsive значения
    if (isResponsiveValue(value)) {
      // Base значение добавляем в основной класс
      const baseValue = getBaseValue(value);
      if (baseValue !== undefined) {
        const cssProperty = convertToCSSProperty(key);
        // Проверяем, является ли значение объектом с полем important
        let cssValue: string | null;
        let isImportant = false;
        
        if (baseValue && typeof baseValue === "object" && !Array.isArray(baseValue) && "value" in baseValue && "important" in baseValue) {
          cssValue = convertToCSSValue(key, baseValue.value, useVariables);
          isImportant = baseValue.important === true;
        } else {
          cssValue = convertToCSSValue(key, baseValue, useVariables);
        }
        
        if (cssValue) {
          const importantSuffix = isImportant ? " !important" : "";
          properties.push(`  ${cssProperty}: ${cssValue}${importantSuffix};`);
        }
      }
      // Медиа-запросы добавляем отдельно
      const responsiveRules = generateResponsiveCSS(className, key, value, useVariables);
      mediaQueries.push(...responsiveRules);
    } else {
      const cssProperty = convertToCSSProperty(key);
      // Проверяем, является ли значение объектом с полем important
      let cssValue: string | null;
      let isImportant = false;
      
      if (value && typeof value === "object" && !Array.isArray(value) && "value" in value && "important" in value) {
        // Специальный синтаксис: { value: "...", important: true }
        cssValue = convertToCSSValue(key, value.value, useVariables);
        isImportant = value.important === true;
      } else {
        cssValue = convertToCSSValue(key, value, useVariables);
      }
      
      if (cssValue) {
        const importantSuffix = isImportant ? " !important" : "";
        properties.push(`  ${cssProperty}: ${cssValue}${importantSuffix};`);
      }
    }
  }
  
  if (properties.length === 0 && mediaQueries.length === 0) {
    return "";
  }
  
  let css = properties.length > 0 ? `${className} {\n${properties.join("\n")}\n}` : "";
  
  // Вложенные селекторы (все ключи начинающиеся с &)
  const nestedRules = generateNestedCSS(className, design, useVariables);
  css += nestedRules.length > 0 ? "\n" + nestedRules.join("\n") : "";
  
  // Pseudo-states
  if (design.hover) {
    const hoverProps: string[] = [];
    for (const [key, value] of Object.entries(design.hover)) {
      // Пропускаем вложенные селекторы (обрабатываются отдельно)
      if (key.startsWith("&")) {
        continue;
      }
      const cssProperty = convertToCSSProperty(key);
      // Проверяем, является ли значение объектом с полем important
      let cssValue: string | null;
      let isImportant = false;
      
      if (value && typeof value === "object" && !Array.isArray(value) && "value" in value && "important" in value) {
        cssValue = convertToCSSValue(key, value.value, useVariables);
        isImportant = value.important === true;
      } else {
        cssValue = convertToCSSValue(key, value, useVariables);
      }
      
      if (cssValue) {
        const importantSuffix = isImportant ? " !important" : "";
        hoverProps.push(`  ${cssProperty}: ${cssValue}${importantSuffix};`);
      }
    }
    if (hoverProps.length > 0) {
      css += `\n${className}:hover {\n${hoverProps.join("\n")}\n}`;
    }
    
    // Вложенные селекторы в hover
    const hoverNestedRules = generateNestedCSS(`${className}:hover`, design.hover, useVariables);
    css += hoverNestedRules.length > 0 ? "\n" + hoverNestedRules.join("\n") : "";
  }
  
  if (design.focus) {
    const focusProps: string[] = [];
    for (const [key, value] of Object.entries(design.focus)) {
      if (key.startsWith("&")) {
        continue;
      }
      const cssProperty = convertToCSSProperty(key);
      // Проверяем, является ли значение объектом с полем important
      let cssValue: string | null;
      let isImportant = false;
      
      if (value && typeof value === "object" && !Array.isArray(value) && "value" in value && "important" in value) {
        cssValue = convertToCSSValue(key, value.value, useVariables);
        isImportant = value.important === true;
      } else {
        cssValue = convertToCSSValue(key, value, useVariables);
      }
      
      if (cssValue) {
        const importantSuffix = isImportant ? " !important" : "";
        focusProps.push(`  ${cssProperty}: ${cssValue}${importantSuffix};`);
      }
    }
    if (focusProps.length > 0) {
      css += `\n${className}:focus {\n${focusProps.join("\n")}\n}`;
    }
    
    const focusNestedRules = generateNestedCSS(`${className}:focus`, design.focus, useVariables);
    css += focusNestedRules.length > 0 ? "\n" + focusNestedRules.join("\n") : "";
  }
  
  if (design.active) {
    const activeProps: string[] = [];
    for (const [key, value] of Object.entries(design.active)) {
      if (key.startsWith("&")) {
        continue;
      }
      const cssProperty = convertToCSSProperty(key);
      // Проверяем, является ли значение объектом с полем important
      let cssValue: string | null;
      let isImportant = false;
      
      if (value && typeof value === "object" && !Array.isArray(value) && "value" in value && "important" in value) {
        cssValue = convertToCSSValue(key, value.value, useVariables);
        isImportant = value.important === true;
      } else {
        cssValue = convertToCSSValue(key, value, useVariables);
      }
      
      if (cssValue) {
        const importantSuffix = isImportant ? " !important" : "";
        activeProps.push(`  ${cssProperty}: ${cssValue}${importantSuffix};`);
      }
    }
    if (activeProps.length > 0) {
      css += `\n${className}:active {\n${activeProps.join("\n")}\n}`;
    }
    
    const activeNestedRules = generateNestedCSS(`${className}:active`, design.active, useVariables);
    css += activeNestedRules.length > 0 ? "\n" + activeNestedRules.join("\n") : "";
  }
  
  if (design.selected) {
    const selectedProps: string[] = [];
    for (const [key, value] of Object.entries(design.selected)) {
      if (key.startsWith("&")) {
        continue;
      }
      const cssProperty = convertToCSSProperty(key);
      // Проверяем, является ли значение объектом с полем important
      let cssValue: string | null;
      let isImportant = false;
      
      if (value && typeof value === "object" && !Array.isArray(value) && "value" in value && "important" in value) {
        cssValue = convertToCSSValue(key, value.value, useVariables);
        isImportant = value.important === true;
      } else {
        cssValue = convertToCSSValue(key, value, useVariables);
      }
      
      if (cssValue) {
        const importantSuffix = isImportant ? " !important" : "";
        selectedProps.push(`  ${cssProperty}: ${cssValue}${importantSuffix};`);
      }
    }
    if (selectedProps.length > 0) {
      // Используем aria-pressed для активного/выбранного состояния
      css += `\n${className}[aria-pressed="true"] {\n${selectedProps.join("\n")}\n}`;
    }
    
    const selectedNestedRules = generateNestedCSS(`${className}[aria-pressed="true"]`, design.selected, useVariables);
    css += selectedNestedRules.length > 0 ? "\n" + selectedNestedRules.join("\n") : "";
  }
  
  // Добавляем медиа-запросы
  if (mediaQueries.length > 0) {
    css += "\n" + mediaQueries.join("\n");
  }
  
  return css;
}

export function generateRuntimeStyles(prefix: string = "vi-", useVariables: boolean = true): void {
  if (typeof document === "undefined") {
    return;
  }
  
  // Находим все элементы с data-design
  const elements = document.querySelectorAll("[data-design]");
  const designMap = new Map<string, Record<string, any>>();
  const classMap = new Map<Element, string>();
  
  elements.forEach((el) => {
    const designAttr = el.getAttribute("data-design");
    if (!designAttr) return;
    
    try {
      const design = JSON.parse(designAttr);
      const hash = generateHash(JSON.stringify(design));
      const className = `${prefix}${hash}`;
      
      designMap.set(hash, design);
      classMap.set(el, className);
      
      // Добавляем класс к элементу
      el.classList.add(className);
    } catch (e) {
      console.warn("[vira-ui] Failed to parse design:", e);
    }
  });
  
  // Генерируем CSS
  const cssRules: string[] = [];
  for (const [hash, design] of designMap.entries()) {
    const css = generateCSSFromDesign(design, prefix, useVariables);
    if (css) {
      cssRules.push(css);
    }
  }
  
  if (cssRules.length === 0) {
    return;
  }
  
  // Добавляем стили в head
  const styleId = "vira-runtime-styles";
  let styleEl = document.getElementById(styleId) as HTMLStyleElement;
  
  if (!styleEl) {
    styleEl = document.createElement("style");
    styleEl.id = styleId;
    document.head.appendChild(styleEl);
  }
  
  styleEl.textContent = cssRules.join("\n\n");
}

// Автоматически генерируем стили при загрузке и после мутаций (только в dev режиме)
// В проде CSS должен быть извлечён на билд-тайме через extractCSS()
if (typeof window !== "undefined" && shouldEnableDevTools()) {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      generateRuntimeStyles();
    });
  } else {
    generateRuntimeStyles();
  }
  
  // Отслеживаем изменения DOM (только в dev)
  const observer = new MutationObserver(() => {
    generateRuntimeStyles();
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ["data-design"],
  });
}

