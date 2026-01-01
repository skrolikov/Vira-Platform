/**
 * Vira SSR - Лёгкий Server-Side Rendering
 * 
 * Совместимо с:
 * - Cloudflare Workers
 * - Bun
 * - Deno
 * - Node.js
 */

import { ViraNode, createElement } from "./jsx-renderer";

/**
 * Рендеринг ViraNode в строку (SSR)
 * 
 * @example
 * const html = renderToString(
 *   createElement("div", { className: "app" }, "Hello")
 * );
 */
export function renderToString(node: ViraNode): string {
  if (typeof node.type === "string") {
    const tag = node.type;
    const props = node.props;
    const children = node.children;

    // Собираем атрибуты
    const attrs: string[] = [];
    for (const [key, value] of Object.entries(props)) {
      if (key === "key" || key === "ref" || key === "children") continue;
      
      if (key === "className") {
        attrs.push(`class="${escapeHtml(String(value))}"`);
      } else if (key.startsWith("on")) {
        // События не рендерятся в SSR
        continue;
      } else if (typeof value === "boolean") {
        if (value) {
          attrs.push(key);
        }
      } else {
        attrs.push(`${key}="${escapeHtml(String(value))}"`);
      }
    }

    const attrsStr = attrs.length > 0 ? ` ${attrs.join(" ")}` : "";
    const childrenStr = children.map(child => renderToString(child)).join("");

    // Self-closing tags
    const selfClosingTags = new Set([
      "area", "base", "br", "col", "embed", "hr", "img", "input",
      "link", "meta", "param", "source", "track", "wbr"
    ]);

    if (selfClosingTags.has(tag.toLowerCase())) {
      return `<${tag}${attrsStr} />`;
    }

    return `<${tag}${attrsStr}>${childrenStr}</${tag}>`;
  } else if (node.type === Symbol.for("TEXT")) {
    return escapeHtml(node.props.nodeValue || "");
  } else if (typeof node.type === "function") {
    // Компонент - рекурсивный рендер
    const component = node.type as any;
    const childNode = component(node.props);
    return renderToString(childNode);
  }

  return "";
}

/**
 * Экранирование HTML
 */
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

/**
 * Hydrate существующего DOM
 * 
 * @example
 * hydrate(
 *   createElement("div", { className: "app" }, "Hello"),
 *   document.getElementById("root")
 * );
 */
export function hydrate(node: ViraNode, container: HTMLElement) {
  // Связываем ViraNode с существующими DOM элементами
  // Не пересоздаём DOM, а только связываем ноды

  if (typeof node.type === "string") {
    const element = container.firstElementChild as HTMLElement;
    if (element && element.tagName.toLowerCase() === node.type) {
      node._dom = element;

      // Связываем детей
      let childIndex = 0;
      for (const child of node.children) {
        const childElement = element.childNodes[childIndex] as HTMLElement | Text;
        if (childElement) {
          hydrate(child, childElement as any);
        }
        childIndex++;
      }
    }
  } else if (node.type === Symbol.for("TEXT")) {
    const textNode = container.firstChild as Text;
    if (textNode && textNode.nodeType === Node.TEXT_NODE) {
      node._dom = textNode;
    }
  } else if (typeof node.type === "function") {
    const component = node.type as any;
    const childNode = component(node.props);
    hydrate(childNode, container);
  }
}

/**
 * Создание SSR приложения
 * 
 * @example
 * import { createSSRApp } from "@vira-ui/core";
 * 
 * const app = createSSRApp(() => createElement(App));
 * const html = app.renderToString();
 */
export function createSSRApp(
  renderFn: () => ViraNode
): {
  renderToString: () => string;
  hydrate: (container: HTMLElement) => void;
} {
  return {
    renderToString: () => {
      const node = renderFn();
      return renderToString(node);
    },
    hydrate: (container: HTMLElement) => {
      const node = renderFn();
      hydrate(node, container);
    },
  };
}

