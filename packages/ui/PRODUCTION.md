# Production Optimizations

Руководство по оптимизации Vira UI для продакшена.

## 1. Hash-функция

Для больших проектов рекомендуется использовать более продвинутую hash-функцию:

```typescript
import { setHashFunction, fnv1aHash } from "@vira-ui/ui";

// В начале приложения (до использования компонентов)
if (process.env.NODE_ENV === "production") {
  setHashFunction(fnv1aHash); // Лучшая дистрибуция, меньше коллизий
}
```

**Доступные функции:**
- `simpleHash` - по умолчанию, быстрая для небольших проектов
- `fnv1aHash` - FNV-1a алгоритм, лучше для больших проектов

## 2. Build-time CSS Extraction

В продакшене CSS должен генерироваться на билд-тайме, а не в runtime.

### Вариант A: Извлечение всех designs

```typescript
// build-scripts/extract-css.ts
import { extractCSS } from "@vira-ui/ui";
import { allDesigns } from "./your-designs";

// Собираем все designs из вашего приложения
const allDesigns = [
  { bg: "color.primary", padding: 3 },
  { color: "color.text.primary", fontSize: "md" },
  // ... все ваши designs
];

// Извлекаем CSS
const css = extractCSS(allDesigns);

// Сохраняем в файл
fs.writeFileSync("dist/vira-styles.css", css);
```

Затем в HTML:
```html
<link rel="stylesheet" href="/vira-styles.css" />
```

### Вариант B: SSR извлечение

```typescript
// server.tsx (Next.js, Remix, etc.)
import { getAllRegisteredCSS } from "@vira-ui/ui";

function renderApp() {
  // Рендерим приложение
  const html = renderToString(<App />);
  
  // Извлекаем сгенерированный CSS
  const css = getAllRegisteredCSS();
  
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style id="vira-runtime">${css}</style>
      </head>
      <body>${html}</body>
    </html>
  `;
}
```

## 3. Environment Variables

Используйте переменные окружения для контроля режима:

```bash
# .env.production
VIRA_DEV=false
NODE_ENV=production

# .env.development
VIRA_DEV=true
NODE_ENV=development
```

**Что происходит:**
- `VIRA_DEV=false` - отключает:
  - MutationObserver для runtime стилей
  - data-design атрибуты в DOM
  - Runtime CSS injection
  
- `VIRA_DEV=true` (dev режим):
  - Включает все dev tools
  - Добавляет data-design для отладки
  - Автоматически генерирует CSS из data-design

## 4. Полный пример для продакшена

```typescript
// app.tsx
import { ViraProvider } from "@vira-ui/ui";
import { setHashFunction, fnv1aHash } from "@vira-ui/ui";

// Настройка hash-функции
if (process.env.NODE_ENV === "production") {
  setHashFunction(fnv1aHash);
}

function App() {
  return (
    <ViraProvider hideDataDesign={true}>
      {/* Ваше приложение */}
    </ViraProvider>
  );
}
```

```typescript
// build.ts
import { extractCSS } from "@vira-ui/ui";
import { collectAllDesigns } from "./design-collector";

async function build() {
  // Собираем все designs из кода
  const designs = await collectAllDesigns();
  
  // Извлекаем CSS
  const css = extractCSS(designs);
  
  // Минифицируем (опционально)
  const minifiedCSS = minify(css);
  
  // Сохраняем
  fs.writeFileSync("dist/vira.css", minifiedCSS);
}
```

```html
<!-- index.html -->
<!DOCTYPE html>
<html>
  <head>
    <!-- Pre-built CSS -->
    <link rel="stylesheet" href="/vira.css" />
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>
```

## 5. Tree-shaking

Vira UI поддерживает tree-shaking. Убедитесь, что ваш bundler настроен правильно:

```javascript
// vite.config.js
export default {
  build: {
    rollupOptions: {
      output: {
        // Включает tree-shaking
        manualChunks: undefined,
      },
    },
  },
};
```

```javascript
// webpack.config.js
module.exports = {
  optimization: {
    usedExports: true,
    sideEffects: false,
  },
};
```

## 6. Итоговый чеклист

- [ ] Установить `fnv1aHash` для production
- [ ] Извлечь CSS на билд-тайме через `extractCSS()`
- [ ] Установить `VIRA_DEV=false` в production
- [ ] Включить `hideDataDesign={true}` в ViraProvider
- [ ] Минифицировать извлечённый CSS
- [ ] Убедиться, что CSS подключён статически в HTML
- [ ] Проверить, что MutationObserver не работает в проде

## Результат

После всех оптимизаций:
- ✅ Чистый DOM (нет data-design атрибутов)
- ✅ Предзагруженный CSS (нет runtime injection)
- ✅ Меньше размер бандла (tree-shaking работает)
- ✅ Нет MutationObserver (лучше производительность)
- ✅ Стабильные hash'и (меньше коллизий)

