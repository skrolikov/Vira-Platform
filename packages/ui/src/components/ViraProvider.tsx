import React, { createContext, useContext, useEffect } from "react";
import { cyberpunk } from "../themes/cyberpunk";
import { aurora } from "../themes/luxury";
import { material } from "../themes/material";
import { midnight } from "../themes/midnight";
import { synthwave } from "../themes/synthwave";
import { apple } from "../themes/apple";
import { vintage } from "../themes/vintage";
import { monochrome } from "../themes/monochrome";
import { virstakdark } from "../themes/virstakdark";
import { virstaklight } from "../themes/virstaklight";
import { foundationTokens } from "../tokens/foundation";
import { generateCSSVariables } from "../utils/css-variables";
import { generateRuntimeStyles } from "../utils/runtime-styles";
import { setHideDataDesign } from "../utils/design-utils";
import { generateThemeCSSVariables, Theme } from "../utils/theme-generator";
import { shouldEnableDevTools } from "../utils/env";

// Вспомогательная функция для разрешения color токенов
function resolveColorToken(path: string, theme: Theme): string | null {
  if (!path.startsWith("color.")) return null;
  
  const parts = path.replace("color.", "").split(".");
  let current: any = theme.color || foundationTokens.color;
  
  // Сначала пробуем найти в теме
  for (const part of parts) {
    if (current && typeof current === "object" && part in current) {
      current = current[part];
    } else {
      // Если не нашли в теме, пробуем foundation
      current = foundationTokens.color;
      for (const p of parts) {
        if (current && typeof current === "object") {
          // Пробуем найти как вложенный объект
          if (p in current) {
            current = current[p];
          } else {
            // Пробуем найти как ключ с точками
            const fullKey = parts.join(".");
            if (fullKey in foundationTokens.color) {
              return foundationTokens.color[fullKey as keyof typeof foundationTokens.color] as string;
            }
            return null;
          }
        } else {
          return null;
        }
      }
      break;
    }
  }
  
  return typeof current === "string" ? current : null;
}

export type ThemeName = "default" | "monochrome" | "cyberpunk" | "aurora" | "material" | "retro" | "midnight" | "synthwave" | "apple" | "neomorph" | "eightbit" | "vintage" | "swiss" | "typography" | "memphis" | "threed" | "virstakdark" | "virstaklight";

export interface ViraProviderProps {
  theme?: ThemeName;
  children: React.ReactNode;
  hideDataDesign?: boolean; // Скрывать data-design атрибуты в HTML
}

interface ViraContextValue {
  theme: ThemeName;
  hideDataDesign: boolean;
}

const ViraContext = createContext<ViraContextValue>({ theme: "default", hideDataDesign: false });

