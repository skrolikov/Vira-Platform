import { DesignProps } from "../types";
import { generateHash } from "./hash";
import { generateCSSFromDesign } from "./runtime-styles";
import { isProdMode } from "./env";
import { memoizedHash } from "./hash-memo";

/**
 * DesignRegistry - Реестр стилей для продакшена
 * 
 * Хранит соответствие hash -> CSS и генерирует стили один раз
 * 
 * @example
 * const hash = DesignRegistry.register(design);
 * // CSS автоматически добавляется в <style id="vira-runtime">
 * // Используй: <div className={hash} />
 */
class DesignRegistry {
  private static instance: DesignRegistry;
  private styles = new Map<string, string>(); // hash -> CSS
  private styleElement: HTMLStyleElement | null = null;
  private styleContent = new Map<string, string>(); // hash -> CSS content
  private isClient = typeof document !== "undefined";

  private constructor() {
    if (this.isClient) {
      this.ensureStyleElement();
    }
  }

  static getInstance(): DesignRegistry {
    if (!DesignRegistry.instance) {
      DesignRegistry.instance = new DesignRegistry();
    }
    return DesignRegistry.instance;
  }

  /**
   * Нормализует design объект для стабильного hash
   * Сортирует ключи и рекурсивно нормализует вложенные объекты
   * 
   * Это важно для стабильности hash - одинаковый design всегда даёт одинаковый hash
   */
  private normalizeDesign(design: DesignProps): string {
    if (!design || typeof design !== "object" || Array.isArray(design)) {
      return JSON.stringify(design);
    }

    // Создаём отсортированный объект
    const normalized: Record<string, any> = {};
    const sortedKeys = Object.keys(design).sort();

    for (const key of sortedKeys) {
      const value = design[key as keyof DesignProps];
      
      // Пропускаем undefined значения
      if (value === undefined) {
        continue;
      }
      
      // Рекурсивно нормализуем вложенные объекты
      if (value && typeof value === "object" && !Array.isArray(value)) {
        // Псевдо-состояния нормализуем отдельно
        if (key === "hover" || key === "focus" || key === "active") {
          normalized[key] = this.normalizeNestedDesign(value as DesignProps);
        } else {
          // Проверяем, не является ли это responsive значением
          if ("base" in value || "sm" in value || "md" in value || "lg" in value || "xl" in value) {
            // Responsive значение - нормализуем с сортировкой ключей
            normalized[key] = this.normalizeResponsiveValue(value as any);
          } else {
            normalized[key] = this.normalizeDesign(value as DesignProps);
          }
        }
      } else if (Array.isArray(value)) {
        // Массивы сериализуем как есть
        normalized[key] = value;
      } else {
        normalized[key] = value;
      }
    }

    return JSON.stringify(normalized);
  }

  /**
   * Нормализует responsive значение (сортирует ключи)
   */
  private normalizeResponsiveValue(value: any): Record<string, any> {
    const normalized: Record<string, any> = {};
    const sortedKeys = Object.keys(value).sort();
    
    for (const key of sortedKeys) {
      normalized[key] = value[key];
    }
    
    return normalized;
  }

  /**
   * Нормализует вложенный design (для hover/focus/active)
   */
  private normalizeNestedDesign(design: DesignProps): Record<string, any> {
    const normalized: Record<string, any> = {};
    const sortedKeys = Object.keys(design).sort();

    for (const key of sortedKeys) {
      const value = design[key as keyof DesignProps];
      
      if (value === undefined) {
        continue;
      }
      
      if (value && typeof value === "object" && !Array.isArray(value)) {
        normalized[key] = this.normalizeDesign(value as DesignProps);
      } else {
        normalized[key] = value;
      }
    }

    return normalized;
  }

  /**
   * Генерирует стабильный hash из design
   * Использует мемоизацию для избежания повторных вычислений
   */
  getDesignHash(design: DesignProps): string {
    if (!design || Object.keys(design).length === 0) {
      return "";
    }
    
    const normalized = this.normalizeDesign(design);
    // Мемоизируем hash для одинаковых normalized design
    return memoizedHash(normalized, generateHash);
  }

  /**
   * Регистрирует design и возвращает hash
   * Если design уже зарегистрирован - просто возвращает hash
   * Иначе генерирует CSS и добавляет в стили
   */
  register(design: DesignProps, prefix: string = "v-"): string {
    if (!design || Object.keys(design).length === 0) {
      return "";
    }

    const hash = this.getDesignHash(design);

    // Если уже зарегистрирован - просто возвращаем hash
    if (this.styles.has(hash)) {
      return hash;
    }

    // Генерируем CSS (передаём hash чтобы не генерировать его дважды)
    const css = generateCSSFromDesign(design, prefix, true, hash);
    
    if (!css) {
      // Если CSS пустой, всё равно сохраняем чтобы не пытаться снова
      this.styles.set(hash, "");
      return hash;
    }

    // Сохраняем CSS
    this.styles.set(hash, css);
    this.styleContent.set(hash, css);

    // Обновляем style элемент
    if (this.isClient) {
      this.updateStyleElement();
    }

    return hash;
  }

  /**
   * Проверяет, зарегистрирован ли design
   */
  has(hash: string): boolean {
    return this.styles.has(hash);
  }

  /**
   * Получает CSS для hash
   */
  getCSS(hash: string): string | undefined {
    return this.styles.get(hash);
  }

  /**
   * Обеспечивает наличие style элемента в DOM
   */
  private ensureStyleElement(): void {
    if (!this.isClient) return;

    const styleId = "vira-runtime";
    let styleEl = document.getElementById(styleId) as HTMLStyleElement;

    if (!styleEl) {
      styleEl = document.createElement("style");
      styleEl.id = styleId;
      styleEl.setAttribute("data-vira-runtime", "true");
      document.head.appendChild(styleEl);
    }

    this.styleElement = styleEl;
  }

  /**
   * Обновляет содержимое style элемента
   */
  private updateStyleElement(): void {
    if (!this.styleElement || !this.isClient) return;

    // Собираем все CSS правила
    const allCSS = Array.from(this.styleContent.values())
      .filter(css => css.length > 0)
      .join("\n\n");

    this.styleElement.textContent = allCSS;
  }

  /**
   * Получает все зарегистрированные стили (для SSR)
   */
  getAllCSS(): string {
    return Array.from(this.styleContent.values())
      .filter(css => css.length > 0)
      .join("\n\n");
  }

  /**
   * Очищает registry (для тестов)
   */
  clear(): void {
    this.styles.clear();
    this.styleContent.clear();
    if (this.styleElement && this.isClient) {
      this.styleElement.textContent = "";
    }
  }
}

// Экспортируем singleton instance
export const designRegistry = DesignRegistry.getInstance();

// Экспортируем функции для удобства
export function registerDesign(design: DesignProps, prefix: string = "v-"): string {
  return designRegistry.register(design, prefix);
}

export function getDesignHash(design: DesignProps): string {
  return designRegistry.getDesignHash(design);
}

