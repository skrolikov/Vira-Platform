import { foundationTokens } from "../tokens/foundation";

// Генерирует имя CSS переменной из токена
export function tokenToCSSVariable(path: string): string {
  // color.primary -> --color-primary
  // color.text.inverse -> --color-text-inverse
  // spacing.3 -> --spacing-3
  // typography.fontSize.sm -> --typography-fontSize-sm
  // typography.fontWeight.bold -> --typography-fontWeight-bold
  
  return `--${path.replace(/\./g, "-")}`;
}

// Генерирует CSS переменные из foundation токенов
export function generateCSSVariables(): string {
  const rules: string[] = [];
  
  // Color variables
  Object.entries(foundationTokens.color).forEach(([key, value]) => {
    const varName = tokenToCSSVariable(`color-${key.replace(/\./g, "-")}`);
    rules.push(`  ${varName}: ${value};`);
    // Также добавляем --color-bg для обратной совместимости
    if (key === "bg") {
      rules.push(`  --color-bg: ${value};`);
    }
    // Для цветовых палитр (blue.100, red.500 и т.д.) также создаем альтернативные имена
    if (key.includes(".") && /^\d+$/.test(key.split(".")[1] || "")) {
      // blue.100 -> --color-blue-100 и color.blue.100
      const parts = key.split(".");
      if (parts.length === 2) {
        const altVarName = tokenToCSSVariable(`color.${parts[0]}.${parts[1]}`);
        if (altVarName !== varName) {
          rules.push(`  ${altVarName}: ${value};`);
        }
      }
    }
  });
  
  // Radius variables
  Object.entries(foundationTokens.radius).forEach(([key, value]) => {
    const varName = tokenToCSSVariable(`radius-${key}`);
    rules.push(`  ${varName}: ${value};`);
  });
  
  // Shadow variables
  Object.entries(foundationTokens.shadow).forEach(([key, value]) => {
    const varName = tokenToCSSVariable(`shadow-${key}`);
    rules.push(`  ${varName}: ${value};`);
  });
  
  // Spacing variables
  Object.entries(foundationTokens.spacing).forEach(([key, value]) => {
    const varName = tokenToCSSVariable(`spacing-${key}`);
    rules.push(`  ${varName}: ${value};`);
  });
  
  // Typography variables
  Object.entries(foundationTokens.typography).forEach(([key, value]) => {
    if (typeof value === "string") {
      // fontSize tokens (sm, md, lg, xl, 2xl)
      // Генерируем как typography.fontSize.{key} -> --typography-fontSize-{key}
      const varName = tokenToCSSVariable(`typography.fontSize.${key}`);
      rules.push(`  ${varName}: ${value};`);
      // Также добавляем как typography-{key} для обратной совместимости
      const varNameAlt = tokenToCSSVariable(`typography-${key}`);
      rules.push(`  ${varNameAlt}: ${value};`);
    } else if (typeof value === "object") {
      // weight object
      Object.entries(value).forEach(([subKey, subValue]) => {
        // Генерируем как typography.fontWeight.{subKey} -> --typography-fontWeight-{subKey}
        const varName = tokenToCSSVariable(`typography.fontWeight.${subKey}`);
        rules.push(`  ${varName}: ${subValue};`);
        // Также добавляем как typography-weight-{subKey} для обратной совместимости
        const varNameAlt = tokenToCSSVariable(`typography-weight-${subKey}`);
        rules.push(`  ${varNameAlt}: ${subValue};`);
      });
    }
  });
  
  return `:root {\n${rules.join("\n")}\n}`;
}

// Преобразует токен в CSS переменную или значение
export function resolveTokenToVariable(path: string, useVariables: boolean = true): string {
  if (!useVariables) {
    // Fallback на прямое значение
    const parts = path.split(".");
    let current: any = foundationTokens;
    
    for (const part of parts) {
      if (current && typeof current === "object" && part in current) {
        current = current[part];
      } else {
        return path; // Если не нашли, возвращаем как есть
      }
    }
    
    return typeof current === "string" ? current : path;
  }
  
  // Используем CSS переменные
  return `var(${tokenToCSSVariable(path)})`;
}

