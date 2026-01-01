# @vira-ui/bindings-react

React компоненты с автоматическим связыванием для Vira Framework. Интеграция между `@vira-ui/core`, `@vira-ui/ui` и `@vira-ui/react`.

## 📦 Установка

```bash
npm install @vira-ui/bindings-react @vira-ui/core @vira-ui/ui @vira-ui/react
```

**Требования:**
- React 18.2.0+
- `@vira-ui/core` ^1.0.0
- `@vira-ui/ui` ^1.0.0
- `@vira-ui/react` ^1.0.0

## 🎯 Что это?

**@vira-ui/bindings-react** предоставляет компоненты с префиксом `Vira`, которые автоматически интегрируются с Vira Framework:

- **Автоматическое связывание** — компоненты автоматически связываются с моделями и actions
- **VRP интеграция** — работа с Vira Reactive Protocol из коробки
- **Формы** — продвинутые формы с валидацией и условными полями
- **Таблицы** — таблицы с автоматической синхронизацией данных

## 🚀 Быстрый старт

### 1. Настройка BindingRuntime

```tsx
import { BindingRuntime } from '@vira-ui/bindings-react';
import { ViraProvider } from '@vira-ui/ui';

function App() {
  return (
    <ViraProvider theme="default">
      <BindingRuntime>
        {/* Ваше приложение */}
      </BindingRuntime>
    </ViraProvider>
  );
}
```

### 2. Использование Vira компонентов

```tsx
import { ViraForm, ViraTable, ViraModal } from '@vira-ui/bindings-react';
import { useService } from '@vira-ui/core';

function UserForm() {
  const userService = useService('user');
  
  return (
    <ViraForm
      model={userService.model}
      onSubmit={userService.create}
    >
      {/* Поля формы */}
    </ViraForm>
  );
}
```

## 📚 Компоненты

### ViraForm

Форма с автоматическим связыванием модели:

```tsx
import { ViraForm } from '@vira-ui/bindings-react';
import { defineModel } from '@vira-ui/core';

const userModel = defineModel({
  name: { type: 'string', required: true },
  email: { type: 'string', required: true, validate: 'email' },
  age: { type: 'number', min: 18, max: 100 }
});

function UserForm() {
  return (
    <ViraForm
      model={userModel}
      onSubmit={(data) => {
        console.log('Submitted:', data);
      }}
    />
  );
}
```

### ViraMultiStepForm

Многошаговая форма:

```tsx
import { ViraMultiStepForm } from '@vira-ui/bindings-react';

const steps = [
  {
    id: 'personal',
    title: 'Личные данные',
    fields: ['name', 'email']
  },
  {
    id: 'address',
    title: 'Адрес',
    fields: ['address', 'city']
  }
];

function RegistrationForm() {
  return (
    <ViraMultiStepForm
      steps={steps}
      model={userModel}
      onSubmit={handleSubmit}
    />
  );
}
```

### ViraConditionalForm

Форма с условными полями:

```tsx
import { ViraConditionalForm } from '@vira-ui/bindings-react';

const rules = [
  {
    field: 'hasAddress',
    condition: (value) => value === true,
    showFields: ['address', 'city', 'zip']
  }
];

function ConditionalForm() {
  return (
    <ViraConditionalForm
      model={userModel}
      rules={rules}
      onSubmit={handleSubmit}
    />
  );
}
```

### ViraTable

Таблица с автоматической синхронизацией через VRP:

```tsx
import { ViraTable } from '@vira-ui/bindings-react';

const columns = [
  { key: 'name', label: 'Имя' },
  { key: 'email', label: 'Email' },
  { key: 'status', label: 'Статус' }
];

function UsersTable() {
  return (
    <ViraTable
      channel="users"
      columns={columns}
      onRowClick={(row) => console.log('Clicked:', row)}
    />
  );
}
```

### ViraDataGrid

Продвинутая таблица с редактированием:

```tsx
import { ViraDataGrid } from '@vira-ui/bindings-react';

function EditableTable() {
  return (
    <ViraDataGrid
      channel="users"
      columns={columns}
      editable={true}
      onCellEdit={(row, field, value) => {
        // Автоматически отправляется через VRP
      }}
    />
  );
}
```

### ViraModal / ViraDrawer

Модальные окна с интеграцией Vira:

```tsx
import { ViraModal, ViraDrawer } from '@vira-ui/bindings-react';

function MyComponent() {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Открыть</Button>
      
      <ViraModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Заголовок"
      >
        <ViraForm model={userModel} onSubmit={handleSubmit} />
      </ViraModal>
      
      <ViraDrawer
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        placement="right"
      >
        <ViraForm model={userModel} onSubmit={handleSubmit} />
      </ViraDrawer>
    </>
  );
}
```

### ViraDatePicker / ViraFileUpload

