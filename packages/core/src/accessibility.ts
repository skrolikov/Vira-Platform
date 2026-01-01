/**
 * Accessibility utilities для Vira Framework
 * Автоматическая генерация ARIA атрибутов, управление фокусом, keyboard navigation
 */

export interface AriaAttributes {
  "aria-label"?: string;
  "aria-labelledby"?: string;
  "aria-describedby"?: string;
  "aria-disabled"?: boolean;
  "aria-hidden"?: boolean;
  "aria-expanded"?: boolean;
  "aria-selected"?: boolean;
  "aria-checked"?: boolean | "mixed";
  "aria-required"?: boolean;
  "aria-invalid"?: boolean;
  "aria-busy"?: boolean;
  "aria-live"?: "off" | "polite" | "assertive";
  "aria-atomic"?: boolean;
  "aria-relevant"?: "additions" | "removals" | "text" | "all";
  "aria-controls"?: string;
  "aria-owns"?: string;
  "aria-haspopup"?: boolean | "menu" | "listbox" | "tree" | "grid" | "dialog";
  "aria-current"?: boolean | "page" | "step" | "location" | "date" | "time";
  "aria-orientation"?: "horizontal" | "vertical";
  "aria-valuemin"?: number;
  "aria-valuemax"?: number;
  "aria-valuenow"?: number;
  "aria-valuetext"?: string;
  role?: string;
}

/**
 * Генерация ARIA атрибутов на основе props компонента
 */
export function generateAriaAttributes(props: {
  label?: string;
  labelledBy?: string;
  describedBy?: string;
  disabled?: boolean;
  hidden?: boolean;
  expanded?: boolean;
  selected?: boolean;
  checked?: boolean | "mixed";
  required?: boolean;
  invalid?: boolean;
  busy?: boolean;
  live?: "off" | "polite" | "assertive";
  controls?: string;
  owns?: string;
  hasPopup?: boolean | "menu" | "listbox" | "tree" | "grid" | "dialog";
  current?: boolean | "page" | "step" | "location" | "date" | "time";
  orientation?: "horizontal" | "vertical";
  role?: string;
  [key: string]: any;
}): AriaAttributes {
  const aria: AriaAttributes = {};

  if (props.label) {
    aria["aria-label"] = props.label;
  }

  if (props.labelledBy) {
    aria["aria-labelledby"] = props.labelledBy;
  }

  if (props.describedBy) {
    aria["aria-describedby"] = props.describedBy;
  }

  if (props.disabled !== undefined) {
    aria["aria-disabled"] = props.disabled;
  }

  if (props.hidden !== undefined) {
    aria["aria-hidden"] = props.hidden;
  }

  if (props.expanded !== undefined) {
    aria["aria-expanded"] = props.expanded;
  }

  if (props.selected !== undefined) {
    aria["aria-selected"] = props.selected;
  }

  if (props.checked !== undefined) {
    aria["aria-checked"] = props.checked;
  }

  if (props.required !== undefined) {
    aria["aria-required"] = props.required;
  }

  if (props.invalid !== undefined) {
    aria["aria-invalid"] = props.invalid;
  }

  if (props.busy !== undefined) {
    aria["aria-busy"] = props.busy;
  }

  if (props.live) {
    aria["aria-live"] = props.live;
  }

  if (props.controls) {
    aria["aria-controls"] = props.controls;
  }

  if (props.owns) {
    aria["aria-owns"] = props.owns;
  }

  if (props.hasPopup !== undefined) {
    aria["aria-haspopup"] = props.hasPopup;
  }

  if (props.current !== undefined) {
    aria["aria-current"] = props.current;
  }

  if (props.orientation) {
    aria["aria-orientation"] = props.orientation;
  }

  if (props.role) {
    aria.role = props.role;
  }

  return aria;
}

/**
 * Объединение ARIA атрибутов (приоритет у custom)
 */
export function mergeAriaAttributes(
  defaultAria: AriaAttributes,
  customAria?: Partial<AriaAttributes>
): AriaAttributes {
  return { ...defaultAria, ...customAria };
}

/**
 * Утилиты для keyboard navigation
 */
