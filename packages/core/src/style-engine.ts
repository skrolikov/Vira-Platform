/**
 * ViraStyle Engine - Генерация CSS в рантайме
 * 
 * Как Tailwind/Qwik/Solid, но универсально для Web и Native
 * 
 * Автоматическая генерация классов по design={...}
 * CSS-кеш для оптимизации
 * Автоматический вывод стилей в <style id="vira-css">
 */

// CSS кеш
const styleCache = new Map<string, string>();
const classNameCache = new Map<string, string>();

// Счётчик для уникальных классов
let classCounter = 0;

// ======================== Глобальные токены и тема ========================
let globalTokens: any = {};
let globalTheme: any = {}; // сюда пихаем, например, appleTheme

export function setGlobalTokens(tokens: any) {
  globalTokens = tokens;
}

export function setGlobalTheme(theme: any) {
  globalTheme = theme;
}

// ======================== Хэш и генерация классов ========================
function generateClassName(design: Record<string, any>): string {
  const key = JSON.stringify(design);
  if (classNameCache.has(key)) return classNameCache.get(key)!;

  const className = `vira-${hashString(key)}-${classCounter++}`;
  classNameCache.set(key, className);
  return className;
}

function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

// ======================== Разрешение токенов ========================
function resolveToken(path: string, tokens: any): string | undefined {
  if (!tokens || typeof tokens !== "object") return undefined;
  const parts = path.split(".");
  let current = tokens;
  for (const part of parts) {
    if (current && typeof current === "object" && part in current) {
      current = current[part];
    } else {
      return undefined;
    }
  }
  return typeof current === "string" ? current : undefined;
}

// ======================== Effect ========================
// Исправленная функция applyEffect
function applyEffect(design: Record<string, any>, theme: any): Record<string, any> {
  if (!design.effect) return design;
  
  // Если effect - это строка (название эффекта из темы)
  if (typeof design.effect === 'string') {
    const effectName = design.effect;
    const effectDef = theme.effect?.[effectName];
    if (!effectDef) {
      console.warn(`Effect "${effectName}" not found in theme`);
      return design;
    }
    
    // Удаляем effect из design и применяем его стили
    const { effect, ...rest } = design;
    return { ...effectDef, ...rest };
  }
  
  // Если effect - уже объект с CSS свойствами
  return { ...design.effect, ...design };
}

// ======================== CSS генерация ========================
function convertToCSSProperty(key: string): string {
  const propertyMap: Record<string, string> = {
    bg: "background-color",
    backgroundColor: "background-color",
    p: "padding",
    padding: "padding",
    pt: "padding-top",
    paddingTop: "padding-top",
    pr: "padding-right",
    paddingRight: "padding-right",
    pb: "padding-bottom",
    paddingBottom: "padding-bottom",
    pl: "padding-left",
    paddingLeft: "padding-left",
    m: "margin",
    margin: "margin",
    mt: "margin-top",
    marginTop: "margin-top",
    mr: "margin-right",
    marginRight: "margin-right",
    mb: "margin-bottom",
    marginBottom: "margin-bottom",
    ml: "margin-left",
    marginLeft: "margin-left",
    w: "width",
    width: "width",
    h: "height",
    height: "height",
    radius: "border-radius",
    borderRadius: "border-radius",
    border: "border",
    shadow: "box-shadow",
    boxShadow: "box-shadow",
    gap: "gap",
    flex: "flex",
    flexDirection: "flex-direction",
    alignItems: "align-items",
    justifyContent: "justify-content",
    fontSize: "font-size",
    fontWeight: "font-weight",
    color: "color",
    display: "display",
    backdropFilter: "backdrop-filter",
    WebkitBackdropFilter: "-webkit-backdrop-filter",
    background: "background",
  };
  return propertyMap[key] || key;
}

function resolveDesignValue(value: any): string | undefined {
  if (typeof value === "string") {
    if (value.startsWith("$")) {
      const tokenPath = value.substring(1);
      const resolved = resolveToken(tokenPath, globalTokens);
      return resolved || value;
    }
    return value;
  }
  if (typeof value === "number") return `${value}px`;
  return String(value);
}