Специализированные компоненты:

```tsx
import { ViraDatePicker, ViraFileUpload } from '@vira-ui/bindings-react';

function FormWithSpecialFields() {
  return (
    <ViraForm model={userModel}>
      <ViraDatePicker
        label="Дата рождения"
        value={date}
        onChange={setDate}
      />
      
      <ViraFileUpload
        label="Загрузить фото"
        accept="image/*"
        onUpload={(files) => console.log('Uploaded:', files)}
      />
    </ViraForm>
  );
}
```

### ViraVirtualList

Виртуализированный список для больших данных:

```tsx
import { ViraVirtualList } from '@vira-ui/bindings-react';

function LargeList() {
  return (
    <ViraVirtualList
      channel="items"
      itemHeight={50}
      renderItem={(item) => <div>{item.name}</div>}
    />
  );
}
```

### ViraSkeleton / ViraSuspense / ViraLazy

Компоненты для загрузки и ленивой загрузки:

```tsx
import { ViraSkeleton, ViraSuspense, ViraLazy } from '@vira-ui/bindings-react';

function LoadingComponents() {
  return (
    <>
      <ViraSkeleton width="200px" height="20px" />
      
      <ViraSuspense fallback={<ViraSkeleton />}>
        <AsyncComponent />
      </ViraSuspense>
      
      <ViraLazy
        load={() => import('./HeavyComponent')}
        fallback={<ViraSkeleton />}
      />
    </>
  );
}
```

### ViraErrorBoundary

Обработка ошибок:

```tsx
import { ViraErrorBoundary } from '@vira-ui/bindings-react';

function App() {
  return (
    <ViraErrorBoundary
      onError={(error) => console.error('Error:', error)}
      fallback={<div>Что-то пошло не так</div>}
    >
      <YourApp />
    </ViraErrorBoundary>
  );
}
```

## 🔗 Интеграция с Vira Framework

### Использование с сервисами

```tsx
import { useService } from '@vira-ui/core';
import { ViraForm } from '@vira-ui/bindings-react';

function UserForm() {
  const userService = useService('user');
  
  return (
    <ViraForm
      model={userService.model}
      onSubmit={userService.create}
      initialValues={userService.data}
    />
  );
}
```

### Использование с VRP

```tsx
import { useViraState } from '@vira-ui/react';
import { ViraTable } from '@vira-ui/bindings-react';

function UsersTable() {
  const { data, sendEvent } = useViraState('users', []);
  
  return (
    <ViraTable
      data={data}
      columns={columns}
      onRowClick={(row) => sendEvent('user.selected', row)}
    />
  );
}
```

## 🎨 Кастомизация

Все компоненты поддерживают стандартные props из `@vira-ui/ui`:

```tsx
<ViraForm
  model={userModel}
  design={{
    padding: 4,
    bg: 'color.bg.secondary'
  }}
  preset="card"
/>
```

## 📖 Примеры

### Полная форма с валидацией

```tsx
import { ViraForm } from '@vira-ui/bindings-react';
import { defineModel, action } from '@vira-ui/core';

const userModel = defineModel({
  name: { type: 'string', required: true, minLength: 2 },
  email: { type: 'string', required: true, validate: 'email' },
  password: { type: 'string', required: true, minLength: 8 }
});

const createUser = action(async (data) => {
  const response = await fetch('/api/users', {
    method: 'POST',
    body: JSON.stringify(data)
  });
  return response.json();
});

function RegistrationForm() {
  return (
    <ViraForm
      model={userModel}
      onSubmit={createUser}
      submitLabel="Зарегистрироваться"
    />
  );
}
```

### Таблица с действиями

```tsx
import { ViraTable } from '@vira-ui/bindings-react';
import { useService } from '@vira-ui/core';

function UsersTable() {
  const userService = useService('user');
  
  return (
    <ViraTable
      channel="users"
      columns={columns}
      actions={[
        {
          label: 'Редактировать',
          onClick: (row) => userService.edit(row.id)
        },
        {
          label: 'Удалить',
          onClick: (row) => userService.delete(row.id),
          variant: 'danger'
        }
      ]}
    />
  );
}
```

## 🔥 Best Practices

1. **Используйте BindingRuntime** — оберните приложение для автоматического связывания
2. **Комбинируйте с сервисами** — используйте `useService` для бизнес-логики
3. **VRP для real-time** — используйте VRP каналы для синхронизации данных
4. **Модели для валидации** — определяйте модели для автоматической валидации

## 📄 License

MIT

## 🔗 Связанные пакеты

- [`@vira-ui/core`](../core/README.md) - Базовый фреймворк
- [`@vira-ui/ui`](../ui/README.md) - UI компоненты
- [`@vira-ui/react`](../react/README.md) - React хуки для VRP

