# @vira-ui/core

<div align="center">

**Vira Framework - Declarative UI framework layer over React**

[![Version](https://img.shields.io/npm/v/@vira-ui/core.svg)](https://www.npmjs.com/package/@vira-ui/core)
[![License](https://img.shields.io/npm/l/@vira-ui/core.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3+-blue.svg)](https://www.typescriptlang.org/)

**Ядро фреймворка Vira. Базовые механизмы для работы с компонентами, состоянием и сервисами.**

[Установка](#-установка) • [Быстрый старт](#-быстрый-старт) • [Документация](#-документация)

</div>

---

## 🎯 Что это?

**@vira-ui/core** — это фундамент для построения React-приложений с декларативным подходом. Предоставляет систему компонентов, реактивности, DI контейнер и множество других возможностей.

### Основные возможности

- ✅ **Компоненты как декларация** — `defineComponent()` вместо обычных функций
- ✅ **Реактивность** — автоматические обновления при изменении данных (signals, reactive)
- ✅ **DI контейнер** — управление сервисами и их зависимостями
- ✅ **Actions** — автоматическая обработка загрузки, ошибок, логирования
- ✅ **Модели** — валидация форм и данных
- ✅ **REST клиент** — работа с API
- ✅ **Роутер** — навигация
- ✅ **SSR** — серверный рендеринг
- ✅ **VRP клиент** — Vira Reactive Protocol для real-time синхронизации

---

## 📦 Установка

```bash
npm install @vira-ui/core react
```

**Требования:**
- React 18.2.0+
- TypeScript 5.3+ (рекомендуется)

---

## 🚀 Быстрый старт

### Компоненты

```tsx
import { defineComponent } from '@vira-ui/core';

const MyComponent = defineComponent({
  props: { name: String },
  render: ({ name }) => <div>Hello {name}</div>
});

// Использование
<MyComponent name="World" />
```

### Реактивность (Signals)

```tsx
import { signal, useSignal } from '@vira-ui/core';

function Counter() {
  const [count, setCount] = useSignal(0);
  
  return (
    <div>
      <p>Count: {count()}</p>
      <button onClick={() => setCount(count() + 1)}>Increment</button>
    </div>
  );
}
```

### Сервисы (DI Container)

```tsx
import { createService, useService } from '@vira-ui/core';

// Создание сервиса
createService('api', () => ({
  async fetchUsers() {
    const response = await fetch('/api/users');
    return response.json();
  }
}));

// Использование
function UsersList() {
  const api = useService('api');
  const [users, setUsers] = useState([]);
  
  useEffect(() => {
    api.fetchUsers().then(setUsers);
  }, []);
  
  return <div>{/* ... */}</div>;
}
```

### Actions

```tsx
import { action, useAction } from '@vira-ui/core';

const saveUser = action(async (data) => {
  const response = await fetch('/api/users', {
    method: 'POST',
    body: JSON.stringify(data)
  });
  return response.json();
});

function UserForm() {
  const { execute, loading, error } = useAction(saveUser);
  
  const handleSubmit = async (data) => {
    const result = await execute(data);
    console.log('Saved:', result);
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {loading && <div>Loading...</div>}
      {error && <div>Error: {error.message}</div>}
      {/* ... */}
    </form>
  );
}
```

---

## 📚 Документация

### Компоненты

#### defineComponent

Создание декларативного компонента:

```tsx
import { defineComponent } from '@vira-ui/core';

const Button = defineComponent({
  props: {
    label: String,
    onClick: Function,
    disabled: Boolean
  },
  render: ({ label, onClick, disabled }) => (
    <button onClick={onClick} disabled={disabled}>
      {label}
    </button>
  )
});
```

### Реактивность

#### Signals

Система сигналов для реактивности:

```tsx
import { signal, computed, effect } from '@vira-ui/core';

const [count, setCount] = signal(0);
const double = computed(() => count() * 2);

effect(() => {
  console.log('Count:', count());
  console.log('Double:', double());
});
```

#### Reactive Objects

Реактивные объекты через Proxy:

```tsx
import { reactive } from '@vira-ui/core';

const state = reactive({
  user: { name: 'John', age: 30 }
});

// Автоматически отслеживаются изменения
state.user.name = 'Jane';
```

### Сервисы

#### Dependency Injection

```tsx
import { createService, useService } from '@vira-ui/core';

// Создание сервиса
createService('userService', () => ({
  users: [],
  async loadUsers() {
    this.users = await fetch('/api/users').then(r => r.json());
  }
}));

// Использование
function Component() {
  const userService = useService('userService');
  // ...
}
```

### Модели

#### defineModel

Создание модели с валидацией:

```tsx
import { defineModel } from '@vira-ui/core';

const userModel = defineModel({
  name: {
    type: 'string',
    required: true,
    minLength: 2
  },
  email: {
    type: 'string',
    required: true,
    validate: 'email'
  },
  age: {
    type: 'number',
    min: 18,
    max: 100
  }
});

// Валидация
const errors = userModel.validate({ name: '', email: 'invalid' });
```

### REST Client

```tsx
import { createRestClient, rest } from '@vira-ui/core';

const api = createRestClient({
  baseURL: '/api'
});

// Использование
const users = await rest.get('/users');
const user = await rest.post('/users', { name: 'John' });
```

### VRP (Vira Reactive Protocol)

```tsx
import { createViraConnection } from '@vira-ui/core';

const connection = createViraConnection({
  url: 'ws://45.90.35.155/ws',
  authToken: 'token'
});

connection.subscribe('user:123', (data) => {
  console.log('User updated:', data);
});
```

---

## 🔗 Интеграция

Обычно используется через другие пакеты:

- **@vira-ui/react** — React хуки для VRP
- **@vira-ui/bindings-react** — Компоненты с автоматическим связыванием
- **@vira-ui/ui** — UI компоненты

Но можно импортировать напрямую для кастомных решений.

---

## 📖 Примеры

### Полный пример компонента

```tsx
import { defineComponent, signal, useSignal } from '@vira-ui/core';

const Counter = defineComponent({
  props: {},
  render: () => {
    const [count, setCount] = useSignal(0);
    
    return (
      <div>
        <p>Count: {count()}</p>
        <button onClick={() => setCount(count() + 1)}>+</button>
        <button onClick={() => setCount(count() - 1)}>-</button>
      </div>
    );
  }
});
```

### Сервис с реактивностью

```tsx
import { createService, useService, signal } from '@vira-ui/core';

createService('todoService', () => {
  const todos = signal([]);
  const loading = signal(false);
  
  return {
    todos,
    loading,
    async loadTodos() {
      loading.set(true);
      try {
        const data = await fetch('/api/todos').then(r => r.json());
        todos.set(data);
      } finally {
        loading.set(false);
      }
    }
  };
});

function TodoList() {
  const service = useService('todoService');
  
  useEffect(() => {
    service.loadTodos();
  }, []);
  
  return (
    <div>
      {service.loading() && <div>Loading...</div>}
      {service.todos().map(todo => (
        <div key={todo.id}>{todo.text}</div>
      ))}
    </div>
  );
}
```

---

## 📄 License

MIT

---

## 🔗 Связанные пакеты

- [`@vira-ui/react`](../react/README.md) - React хуки для VRP
- [`@vira-ui/ui`](../ui/README.md) - UI компоненты
- [`@vira-ui/bindings-react`](../bindings-react/README.md) - Компоненты с auto-binding