export const ViraProvider: React.FC<ViraProviderProps> = ({ 
  theme = "default", 
  children,
  hideDataDesign = process.env.NODE_ENV === "production", // По умолчанию скрываем в production
}) => {
  useEffect(() => {
    // Генерируем и добавляем CSS переменные
    const root = document.documentElement;
    const styleId = "vira-css-variables";
    let styleEl = document.getElementById(styleId) as HTMLStyleElement;
    
    if (!styleEl) {
      styleEl = document.createElement("style");
      styleEl.id = styleId;
      document.head.appendChild(styleEl);
    }
    
    // Маппинг тем на их объекты
    const themeMap: Record<string, Theme> = {
      default: {} as Theme, // Пустая тема = используем только foundation
      monochrome: monochrome as Theme,
      cyberpunk: cyberpunk as Theme,
      aurora: aurora as Theme,
      material: material as Theme,
      midnight: midnight as Theme,
      synthwave: synthwave as Theme,
      apple: apple as Theme,
      vintage: vintage as Theme,
      virstakdark: virstakdark as Theme,
      virstaklight: virstaklight as Theme,
    };
    
    const selectedTheme = themeMap[theme];
    
    if (theme === "default" || !selectedTheme) {
      // Генерируем CSS переменные из foundation токенов
      styleEl.textContent = generateCSSVariables();
    } else {
      // Генерируем CSS переменные из темы с fallback на foundation
      const themeCSS = generateThemeCSSVariables(selectedTheme);
      
      // Добавляем CSS правила для переопределения пресетов в контексте темы
      let presetOverridesCSS = "";
      if (selectedTheme.presets) {
        const presetRules: string[] = [];
        Object.entries(selectedTheme.presets).forEach(([presetName, presetOverrides]) => {
          const properties: string[] = [];
          
          Object.entries(presetOverrides).forEach(([key, value]) => {
            if (key === "padding" && typeof value === "number") {
              // Используем spacing токен из темы или foundation
              const spacing = selectedTheme.spacing || selectedTheme.space || foundationTokens.spacing;
              const spacingValue = spacing[value as keyof typeof spacing] || `${value * 4}px`;
              properties.push(`  padding: ${spacingValue};`);
            } else if (key === "radius" && typeof value === "string") {
              // Разрешаем radius токен
              let radiusValue = value;
              if (value.startsWith("radius.")) {
                const radiusKey = value.replace("radius.", "");
                radiusValue = selectedTheme.radius?.[radiusKey] || foundationTokens.radius[radiusKey as keyof typeof foundationTokens.radius] || value;
              }
              properties.push(`  border-radius: ${radiusValue};`);
            } else if (key === "bg" && typeof value === "string" && value.startsWith("color.")) {
              // Разрешаем color токены для background
              const colorValue = resolveColorToken(value, selectedTheme);
              if (colorValue) {
                properties.push(`  background-color: ${colorValue};`);
              }
            } else if (key === "color" && typeof value === "string" && value.startsWith("color.")) {
              // Разрешаем color токены для text color
              const colorValue = resolveColorToken(value, selectedTheme);
              if (colorValue) {
                properties.push(`  color: ${colorValue};`);
              }
            } else if (key === "shadow" && typeof value === "string" && value.startsWith("shadow.")) {
              // Разрешаем shadow токены
              const shadowKey = value.replace("shadow.", "");
              const shadowValue = selectedTheme.shadow?.[shadowKey] || foundationTokens.shadow[shadowKey as keyof typeof foundationTokens.shadow] || value;
              properties.push(`  box-shadow: ${shadowValue};`);
            } else if (key === "hover" && typeof value === "object") {
              // Обрабатываем вложенные hover состояния
              const hoverProperties: string[] = [];
              Object.entries(value).forEach(([hoverKey, hoverValue]) => {
                if (hoverKey === "bg" && typeof hoverValue === "string" && hoverValue.startsWith("color.")) {
                  const colorValue = resolveColorToken(hoverValue, selectedTheme);
                  if (colorValue) {
                    // Для неоморфизма используем цвет с низкой прозрачностью (10%)
                    const rgbMatch = colorValue.match(/#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})/i);
                    if (rgbMatch) {
                      const r = parseInt(rgbMatch[1], 16);
                      const g = parseInt(rgbMatch[2], 16);
                      const b = parseInt(rgbMatch[3], 16);
                      // Слабый оттенок цвета (10% прозрачности)
                      hoverProperties.push(`  background-color: rgba(${r}, ${g}, ${b}, 0.1);`);
                    } else {
                      hoverProperties.push(`  background-color: ${colorValue};`);
                    }
                  }
                } else if (hoverKey === "color" && typeof hoverValue === "string" && hoverValue.startsWith("color.")) {
                  const colorValue = resolveColorToken(hoverValue, selectedTheme);
                  if (colorValue) {
                    hoverProperties.push(`  color: ${colorValue};`);
                  }
                } else if (hoverKey === "opacity" && typeof hoverValue === "number") {
                  hoverProperties.push(`  opacity: ${hoverValue};`);
                } else if (hoverKey === "shadow" && typeof hoverValue === "string" && hoverValue.startsWith("shadow.")) {
                  const shadowKey = hoverValue.replace("shadow.", "");
                  const shadowValue = selectedTheme.shadow?.[shadowKey] || foundationTokens.shadow[shadowKey as keyof typeof foundationTokens.shadow] || hoverValue;
                  hoverProperties.push(`  box-shadow: ${shadowValue};`);
                }
              });
              if (hoverProperties.length > 0) {
                presetRules.push(`[data-theme="${theme}"] [data-preset="${presetName}"]:hover:not(:disabled),`);
                presetRules.push(`[data-theme="${theme}"][data-preset="${presetName}"]:hover:not(:disabled) {`);
                presetRules.push(...hoverProperties);
                presetRules.push(`}`);
              }
            } else if (key === "active" && typeof value === "object") {
              // Обрабатываем вложенные active состояния
              const activeProperties: string[] = [];
              Object.entries(value).forEach(([activeKey, activeValue]) => {
                if (activeKey === "shadow" && typeof activeValue === "string" && activeValue.startsWith("shadow.")) {
                  const shadowKey = activeValue.replace("shadow.", "");
                  const shadowValue = selectedTheme.shadow?.[shadowKey] || foundationTokens.shadow[shadowKey as keyof typeof foundationTokens.shadow] || activeValue;
                  activeProperties.push(`  box-shadow: ${shadowValue};`);
                }
              });
              if (activeProperties.length > 0) {
                // Маппинг имен пресетов для инпутов
                const inputPresetMap: Record<string, string> = {
                  inputDefault: "default",
                  inputSoft: "soft",
                  inputOutline: "outline",
                };
                
                if (presetName.startsWith("input")) {
                  const actualPresetName = inputPresetMap[presetName] || presetName.replace("input", "").toLowerCase();
                  presetRules.push(`[data-theme="${theme}"] input[data-preset="${actualPresetName}"]:active,`);
                  presetRules.push(`[data-theme="${theme}"] input[data-preset="${actualPresetName}"]:active {`);
                } else {
                  presetRules.push(`[data-theme="${theme}"] [data-preset="${presetName}"]:active,`);
                  presetRules.push(`[data-theme="${theme}"][data-preset="${presetName}"]:active {`);
                }
                presetRules.push(...activeProperties);
                presetRules.push(`}`);
              }
            }
          });
          
          if (properties.length > 0) {
            // Используем data-preset атрибут для селектора
            // Селектор применяется к элементам с data-preset атрибутом внутри темы
            
            // Маппинг имен пресетов для инпутов
            const inputPresetMap: Record<string, string> = {
              inputDefault: "default",
              inputSoft: "soft",
              inputOutline: "outline",
            };
            
            // Если это пресет для инпута, используем правильное имя
            if (presetName.startsWith("input")) {
              const actualPresetName = inputPresetMap[presetName] || presetName.replace("input", "").toLowerCase();
              presetRules.push(`[data-theme="${theme}"] input[data-preset="${actualPresetName}"],`);
              presetRules.push(`[data-theme="${theme}"] input[data-preset="${actualPresetName}"] {`);
            } else {
              presetRules.push(`[data-theme="${theme}"] [data-preset="${presetName}"],`);
              presetRules.push(`[data-theme="${theme}"][data-preset="${presetName}"] {`);
            }
            presetRules.push(...properties);
            presetRules.push(`}`);
          }
        });
        
        if (presetRules.length > 0) {
          presetOverridesCSS = "\n" + presetRules.join("\n");
        }
      }
      
      styleEl.textContent = themeCSS + presetOverridesCSS;
    }
    
    // Устанавливаем data-theme атрибут
    root.setAttribute("data-theme", theme);
    
    // Регенерируем runtime стили с CSS переменными
    // Only generate runtime styles in dev mode
    // In production, CSS should be extracted at build time
    if (shouldEnableDevTools()) {
    setTimeout(() => {
      generateRuntimeStyles("vi-", true);
    }, 0);
    }
  }, [theme]);
  
  useEffect(() => {
    // Устанавливаем флаг для скрытия data-design
    setHideDataDesign(hideDataDesign);
    
    // Удаляем data-design атрибуты если нужно
    if (hideDataDesign) {
      const removeDataDesign = () => {
        document.querySelectorAll("[data-design]").forEach((el) => {
          el.removeAttribute("data-design");
        });
      };
      
      // Удаляем сразу
      removeDataDesign();
      
      // И следим за новыми элементами (только в dev режиме)
      if (shouldEnableDevTools()) {
      const observer = new MutationObserver(() => {
        removeDataDesign();
      });
      
      observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ["data-design"],
      });
      
      return () => observer.disconnect();
      }
      
      return undefined;
    }
  }, [hideDataDesign]);
  
  return (
    <ViraContext.Provider value={{ theme, hideDataDesign }}>
      {children}
    </ViraContext.Provider>
  );
};

export const useViraTheme = () => useContext(ViraContext);
