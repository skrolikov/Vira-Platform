<p align="center">
  <img src="https://raw.githubusercontent.com/skrolikov/vira-ui/main/assets/logo.svg" width="120" />
</p>

<h1 align="center">Vira Platform</h1>

<p align="center">
  Reactive architecture for complex business applications
</p>


<p align="center">
  <img src="https://img.shields.io/npm/v/@vira-ui/core?style=for-the-badge&labelColor=000&color=7C3AED" alt="Core Version">
  <img src="https://img.shields.io/npm/v/@vira-ui/ui?style=for-the-badge&labelColor=000&color=7C3AED" alt="UI Version">
  <img src="https://img.shields.io/npm/v/@vira-ui/react?style=for-the-badge&labelColor=000&color=7C3AED" alt="React Version">
  <img src="https://img.shields.io/badge/license-MIT-blue?style=for-the-badge&labelColor=000" alt="MIT License">
  <img src="https://img.shields.io/badge/TypeScript-5.0+-3178C6?style=for-the-badge&labelColor=000&logo=typescript" alt="TypeScript">
  <img src="https://img.shields.io/badge/React-18+-61DAFB?style=for-the-badge&labelColor=000&logo=react" alt="React 18+">
</p>

<p align="center">
  <strong>Архитектурная платформа для сложных бизнес-приложений</strong><br>
  Реактивная, декларативная, масштабируемая
</p>

