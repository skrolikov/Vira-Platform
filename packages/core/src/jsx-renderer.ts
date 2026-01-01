/**
 * ViraJS JSX Renderer - Собственный рендерер для максимальной производительности
 * 
 * Это следующий шаг - превращение в полноценный фреймворк
 * 
 * Пока что концепция и базовый интерфейс
 * Полная реализация требует компилятор/трансформер
 */

/**
 * ViraJS Virtual DOM Node
 */
export interface ViraNode {
  type: string | Function | Symbol;
  props: Record<string, any>;
  children: ViraNode[];
  key?: string | number;
  ref?: any;
  _dom?: HTMLElement | Text;
}

/**
 * Создание ViraNode из JSX
 */
export function createElement(
  type: string | Function,
  props: Record<string, any> | null,
  ...children: any[]
): ViraNode {
  const normalizedChildren: ViraNode[] = children
    .flat()
    .filter(child => child != null && child !== false)
    .map(child => {
      if (typeof child === "object" && "type" in child) {
        return child as ViraNode;
      }
      return {
        type: Symbol.for("TEXT"),
        props: { nodeValue: String(child) },
        children: [],
      } as ViraNode;
    });

  return {
    type,
    props: props || {},
    children: normalizedChildren,
    key: props?.key,
    ref: props?.ref,
  };
}

/**
 * Рендеринг ViraNode в DOM
 * 
 * @example
 * const node = createElement("div", { className: "app" }, "Hello");
 * render(node, document.getElementById("root"));
 */
export function render(node: ViraNode, container: HTMLElement) {
  // Базовая реализация рендеринга
  // Полная версия будет включать:
  // - Diff алгоритм
  // - Реактивные обновления
  // - Event delegation
  // - Refs handling
  
  if (typeof node.type === "string") {
    const element = document.createElement(node.type);
    
    // Применяем пропсы
    for (const [key, value] of Object.entries(node.props)) {
      if (key === "key" || key === "ref" || key === "children") continue;
      
      if (key === "className") {
        element.className = value;
      } else if (key.startsWith("on")) {
        const eventName = key.substring(2).toLowerCase();
        element.addEventListener(eventName, value);
      } else {
        (element as any)[key] = value;
      }
    }
    
    // Рендерим детей
    node.children.forEach(child => {
      render(child, element);
    });
    
    // Сохраняем ссылку на DOM элемент
    node._dom = element;
    
    container.appendChild(element);
  } else if (node.type === Symbol.for("TEXT")) {
    const textNode = document.createTextNode(node.props.nodeValue);
    node._dom = textNode;
    container.appendChild(textNode);
  } else if (typeof node.type === "function") {
    // Компонент - рекурсивный рендер
    const component = node.type as any;
    const childNode = component(node.props);
    render(childNode, container);
  }
}

/**
 * Hydrate существующего DOM
 */
export function hydrate(node: ViraNode, container: HTMLElement) {
  // SSR hydration
  // Сравниваем существующий DOM с Virtual DOM
  // Применяем только изменения
}

/**
 * Концепция: ViraJS Framework
 * 
 * 1. Собственный JSX трансформер (Babel plugin)
 * 2. Компиляция в оптимизированный код
 * 3. Минимальный runtime
 * 4. Реактивность на уровне компиляции
 * 5. Tree-shaking по умолчанию
 * 
 * @example
 * // До компиляции:
 * function Counter() {
 *   const [count, setCount] = signal(0);
 *   return <button onClick={() => setCount(count() + 1)}>{count()}</button>;
 * }
 * 
 * // После компиляции (концепция):
 * function Counter() {
 *   const [count, setCount] = signal(0);
 *   return h("button", { onClick: () => setCount(count() + 1) }, count());
 * }
 * 
 * // Или ещё лучше - прямые DOM обновления:
 * function Counter() {
 *   const [count, setCount] = signal(0);
 *   const button = document.createElement("button");
 *   button.onclick = () => setCount(count() + 1);
 *   effect(() => { button.textContent = count(); });
 *   return button;
 * }
 */

