# @vira-ui/react

<div align="center">

**React хуки для Vira Reactive Protocol (VRP)**

[![Version](https://img.shields.io/npm/v/@vira-ui/react.svg)](https://www.npmjs.com/package/@vira-ui/react)
[![License](https://img.shields.io/npm/l/@vira-ui/react.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3+-blue.svg)](https://www.typescriptlang.org/)

**Синхронизация состояния между клиентом и сервером через WebSocket**

[Установка](#-установка) • [Быстрый старт](#-быстрый-старт) • [Документация](#-документация)

</div>

---

## 🎯 Что это?

**@vira-ui/react** предоставляет React хуки для работы с Vira Reactive Protocol (VRP) — протоколом для real-time синхронизации состояния между клиентом и сервером через WebSocket.

### Основные возможности

- ✅ **Автоматическая синхронизация** — состояние обновляется при изменениях на сервере
- ✅ **Двусторонняя связь** — можно отправлять события и обновления на сервер
- ✅ **Diff-патчи** — обновляются только изменённые части данных
- ✅ **Переподключение** — автоматическое восстановление соединения
- ✅ **TypeScript** — полная типизация

---

## 📦 Установка

```bash
npm install @vira-ui/react @vira-ui/core react
```

**Требования:**
- React 18.2.0+
- `@vira-ui/core` ^1.0.0
- Сервер с поддержкой Vira Reactive Protocol

---

## 🚀 Быстрый старт

### useViraState

Основной хук для синхронизации состояния:

```tsx
import { useViraState } from '@vira-ui/react';

interface User {
  id: string;
  name: string;
  email: string;
}

function UserProfile({ userId }: { userId: string }) {
  const { data, sendUpdate, sendDiff, isConnected } = useViraState<User>(
    `user:${userId}`,
    {
      initial: { id: userId, name: 'Guest', email: '' },
      onOpen: () => console.log('Connected'),
      deepMerge: true
    }
  );

  if (!isConnected) return <div>Connecting...</div>;
  if (!data) return <div>Loading...</div>;

  return (
    <div>
      <h1>{data.name}</h1>
      <p>{data.email}</p>
      <button onClick={() => sendDiff({ name: 'New Name' })}>
        Update Name
      </button>
    </div>
  );
}
```

---

## 📚 Документация

### useViraState

Подключается к VRP каналу и синхронизирует состояние.

**Параметры:**
- `channel` — имя канала (например: `"user:123"`, `"tasks"`)
- `options` — опции конфигурации

**Возвращает:**
- `data` — текущее состояние
- `sendUpdate(payload)` — полная замена состояния
- `sendDiff(patch)` — частичное обновление (merge)
- `sendEvent(name, payload)` — отправка события
- `isConnected` — статус соединения
- `isLoading` — статус загрузки

**Опции:**
- `initial` — начальное значение
- `apiUrl` — URL сервера (по умолчанию из `VITE_API_URL`)
- `authToken` — токен авторизации
- `deepMerge` — глубокое слияние для diff-патчей
- `enableMsgId` — поддержка idempotency
- `onOpen`, `onClose`, `onError` — колбэки событий соединения

### Примеры использования

#### Список элементов

```tsx
import { useViraState } from '@vira-ui/react';

interface Task {
  id: string;
  title: string;
  completed: boolean;
}

function TasksList() {
  const { data, sendEvent, sendDiff } = useViraState<Task[]>(
    'tasks',
    { initial: [] }
  );

  const toggleTask = (taskId: string) => {
    const task = data?.find(t => t.id === taskId);
    if (task) {
      sendDiff({ [taskId]: { completed: !task.completed } });
    }
  };

  const createTask = (title: string) => {
    sendEvent('task.created', {
      id: crypto.randomUUID(),
      title,
      completed: false
    });
  };

  return (
    <div>
      {data?.map(task => (
        <div key={task.id}>
          <input
            type="checkbox"
            checked={task.completed}
            onChange={() => toggleTask(task.id)}
          />
          <span>{task.title}</span>
        </div>
      ))}
      <button onClick={() => createTask('New Task')}>
        Add Task
      </button>
    </div>
  );
}
```

#### Одиночный элемент

```tsx
function UserDetails({ userId }: { userId: string }) {
  const { data, sendDiff, isConnected } = useViraState<User>(
    `user:${userId}`,
    {
      initial: null,
      deepMerge: true
    }
  );

  const updateName = (name: string) => {
    sendDiff({ name });
  };

  if (!isConnected) {
    return <div>Connecting to server...</div>;
  }

  if (!data) {
    return <div>Loading user...</div>;
  }

  return (
    <div>
      <input
        value={data.name}
        onChange={(e) => updateName(e.target.value)}
      />
      <p>Email: {data.email}</p>
    </div>
  );
}
```

#### С обработкой ошибок

```tsx
function DataComponent({ channel }: { channel: string }) {
  const { data, sendEvent, isConnected, error } = useViraState(
    channel,
    {
      initial: null,
      onError: (err) => {
        console.error('VRP Error:', err);
        // Можно показать уведомление пользователю
      },
      onClose: () => {
        console.log('Connection closed, reconnecting...');
      }
    }
  );

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  if (!isConnected) {
    return <div>Reconnecting...</div>;
  }

  return <div>{/* ... */}</div>;
}
```

#### С авторизацией

```tsx
function AuthenticatedComponent() {
  const authToken = useAuthToken(); // Ваш хук для получения токена
  
  const { data } = useViraState('protected:data', {
    authToken,
    onError: (err) => {
      if (err.message.includes('unauthorized')) {
        // Перенаправить на страницу входа
      }
    }
  });

  return <div>{/* ... */}</div>;
}
```

---

## 🔄 Паттерны использования

### Real-time обновления

```tsx
function LiveDashboard() {
  const { data } = useViraState('dashboard:stats', {
    initial: { users: 0, orders: 0 }
  });

  // Данные автоматически обновляются при изменениях на сервере
  return (
    <div>
      <div>Users: {data?.users}</div>
      <div>Orders: {data?.orders}</div>
    </div>
  );
}
```

### Оптимистичные обновления

```tsx
function OptimisticUpdate() {
  const { data, sendDiff } = useViraState('user:123', {
    initial: { name: 'John' }
  });

  const updateName = (newName: string) => {
    // Сразу обновляем локально (оптимистично)
    sendDiff({ name: newName });
    
    // Сервер подтвердит или откатит изменение
  };

  return (
    <input
      value={data?.name}
      onChange={(e) => updateName(e.target.value)}
    />
  );
}
```

### События вместо обновлений

```tsx
function EventDriven() {
  const { sendEvent } = useViraState('tasks', { initial: [] });

  const handleComplete = (taskId: string) => {
    // Отправляем событие вместо прямого обновления
    sendEvent('task.completed', { taskId });
    
    // Сервер обработает событие и обновит состояние
  };

  return <button onClick={() => handleComplete('123')}>Complete</button>;
}
```

---

## 🔗 Интеграция

Обычно используется вместе с:

- **@vira-ui/core** — базовый фреймворк
- **@vira-ui/bindings-react** — компоненты с автоматическим связыванием

---

## 📖 Примеры

### Kanban доска

```tsx
function KanbanBoard() {
  const { data, sendEvent } = useViraState<Column[]>('kanban:board', {
    initial: []
  });

  const moveCard = (cardId: string, fromColumn: string, toColumn: string) => {
    sendEvent('card.moved', {
      cardId,
      fromColumn,
      toColumn
    });
  };

  return (
    <div className="kanban-board">
      {data?.map(column => (
        <Column
          key={column.id}
          column={column}
          onMoveCard={moveCard}
        />
      ))}
    </div>
  );
}
```

### Чат

```tsx
function ChatRoom({ roomId }: { roomId: string }) {
  const { data, sendEvent } = useViraState<Message[]>(
    `chat:${roomId}`,
    { initial: [] }
  );

  const sendMessage = (text: string) => {
    sendEvent('message.sent', {
      id: crypto.randomUUID(),
      text,
      timestamp: Date.now()
    });
  };

  return (
    <div>
      <div className="messages">
        {data?.map(msg => (
          <Message key={msg.id} message={msg} />
        ))}
      </div>
      <MessageInput onSend={sendMessage} />
    </div>
  );
}
```

---

## 🔥 Best Practices

1. **Используйте типизацию** — всегда указывайте тип для `useViraState<T>`
2. **Обрабатывайте ошибки** — используйте `onError` для обработки ошибок соединения
3. **Оптимистичные обновления** — используйте `sendDiff` для мгновенного обновления UI
4. **События для действий** — используйте `sendEvent` для действий, которые должны обрабатываться на сервере

---

## 📄 License

MIT

---

## 🔗 Связанные пакеты

- [`@vira-ui/core`](../core/README.md) - Базовый фреймворк с VRP клиентом
- [`@vira-ui/bindings-react`](../bindings-react/README.md) - Компоненты с auto-binding
- [`@vira-ui/ui`](../ui/README.md) - UI компоненты

