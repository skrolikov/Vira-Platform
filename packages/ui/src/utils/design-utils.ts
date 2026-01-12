import { DesignProps } from "../types";
import { registerDesign, getDesignHash } from "./design-registry";
import { shouldIncludeDataDesign } from "./env";

// Контекст для проверки, нужно ли скрывать data-design
let shouldHideDataDesign = false;

export function setHideDataDesign(value: boolean) {
  shouldHideDataDesign = value;
}

export function mergeDesign(
  preset?: DesignProps,
  design?: DesignProps
): DesignProps {
  if (!preset) return design || {};
  if (!design) return preset;

  // Для effect применяем специальную логику:
  // Если в design указан effect, он имеет приоритет
  // Но мы сохраняем его как отдельное свойство
  const hasEffect = 'effect' in design;

  // Мержим основные свойства, но effect из design имеет приоритет
  const merged: DesignProps = {
    ...preset,
    ...design,
  };

  // Правильно мержим вложенные объекты (hover, focus, active)
  // Только если они есть в обоих объектах
  if (preset.hover || design.hover) {
    merged.hover = {
      ...(preset.hover || {}),
      ...(design.hover || {}),
    };
  }

  if (preset.focus || design.focus) {
    merged.focus = {
      ...(preset.focus || {}),
      ...(design.focus || {}),
    };
  }

  if (preset.active || design.active) {
    merged.active = {
      ...(preset.active || {}),
      ...(design.active || {}),
    };
  }

  return merged;
}

/**
 * Получает класс для design и регистрирует его в DesignRegistry
 * 
 * В проде: возвращает только hash класс (vi-{hash})
 * В dev: можно также добавить data-design атрибут для отладки
 */
export function getDesignClass(
  design: DesignProps,
  prefix: string = "vi-"
): string {
  if (!design || Object.keys(design).length === 0) {
    return "";
  }

  // Регистрируем design в registry (если ещё не зарегистрирован - генерирует CSS)
  const hash = registerDesign(design, prefix);

  return hash ? `${prefix}${hash}` : "";
}

export function applyDesignClass(
  className: string | undefined,
  designClass: string
): string {
  return className ? `${className} ${designClass}` : designClass;
}

/**
 * Возвращает data-design атрибут только в dev режиме
 * 
 * В проде: всегда undefined (не добавляем JSON в DOM)
 * В dev: возвращает JSON для отладки (если не отключено через setHideDataDesign)
 */
export function getDataDesignAttribute(design: DesignProps): string | undefined {
  if (shouldHideDataDesign) {
    return undefined;
  }

  // В проде не добавляем data-design
  if (!shouldIncludeDataDesign()) {
    return undefined;
  }

  // В dev режиме добавляем для отладки
  return JSON.stringify(design);
}