## 📖 Содержание
- [🎯 Что такое Vira?](#-что-такое-vira)
- [🌟 Почему Vira?](#-почему-vira)
- [🏗️ Архитектура](#️-архитектура)
- [📦 Пакеты](#-пакеты)
- [⚡ Быстрый старт](#-быстрый-старт)
- [🧪 Примеры](#-примеры)
- [⚔️ Сравнение](#️-сравнение)
- [🚀 Использование](#-использование)
- [🤝 Вклад](#-вклад)
- [📄 Лицензия](#-лицензия)

## 🎯 Что такое Vira?

**Vira** — это не UI-кит и не очередной state-manager. Это **архитектурная платформа** для создания сложных бизнес-приложений следующего поколения.

### Для чего?
- **CRM/ERP системы** с тысячами бизнес-правил
- **Админ-панели** с реальным временем и сложной логикой
- **Fintech приложения** с требовательной валидацией
- **Логистические платформы** с workflow-ориентированной архитектурой

### Философия
> **Если React — это "как рисовать UI", то Vira — "как живёт система".**

## 🌟 Почему Vira?

| Проблема в классическом стеке | Решение Vira |
|------------------------------|--------------|
| Ручная синхронизация состояний | **Автоматические реактивные биндинги** |
| `useEffect` зависимости | **Декларативная событийная модель** |
| Бизнес-логика в компонентах | **Чистое разделение слоёв** |
| Сложный рефакторинг | **Предсказуемая архитектура VRP** |
| Real-time как боль | **Встроенная событийная система** |
| Масштабирование = ад | **Модульная, поэтапная адаптация** |

## 🏗️ Архитектура

```
┌─────────────────────────────────────────────────┐
│              Бизнес-логика (Core)               │
│  Состояния │ События │ Действия │ Валидации     │
└────────────┴─────────┴──────────┴───────────────┘
                         │ VRP (Vira Reactive Protocol)
┌─────────────────────────────────────────────────┐
│            UI Слой (React + Bindings)           │
│  Компоненты │ Хуки │ Автоматические биндинги    │
└─────────────────────────────────────────────────┘
```

### Ключевые принципы
1. **Источник истины — события, а не UI**
2. **Декларативная логика вместо императивной**
3. **Автоматическая реактивность вместо ручных подписок**
4. **Слоистая архитектура вместо монолита**

## 📦 Пакеты

### 🧠 Ядро платформы
| Пакет | Версия | Описание |
|-------|--------|----------|
| **[@vira-ui/core]** | [![npm version](https://img.shields.io/npm/v/@vira-ui/core)](https://www.npmjs.com/package/@vira-ui/core) | Реактивное ядро, VRP, состояния, события |
| **[@vira-ui/react]** | [![npm version](https://img.shields.io/npm/v/@vira-ui/react)](https://www.npmjs.com/package/@vira-ui/react) | React-интеграция, хуки, контексты |
| **[@vira-ui/bindings-react]** | [![npm version](https://img.shields.io/npm/v/@vira-ui/bindings-react)](https://www.npmjs.com/package/@vira-ui/bindings-react) | Автоматические биндинги данных |

### 🎨 Дизайн-система
| Пакет | Версия | Описание |
|-------|--------|----------|
| **[@vira-ui/ui]** | [![npm version](https://img.shields.io/npm/v/@vira-ui/ui)](https://www.npmjs.com/package/@vira-ui/ui) | Полноценная UI-библиотека, темы, tokens |
| **[@vira-ui/icons]** | [![npm version](https://img.shields.io/npm/v/@vira-ui/icons)](https://www.npmjs.com/package/@vira-ui/icons) | Иконки и SVG-компоненты |

### ⚡ Инструменты
| Пакет | Версия | Описание |
|-------|--------|----------|
| **[@vira-ui/babel-plugin]** | [![npm version](https://img.shields.io/npm/v/@vira-ui/babel-plugin)](https://www.npmjs.com/package/@vira-ui/babel-plugin) | Компиляторные оптимизации |
| **[@vira-ui/cli]** | [![npm version](https://img.shields.io/npm/v/@vira-ui/cli)](https://www.npmjs.com/package/@vira-ui/cli) | Генератор проектов и инструменты |

## 🧪 Примеры

### Сложная форма с валидацией
```tsx
import { state, event, validator } from '@vira-ui/core';
import { Form, Input, Button, ErrorText } from '@vira-ui/ui';

const order = state({
  amount: 0,
  currency: 'USD',
  description: ''
});

// Валидатор
const amountValidator = validator(order, 'amount')
  .min(1, 'Сумма должна быть положительной')
  .max(10000, 'Максимум 10,000');

const submitOrder = event();

submitOrder.on(() => {
  if (amountValidator.valid) {
    api.createOrder(order.value);
  }
});

function OrderForm() {
  const amount = useBinding(order, 'amount');
  
  return (
    <Form>
      <Input 
        {...amount} 
        type="number"
        label="Сумма заказа"
      />
      {amountValidator.error && (
        <ErrorText>{amountValidator.error}</ErrorText>
      )}
      <Button 
        onClick={submitOrder}
        disabled={!amountValidator.valid}
      >
        Создать заказ
      </Button>
    </Form>
  );
}
```

### Real-time дашборд
```tsx
import { state, event, stream } from '@vira-ui/core';
import { Dashboard, Card, Chart } from '@vira-ui/ui';

// WebSocket стрим
const metrics = stream('wss://api.example.com/metrics');

// Автоматическое обновление данных
const dashboardData = state({
  users: 0,
  revenue: 0,
  conversions: 0
});

metrics.on('update', (data) => {
  dashboardData.set(data);
});

function AnalyticsDashboard() {
  const data = useBinding(dashboardData);
  
  return (
    <Dashboard>
      <Card title="Пользователи">
        <h2>{data.users}</h2>
      </Card>
      <Card title="Выручка">
        <Chart data={data.revenue} />
      </Card>
    </Dashboard>
  );
}
```

## ⚔️ Сравнение

### Vira vs Redux/Zustand
| | Redux/Zustand | **Vira** |
|-|---------------|----------|
| Событийная модель | ❌ Нет | ✅ **Встроенная VRP** |
| Реальное время | 🔧 Доп. библиотеки | ✅ **Из коробки** |
| Бизнес-логика | 🧩 Разрозненная | ✅ **Централизованная** |
| Валидации | 🔧 Вручную | ✅ **Декларативные** |

### Vira vs MobX
| | MobX | **Vira** |
|-|------|----------|
| Магия | 🔮 Много | ✅ **Минимум магии** |
| Отладка | 🐛 Сложно | ✅ **Предсказуемо** |
| Архитектура | 🏗️ Отсутствует | ✅ **Чёткая слоистая** |

## 🚀 Использование

### 🎯 Идеально для:
- ✅ **CRM/ERP системы** с сотнями экранов
- ✅ **Админ-панели** с реальным временем
- ✅ **Торговые платформы** с сложной логикой
- ✅ **Медицинские системы** с валидациями
- ✅ **Логистика** с workflow

### ⚠️ Менее подходит:
- ❌ Статические сайты-визитки
- ❌ Простые блоги
- ❌ Проекты без бизнес-логики

## 📊 Статус разработки

| Пакет | Статус | Тесты | Документация |
|-------|--------|-------|--------------|
| `@vira-ui/core` | ✅ **Production** | 95% | 📖 Полная |
| `@vira-ui/ui` | ✅ **Production** | 90% | 📖 Полная |
| `@vira-ui/react` | ✅ **Production** | 85% | 📖 Полная |
| `@vira-ui/bindings-react` | 🟡 **Beta** | 80% | 📖 Частичная |
| `@vira-ui/cli` | 🟡 **Beta** | 70% | 📘 Базовая |

## 🤝 Вклад

Мы приветствуем вклад! Вот как можно помочь:

### Как начать?
1. **Выберите пакет для работы:**
   - `core` — для работы с архитектурой
   - `ui` — для компонентов дизайн-системы
   - Другие пакеты — для интеграций
2. **Обсудите крупные изменения** через Issues
3. **Обсудите крупные изменения** — создайте Discussion

## 📄 Лицензия

**MIT License** — свободное использование, изменение, распространение.

Полный текст лицензии: [LICENSE](LICENSE)

## 🔗 Ссылки

- **GitHub**: [github.com/skrolikov/vira-ui](https://github.com/skrolikov/vira-ui)
- **NPM**: [npmjs.com/org/vira-ui](https://www.npmjs.com/org/vira-ui)
- **Issues**: [github.com/skrolikov/vira-ui/issues](https://github.com/skrolikov/vira-ui/issues)
- **Discussions**: [github.com/skrolikov/vira-ui/discussions](https://github.com/skrolikov/vira-ui/discussions)

## 🌟 Поддержка проекта

Если Vira помогает вам в работе, поддержите проект:

1. **Поставьте звезду на GitHub** ⭐
2. **Расскажите** о платформе
3. **Создавайте Issues** для улучшений

---

<p align="center">
  <strong>Vira Platform © 2025</strong><br>
  Реактивная архитектура для следующего поколения бизнес-приложений
</p>

<p align="center">
  <sub>Создано с ❤️ для разработчиков сложных систем</sub>
</p>

[@vira-ui/core]: packages/core/README.md
[@vira-ui/react]: packages/react/README.md
[@vira-ui/bindings-react]: packages/bindings-react/README.md
[@vira-ui/ui]: packages/ui/README.md
[@vira-ui/icons]: packages/icons/README.md
[@vira-ui/babel-plugin]: packages/babel-plugin/README.md
[@vira-ui/cli]: packages/cli/README.md