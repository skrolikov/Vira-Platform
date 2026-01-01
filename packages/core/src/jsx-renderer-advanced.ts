/**
 * ViraJS Advanced Renderer - Продвинутый рендерер с diff алгоритмом
 * 
 * Реализация для превращения в полноценный фреймворк
 */

import { Signal, effect } from "./signals";

export interface ViraNode {
  type: string | Function | Symbol;
  props: Record<string, any>;
  children: ViraNode[];
  key?: string | number;
  ref?: any;
  _dom?: HTMLElement | Text;
  _key?: string | number;
}

/**
 * Diff и патчинг DOM (упрощённая версия)
 */
export function patch(oldNode: ViraNode | null, newNode: ViraNode, container: HTMLElement | Text) {
  if (!oldNode) {
    // Первый рендер
    const dom = createDOM(newNode);
    newNode._dom = dom;
    if (container instanceof HTMLElement) {
      container.appendChild(dom);
    }
    return;
  }

  if (oldNode.type !== newNode.type) {
    // Разные типы - заменяем полностью
    const newDOM = createDOM(newNode);
    newNode._dom = newDOM;
    if (oldNode._dom && oldNode._dom.parentNode) {
      oldNode._dom.parentNode.replaceChild(newDOM, oldNode._dom);
    }
    return;
  }

  // Одинаковый тип - патчим пропсы и детей
  const dom = oldNode._dom as HTMLElement;
  newNode._dom = dom;

  // Патчим пропсы
  patchProps(dom, oldNode.props, newNode.props);

  // Патчим детей
  patchChildren(dom, oldNode.children, newNode.children);
}

/**
 * Создание DOM элемента из ViraNode
 */
function createDOM(node: ViraNode): HTMLElement | Text {
  if (typeof node.type === "string") {
    const element = document.createElement(node.type);

    // Применяем пропсы
    for (const [key, value] of Object.entries(node.props)) {
      if (key === "key" || key === "ref" || key === "children") continue;
      applyProp(element, key, value);
    }

    // Рендерим детей
    node.children.forEach(child => {
      const childDOM = createDOM(child);
      element.appendChild(childDOM);
    });

    return element;
  } else if (node.type === Symbol.for("TEXT")) {
    return document.createTextNode(node.props.nodeValue || "");
  } else if (typeof node.type === "function") {
    // Компонент
    const component = node.type as any;
    const childNode = component(node.props);
    return createDOM(childNode);
  }

  throw new Error(`Unknown node type: ${node.type}`);
}

/**
 * Применение пропса к элементу
 */
function applyProp(element: HTMLElement, key: string, value: any) {
  if (key === "className") {
    element.className = value;
  } else if (key.startsWith("on")) {
    const eventName = key.substring(2).toLowerCase();
    (element as any)[`_${key}`] = value; // Сохраняем для удаления
    element.addEventListener(eventName, value);
  } else if (key === "style" && typeof value === "object") {
    Object.assign(element.style, value);
  } else {
    (element as any)[key] = value;
  }
}

/**
 * Патчинг пропсов
 */
function patchProps(element: HTMLElement, oldProps: Record<string, any>, newProps: Record<string, any>) {
  // Удаляем старые пропсы
  for (const key in oldProps) {
    if (key === "key" || key === "ref" || key === "children") continue;
    if (!(key in newProps)) {
      removeProp(element, key, oldProps[key]);
    }
  }

  // Добавляем/обновляем новые пропсы
  for (const key in newProps) {
    if (key === "key" || key === "ref" || key === "children") continue;
    if (oldProps[key] !== newProps[key]) {
      applyProp(element, key, newProps[key]);
    }
  }
}

/**
 * Удаление пропса
 */
function removeProp(element: HTMLElement, key: string, value: any) {
  if (key.startsWith("on")) {
    const eventName = key.substring(2).toLowerCase();
    element.removeEventListener(eventName, (element as any)[`_${key}`]);
    delete (element as any)[`_${key}`];
  } else if (key === "className") {
    element.className = "";
  } else {
    delete (element as any)[key];
  }
}

