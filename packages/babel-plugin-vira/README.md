# @vira-ui/babel-plugin

Babel плагин для трансформации JSX в вызовы `createElement` от Vira Framework.

## 📦 Установка

```bash
npm install --save-dev @vira-ui/babel-plugin @babel/core
```

**Требования:**
- `@babel/core` ^7.0.0

## 🎯 Что это?

Плагин трансформирует JSX синтаксис в вызовы `createElement` из `@vira-ui/core`, что позволяет использовать декларативный синтаксис JSX с Vira Framework.

## 🚀 Использование

### Babel конфигурация

#### `.babelrc` / `babel.config.js`

```json
{
  "plugins": [
    ["@vira-ui/babel-plugin", {
      "pragma": "createElement",
      "pragmaFrag": "Fragment"
    }]
  ]
}
```

#### Vite

```ts
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [
          ['@vira-ui/babel-plugin', {
            pragma: 'createElement',
            pragmaFrag: 'Fragment'
          }]
        ]
      }
    })
  ]
});
```

#### Webpack

```js
// webpack.config.js
module.exports = {
  module: {
    rules: [
      {
        test: /\.(js|jsx|ts|tsx)$/,
        use: {
          loader: 'babel-loader',
          options: {
            plugins: [
              ['@vira-ui/babel-plugin', {
                pragma: 'createElement',
                pragmaFrag: 'Fragment'
              }]
            ]
          }
        }
      }
    ]
  }
};
```

## ⚙️ Опции

### `pragma`

Имя функции для создания элементов. По умолчанию: `"createElement"`.

```json
{
  "plugins": [
    ["@vira-ui/babel-plugin", {
      "pragma": "h"  // Использовать h() вместо createElement()
    }]
  ]
}
```

### `pragmaFrag`

Имя функции для Fragment. По умолчанию: `"Fragment"`.

```json
{
  "plugins": [
    ["@vira-ui/babel-plugin", {
      "pragmaFrag": "Fragment"  // Использовать Fragment() для <>
    }]
  ]
}
```

### `useBuiltIns`

Использовать встроенные функции вместо импорта. По умолчанию: `false`.

### `development`

Режим разработки (добавляет дополнительную информацию). По умолчанию: `false`.

## 📝 Примеры трансформации

### Простой элемент

**До:**
```tsx
<div className="container">
  <h1>Hello</h1>
</div>
```

**После:**
```ts
createElement('div', { className: 'container' },
  createElement('h1', {}, 'Hello')
)
```

### Компонент

**До:**
```tsx
<Button onClick={handleClick} disabled={isDisabled}>
  Click me
</Button>
```

**После:**
```ts
createElement(Button, {
  onClick: handleClick,
  disabled: isDisabled
}, 'Click me')
```

### Fragment

**До:**
```tsx
<>
  <div>Item 1</div>
  <div>Item 2</div>
</>
```

**После:**
```ts
Fragment({},
  createElement('div', {}, 'Item 1'),
  createElement('div', {}, 'Item 2')
)
```

### Выражения

**До:**
```tsx
<div>
  {count > 0 && <span>{count}</span>}
  {items.map(item => <Item key={item.id} {...item} />)}
</div>
```

**После:**
```ts
createElement('div', {},
  count > 0 && createElement('span', {}, count),
  items.map(item => createElement(Item, { key: item.id, ...item }))
)
```

## 🔧 Автоматический импорт

Плагин автоматически добавляет импорт `createElement` из `@vira-ui/core`, если его нет:

```ts
// Автоматически добавляется
import { createElement } from '@vira-ui/core';
```

## 🎨 Интеграция с Vira Framework

### Использование с defineComponent

```tsx
import { defineComponent } from '@vira-ui/core';

const MyComponent = defineComponent({
  props: { name: String },
  render: ({ name }) => (
    <div>
      <h1>Hello {name}</h1>
    </div>
  )
});
```

Трансформируется в:

```ts
const MyComponent = defineComponent({
  props: { name: String },
  render: ({ name }) => createElement('div', {},
    createElement('h1', {}, 'Hello ', name)
  )
});
```

### Использование с компонентами UI

```tsx
import { Button, Input } from '@vira-ui/ui';

function MyForm() {
  return (
    <form>
      <Input placeholder="Name" />
      <Button preset="primary">Submit</Button>
    </form>
  );
}
```

## 🚀 Оптимизации

Плагин выполняет следующие оптимизации:

1. **Статические элементы** — простые элементы остаются простыми
2. **Удаление пустых текстовых узлов** — пробелы и переносы строк удаляются
3. **Оптимизация props** — пустые объекты не создаются

## 🔍 Отладка

Для отладки трансформации используйте Babel REPL:

1. Откройте [Babel REPL](https://babeljs.io/repl)
2. Добавьте плагин `@vira-ui/babel-plugin`
3. Введите ваш JSX код
4. Посмотрите результат трансформации

## 📖 Примеры конфигурации

### TypeScript + Vite

```ts
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [
          ['@vira-ui/babel-plugin', {
            pragma: 'createElement',
            pragmaFrag: 'Fragment'
          }]
        ]
      }
    })
  ]
});
```

### Next.js

```js
// next.config.js
module.exports = {
  webpack: (config) => {
    config.module.rules.push({
      test: /\.(js|jsx|ts|tsx)$/,
      use: {
        loader: 'babel-loader',
        options: {
          plugins: [
            ['@vira-ui/babel-plugin', {
              pragma: 'createElement',
              pragmaFrag: 'Fragment'
            }]
          ]
        }
      }
    });
    return config;
  }
};
```

## 🐛 Troubleshooting

### Импорт не добавляется

Если импорт `createElement` не добавляется автоматически:

1. Убедитесь, что плагин правильно настроен
2. Проверьте порядок плагинов (должен быть последним)
3. Добавьте импорт вручную:

```ts
import { createElement } from '@vira-ui/core';
```

### Конфликты с другими плагинами

Если есть конфликты с другими Babel плагинами:

1. Измените порядок плагинов
2. Используйте `@babel/plugin-transform-react-jsx` вместо стандартного React плагина
3. Настройте опции для избежания конфликтов

## 📄 License

MIT

## 🔗 Связанные пакеты

- [`@vira-ui/core`](../core/README.md) - Базовый фреймворк с `createElement`
- [`@vira-ui/ui`](../ui/README.md) - UI компоненты

