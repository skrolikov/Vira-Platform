/**
 * Vira Micro-Optimizations
 * 
 * - Static Hoisting
 * - shouldDiff проверка
 * - children caching
 * - keyed reordering по O(n) алгоритму
 */

import { ViraNode } from "./jsx-renderer-advanced";

/**
 * Статический hoisting - поднимает статические узлы
 */
export function hoistStatic(nodes: ViraNode[]): {
  static: ViraNode[];
  dynamic: ViraNode[];
} {
  const staticNodes: ViraNode[] = [];
  const dynamicNodes: ViraNode[] = [];

  for (const node of nodes) {
    if (isStaticNode(node)) {
      staticNodes.push(node);
    } else {
      dynamicNodes.push(node);
    }
  }

  return { static: staticNodes, dynamic: dynamicNodes };
}

/**
 * Проверка, является ли узел статическим
 */
function isStaticNode(node: ViraNode): boolean {
  // Если явно помечен как статический
  if ((node as any).__isStatic) {
    return true;
  }

  // Если это текст
  if (node.type === Symbol.for("TEXT")) {
    return true;
  }

  // Если это строка и нет динамических пропсов
  if (typeof node.type === "string") {
    // Проверяем пропсы на наличие функций/сигналов
    for (const value of Object.values(node.props)) {
      if (typeof value === "function" || (value && typeof value === "object" && "__reactive__" in value)) {
        return false;
      }
    }

    // Проверяем детей
    return node.children.every(child => isStaticNode(child));
  }

  // Компоненты всегда динамические
  return false;
}

/**
 * Пометить узел как статический
 */
export function markStatic(node: ViraNode): ViraNode {
  (node as any).__isStatic = true;
  return node;
}

/**
 * shouldDiff - проверка, нужно ли делать diff
 */
export function shouldDiff(oldNode: ViraNode, newNode: ViraNode): boolean {
  // Если новый узел статический - не делаем diff
  if ((newNode as any).__isStatic) {
    return false;
  }

  // Если типы разные - нужен diff
  if (oldNode.type !== newNode.type) {
    return true;
  }

  // Если ключи разные - нужен diff
  if (oldNode.key !== newNode.key) {
    return true;
  }

  // Проверяем пропсы
  const oldProps = oldNode.props;
  const newProps = newNode.props;

  const oldKeys = Object.keys(oldProps);
  const newKeys = Object.keys(newProps);

  if (oldKeys.length !== newKeys.length) {
    return true;
  }

  for (const key of oldKeys) {
    if (key === "key" || key === "ref" || key === "children") continue;
    
    if (oldProps[key] !== newProps[key]) {
      return true;
    }
  }

  // Проверяем количество детей
  if (oldNode.children.length !== newNode.children.length) {
    return true;
  }

  return false;
}

/**
 * Кеширование детей для оптимизации
 */
const childrenCache = new WeakMap<ViraNode, ViraNode[]>();

export function getCachedChildren(node: ViraNode): ViraNode[] {
  if (childrenCache.has(node)) {
    return childrenCache.get(node)!;
  }

  const children = node.children;
  childrenCache.set(node, children);
  return children;
}

/**
 * Keyed reordering - O(n) алгоритм для переупорядочивания детей
 * 
 * Основан на алгоритме из Vue 3
 */
export function keyedReorder(
  oldChildren: ViraNode[],
  newChildren: ViraNode[],
  parent: HTMLElement
): void {
  let oldStartIdx = 0;
  let newStartIdx = 0;
  let oldEndIdx = oldChildren.length - 1;
  let newEndIdx = newChildren.length - 1;
  let oldStartNode = oldChildren[oldStartIdx];
  let oldEndNode = oldChildren[oldEndIdx];
  let newStartNode = newChildren[newStartIdx];
  let newEndNode = newChildren[newEndIdx];

  // Map для быстрого поиска по key
  const keyToOldIndexMap = new Map<string | number, number>();
  for (let i = oldStartIdx; i <= oldEndIdx; i++) {
    const key = oldChildren[i].key;
    if (key != null) {
      keyToOldIndexMap.set(key, i);
    }
  }

  while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
    if (!oldStartNode) {
      oldStartNode = oldChildren[++oldStartIdx];
    } else if (!oldEndNode) {
      oldEndNode = oldChildren[--oldEndIdx];
    } else if (!newStartNode) {
      newStartNode = newChildren[++newStartIdx];
    } else if (!newEndNode) {
      newEndNode = newChildren[--newEndIdx];
    } else if (oldStartNode.key === newStartNode.key) {
      // Начало совпадает
      oldStartNode = oldChildren[++oldStartIdx];
      newStartNode = newChildren[++newStartIdx];
    } else if (oldEndNode.key === newEndNode.key) {
      // Конец совпадает
      oldEndNode = oldChildren[--oldEndIdx];
      newEndNode = newChildren[--newEndIdx];
    } else if (oldStartNode.key === newEndNode.key) {
      // Старый начало = новый конец (перемещение)
      parent.insertBefore(oldStartNode._dom!, oldEndNode._dom!.nextSibling);
      oldStartNode = oldChildren[++oldStartIdx];
      newEndNode = newChildren[--newEndIdx];
    } else if (oldEndNode.key === newStartNode.key) {
      // Старый конец = новый начало (перемещение)
      parent.insertBefore(oldEndNode._dom!, oldStartNode._dom!);
      oldEndNode = oldChildren[--oldEndIdx];
      newStartNode = newChildren[++newStartIdx];
    } else {
      // Ищем в map
      const newKey = newStartNode.key;
      const oldIndex = newKey != null ? keyToOldIndexMap.get(newKey) : undefined;

      if (oldIndex === undefined) {
        // Новый элемент
        const newDOM = createDOMNode(newStartNode);
        parent.insertBefore(newDOM, oldStartNode._dom!);
        newStartNode = newChildren[++newStartIdx];
      } else {
        // Существующий элемент - перемещаем
        const nodeToMove = oldChildren[oldIndex];
        parent.insertBefore(nodeToMove._dom!, oldStartNode._dom!);
        oldChildren[oldIndex] = undefined as any;
        newStartNode = newChildren[++newStartIdx];
      }
    }
  }

  // Удаляем оставшиеся старые элементы
  if (oldStartIdx <= oldEndIdx) {
    for (let i = oldStartIdx; i <= oldEndIdx; i++) {
      if (oldChildren[i]?._dom) {
        parent.removeChild(oldChildren[i]._dom!);
      }
    }
  }

  // Добавляем оставшиеся новые элементы
  if (newStartIdx <= newEndIdx) {
    const beforeNode = newChildren[newEndIdx + 1]?._dom || null;
    for (let i = newStartIdx; i <= newEndIdx; i++) {
      const newDOM = createDOMNode(newChildren[i]);
      parent.insertBefore(newDOM, beforeNode);
    }
  }
}

/**
 * Создание DOM узла (упрощённая версия)
 */
function createDOMNode(node: ViraNode): HTMLElement | Text {
  if (typeof node.type === "string") {
    const element = document.createElement(node.type);
    node._dom = element;
    return element;
  } else if (node.type === Symbol.for("TEXT")) {
    const textNode = document.createTextNode(node.props.nodeValue || "");
    node._dom = textNode;
    return textNode;
  }
  throw new Error("Cannot create DOM node");
}

