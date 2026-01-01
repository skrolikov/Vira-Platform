/**
 * Vira Components 2.0 - Локальные обновления компонентов
 * 
 * Каждый компонент знает свои signals и обновляет ТОЛЬКО себя
 * Ultra local reactivity - никаких re-render App()
 * 
 * Как Solid, но более гибко
 */

import type { Signal } from "./signals";
import { effect } from "./signals";
import { ViraNode, patch } from "./jsx-renderer-advanced";

export interface ViraComponent {
  (props: Record<string, any>): ViraNode;
  __update?: () => void;
  __vnode?: ViraNode;
  __dom?: HTMLElement | Text;
  __signals?: Set<Signal<any>>;
  __isStatic?: boolean;
}

/**
 * Создание компонента с локальными обновлениями
 * 
 * @example
 * const Counter = createComponent((props) => {
 *   const [count, setCount] = signal(0);
 *   return createElement("div", null, count());
 * });
 * 
 * // Компонент обновляется только при изменении count
 * // App() не перерендеривается
 */
export function createComponent(
  componentFn: (props: Record<string, any>) => ViraNode
): ViraComponent {
  const component = componentFn as ViraComponent;
  let currentVNode: ViraNode | null = null;
  let currentProps: Record<string, any> = {};
  let isMounted = false;
  const componentSignals = new Set<Signal<any>>();

  // Функция обновления компонента
  component.__update = () => {
    if (!isMounted || !currentVNode?._dom) return;

    // Создаём новый VNode с текущими пропсами
    const newVNode = componentFn(currentProps);

    // Патчим только локальный subtree
    if (currentVNode._dom) {
      patch(currentVNode, newVNode, currentVNode._dom);
    }

    currentVNode = newVNode;
    component.__vnode = newVNode;
  };

  // Обёртка компонента для отслеживания signals
  const wrappedComponent: ViraComponent = (props: Record<string, any>) => {
    currentProps = props;

    // Рендерим компонент в effect для отслеживания signals
    // effect автоматически отслеживает все используемые signals
    let vnode: ViraNode;
    
    effect(() => {
      // При первом рендере или изменении signals
      if (!isMounted) {
        // Первый рендер
        vnode = componentFn(props);
        currentVNode = vnode;
        component.__vnode = vnode;
      } else {
        // Обновление - патчим существующий VNode
        if (currentVNode?._dom) {
          const newVNode = componentFn(props);
          patch(currentVNode, newVNode, currentVNode._dom);
          currentVNode = newVNode;
          component.__vnode = newVNode;
        }
      }
    });

    return vnode!;
  };

  wrappedComponent.__update = component.__update;
  wrappedComponent.__signals = componentSignals;

  return wrappedComponent;
}

/**
 * Монтирование компонента с автоматическими подписками
 */
export function mountComponent(
  component: ViraComponent,
  props: Record<string, any>,
  container: HTMLElement
) {
  const vnode = component(props);
  
  if (vnode._dom) {
    container.appendChild(vnode._dom);
  }

  // Подписываемся на signals после монтирования
  if (component.__signals) {
    component.__signals.forEach(signal => {
      effect(() => {
        signal(); // Читаем signal
        component.__update?.(); // Обновляем только этот компонент
      });
    });
  }

  (component as any).__isMounted = true;
}

/**
 * Статический компонент (не обновляется)
 */
export function createStaticComponent(
  componentFn: (props: Record<string, any>) => ViraNode
): ViraComponent {
  const component = createComponent(componentFn);
  component.__isStatic = true;
  return component;
}

/**
 * Хелпер для проверки, нужно ли обновлять компонент
 */
export function shouldUpdateComponent(
  oldProps: Record<string, any>,
  newProps: Record<string, any>
): boolean {
  // Простое сравнение пропсов
  const oldKeys = Object.keys(oldProps);
  const newKeys = Object.keys(newProps);

  if (oldKeys.length !== newKeys.length) return true;

  for (const key of oldKeys) {
    if (oldProps[key] !== newProps[key]) {
      return true;
    }
  }

  return false;
}

