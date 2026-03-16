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

  // Glass system variables
  Object.entries(foundationTokens.glass).forEach(([key, value]) => {
    rules.push(`  --glass-${key}: ${value};`);
  });
  // Shorthand glass aliases
  rules.push(`  --vi-glass-bg: var(--glass-bg);`);
  rules.push(`  --vi-glass-border: var(--glass-border);`);
  rules.push(`  --vi-glass-highlight: var(--glass-highlight);`);
  rules.push(`  --vi-glass-noise: var(--glass-noise-opacity);`);
  rules.push(`  --vi-glass-blur: var(--glass-blur);`);
  rules.push(`  --vi-glass-popup-bg: var(--glass-popup-bg);`);
  rules.push(`  --vi-glass-popup-border: var(--glass-popup-border);`);
  rules.push(`  --vi-glass-popup-blur: var(--glass-popup-blur);`);

  // Blur variables
  Object.entries(foundationTokens.blur).forEach(([key, value]) => {
    rules.push(`  --blur-${key}: ${value};`);
  });

  // Depth variables (elevation shadows)
  Object.entries(foundationTokens.depth).forEach(([key, value]) => {
    rules.push(`  --depth-${key}: ${value};`);
  });

  // Motion variables (duration + easing)
  Object.entries(foundationTokens.motion.duration).forEach(([key, value]) => {
    rules.push(`  --motion-duration-${key}: ${value};`);
  });
  Object.entries(foundationTokens.motion.ease).forEach(([key, value]) => {
    rules.push(`  --motion-ease-${key}: ${value};`);
  });
  // Shorthand aliases
  rules.push(`  --vi-ease: var(--motion-ease-default);`);
  rules.push(`  --vi-ease-spring: var(--motion-ease-spring);`);
  rules.push(`  --vi-duration-fast: var(--motion-duration-fast);`);
  rules.push(`  --vi-duration-normal: var(--motion-duration-normal);`);
  rules.push(`  --vi-duration-slow: var(--motion-duration-slow);`);
  rules.push(`  --vi-blur-sm: var(--blur-sm);`);
  rules.push(`  --vi-blur-md: var(--blur-md);`);
  rules.push(`  --vi-blur-lg: var(--blur-lg);`);
  rules.push(`  --vi-blur-xl: var(--blur-xl);`);
  rules.push(`  --vi-depth-1: var(--depth-1);`);
  rules.push(`  --vi-depth-2: var(--depth-2);`);
  rules.push(`  --vi-depth-3: var(--depth-3);`);
  rules.push(`  --vi-depth-4: var(--depth-4);`);

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

