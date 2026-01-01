/**
 * Babel Plugin for ViraJS
 * 
 * Трансформирует JSX в вызовы createElement от Vira
 * Оптимизирует код для лучшей производительности
 */

import type { PluginObj } from "@babel/core";
import type * as t from "@babel/types";

interface PluginOptions {
  pragma?: string;
  pragmaFrag?: string;
  useBuiltIns?: boolean;
  development?: boolean;
}

/**
 * ViraJS Babel Plugin
 * 
 * @example
 * // .babelrc
 * {
 *   "plugins": [["@vira-ui/babel-plugin", {
 *     "pragma": "createElement"
 *   }]]
 * }
 */
export default function viraPlugin(
  { types: t }: { types: typeof import("@babel/types") },
  options: PluginOptions = {}
): PluginObj {
  const {
    pragma = "createElement",
    pragmaFrag = "Fragment",
    useBuiltIns = false,
    development = false,
  } = options;

  /**
   * Проверка, является ли узел JSX элементом
   */
  function isJSXElement(node: t.Node): node is t.JSXElement {
    return t.isJSXElement(node);
  }

  /**
   * Преобразование JSX атрибута в объектное свойство
   */
  function transformJSXAttribute(
    attr: t.JSXAttribute | t.JSXSpreadAttribute
  ): t.ObjectProperty | t.SpreadElement {
    if (t.isJSXSpreadAttribute(attr)) {
      return t.spreadElement(attr.argument);
    }

    // Получаем имя атрибута (может быть JSXIdentifier или JSXNamespacedName)
    let name: string;
    if (t.isJSXIdentifier(attr.name)) {
      name = attr.name.name;
    } else {
      // Для JSXNamespacedName используем полное имя
      name = `${attr.name.namespace.name}.${attr.name.name.name}`;
    }

    const key = t.stringLiteral(name);

    let value: t.Expression;
    if (!attr.value) {
      // Boolean атрибут
      value = t.booleanLiteral(true);
    } else if (t.isJSXExpressionContainer(attr.value)) {
      // Выражение {expr}
      value = attr.value.expression as t.Expression;
    } else {
      // Строковое значение
      value = attr.value as t.StringLiteral;
    }

    return t.objectProperty(key, value);
  }

  /**
   * Преобразование JSX элемента в вызов createElement
   */
  function transformJSXElement(element: t.JSXElement): t.CallExpression {
    const tag = element.openingElement.name;
    let tagName: t.Expression;

    if (t.isJSXIdentifier(tag)) {
      if (tag.name[0] === tag.name[0].toUpperCase()) {
        // Компонент
        tagName = t.identifier(tag.name);
      } else {
        // HTML элемент
        tagName = t.stringLiteral(tag.name);
      }
    } else if (t.isJSXMemberExpression(tag)) {
      // Member expression: Component.SubComponent
      tagName = transformJSXMemberExpression(tag);
    } else {
      // Namespaced name или другой тип
      tagName = t.stringLiteral("div");
    }

    // Собираем пропсы
    const props: (t.ObjectProperty | t.SpreadElement)[] = [];

    // Преобразуем атрибуты
    for (const attr of element.openingElement.attributes) {
      props.push(transformJSXAttribute(attr));
    }

    // Добавляем children
    const children: t.Expression[] = [];
    for (const child of element.children) {
      if (t.isJSXText(child)) {
        // Текстовый узел
        const text = child.value.trim();
        if (text) {
          children.push(t.stringLiteral(text));
        }
      } else if (t.isJSXExpressionContainer(child)) {
        // Выражение {expr}
        children.push(child.expression as t.Expression);
      } else if (t.isJSXElement(child)) {
        // Вложенный элемент
        children.push(transformJSXElement(child));
      } else if (t.isJSXFragment(child)) {
        // Fragment - разворачиваем детей
        for (const fragmentChild of child.children) {
          if (t.isJSXText(fragmentChild)) {
            const text = fragmentChild.value.trim();
            if (text) {
              children.push(t.stringLiteral(text));
            }
          } else if (t.isJSXExpressionContainer(fragmentChild)) {
            children.push(fragmentChild.expression as t.Expression);
          } else if (t.isJSXElement(fragmentChild)) {
            children.push(transformJSXElement(fragmentChild));
          }
        }
      }
    }

    // Создаём объект пропсов
    let propsObject: t.ObjectExpression;
    if (children.length === 0) {
      propsObject = t.objectExpression(props);
    } else {
      // Добавляем children в props
      props.push(
        t.objectProperty(t.identifier("children"), t.arrayExpression(children))
      );
      propsObject = t.objectExpression(props);
    }

    // Вызов createElement(tag, props, ...children)
    // Но Vira использует createElement(tag, props, ...children) формат
    return t.callExpression(t.identifier(pragma), [tagName, propsObject, ...children]);
  }

  /**
   * Преобразование JSX Member Expression
   */
  function transformJSXMemberExpression(
    expr: t.JSXMemberExpression
  ): t.MemberExpression {
    const object = t.isJSXIdentifier(expr.object)
      ? t.identifier(expr.object.name)
      : transformJSXMemberExpression(expr.object as t.JSXMemberExpression);
    const property = t.identifier(expr.property.name);
    return t.memberExpression(object, property);
  }

  return {
    name: "@vira-ui/babel-plugin",
    visitor: {
      JSXElement(path) {
        if (!isJSXElement(path.node)) return;

        const callExpression = transformJSXElement(path.node);
        path.replaceWith(callExpression);
      },
      JSXFragment(path) {
        // Fragment превращаем в вызов Fragment(...children)
        const children: t.Expression[] = [];

        for (const child of path.node.children) {
          if (t.isJSXText(child)) {
            const text = child.value.trim();
            if (text) {
              children.push(t.stringLiteral(text));
            }
          } else if (t.isJSXExpressionContainer(child)) {
            children.push(child.expression as t.Expression);
          } else if (t.isJSXElement(child)) {
            children.push(transformJSXElement(child));
          }
        }

        const fragmentCall = t.callExpression(t.identifier(pragmaFrag), [
          t.objectExpression([]),
          ...children,
        ]);

        path.replaceWith(fragmentCall);
      },
      Program: {
        exit(path) {
          // Добавляем импорт createElement, если его нет
          const hasImport = path.node.body.some(
            (node) =>
              t.isImportDeclaration(node) &&
              node.specifiers.some(
                (spec) =>
                  t.isImportSpecifier(spec) &&
                  t.isIdentifier(spec.imported) &&
                  spec.imported.name === pragma
              )
          );

          if (!hasImport) {
            const importDeclaration = t.importDeclaration(
              [
                t.importSpecifier(
                  t.identifier(pragma),
                  t.identifier(pragma)
                ),
              ],
              t.stringLiteral("@vira-ui/core")
            );

            path.node.body.unshift(importDeclaration);
          }
        },
      },
    },
  };
}