export interface KeyboardNavigationOptions {
  onEnter?: (e: KeyboardEvent) => void;
  onEscape?: (e: KeyboardEvent) => void;
  onArrowUp?: (e: KeyboardEvent) => void;
  onArrowDown?: (e: KeyboardEvent) => void;
  onArrowLeft?: (e: KeyboardEvent) => void;
  onArrowRight?: (e: KeyboardEvent) => void;
  onHome?: (e: KeyboardEvent) => void;
  onEnd?: (e: KeyboardEvent) => void;
  onTab?: (e: KeyboardEvent) => void;
  onTabReverse?: (e: KeyboardEvent) => void;
  preventDefault?: boolean;
}

/**
 * Обработчик keyboard navigation
 */
export function createKeyboardHandler(options: KeyboardNavigationOptions) {
  return (e: KeyboardEvent) => {
    const {
      onEnter,
      onEscape,
      onArrowUp,
      onArrowDown,
      onArrowLeft,
      onArrowRight,
      onHome,
      onEnd,
      onTab,
      onTabReverse,
      preventDefault = true,
    } = options;

    if (preventDefault) {
      e.preventDefault();
    }

    switch (e.key) {
      case "Enter":
      case " ":
        if (onEnter && (e.key === "Enter" || e.key === " ")) {
          onEnter(e);
        }
        break;
      case "Escape":
        if (onEscape) {
          onEscape(e);
        }
        break;
      case "ArrowUp":
        if (onArrowUp) {
          onArrowUp(e);
        }
        break;
      case "ArrowDown":
        if (onArrowDown) {
          onArrowDown(e);
        }
        break;
      case "ArrowLeft":
        if (onArrowLeft) {
          onArrowLeft(e);
        }
        break;
      case "ArrowRight":
        if (onArrowRight) {
          onArrowRight(e);
        }
        break;
      case "Home":
        if (onHome) {
          onHome(e);
        }
        break;
      case "End":
        if (onEnd) {
          onEnd(e);
        }
        break;
      case "Tab":
        if (e.shiftKey && onTabReverse) {
          onTabReverse(e);
        } else if (onTab) {
          onTab(e);
        }
        break;
    }
  };
}

/**
 * Получение всех фокусируемых элементов внутри контейнера
 */
export function getFocusableElements(container: HTMLElement): HTMLElement[] {
  const focusableSelectors = [
    'a[href]:not([disabled])',
    'button:not([disabled])',
    'textarea:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
  ].join(', ');

  return Array.from(container.querySelectorAll<HTMLElement>(focusableSelectors));
}

/**
 * Focus trap - ограничение фокуса внутри контейнера
 */
export function createFocusTrap(container: HTMLElement) {
  const focusableElements = getFocusableElements(container);
  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];

  const handleTab = (e: KeyboardEvent) => {
    if (e.key !== "Tab") return;

    if (e.shiftKey) {
      // Shift + Tab
      if (document.activeElement === firstElement) {
        e.preventDefault();
        lastElement?.focus();
      }
    } else {
      // Tab
      if (document.activeElement === lastElement) {
        e.preventDefault();
        firstElement?.focus();
      }
    }
  };

  container.addEventListener("keydown", handleTab);

  return () => {
    container.removeEventListener("keydown", handleTab);
  };
}

/**
 * Установка фокуса на первый фокусируемый элемент
 */
export function focusFirstElement(container: HTMLElement): void {
  const focusableElements = getFocusableElements(container);
  focusableElements[0]?.focus();
}

/**
 * Установка фокуса на последний фокусируемый элемент
 */
export function focusLastElement(container: HTMLElement): void {
  const focusableElements = getFocusableElements(container);
  const lastElement = focusableElements[focusableElements.length - 1];
  lastElement?.focus();
}

/**
 * Сохранение и восстановление фокуса
 */
export class FocusManager {
  private previousActiveElement: HTMLElement | null = null;

  save(): void {
    this.previousActiveElement = document.activeElement as HTMLElement;
  }

  restore(): void {
    if (this.previousActiveElement) {
      this.previousActiveElement.focus();
      this.previousActiveElement = null;
    }
  }

  reset(): void {
    this.previousActiveElement = null;
  }
}

/**
 * Генерация уникального ID для ARIA связей
 */
let idCounter = 0;
export function generateAriaId(prefix: string = "vira"): string {
  return `${prefix}-${++idCounter}-${Date.now()}`;
}

