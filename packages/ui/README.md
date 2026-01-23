# @vira-ui/ui

<div align="center">

**Vira UI - Beautiful, minimal design system components**

[![Version](https://img.shields.io/npm/v/@vira-ui/ui.svg)](https://www.npmjs.com/package/@vira-ui/ui)
[![License](https://img.shields.io/npm/l/@vira-ui/ui.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3+-blue.svg)](https://www.typescriptlang.org/)

**UI-кит с системой дизайна на токенах. Работает независимо от Vira Framework.**

[Установка](#-установка) • [Быстрый старт](#-быстрый-старт) • [Компоненты](#-компоненты) • [Документация](https://vira.dev/ui)

</div>

---

## 🎯 Что это?

**Vira UI** — это библиотека React компонентов с системой дизайна на основе токенов. Она работает **независимо** от Vira Framework и может использоваться в любом React проекте.

### Основные возможности

- ✅ **Базовые компоненты** — Button, Input, Card, Layout и др.
- ✅ **Presets** — готовые наборы стилей (`preset="primary"`)
- ✅ **Design Props** — декларативная стилизация для power users
- ✅ **Токены** — единая система дизайн-токенов
- ✅ **Темы** — встроенные темы (cyberpunk, neomorph)
- ✅ **TypeScript** — полная типизация
- ✅ **Accessibility** — встроенная поддержка a11y

---

## 📦 Установка

```bash
npm install @vira-ui/ui react
```

**Требования:**
- React 18.2.0+
- TypeScript 5.3+ (рекомендуется)

---

## 🚀 Быстрый старт

### 1. Обёртка приложения

```tsx
import { ViraProvider } from "@vira-ui/ui";

function App() {
  return (
    <ViraProvider theme="default">
      {/* Ваше приложение */}
    </ViraProvider>
  );
}
```

### 2. Использование компонентов

```tsx
import { Button, Input, Card, Stack } from "@vira-ui/ui";

function MyComponent() {
  return (
    <Stack space={3}>
      <Card design={{ padding: 4 }}>
        <Input placeholder="Введите имя" />
        <Button preset="primary">Сохранить</Button>
      </Card>
    </Stack>
  );
}
```

**Готово!** Компоненты работают без Vira Framework.

---

## 📚 Компоненты

### Базовые

#### Button

```tsx
import { Button } from "@vira-ui/ui";

// С preset (рекомендуется)
<Button preset="primary">Нажми меня</Button>
<Button preset="secondary">Вторичная</Button>
<Button preset="danger">Опасная</Button>
<Button preset="outline">Контурная</Button>
<Button preset="ghost">Призрачная</Button>

// С design prop (для power users)
<Button 
  design={{ 
    bg: "color.primary", 
    padding: 3,
    hover: { bg: "color.secondary" }
  }}
>
  Кастомная
</Button>
```

**Presets:** `primary`, `secondary`, `success`, `warning`, `danger`, `outline`, `ghost`, `glass`, `neon`, `cyberpunk`, `gradient`

#### Input

```tsx
import { Input } from "@vira-ui/ui";

<Input placeholder="Введите текст" />
<Input preset="input" placeholder="С preset" />
<Input type="email" placeholder="Email" />
```

#### Card

```tsx
import { Card } from "@vira-ui/ui";

<Card design={{ padding: 4, radius: "radius.lg" }}>
  <Heading>Заголовок</Heading>
  <Text>Содержимое</Text>
</Card>
```

### Layout

#### Stack

```tsx
import { Stack } from "@vira-ui/ui";

<Stack space={3} direction="row">
  <Button>Кнопка 1</Button>
  <Button>Кнопка 2</Button>
</Stack>
```

#### Flex

```tsx
import { Flex } from "@vira-ui/ui";

<Flex 
  direction="row" 
  alignItems="center" 
  justifyContent="space-between"
>
  <Text>Левая часть</Text>
  <Button>Правая часть</Button>
</Flex>
```

#### Grid

```tsx
import { Grid } from "@vira-ui/ui";

<Grid columns={3} gap={4}>
  <Card>Элемент 1</Card>
  <Card>Элемент 2</Card>
  <Card>Элемент 3</Card>
</Grid>
```

#### Container

```tsx
import { Container } from "@vira-ui/ui";

<Container design={{ maxWidth: "1200px", margin: "0 auto" }}>
  {/* Содержимое */}
</Container>
```

### Формы

#### Checkbox, Radio, Switch

```tsx
import { Checkbox, Radio, Switch } from "@vira-ui/ui";

<Checkbox checked={checked} onChange={setChecked} />
<Radio value="option1" />
<Switch checked={enabled} onChange={setEnabled} />
```

#### Textarea

```tsx
import { Textarea } from "@vira-ui/ui";

<Textarea placeholder="Введите текст" rows={5} />
```

### Модальные окна и Панели

#### Modal

Классическое модальное окно, появляется поверх контента с затемнением фона.

```tsx
import { Modal } from "@vira-ui/ui";

<Modal 
  isOpen={isOpen} 
  onClose={() => setIsOpen(false)}
  title="Заголовок"
  size="md"
>
  <Text>Содержимое модального окна</Text>
</Modal>
```

**Sizes:** `xs`, `sm`, `md`, `lg`, `xl`, `full`

#### Drawer

Выдвижная панель, появляется поверх контента с затемнением фона. Идеально для форм и быстрых действий.

```tsx
import { Drawer } from "@vira-ui/ui";

<Drawer 
  isOpen={isOpen} 
  onClose={() => setIsOpen(false)} 
  placement="right"
  title="Форма"
  footer={<Button>Сохранить</Button>}
>
  <Text>Содержимое</Text>
</Drawer>
```

**Placements:** `left`, `right`, `top`, `bottom`

#### SidePanel ⚡ NEW

Боковая панель, которая **сдвигает** основной контент страницы вместо наложения поверх него. Создаёт ощущение отдельной страницы/раздела.

```tsx
import { SidePanel } from "@vira-ui/ui";

<SidePanel
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  placement="right"
  title="Детали контакта"
  subtitle="Вся информация о клиенте"
  size="600px"
  footer={<Button>Сохранить</Button>}
>
  <ContactDetails />
</SidePanel>
```

**Особенности:**
- ✨ Сдвигает контент страницы (не overlay)
- 🎯 Создаёт ощущение отдельного раздела
- 📱 Идеально для больших форм, деталей, расширенных интерфейсов
- 🔧 Поддержка хлебных крошек, закладок, переходов
- 💼 Профессиональный UX для бизнес-приложений

**Когда использовать:**
- Детальный просмотр/редактирование записей
- Многошаговые формы
- Расширенные интерфейсы с навигацией
- Когда нужно ощущение "отдельной страницы"

#### BottomSheet ⚡ NEW

Drawer снизу экрана с поддержкой свайпа. Идеально для подтверждений и быстрых форм.

```tsx
import { BottomSheet } from "@vira-ui/ui";

<BottomSheet
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Удалить контакт?"
  subtitle="Это действие нельзя отменить"
  swipeable
  showHandle
  footer={
    <Flex gap={2}>
      <Button preset="ghost">Отмена</Button>
      <Button preset="danger">Удалить</Button>
    </Flex>
  }
>
  <Text>Дополнительная информация</Text>
</BottomSheet>
```

**Особенности:**
- 📱 Выезжает снизу вверх
- 👆 Поддержка свайпа для закрытия
- 🎯 "Ручка" для свайпа (как на iOS)
- ⚡ Минимальная высота под контент
- 📦 Автоматическая адаптация

**Когда использовать:**
- Подтверждения действий (удаление, сохранение)
- Быстрые формы (укажите стоимость, введите комментарий)
- Action sheets (выбор действия)
- Мобильные интерфейсы

**Сравнение компонентов:**

| Компонент | Overlay | Сдвигает контент | Свайп | Лучше для |
|-----------|---------|------------------|-------|-----------|
| Modal | ✅ | ❌ | ❌ | Подтверждения, уведомления |
| Drawer | ✅ | ❌ | ❌ | Формы, быстрые действия |
| SidePanel | ❌ | ✅ | ❌ | Детали, расширенные интерфейсы |
| BottomSheet | ✅ | ❌ | ✅ | Мобильные действия, подтверждения |

### Навигация

#### Tabs

```tsx
import { Tabs } from "@vira-ui/ui";

<Tabs
  tabs={[
    { id: "tab1", label: "Вкладка 1", content: <div>Контент 1</div> },
    { id: "tab2", label: "Вкладка 2", content: <div>Контент 2</div> }
  ]}
/>
```

#### Breadcrumbs

```tsx
import { Breadcrumbs } from "@vira-ui/ui";

<Breadcrumbs
  items={[
    { label: "Главная", href: "/" },
    { label: "Клиенты", href: "/clients" },
    { label: "Детали" }
  ]}
/>
```

### Уведомления

#### Toast

```tsx
import { Toast, toast } from "@vira-ui/ui";

// Использование
toast.success("Успешно!");
toast.error("Ошибка!");
toast.info("Информация");

// Компонент
<ToastContainer />
```

#### Alert

```tsx
import { Alert } from "@vira-ui/ui";

<Alert type="success" title="Успех">
  Данные сохранены
</Alert>
```

### Дополнительные

```tsx
import { 
  Accordion, 
  Stepper, 
  Timeline, 
  Skeleton, 
  Progress, 
  Rating, 
  Slider,
  Pagination,
  Dropdown,
  Popover,
  Tooltip
} from "@vira-ui/ui";

// Используйте по необходимости
<Accordion items={items} />
<Stepper steps={steps} />
<Skeleton width="200px" height="20px" />
<Progress value={75} />
```

---

## 🎨 Дизайн система

### Presets (рекомендуется)

Используйте presets для быстрой разработки:

```tsx
<Button preset="primary">Primary</Button>
<Button preset="secondary">Secondary</Button>
<Button preset="danger">Danger</Button>
<Button preset="outline">Outline</Button>
<Button preset="ghost">Ghost</Button>
```

### Design Props (для power users)

Для кастомизации используйте `design` prop:

```tsx
<Button 
  design={{
    // Цвета
    bg: "color.primary",
    color: "color.text.inverse",
    
    // Отступы
    padding: 3,
    margin: 2,
    
    // Размеры
    width: "100%",
    maxWidth: "500px",
    
    // Типография
    fontSize: "typography.fontSize.lg",
    fontWeight: "typography.fontWeight.bold",
    
    // Визуальные эффекты
    radius: "radius.md",
    shadow: "shadow.md",
    
    // Псевдо-состояния
    hover: {
      bg: "color.secondary",
      transform: "translateY(-2px)"
    },
    focus: {
      borderColor: "color.primary",
      shadow: "0 0 0 3px rgba(59, 130, 246, 0.1)"
    }
  }}
>
  Кастомная кнопка
</Button>
```

### Токены

```tsx
// Цвета
"color.primary"
"color.secondary"
"color.danger"
"color.text.primary"
"color.bg.primary"

// Отступы
"space.1" // 4px
"space.2" // 8px
"space.3" // 16px

// Радиусы
"radius.sm" // 6px
"radius.md" // 10px
"radius.lg" // 16px

// Тени
"shadow.sm"
"shadow.md"
"shadow.lg"
```

### Темы

```tsx
import { ViraProvider } from "@vira-ui/ui";

// Default
<ViraProvider theme="default">
  <App />
</ViraProvider>

// Cyberpunk
<ViraProvider theme="cyberpunk">
  <App />
</ViraProvider>

// Neomorph
<ViraProvider theme="neomorph">
  <App />
</ViraProvider>
```

---

## 🔗 Интеграция с Vira Framework

> **Важно:** Компоненты с префиксом `Vira` (ViraInput, ViraTable, ViraForm) и auto-binding находятся в отдельном пакете `@vira-ui/bindings-react` (планируется).

Для использования с Vira Framework:

```tsx
import { Button, Input } from "@vira-ui/ui";
import { useService } from "@vira-ui/core";

function MyComponent() {
  const clientService = useService("client");
  
  return (
    <div>
      <Input 
        value={clientService.search}
        onChange={(e) => clientService.setSearch(e.target.value)}
      />
      <Button onClick={() => clientService.create()}>
        Создать
      </Button>
    </div>
  );
}
```

---

## 📖 Примеры

### Простая форма

```tsx
import { Card, Input, Button, Stack } from "@vira-ui/ui";

function ContactForm() {
  return (
    <Card design={{ padding: 4, maxWidth: "500px" }}>
      <Stack space={3}>
        <Input placeholder="Имя" />
        <Input placeholder="Email" type="email" />
        <Textarea placeholder="Сообщение" />
        <Button preset="primary">Отправить</Button>
      </Stack>
    </Card>
  );
}
```

### Dashboard

```tsx
import { Container, Grid, StatCard, Table } from "@vira-ui/ui";

function Dashboard() {
  return (
    <Container design={{ padding: 6 }}>
      <Grid columns={3} gap={4}>
        <StatCard title="Клиенты" value="1,234" />
        <StatCard title="Продажи" value="$45,678" />
        <StatCard title="Конверсия" value="23.5%" />
      </Grid>
      
      <Table
        columns={[
          { key: "name", label: "Имя" },
          { key: "email", label: "Email" }
        ]}
        data={clients}
      />
    </Container>
  );
}
```

---

## 🔥 Best Practices

### 1. Используйте presets

```tsx
// ✅ Хорошо
<Button preset="primary" />

// ❌ Плохо (если не нужна кастомизация)
<Button design={{ bg: "color.primary", padding: 3, ... }} />
```

### 2. Используйте токены

```tsx
// ✅ Хорошо
<Button design={{ bg: "color.primary" }} />

// ❌ Плохо
<Button design={{ bg: "#3b82f6" }} />
```

### 3. Design Props для кастомизации

```tsx
// ✅ Хорошо - для power users
<Button 
  design={{ 
    bg: "color.primary",
    hover: { bg: "color.secondary" }
  }}
/>
```

---

## ❓ FAQ

**Q: Можно ли использовать без Vira Framework?**

A: Да! Все компоненты работают независимо. Vira Framework — опциональная интеграция.

**Q: Что такое presets?**

A: Presets — готовые наборы стилей для быстрой разработки. Используйте `preset="primary"` вместо написания CSS.

**Q: Когда использовать design prop?**

A: Design prop — для power users, когда нужна кастомизация. Для большинства случаев используйте presets.

**Q: Поддерживается ли SSR?**

A: Да! Все компоненты совместимы с SSR.

**Q: Можно ли использовать с другими UI библиотеками?**

A: Да! Компоненты не конфликтуют с другими библиотеками.

---

## 📄 License

MIT

---

## 📞 Support

- **GitHub Issues**: [Создать issue](https://github.com/skrolikov/vira-ui/issues)
- **Документация**: [vira.dev/ui](https://vira.dev/ui)
- **Примеры**: [vira.dev/examples](https://vira.dev/examples)

---

<div align="center">

**Сделано с ❤️ командой Vira**

[GitHub](https://github.com/skrolikov/vira-ui) • [Документация](https://vira.dev/ui)

</div>