/**
 * Патчинг детей (key-based diff)
 */
function patchChildren(
  parent: HTMLElement,
  oldChildren: ViraNode[],
  newChildren: ViraNode[]
) {
  // Создаём maps для быстрого поиска по key
  const oldKeyMap = new Map<string | number, { node: ViraNode; index: number }>();
  const newKeyMap = new Map<string | number, { node: ViraNode; index: number }>();

  oldChildren.forEach((child, index) => {
    if (child.key != null) {
      oldKeyMap.set(child.key, { node: child, index });
    }
  });

  newChildren.forEach((child, index) => {
    if (child.key != null) {
      newKeyMap.set(child.key, { node: child, index });
    }
  });

  const newChildrenDOM: (HTMLElement | Text)[] = [];
  let oldIndex = 0;
  let newIndex = 0;

  while (newIndex < newChildren.length) {
    const newChild = newChildren[newIndex];
    const newKey = newChild.key;

    if (newKey != null && oldKeyMap.has(newKey)) {
      // Нашли элемент с таким же key - патчим
      const oldEntry = oldKeyMap.get(newKey)!;
      const oldChild = oldEntry.node;

      if (oldChild._dom) {
        patch(oldChild, newChild, oldChild._dom);
        newChildrenDOM.push(oldChild._dom as HTMLElement | Text);
      }

      oldKeyMap.delete(newKey);
      oldIndex = oldEntry.index + 1;
      newIndex++;
    } else if (oldIndex < oldChildren.length) {
      // Нет key или не совпадает - обычный порядок
      const oldChild = oldChildren[oldIndex];

      if (oldChild.key != null && !newKeyMap.has(oldChild.key)) {
        // Старый элемент удалён
        if (oldChild._dom) {
          parent.removeChild(oldChild._dom);
        }
        oldIndex++;
      } else {
        // Патчим по порядку
        if (oldChild._dom) {
          patch(oldChild, newChild, oldChild._dom);
          newChildrenDOM.push(oldChild._dom as HTMLElement | Text);
        }
        oldIndex++;
        newIndex++;
      }
    } else {
      // Новый элемент
      const newDOM = createDOM(newChild);
      newChild._dom = newDOM;
      newChildrenDOM.push(newDOM);
      newIndex++;
    }
  }

  // Удаляем оставшиеся старые элементы
  while (oldIndex < oldChildren.length) {
    const oldChild = oldChildren[oldIndex];
    if (oldChild._dom) {
      parent.removeChild(oldChild._dom);
    }
    oldIndex++;
  }

  // Удаляем элементы без key из oldKeyMap (они были удалены)
  for (const { node } of oldKeyMap.values()) {
    if (node._dom) {
      parent.removeChild(node._dom);
    }
  }

  // Переупорядочиваем DOM элементы
  newChildrenDOM.forEach((dom, index) => {
    const currentChild = parent.childNodes[index];
    if (currentChild !== dom) {
      parent.insertBefore(dom, currentChild || null);
    }
  });
}

/**
 * Реактивный рендерер - автоматически обновляет DOM при изменении signals
 */
export function reactiveRender(
  renderFn: () => ViraNode,
  container: HTMLElement
) {
  let currentNode: ViraNode | null = null;

  const update = () => {
    const newNode = renderFn();
    patch(currentNode, newNode, container);
    currentNode = newNode;
  };

  // Первый рендер
  update();

  // Возвращаем функцию обновления (можно интегрировать с signals)
  return update;
}

/**
 * Интеграция с signals для автоматических обновлений
 */
export function renderWithSignals(
  renderFn: () => ViraNode,
  container: HTMLElement,
  signals: Signal<any>[]
) {
  const update = reactiveRender(renderFn, container);

  // Подписываемся на все signals через effect
  effect(() => {
    // Читаем все signals (это создаст подписки)
    signals.forEach(signal => signal());
    
    // Обновляем DOM при любом изменении
    update();
  });

  return update;
}

