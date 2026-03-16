import { foundationTokens } from "../tokens/foundation";

// Тип для темы (может быть частичным, недостающие значения берутся из foundation)
export interface Theme {
  color?: Record<string, any>;
  radius?: Record<string, string>;
  shadow?: Record<string, string>;
  /** Elevation-тени (depth.1 .. depth.4) */
  depth?: Record<string, string>;
  /** Glass tokens (bg, border, blur, highlight…) */
  glass?: Record<string, string>;
  /** Blur-радиусы (blur.sm .. blur.xl) */
  blur?: Record<string, string>;
  /** Motion-токены (duration.fast, ease.spring …) */
  motion?: {
    duration?: Record<string, string>;
    ease?: Record<string, string>;
  };
  spacing?: Record<string | number, string>;
  space?: Record<string | number, string>; // Альтернативное название для spacing
  typography?: {
    fontSize?: Record<string, string>;
    fontWeight?: Record<string, string>;
    // Или может быть плоская структура как в foundation
    [key: string]: any;
  };
  presets?: Record<string, {
    padding?: number | string;
    radius?: string;
    [key: string]: any;
  }>;
  effect?: Record<string, any>; // Эффекты могут быть как объектами, так и строками
  [key: string]: any; // Для дополнительных свойств тем
}

// Генерирует CSS переменные из темы с fallback на foundation
export function generateThemeCSSVariables(theme: Theme): string {
  const rules: string[] = [];
  const addedVars = new Set<string>(); // Отслеживаем уже добавленные переменные
  
  // Color variables
  if (theme.color) {
    Object.entries(theme.color).forEach(([key, value]) => {
      if (typeof value === "object" && value !== null && !Array.isArray(value)) {
        // Вложенные объекты (например, text: { primary: ... })
        Object.entries(value).forEach(([subKey, subValue]) => {
          const varName = `--color-${key}-${subKey}`;
          if (!addedVars.has(varName)) {
            rules.push(`  ${varName}: ${subValue};`);
            addedVars.add(varName);
          }
        });
      } else {
        const varName = `--color-${key}`;
        if (!addedVars.has(varName)) {
          rules.push(`  ${varName}: ${value};`);
          addedVars.add(varName);
        }
      }
    });
  }
  
  // Effect variables
  if (theme.effect) {
    Object.entries(theme.effect).forEach(([effectName, effectConfig]) => {
      if (typeof effectConfig === "object" && effectConfig !== null && !Array.isArray(effectConfig)) {
        // Эффекты - это объекты с CSS свойствами
        // Преобразуем их в CSS переменные
        Object.entries(effectConfig).forEach(([cssProp, cssValue]) => {
          // Преобразуем camelCase в kebab-case для CSS свойств
          const kebabProp = cssProp.replace(/([A-Z])/g, "-$1").toLowerCase();
          const varName = `--effect-${effectName}-${kebabProp}`;
          if (!addedVars.has(varName)) {
            // Если значение - это токен (например, "shadow.md"), разрешаем его
            let finalValue = cssValue;
            if (typeof cssValue === "string" && cssValue.startsWith("shadow.")) {
              // Пытаемся разрешить токен shadow из темы или foundation
              const shadowKey = cssValue.replace("shadow.", "");
              const shadowFromTheme = theme.shadow?.[shadowKey];
              if (shadowFromTheme) {
                finalValue = shadowFromTheme;
              } else {
                // Используем как есть, если не нашли
                finalValue = cssValue;
              }
            }
            rules.push(`  ${varName}: ${finalValue};`);
            addedVars.add(varName);
          }
        });
      } else if (typeof effectConfig === "string") {
        // Если эффект - это строка, пытаемся распарсить её как CSS свойство
        // Например, "0 0 20px rgba(0,122,255,0.35)" для box-shadow
        // Пробуем определить тип эффекта по имени
        if (effectName.includes("glow") || effectName.includes("neon") || effectName.includes("shadow")) {
          const varName = `--effect-${effectName}-box-shadow`;
          if (!addedVars.has(varName)) {
            rules.push(`  ${varName}: ${effectConfig};`);
            addedVars.add(varName);
          }
        } else if (effectName.includes("blur") || effectName.includes("glass")) {
          const varName = `--effect-${effectName}-backdrop-filter`;
          if (!addedVars.has(varName)) {
            rules.push(`  ${varName}: ${effectConfig};`);
            addedVars.add(varName);
          }
        } else if (effectName.includes("gradient") || effectName.includes("background")) {
          const varName = `--effect-${effectName}-background`;
          if (!addedVars.has(varName)) {
            rules.push(`  ${varName}: ${effectConfig};`);
            addedVars.add(varName);
          }
        }
      }
    });
  }
  // Дополняем недостающие color из foundation
  Object.entries(foundationTokens.color).forEach(([key, value]) => {
    // Обрабатываем ключи с точками (например, "text.primary")
    if (key.includes(".")) {
      const parts = key.split(".");
      const varName = `--color-${parts.join("-")}`;
      if (!addedVars.has(varName)) {
        rules.push(`  ${varName}: ${value};`);
        addedVars.add(varName);
      }
    } else {
      // Простые ключи
      const varName = `--color-${key}`;
      if (!addedVars.has(varName)) {
        // Проверяем, не определен ли уже в теме
        const existsInTheme = theme.color && (
          key in theme.color || 
          Object.keys(theme.color).some(k => k.startsWith(`${key}.`))
        );
        if (!existsInTheme) {
          rules.push(`  ${varName}: ${value};`);
          addedVars.add(varName);
        }
      }
      // Также добавляем --color-bg для обратной совместимости
      if (key === "bg" && !addedVars.has("--color-bg")) {
        rules.push(`  --color-bg: ${value};`);
        addedVars.add("--color-bg");
      }
    }
  });
  
  // Radius variables
  if (theme.radius) {
    Object.entries(theme.radius).forEach(([key, value]) => {
      const varName = `--radius-${key}`;
      if (!addedVars.has(varName)) {
        rules.push(`  ${varName}: ${value};`);
        addedVars.add(varName);
      }
    });
  }
  // Дополняем недостающие radius из foundation
  Object.entries(foundationTokens.radius).forEach(([key, value]) => {
    const varName = `--radius-${key}`;
    if (!addedVars.has(varName)) {
      rules.push(`  ${varName}: ${value};`);
      addedVars.add(varName);
    }
  });
  
  // Shadow variables
  if (theme.shadow) {
    Object.entries(theme.shadow).forEach(([key, value]) => {
      const varName = `--shadow-${key}`;
      if (!addedVars.has(varName)) {
        rules.push(`  ${varName}: ${value};`);
        addedVars.add(varName);
      }
    });
  }
  // Дополняем недостающие shadow из foundation
  Object.entries(foundationTokens.shadow).forEach(([key, value]) => {
    const varName = `--shadow-${key}`;
    if (!addedVars.has(varName)) {
      rules.push(`  ${varName}: ${value};`);
      addedVars.add(varName);
    }
  });
  
  // Spacing variables (поддерживаем и space, и spacing)
  const spacing = theme.spacing || theme.space;
  if (spacing) {
    Object.entries(spacing).forEach(([key, value]) => {
      const varName = `--spacing-${key}`;
      if (!addedVars.has(varName)) {
        rules.push(`  ${varName}: ${value};`);
        addedVars.add(varName);
      }
    });
  }
  // Дополняем недостающие spacing из foundation
  Object.entries(foundationTokens.spacing).forEach(([key, value]) => {
    const varName = `--spacing-${key}`;
    if (!addedVars.has(varName)) {
      rules.push(`  ${varName}: ${value};`);
      addedVars.add(varName);
    }
  });
  
  // Typography variables
  if (theme.typography) {
    // Если структура как в cyberpunk (fontSize и fontWeight отдельно)
    if (theme.typography.fontSize) {
      Object.entries(theme.typography.fontSize).forEach(([key, value]) => {
        const varName1 = `--typography-fontSize-${key}`;
        const varName2 = `--typography-${key}`;
        if (!addedVars.has(varName1)) {
          rules.push(`  ${varName1}: ${value};`);
          addedVars.add(varName1);
        }
        if (!addedVars.has(varName2)) {
          rules.push(`  ${varName2}: ${value};`);
          addedVars.add(varName2);
        }
      });
    }
    if (theme.typography.fontWeight) {
      Object.entries(theme.typography.fontWeight).forEach(([key, value]) => {
        const varName1 = `--typography-fontWeight-${key}`;
        const varName2 = `--typography-weight-${key}`;
        if (!addedVars.has(varName1)) {
          rules.push(`  ${varName1}: ${value};`);
          addedVars.add(varName1);
        }
        if (!addedVars.has(varName2)) {
          rules.push(`  ${varName2}: ${value};`);
          addedVars.add(varName2);
        }
      });
    }
    
    // Если структура как в foundation (плоская с weight объектом)
    Object.entries(theme.typography).forEach(([key, value]) => {
      if (key !== "fontSize" && key !== "fontWeight") {
        if (typeof value === "string") {
          const varName1 = `--typography-fontSize-${key}`;
          const varName2 = `--typography-${key}`;
          if (!addedVars.has(varName1)) {
            rules.push(`  ${varName1}: ${value};`);
            addedVars.add(varName1);
          }
          if (!addedVars.has(varName2)) {
            rules.push(`  ${varName2}: ${value};`);
            addedVars.add(varName2);
          }
        } else if (typeof value === "object" && value !== null) {
          // weight object
          Object.entries(value).forEach(([subKey, subValue]) => {
            const varName1 = `--typography-fontWeight-${subKey}`;
            const varName2 = `--typography-weight-${subKey}`;
            if (!addedVars.has(varName1)) {
              rules.push(`  ${varName1}: ${subValue};`);
              addedVars.add(varName1);
            }
            if (!addedVars.has(varName2)) {
              rules.push(`  ${varName2}: ${subValue};`);
              addedVars.add(varName2);
            }
          });
        }
      }
    });
  }
  // Дополняем недостающие typography из foundation
  Object.entries(foundationTokens.typography).forEach(([key, value]) => {
    if (typeof value === "string") {
      // Проверяем, есть ли уже в теме
      const existsInTheme = 
        (theme.typography?.fontSize && key in theme.typography.fontSize) ||
        (theme.typography && key in theme.typography && typeof theme.typography[key] === "string");
      
      if (!existsInTheme) {
        const varName1 = `--typography-fontSize-${key}`;
        const varName2 = `--typography-${key}`;
        if (!addedVars.has(varName1)) {
          rules.push(`  ${varName1}: ${value};`);
          addedVars.add(varName1);
        }
        if (!addedVars.has(varName2)) {
          rules.push(`  ${varName2}: ${value};`);
          addedVars.add(varName2);
        }
      }
    } else if (typeof value === "object" && value !== null) {
      // weight object
      Object.entries(value).forEach(([subKey, subValue]) => {
        const existsInTheme = 
          (theme.typography?.fontWeight && subKey in theme.typography.fontWeight) ||
          (theme.typography?.weight && subKey in theme.typography.weight);
        
        if (!existsInTheme) {
          const varName1 = `--typography-fontWeight-${subKey}`;
          const varName2 = `--typography-weight-${subKey}`;
          if (!addedVars.has(varName1)) {
            rules.push(`  ${varName1}: ${subValue};`);
            addedVars.add(varName1);
          }
          if (!addedVars.has(varName2)) {
            rules.push(`  ${varName2}: ${subValue};`);
            addedVars.add(varName2);
          }
        }
      });
    }
  });
  
  // Генерируем CSS правила для переопределения пресетов в контексте темы
  let presetRules: string[] = [];
  if (theme.presets) {
    Object.entries(theme.presets).forEach(([presetName, presetOverrides]) => {
      const presetSelectors: string[] = [];
      
      // Генерируем селектор для пресета (например, .vi-xxxxx[data-preset="glass"])
      // Но так как мы не знаем хеши классов, используем CSS переменные
      Object.entries(presetOverrides).forEach(([key, value]) => {
        if (key === "padding" && typeof value === "number") {
          // Преобразуем число в spacing токен
          const spacingVar = `--preset-${presetName}-padding`;
          if (!addedVars.has(spacingVar)) {
            const spacingValue = foundationTokens.spacing[value as keyof typeof foundationTokens.spacing] || `${value * 4}px`;
            presetRules.push(`  ${spacingVar}: ${spacingValue};`);
            addedVars.add(spacingVar);
          }
        } else if (key === "radius" && typeof value === "string") {
          // Преобразуем токен radius в значение
          const radiusVar = `--preset-${presetName}-radius`;
          if (!addedVars.has(radiusVar)) {
            let radiusValue = value;
            if (value.startsWith("radius.")) {
              const radiusKey = value.replace("radius.", "");
              radiusValue = theme.radius?.[radiusKey] || foundationTokens.radius[radiusKey as keyof typeof foundationTokens.radius] || value;
            }
            presetRules.push(`  ${radiusVar}: ${radiusValue};`);
            addedVars.add(radiusVar);
          }
        }
      });
    });
  }
  
  // Glass system variables
  if (theme.glass) {
    Object.entries(theme.glass).forEach(([key, value]) => {
      const varName = `--glass-${key}`;
      if (!addedVars.has(varName)) {
        rules.push(`  ${varName}: ${value};`);
        addedVars.add(varName);
      }
    });
  }
  // Дополняем glass из foundation
  Object.entries(foundationTokens.glass).forEach(([key, value]) => {
    const varName = `--glass-${key}`;
    if (!addedVars.has(varName)) {
      rules.push(`  ${varName}: ${value};`);
      addedVars.add(varName);
    }
  });
  // Shorthand glass aliases
  const glassAliases: Record<string, string> = {
    "--vi-glass-bg":           "var(--glass-bg)",
    "--vi-glass-border":       "var(--glass-border)",
    "--vi-glass-highlight":    "var(--glass-highlight)",
    "--vi-glass-noise":        "var(--glass-noise-opacity)",
    "--vi-glass-blur":         "var(--glass-blur)",
    "--vi-glass-popup-bg":     "var(--glass-popup-bg)",
    "--vi-glass-popup-border": "var(--glass-popup-border)",
    "--vi-glass-popup-blur":   "var(--glass-popup-blur)",
  };
  Object.entries(glassAliases).forEach(([varName, value]) => {
    if (!addedVars.has(varName)) {
      rules.push(`  ${varName}: ${value};`);
      addedVars.add(varName);
    }
  });

  // Blur variables
  if (theme.blur) {
    Object.entries(theme.blur).forEach(([key, value]) => {
      const varName = `--blur-${key}`;
      if (!addedVars.has(varName)) {
        rules.push(`  ${varName}: ${value};`);
        addedVars.add(varName);
      }
    });
  }
  // Дополняем blur из foundation
  Object.entries(foundationTokens.blur).forEach(([key, value]) => {
    const varName = `--blur-${key}`;
    if (!addedVars.has(varName)) {
      rules.push(`  ${varName}: ${value};`);
      addedVars.add(varName);
    }
  });

  // Depth variables
  if (theme.depth) {
    Object.entries(theme.depth).forEach(([key, value]) => {
      const varName = `--depth-${key}`;
      if (!addedVars.has(varName)) {
        rules.push(`  ${varName}: ${value};`);
        addedVars.add(varName);
      }
    });
  }
  // Дополняем depth из foundation
  Object.entries(foundationTokens.depth).forEach(([key, value]) => {
    const varName = `--depth-${key}`;
    if (!addedVars.has(varName)) {
      rules.push(`  ${varName}: ${value};`);
      addedVars.add(varName);
    }
  });

  // Motion variables
  if (theme.motion?.duration) {
    Object.entries(theme.motion.duration).forEach(([key, value]) => {
      const varName = `--motion-duration-${key}`;
      if (!addedVars.has(varName)) {
        rules.push(`  ${varName}: ${value};`);
        addedVars.add(varName);
      }
    });
  }
  if (theme.motion?.ease) {
    Object.entries(theme.motion.ease).forEach(([key, value]) => {
      const varName = `--motion-ease-${key}`;
      if (!addedVars.has(varName)) {
        rules.push(`  ${varName}: ${value};`);
        addedVars.add(varName);
      }
    });
  }
  // Дополняем motion из foundation
  Object.entries(foundationTokens.motion.duration).forEach(([key, value]) => {
    const varName = `--motion-duration-${key}`;
    if (!addedVars.has(varName)) {
      rules.push(`  ${varName}: ${value};`);
      addedVars.add(varName);
    }
  });
  Object.entries(foundationTokens.motion.ease).forEach(([key, value]) => {
    const varName = `--motion-ease-${key}`;
    if (!addedVars.has(varName)) {
      rules.push(`  ${varName}: ${value};`);
      addedVars.add(varName);
    }
  });

  // Shorthand aliases (всегда добавляем — они ссылаются на var())
  const shorthandAliases: Record<string, string> = {
    "--vi-ease":            "var(--motion-ease-default)",
    "--vi-ease-spring":     "var(--motion-ease-spring)",
    "--vi-duration-fast":   "var(--motion-duration-fast)",
    "--vi-duration-normal": "var(--motion-duration-normal)",
    "--vi-duration-slow":   "var(--motion-duration-slow)",
    "--vi-blur-sm":         "var(--blur-sm)",
    "--vi-blur-md":         "var(--blur-md)",
    "--vi-blur-lg":         "var(--blur-lg)",
    "--vi-blur-xl":         "var(--blur-xl)",
    "--vi-depth-1":         "var(--depth-1)",
    "--vi-depth-2":         "var(--depth-2)",
    "--vi-depth-3":         "var(--depth-3)",
    "--vi-depth-4":         "var(--depth-4)",
  };
  Object.entries(shorthandAliases).forEach(([varName, value]) => {
    if (!addedVars.has(varName)) {
      rules.push(`  ${varName}: ${value};`);
      addedVars.add(varName);
    }
  });

  // Объединяем основные правила и правила для пресетов
  const allRules = [...rules, ...presetRules];
  return `:root {\n${allRules.join("\n")}\n}`;
}

