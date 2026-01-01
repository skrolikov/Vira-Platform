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

/**
 * Разрешение токена по пути (например, "color.primary" -> "#007bff")
 */
function resolveToken(path: string, tokens: any): string | undefined {
  if (!tokens || typeof tokens !== "object") {
    return undefined;
  }
  
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

/**
 * Базовые токены (заглушка)
 * В реальном приложении токены должны передаваться через конфигурацию
 */
let globalTokens: any = {};

/**
 * Установка глобальных токенов (вызывается из ui пакета при инициализации)
 */
export function setGlobalTokens(tokens: any) {
  globalTokens = tokens;
}

/**
 * Генерация уникального имени класса
 */
function generateClassName(design: Record<string, any>): string {
  const key = JSON.stringify(design);
  
  if (classNameCache.has(key)) {
    return classNameCache.get(key)!;
  }

  const className = `vira-${hashString(key)}-${classCounter++}`;
  classNameCache.set(key, className);
  
  return className;
}

/**
 * Простой hash для строки
 */
function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36);
}

/**
 * Преобразование design props в CSS
 */
function designToCSS(design: Record<string, any>): string {
  const css: string[] = [];

  for (const [key, value] of Object.entries(design)) {
    const cssProperty = convertToCSSProperty(key);
    const cssValue = resolveDesignValue(value);

    if (cssProperty && cssValue !== undefined) {
      css.push(`  ${cssProperty}: ${cssValue};`);
    }
  }

  return css.join("\n");
}

/**
 * Преобразование CSS свойства
 */
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
  };

  return propertyMap[key] || key;
}

/**
 * Разрешение значения дизайн-токена
 */
function resolveDesignValue(value: any): string | undefined {
  if (typeof value === "string") {
    // Проверяем, это токен ($token) или обычное значение
    if (value.startsWith("$")) {
      const tokenPath = value.substring(1);
      const resolved = resolveToken(tokenPath, globalTokens);
      // Если токен не найден, возвращаем оригинальное значение
      return resolved || value;
    }
    return value;
  }

  if (typeof value === "number") {
    return `${value}px`;
  }

  return String(value);
}

/**
 * Генерация CSS класса из design props
 * 
 * @example
 * const className = generateStyle({
 *   bg: "$primary",
 *   p: 12,
 *   radius: "$md",
 * });
 * // Возвращает: "vira-a12f-0"
 * // И добавляет CSS в <style id="vira-css">
 */
export function generateStyle(design: Record<string, any>): string {
  const className = generateClassName(design);
  
  // Проверяем кеш
  if (styleCache.has(className)) {
    return className;
  }

  // Генерируем CSS
  const css = designToCSS(design);
  const fullCSS = `.${className} {\n${css}\n}`;

  // Сохраняем в кеш
  styleCache.set(className, fullCSS);

  // Добавляем в DOM
  injectStyle(className, fullCSS);

  return className;
}

/**
 * Инъекция стилей в DOM
 */
function injectStyle(className: string, css: string) {
  // Проверяем наличие document (для SSR)
  if (typeof document === "undefined") {
    return;
  }

  let styleElement = document.getElementById("vira-css");

  if (!styleElement) {
    styleElement = document.createElement("style");
    styleElement.id = "vira-css";
    document.head.appendChild(styleElement);
  }

  // Добавляем CSS в style элемент
  styleElement.textContent += `\n${css}\n`;
}

/**
 * Преобразование design props в React Native стили
 * 
 * @example
 * const nativeStyle = designToNative({
 *   bg: "$primary",
 *   p: 12,
 *   radius: "$md",
 * });
 * // { backgroundColor: tokens.primary, padding: 12, borderRadius: tokens.radius.md }
 */
export function designToNative(design: Record<string, any>): Record<string, any> {
  const nativeStyle: Record<string, any> = {};

  for (const [key, value] of Object.entries(design)) {
    const nativeKey = convertToNativeProperty(key);
    const nativeValue = resolveNativeValue(value);

    if (nativeKey && nativeValue !== undefined) {
      nativeStyle[nativeKey] = nativeValue;
    }
  }

  return nativeStyle;
}

/**
 * Преобразование в React Native свойство
 */
function convertToNativeProperty(key: string): string {
  const propertyMap: Record<string, string> = {
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
    shadow: "shadowColor", // В RN shadow это объект
    boxShadow: "shadowColor",
    gap: "gap", // RN поддерживает gap
    flex: "flex",
    flexDirection: "flexDirection",
    alignItems: "alignItems",
    justifyContent: "justifyContent",
    fontSize: "fontSize",
    fontWeight: "fontWeight",
    color: "color",
    display: "display",
  };

  return propertyMap[key] || key;
}

/**
 * Разрешение значения для React Native
 */
function resolveNativeValue(value: any): any {
  if (typeof value === "string") {
    if (value.startsWith("$")) {
      const tokenPath = value.substring(1);
      const resolved = resolveToken(tokenPath, globalTokens);
      // Если токен не найден, возвращаем оригинальное значение
      return resolved || value;
    }
    // Если это px - убираем
    if (value.endsWith("px")) {
      return parseFloat(value);
    }
    return value;
  }

  return value;
}

/**
 * Очистка кеша стилей
 */
export function clearStyleCache() {
  styleCache.clear();
  classNameCache.clear();
  
  const styleElement = document.getElementById("vira-css");
  if (styleElement) {
    styleElement.textContent = "";
  }
}

/**
 * Получение всех сгенерированных стилей
 */
export function getGeneratedStyles(): string {
  return Array.from(styleCache.values()).join("\n\n");
}

