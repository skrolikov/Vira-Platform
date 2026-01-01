import { GeneratedComponent, ComponentBindings } from "./types";

/**
 * generateComponent - автоматическая генерация всего "до return"
 * 
 * Это функция, которая принимает контекст компонента
 * и возвращает готовый объект с:
 * - props
 * - classes (через design prop)
 * - bindings (events, attributes, models)
 * - state (из хуков)
 * - methods (из хуков и auto-binding)
 * - refs
 */

interface GeneratorContext {
  props: any;
  design?: any;
  hooks?: any;
  action?: string;
  model?: string;
  source?: string;
}

export function generateComponent<P = any>(
  context: GeneratorContext
): GeneratedComponent<P> {
  const {
    props,
    design = {},
    hooks = {},
    action,
    model,
    source,
  } = context;

  // ============================================
  // CLASSES - генерация через design prop
  // ============================================
  const classes = generateClasses(design);

  // ============================================
  // BINDINGS
  // ============================================
  const bindings: ComponentBindings = {
    events: {},
    attributes: {},
    models: {},
  };

  // Action binding
  if (action) {
    bindings.events!.onClick = () => {
      console.log("Action triggered:", action);
      // Реальная логика будет через resolveAction
    };
  }

  // Model binding
  if (model) {
    bindings.models![model] = {
      value: null, // Будет из сервиса
      onChange: (value: any) => {
        console.log("Model changed:", model, value);
      },
    };
  }

  // ============================================
  // STATE - из хуков
  // ============================================
  const state = hooks;

  // ============================================
  // METHODS
  // ============================================
  const methods: Record<string, Function> = {};

  // ============================================
  // REFS
  // ============================================
  const refs: Record<string, any> = {};

  return {
    props: props as P,
    classes,
    bindings,
    state,
    methods,
    refs,
  };
}

/**
 * Генерация CSS классов из design объекта
 * Интеграция с design-utils из @vira-ui/ui
 */
function generateClasses(design: any): string {
  // Используем хеш-генерацию для уникальных классов
  // В реальности это будет интегрироваться с getDesignClass из @vira-ui/ui
  // Для совместимости генерируем простые классы
  
  if (!design || typeof design !== "object") {
    return "";
  }
  
  const classes: string[] = [];

  // Генерируем классы на основе design props
  // Это базовая реализация, полная версия будет в @vira-ui/ui
  
  if (design.padding) {
    classes.push(`vira-p-${String(design.padding).replace(/[^a-zA-Z0-9]/g, "-")}`);
  }

  if (design.bg) {
    classes.push(`vira-bg-${String(design.bg).replace(/\./g, "-")}`);
  }

  if (design.radius) {
    classes.push(`vira-radius-${String(design.radius).replace(/[^a-zA-Z0-9]/g, "-")}`);
  }

  if (design.color) {
    classes.push(`vira-color-${String(design.color).replace(/\./g, "-")}`);
  }

  return classes.join(" ");
}

// Note: generateAriaAttributes has been moved to accessibility.ts (v3.1)
// Use generateAriaAttributes from @vira-ui/core/accessibility or from the main export