function designToCSS(design: Record<string, any>): string {
  const css: string[] = [];
  for (const [key, value] of Object.entries(design)) {
    const cssProp = convertToCSSProperty(key);
    const cssValue = resolveDesignValue(value);
    if (cssProp && cssValue !== undefined) css.push(`  ${cssProp}: ${cssValue};`);
  }
  return css.join("\n");
}

function injectStyle(className: string, css: string) {
  if (typeof document === "undefined") return;

  let styleEl = document.getElementById("vira-css");
  if (!styleEl) {
    styleEl = document.createElement("style");
    styleEl.id = "vira-css";
    document.head.appendChild(styleEl);
  }

  styleEl.textContent += `\n${css}\n`;
}

// ======================== Основная функция ========================
export function generateStyle(design: Record<string, any>): string {
  // Применяем effect из темы ДО генерации CSS
  const processedDesign = applyEffectFromTheme(design, globalTheme);
  
  const className = generateClassName(processedDesign);
  if (styleCache.has(className)) return className;

  const css = designToCSS(processedDesign);
  styleCache.set(className, `.${className} {\n${css}\n}`);
  injectStyle(className, css);

  return className;
}

// Новая функция для применения эффектов из темы
function applyEffectFromTheme(design: Record<string, any>, theme: any): Record<string, any> {
  if (!design.effect || !theme?.effect) return design;
  
  const effectName = design.effect;
  if (typeof effectName !== 'string') return design;
  
  const effectStyles = theme.effect[effectName];
  if (!effectStyles) return design;
  
  // Удаляем свойство effect и добавляем реальные стили
  const { effect, ...rest } = design;
  return { ...effectStyles, ...rest };
}

// ======================== React Native ========================
export function designToNative(design: Record<string, any>): Record<string, any> {
  const nativeStyle: Record<string, any> = {};
  for (const [key, value] of Object.entries(design)) {
    const nativeKey = convertToNativeProperty(key);
    const nativeValue = resolveNativeValue(value);
    if (nativeKey && nativeValue !== undefined) nativeStyle[nativeKey] = nativeValue;
  }
  return nativeStyle;
}

function convertToNativeProperty(key: string): string {
  const map: Record<string, string> = {
    bg: "backgroundColor",
    backgroundColor: "backgroundColor",
    p: "padding",
    padding: "padding",
    pt: "paddingTop",
    paddingTop: "paddingTop",
    pr: "paddingRight",
    paddingRight: "paddingRight",
    pb: "paddingBottom",
    paddingBottom: "paddingBottom",
    pl: "paddingLeft",
    paddingLeft: "paddingLeft",
    m: "margin",
    margin: "margin",
    mt: "marginTop",
    marginTop: "marginTop",
    mr: "marginRight",
    marginRight: "marginRight",
    mb: "marginBottom",
    marginBottom: "marginBottom",
    ml: "marginLeft",
    marginLeft: "marginLeft",
    w: "width",
    width: "width",
    h: "height",
    height: "height",
    radius: "borderRadius",
    borderRadius: "borderRadius",
    border: "borderWidth",
    shadow: "shadowColor",
    boxShadow: "shadowColor",
    gap: "gap",
    flex: "flex",
    flexDirection: "flexDirection",
    alignItems: "alignItems",
    justifyContent: "justifyContent",
    fontSize: "fontSize",
    fontWeight: "fontWeight",
    color: "color",
    display: "display",
    backdropFilter: "backdropFilter",
    WebkitBackdropFilter: "WebkitBackdropFilter",
    background: "background",
  };
  return map[key] || key;
}

function resolveNativeValue(value: any): any {
  if (typeof value === "string") {
    if (value.startsWith("$")) {
      const resolved = resolveToken(value.substring(1), globalTokens);
      return resolved || value;
    }
    if (value.endsWith("px")) return parseFloat(value);
    return value;
  }
  return value;
}

// ======================== Кэш ========================
export function clearStyleCache() {
  styleCache.clear();
  classNameCache.clear();
  const styleEl = document.getElementById("vira-css");
  if (styleEl) styleEl.textContent = "";
}

export function getGeneratedStyles(): string {
  return Array.from(styleCache.values()).join("\n\n");
}
