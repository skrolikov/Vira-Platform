# 🚀 Quickstart: Создаём CRM за 10 минут

<div align="center">

**Полный гайд от нуля до работающей страницы CRM с использованием Vira CLI**

[⬅️ Назад к README](README.md) • [📚 Документация](README.md#-команды)

</div>

---

> 💡 **Этот гайд покажет вам:**
> - Как создать fullstack проект с нуля
> - Как использовать VRP для real-time синхронизации
> - Как синхронизировать типы между Go и TypeScript
> - Как генерировать код с помощью CLI
> - **Все улучшения встроены в CLI** — UUID, bulk actions, useVrpList, notifications queue, авто-save генерируются автоматически!

---

## 📋 Что мы создадим

- ✅ Fullstack проект (React + Go + Docker)
- ✅ Страницу списка клиентов с VRP
- ✅ Backend API для работы с клиентами
- ✅ Синхронизацию типов между frontend и backend
- ✅ Готовую инфраструктуру для разработки

---

## ⚡ Шаг 1: Установка

```bash
# Глобальная установка (опционально)
npm install -g @vira-ui/cli

# Или используем через npx (рекомендуется)
npx @vira-ui/cli create crm-app --template fullstack
```


После создания вы увидите структуру:

```
crm-app/
├── frontend/          # React приложение
├── ui/                # Vira UI компоненты
├── backend/           # Go API
├── deploy/            # Docker & DevOps
└── migrations/        # SQL миграции
```

---

## 🏗️ Шаг 2: Быстрый запуск (одна команда)

### 🎯 6️⃣ DevOps: quickstart через один npm скрипт

В корне проекта (`crm-app/package.json`) добавьте:

```json
{
  "scripts": {
    "start:dev": "cd deploy && docker compose -f docker-compose.dev.yml up -d && cd ../frontend && npm install && npm run dev"
  }
}
```

Теперь всё запускается одной командой:

```bash
cd crm-app
npm run start:dev
```

Или по шагам (если нужен больший контроль):

---

## 📦 Шаг 3: Установка зависимостей

**✨ CLI автоматически добавляет все необходимые зависимости!**

```bash
cd crm-app

# Frontend (uuid уже в package.json, debounceServiceMethod в @vira-ui/core!)
cd frontend
npm install
cd ..

# UI package
cd ui
npm install
cd ..

# Backend
cd backend
go mod tidy
cd ..
```

---

## 🗄️ Шаг 4: Запуск инфраструктуры

```bash
# Запускаем базу данных, Redis, Kafka
cd deploy
docker compose -f docker-compose.dev.yml up -d
cd ..
```

---

## 🔧 Шаг 5: Backend — создаём модель и handlers

### 5.1 Создаём Go модель


```bash
cd backend

# Создаём Go модель (базовый вариант)
npm run vira make model Client

# Или с полями сразу
npm run vira make model Client --fields "name:string,email:string,phone:string"
```

Редактируем `backend/internal/models/Client.go`:

```go
package models

import "time"

type Client struct {
  ID        string    `db:"id" json:"id"`
  Name      string    `db:"name" json:"name"`
  Email     string    `db:"email" json:"email"`
  Phone     string    `db:"phone" json:"phone"`
  CreatedAt time.Time `db:"created_at" json:"created_at"`
  UpdatedAt time.Time `db:"updated_at" json:"updated_at"`
}
```

### 5.2 Добавляем модель в types

Открываем `backend/internal/types/types.go` и добавляем:

```go
package types

import "time"

type Client struct {
  ID        string    `json:"id"`
  Name      string    `json:"name"`
  Email     string    `json:"email"`
  Phone     string    `json:"phone"`
  CreatedAt time.Time `json:"created_at"`
  UpdatedAt time.Time `json:"updated_at"`
}
```

### 5.3 Создаём CRUD handlers

```bash
npm run vira make crud client
```

Это создаст `backend/internal/handlers/client_crud.go` с методами:
- `ListClient` — GET /client
- `GetClient` — GET /client/{id}
- `CreateClient` — POST /client
- `UpdateClient` — PUT /client/{id}
- `DeleteClient` — DELETE /client/{id}

### 5.4 Создаём event handler для VRP

```bash
npm run vira make event client.updated
```

Редактируем `backend/internal/events/client_updated.go`:

```go
package events

import (
  "context"
  "encoding/json"
  "github.com/gorilla/websocket"
)

// ClientUpdated handles event: client.updated
func ClientUpdated(ctx context.Context, hub EventEmitter, conn *websocket.Conn, msg WSMessage) {
  var payload map[string]any
  if len(msg.Data) > 0 {
    _ = json.Unmarshal(msg.Data, &payload)
  }

  // Emit update to VRP channel
  if clientID, ok := payload["id"].(string); ok {
    hub.Emit(ChannelCustom("client", clientID), payload)
  }
}

func init() {
  Register("client.updated", ClientUpdated)
}
```

---

## 🔄 Шаг 6: Синхронизация типов

```bash
# Из корня проекта
cd crm-app
npm run vira sync --types
```

Это создаст TypeScript типы в:
- `frontend/src/vira-types.ts`
- `ui/src/vira-types.ts`

---

## 🎨 Шаг 7: Frontend — создаём компоненты с VRP

### 7.1 Создаём сервис для работы с клиентами

```bash
cd frontend
npm run vira generate service Client --interactive --vrp
# → Use VRP? Yes
# → Channel: client
# → State type: ClientState
```

**✨ CLI автоматически сгенерирует:**
- ✅ Универсальный `useVrpList<T>` hook для списков
- ✅ Метод `create()` с авто-генерацией UUID на фронте
- ✅ Сервис `clientBulk` для массовых операций
- ✅ Все необходимые зависимости (uuid)
- ✅ Использует встроенные инструменты из @vira-ui/core: `watch()`, `signal()`, `computed()`, `batch()` (не нужен lodash!)

Сгенерированный файл `frontend/src/services/ClientService.ts` уже содержит всё необходимое. Давайте дополним его бизнес-логикой:

```typescript
// ✅ CLI уже сгенерировал базовую структуру сервиса с useVrpList, create() с UUID, и clientBulk!
// Дополняем бизнес-логикой:

import type { Client } from '../vira-types';

// Расширяем бизнес-логику сервиса (CLI создал базовый сервис 'client')
createService('client', () => ({
  formatPhone(phone: string): string {
    // Форматирование телефона: +7 (999) 123-45-67
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 11 && cleaned.startsWith('7')) {
      return `+7 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7, 9)}-${cleaned.slice(9)}`;
    }
    return phone;
  },
  validateEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  },
  getClientStatus(client: Client): 'new' | 'active' | 'old' {
    const daysSinceCreation = Math.floor(
      (Date.now() - new Date(client.created_at).getTime()) / (1000 * 60 * 60 * 24)
    );
    if (daysSinceCreation < 7) return 'new';
    if (daysSinceCreation < 30) return 'active';
    return 'old';
  },
  searchClients(clients: Client[], query: string): Client[] {
    if (!query) return clients;
    const lowerQuery = query.toLowerCase();
    return clients.filter(client =>
      client.name.toLowerCase().includes(lowerQuery) ||
      client.email.toLowerCase().includes(lowerQuery) ||
      client.phone?.toLowerCase().includes(lowerQuery)
    );
  },
}));

// 🎯 3️⃣ Универсальный VRP hook для списков (переиспользуемый для любых сущностей)
export function useVrpList<T>(channel: string) {
  const { data, sendEvent, sendDiff } = useViraState<T[] | T>(channel, []);
  const list = Array.isArray(data) ? data : Object.values(data || {});
  return { data: list, sendEvent, sendDiff };
}

// Hook for Client operations (использует универсальный useVrpList)
export function useClient(id?: string) {
  const channel = id ? `client:${id}` : 'client';
  const { data, sendEvent, sendDiff } = id 
    ? useViraState<Client>(channel, null)
    : useVrpList<Client>(channel);
  const clientService = useService<{
    formatPhone: (phone: string) => string;
    validateEmail: (email: string) => boolean;
    getClientStatus: (client: Client) => 'new' | 'active' | 'old';
    searchClients: (clients: Client[], query: string) => Client[];
  }>('client');

  return {
    data,
    // Операции обновления
    update(updates: Partial<Client>) {
      const clientId = id || (data && typeof data === 'object' && 'id' in data ? data.id : undefined);
      sendDiff(updates);
      sendEvent('client.updated', { 
        id: clientId, 
        ...updates,
        timestamp: new Date().toISOString()
      });
    },
    // ✅ CLI уже сгенерировал create() с авто-UUID!
    // Метод create уже создан и работает автоматически
    // Удаление клиента
    delete(clientId: string) {
      sendEvent('client.deleted', { 
        id: clientId,
        timestamp: new Date().toISOString()
      });
    },
    sendEvent,
    sendDiff,
    // Вспомогательные методы из сервиса (добавьте их вручную, если нужны)
    formatPhone: (phone: string) => clientService.formatPhone(phone),
    validateEmail: (email: string) => clientService.validateEmail(email),
    getClientStatus: (client: Client) => clientService.getClientStatus(client),
    searchClients: (clients: Client[], query: string) => 
      clientService.searchClients(clients, query),
  };
}

// ✅ CLI уже создал clientBulk сервис автоматически!
// Используйте: const bulkService = useService('clientBulk');
```

### 7.2 Создаём компонент карточки клиента с inline-редактированием

```bash
npm run vira generate component ClientCard --interactive --vrp
# → Use VRP? Yes
# → Channel: client:{id}
# → State type: Client
# → Does this component need props? Yes
# → Prop name: clientId
# → Prop type: string
# → Required prop? Yes
# → Use Vira UI? Yes
```

Редактируем `frontend/src/components/ClientCard.tsx`:

```typescript
// Используем встроенные инструменты Vira Core вместо внешних библиотек!
import { createService, useService, watch, signal, computed, batch } from '@vira-ui/core';
import { useViraState } from '@vira-ui/react';
import { ViraInput, ViraButton } from '@vira-ui/bindings-react';
import { Container, Stack, Heading, Text, Card, Tag, Badge } from '@vira-ui/ui';
import type { Client } from '../vira-types';

// ✅ Все инструменты уже в @vira-ui/core:
// - watch() с debounce/throttle для авто-save
// - signal() для реактивных значений
// - computed() для фильтрации/поиска
// - batch() для оптимизации множественных обновлений

// Создаём сервис для управления состоянием редактирования (выносим за компонент)
function createCardService(clientId: string) {
  return createService(`clientCard-${clientId}`, () => ({
    editing: null as string | null,
    editValue: '',
    justUpdated: null as string | null,
    
    setEditing(field: string | null) {
      this.editing = field;
    },
    
    setEditValue(value: string) {
      this.editValue = value;
    },
    
    setJustUpdated(field: string | null) {
      this.justUpdated = field;
      if (field) {
        setTimeout(() => { this.justUpdated = null; }, 2000);
      }
    },
  }));
}

// Компонент с использованием сервисов Vira Core (без React hooks!)
export function ClientCard({ clientId, onDelete }: { clientId: string; onDelete?: (id: string) => void }) {
  const channel = `client:${clientId}`;
  const { data: client, sendDiff } = useViraState<Client>(channel, null);
  
  // Создаём/получаем сервис для этой карточки (реактивно через Vira Core)
  createCardService(clientId);
  const cardService = useService(`clientCard-${clientId}`);
  
  if (!client) {
    return (
      <Card>
        <Text>Loading client...</Text>
      </Card>
    );
  }

  // Статус клиента (новый, активный, просроченный)
  const getClientStatus = () => {
    const daysSinceCreation = Math.floor(
      (Date.now() - new Date(client.created_at).getTime()) / (1000 * 60 * 60 * 24)
    );
    if (daysSinceCreation < 7) return { label: 'Новый', color: 'success' };
    if (daysSinceCreation < 30) return { label: 'Активный', color: 'info' };
    return { label: 'Просрочен', color: 'warning' };
  };

  const status = getClientStatus();

  // 🎯 4️⃣ Inline-редактирование с авто-save используя встроенный watch() с debounce
  // Используем watch() из @vira-ui/core - это лучше чем debounceServiceMethod для реактивных значений!
  import { watch, signal } from '@vira-ui/core';
  
  // Создаём реактивное значение для редактируемого поля
  const [editValue, setEditValue] = signal('');
  const [editField, setEditField] = signal<keyof Client | null>(null);
  
  // Авто-сохранение с debounce через watch()
  watch(() => editValue(), (newValue) => {
    if (editField() && newValue) {
      sendDiff({ 
        [editField()!]: newValue, 
        updated_at: new Date().toISOString() 
      } as Partial<Client>);
      cardService.setJustUpdated(editField()!);
    }
  }, { debounce: 500 });

  // Render редактируемого поля с auto-binding и авто-save
  const renderEditableField = (field: keyof Client, label: string, value: string) => {
    const isEditing = cardService.editing === field;
    const isJustUpdatedField = cardService.justUpdated === field;
    
    const handleEdit = () => {
      cardService.setEditing(field);
      cardService.setEditValue(value);
    };
    
    const handleCancel = () => {
      // Отменяем pending авто-сохранение через cancel (если поддерживается)
      cardService.setEditing(null);
      cardService.setEditValue('');
    };
    
    const handleChange = (newValue: string) => {
      // Обновляем реактивное значение - watch() автоматически вызовет авто-сохранение с debounce
      setEditField(field);
      setEditValue(newValue);
      cardService.setEditValue(newValue);
    };

      return (
        <Stack direction="row" space={2} align="center">
          <Text design={{ minWidth: '80px', fontWeight: 'bold' }}>{label}:</Text>
          {isEditing ? (
            <Stack direction="row" space={2} align="center">
              <ViraInput
                model={`clientCard-${clientId}.editValue`}
                onChange={(e) => handleChange(e.target.value)}
                autoFocus
                design={{
                  border: isJustUpdatedField ? '2px solid #10b981' : undefined,
                  transition: 'all 0.3s',
                }}
              />
              <Text design={{ fontSize: '0.75rem', color: '#6b7280' }}>
                Авто-сохранение...
              </Text>
              <ViraButton
                preset="ghost"
                size="small"
                action={handleCancel}
              >
                ✕
              </ViraButton>
            </Stack>
          ) : (
            <Text
              design={{
                cursor: 'pointer',
                padding: '4px 8px',
                borderRadius: '4px',
                backgroundColor: isJustUpdatedField ? '#d1fae5' : 'transparent',
                transition: 'all 0.3s',
                border: isJustUpdatedField ? '1px solid #10b981' : '1px solid transparent',
              }}
              onClick={handleEdit}
              title="Кликните для редактирования"
            >
              {value || '—'}
            </Text>
          )}
        </Stack>
      );
  };

  return (
    <Card
      design={{
        padding: 16,
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        transition: 'all 0.3s',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        '&:hover': {
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          transform: 'translateY(-2px)',
        },
      }}
    >
      <Stack space={3}>
        <Stack direction="row" space={2} align="center" justify="space-between">
          <Stack direction="row" space={2} align="center">
            {renderEditableField('name', '', client.name)}
            <Tag color={status.color as any}>{status.label}</Tag>
          </Stack>
          <ViraButton
            preset="ghost"
            size="small"
            action={() => onDelete?.(client.id)}
            design={{ color: '#ef4444' }}
          >
            🗑️
          </ViraButton>
        </Stack>

        <Stack space={2}>
          {renderEditableField('email', '📧 Email', client.email)}
          {renderEditableField('phone', '📞 Phone', client.phone)}
        </Stack>

        <Stack direction="row" space={2} align="center" justify="space-between">
          <Text design={{ fontSize: '0.875rem', color: '#6b7280' }}>
            Создан: {new Date(client.created_at).toLocaleDateString()}
          </Text>
          {client.updated_at !== client.created_at && (
            <Badge>Обновлён</Badge>
          )}
        </Stack>
      </Stack>
    </Card>
  );
}
```

### 7.3 Создаём страницу списка клиентов с поиском, фильтрами и real-time уведомлениями

```bash
npm run vira generate page Clients --interactive
# → Use Vira UI? Yes
```

Редактируем `frontend/src/pages/ClientsPage.tsx`:

```typescript
import { createElement, signal, computed, useSignal, useComputed } from '@vira-ui/core';
import { useViraState } from '@vira-ui/react';
import { ViraButton } from '@vira-ui/bindings-react';
import { 
  Container, Stack, Heading, Button, Text, SearchInput, FilterGroup, 
  Toast, ToastContainer, toast, EmptyState, Tag, Badge, Checkbox 
} from '@vira-ui/ui';
import { ViraVirtualList } from '@vira-ui/bindings-react';
import { useClient } from '../services/ClientService';
import { ClientCard } from '../components/ClientCard';
import type { Client } from '../vira-types';

// Создаём сервис для управления состоянием страницы (поиск, фильтры, выбор)
createService('clientsPage', () => ({
  searchQuery: '',
  statusFilter: 'all',
  selectedIds: new Set<string>(),
  
  setSearchQuery(value: string) {
    this.searchQuery = value;
  },
  
  setStatusFilter(value: string) {
    this.statusFilter = value;
  },
  
  toggleSelect(id: string) {
    if (this.selectedIds.has(id)) {
      this.selectedIds.delete(id);
    } else {
      this.selectedIds.add(id);
    }
  },
  
  selectAll(ids: string[]) {
    if (this.selectedIds.size === ids.length) {
      this.selectedIds.clear();
    } else {
      this.selectedIds = new Set(ids);
    }
  },
  
  clearSelection() {
    this.selectedIds.clear();
  },
}));

// Компонент страницы с использованием Vira сервисов (БЕЗ React hooks - только Vira!)
export function ClientsPage() {
  // VRP для списка клиентов
  const { data: clientsList, create, sendEvent } = useClient();
  
  // VRP для real-time уведомлений
  const notificationsState = useViraState<{ 
    type: 'client.created' | 'client.updated' | 'client.deleted';
    client: Client;
    timestamp: string;
  }[]>('notifications:clients', []);

  // Используем сервис страницы (реактивно через Vira Core DI)
  const pageService = useService('clientsPage');
  
  // Обработка уведомлений (реактивно через VRP)
  if (notificationsState.data && notificationsState.data.length > 0) {
    const lastNotification = notificationsState.data[notificationsState.data.length - 1];
    if (lastNotification.type === 'client.created') {
      toast.success(`✨ Новый клиент: ${lastNotification.client.name}`, {
        duration: 3000,
      });
    }
  }

  // Преобразуем данные в массив
  const allClients = clientsList 
    ? (Array.isArray(clientsList) ? clientsList : Object.values(clientsList))
    : [];

  // 🎯 Используем computed() из @vira-ui/core для реактивной фильтрации и поиска
  // computed() автоматически пересчитывается при изменении searchQuery или statusFilter
  const filteredClients = computed(() => {
    let result = allClients;
    const query = pageService.searchQuery;
    const filter = pageService.statusFilter;

    // Поиск
    if (query) {
      const lowerQuery = query.toLowerCase();
      result = result.filter(client =>
        client.name.toLowerCase().includes(lowerQuery) ||
        client.email.toLowerCase().includes(lowerQuery) ||
        client.phone?.toLowerCase().includes(lowerQuery)
      );
    }

    // Фильтр по статусу
    if (filter !== 'all') {
      result = result.filter(client => {
        const daysSinceCreation = Math.floor(
          (Date.now() - new Date(client.created_at).getTime()) / (1000 * 60 * 60 * 24)
        );
        if (filter === 'new') return daysSinceCreation < 7;
        if (filter === 'active') return daysSinceCreation >= 7 && daysSinceCreation < 30;
        if (filter === 'old') return daysSinceCreation >= 30;
        return true;
      });
    }

    return result;
  });

  // Используем useComputed() для получения реактивного значения в компоненте
  const filtered = useComputed(filteredClients);

  // ✅ Используем сгенерированный bulk сервис (CLI создал его автоматически!)
  const handleBulkUpdate = () => {
    const ids = Array.from(pageService.selectedIds);
    bulkService.bulkUpdate(ids, { note: 'Массовое обновление' }, sendEvent);
    toast.success(`Обновлено клиентов: ${ids.length}`);
    pageService.clearSelection();
  };

  const handleBulkDelete = () => {
    const ids = Array.from(pageService.selectedIds);
    bulkService.bulkDelete(ids, sendEvent);
    toast.success(`Удалено клиентов: ${ids.length}`);
    pageService.clearSelection();
  };

  // ✅ create() уже генерирует UUID автоматически (встроено в CLI шаблон)
  const handleCreate = () => {
    create({
      name: 'Новый клиент',
      email: `client${Date.now()}@example.com`,
      phone: `+7${Math.floor(Math.random() * 1000000000)}`,
    });
  };

  const handleDelete = (id: string) => {
    sendEvent('client.deleted', { id });
    toast.info('Клиент удалён');
  };

  return (
    <Container design={{ padding: 24, maxWidth: '1400px', margin: '0 auto' }}>
      <Stack space={4}>
        {/* Header */}
        <Stack direction="row" space={3} align="center" justify="space-between">
          <Stack space={1}>
            <Heading design={{ fontSize: '2rem', fontWeight: 'bold' }}>
              Клиенты
            </Heading>
            <Text design={{ color: '#6b7280' }}>
              Всего: {allClients.length} • Показано: {filtered().length}
            </Text>
          </Stack>
          <ViraButton preset="primary" action={handleCreate}>
            ➕ Добавить клиента
          </ViraButton>
        </Stack>

        {/* Поиск и фильтры с auto-binding через Vira Core */}
        <Stack direction="row" space={3} align="center">
          <SearchInput
            model="clientsPage.searchQuery"
            placeholder="Поиск по имени, email, телефону..."
            design={{ flex: 1 }}
          />
          <FilterGroup
            model="clientsPage.statusFilter"
            options={[
              { value: 'all', label: 'Все' },
              { value: 'new', label: 'Новые' },
              { value: 'active', label: 'Активные' },
              { value: 'old', label: 'Просроченные' },
            ]}
          />
        </Stack>

        {/* Bulk actions */}
        {pageService.selectedIds.size > 0 && (
          <Container
            design={{
              padding: 12,
              backgroundColor: '#eff6ff',
              borderRadius: '8px',
              border: '1px solid #3b82f6',
            }}
          >
            <Stack direction="row" space={3} align="center">
              <Text design={{ fontWeight: 'bold' }}>
                Выбрано: {pageService.selectedIds.size}
              </Text>
              <ViraButton
                preset="primary"
                size="small"
                action={handleBulkUpdate}
              >
                Обновить все
              </ViraButton>
              <ViraButton
                preset="danger"
                size="small"
                action={handleBulkDelete}
              >
                Удалить все
              </ViraButton>
              <ViraButton 
                preset="ghost" 
                size="small" 
                action={() => pageService.clearSelection()}
              >
                Отмена
              </ViraButton>
            </Stack>
          </Container>
        )}

        {/* Список клиентов */}
        {filtered().length > 0 ? (
          <Stack space={2}>
            {/* Select all */}
            <Checkbox
              checked={pageService.selectedIds.size === filtered().length && filtered().length > 0}
              onChange={() => pageService.selectAll(filtered().map(c => c.id))}
              label="Выбрать все"
            />
            
            {/* Виртуализированный список для больших объёмов */}
            {filtered().length > 50 ? (
              <ViraVirtualList
                items={filtered()}
                itemHeight={200}
                renderItem={(client: Client) => (
                  <Stack key={client.id} direction="row" space={2} align="center">
                    <Checkbox
                      checked={pageService.selectedIds.has(client.id)}
                      onChange={() => pageService.toggleSelect(client.id)}
                    />
                    <ClientCard 
                      clientId={client.id} 
                      onDelete={handleDelete}
                    />
                  </Stack>
                )}
              />
            ) : (
              <Stack space={3}>
                {filtered().map((client: Client) => (
                  <Stack key={client.id} direction="row" space={2} align="center">
                    <Checkbox
                      checked={pageService.selectedIds.has(client.id)}
                      onChange={() => pageService.toggleSelect(client.id)}
                    />
                    <ClientCard 
                      clientId={client.id} 
                      onDelete={handleDelete}
                    />
                  </Stack>
                ))}
              </Stack>
            )}
          </Stack>
        ) : (
          <EmptyState
            title={query ? 'Ничего не найдено' : 'Нет клиентов'}
            description={
              query
                ? 'Попробуйте изменить параметры поиска'
                : 'Создайте первого клиента для начала работы'
            }
          />
        )}
      </Stack>

      <ToastContainer />
    </Container>
  );
}
```

### 7.4 Создаём роут

```bash
npm run vira generate route clients
```

Редактируем `frontend/src/routes/clients.ts`:

```typescript
import { reactiveRoute } from '@vira-ui/core';
import { ClientsPage } from '../pages/ClientsPage';

export const clientsRoute = reactiveRoute({
  path: '/clients',
  component: ClientsPage,
});
```

---

## 🗄️ Шаг 8: Создаём миграцию БД

```bash
cd crm-app
npm run vira make migration create-clients
```

Редактируем `migrations/YYYYMMDDHHMMSS_create-clients.up.sql`:

```sql
-- +goose Up
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_clients_email ON clients(email);
```

Редактируем `migrations/YYYYMMDDHHMMSS_create-clients.down.sql`:

```sql
-- +goose Down
DROP TABLE IF EXISTS clients;
```

---

## 🚀 Шаг 9: Запуск проекта

### Запускаем backend

```bash
cd backend
go run ./cmd/api
```

Backend будет доступен на `http://localhost:8080`

### Запускаем frontend

```bash
cd frontend
npm run dev
```

Frontend будет доступен на `http://localhost:5173`

### Открываем в браузере

Откройте `http://localhost:5173/clients` и увидите страницу клиентов!

---

## 🔥 Дополнительные фичи (опционально)

### Timeline событий по клиенту

Создаём компонент для отображения истории изменений:

```bash
npm run vira generate component ClientTimeline --interactive --vrp
```

`frontend/src/components/ClientTimeline.tsx`:

```typescript
import { useViraState } from '@vira-ui/react';
import { Timeline, TimelineItem } from '@vira-ui/ui';
import type { Client } from '../vira-types';

interface ClientEvent {
  type: 'created' | 'updated' | 'deleted';
  user: string;
  timestamp: string;
  changes?: Record<string, { from: any; to: any }>;
}

export function ClientTimeline({ clientId }: { clientId: string }) {
  const { data: events } = useViraState<ClientEvent[]>(
    `client:${clientId}:events`,
    []
  );

  const timelineItems: TimelineItem[] = (events || []).map(event => ({
    title: {
      created: 'Клиент создан',
      updated: 'Клиент обновлён',
      deleted: 'Клиент удалён',
    }[event.type],
    description: `${event.user} • ${new Date(event.timestamp).toLocaleString()}`,
    timestamp: event.timestamp,
    color: {
      created: 'success',
      updated: 'info',
      deleted: 'error',
    }[event.type] as any,
  }));

  return <Timeline items={timelineItems} />;
}
```

### Backend: обработка событий и логирование

Обновляем `backend/internal/events/client_created.go`:

```go
package events

import (
  "context"
  "encoding/json"
  "github.com/gorilla/websocket"
  "time"
)

func ClientCreated(ctx context.Context, hub EventEmitter, conn *websocket.Conn, msg WSMessage) {
  var payload map[string]any
  if len(msg.Data) > 0 {
    _ = json.Unmarshal(msg.Data, &payload)
  }

  // Сохраняем событие в БД
  // TODO: implement database logging

  // Emit update to VRP channel
  hub.Emit(ChannelCustom("client", ""), payload)

  // Уведомления
  hub.Emit(ChannelCustom("notifications", "clients"), map[string]any{
    "type": "client.created",
    "client": payload,
    "timestamp": time.Now().Format(time.RFC3339),
  })
}
```

### Интеграция с Telegram (опционально)

В `backend/internal/events/client_created.go`:

```go
// Отправка уведомления в Telegram
func sendTelegramNotification(message string) {
  // TODO: implement Telegram bot integration
  // bot.SendMessage(chatID, message)
}
```

### Экспорт в Google Sheets (опционально)

Создаём сервис:

```bash
npm run vira generate service Export --no-vrp
```

`frontend/src/services/ExportService.ts`:

```typescript
export const ExportService = {
  async exportToSheets(clients: Client[]) {
    // TODO: implement Google Sheets API integration
    const csv = clients.map(c => 
      `${c.name},${c.email},${c.phone}`
    ).join('\n');
    
    // Trigger download
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `clients-${Date.now()}.csv`;
    a.click();
  },
};
```

---

## 🎯 Что получилось

✅ **Fullstack приложение** с разделением frontend/backend  
✅ **VRP интеграция** — реальное время синхронизации состояния  
✅ **Inline-редактирование** — клик и редактируй прямо в карточке  
✅ **Real-time уведомления** — мгновенные оповещения о новых клиентах  
✅ **Поиск и фильтрация** — живой поиск по всем полям  
✅ **Bulk actions** — массовое обновление и удаление  
✅ **Виртуализация** — оптимизация для больших списков  
✅ **Визуальные индикации** — статусы, анимации, подсветка изменений  
✅ **Type-safe** — синхронизация типов из Go в TypeScript  
✅ **Готовая инфраструктура** — Docker, база данных, Redis, Kafka  
✅ **Архитектура по стандартам Vira** — сервисы, компоненты, hooks  

---

## 🔥 Следующие шаги

Теперь у вас есть полнофункциональная CRM! Можете добавить:

1. **Формы создания/редактирования** — используйте `ViraForm` из `@vira-ui/bindings-react`
2. **Расширенная валидация** — добавьте правила в модели
3. **Пагинация на backend** — для больших объёмов данных
4. **Timeline событий** — история изменений каждого клиента
5. **Экспорт/импорт** — CSV, Excel, Google Sheets
6. **Интеграции** — Telegram, Email уведомления
7. **Тесты** — `npm run vira generate test ClientCard`
8. **Аналитика** — статистика и графики

---

## 💡 Полезные команды

```bash
# Генерация компонента с VRP
npm run vira generate component ProductCard --interactive --vrp

# Генерация сервиса без VRP
npm run vira generate service Product --no-vrp

# Валидация проекта
npm run vira validate

# Синхронизация типов после изменений в Go
npm run vira sync --types

# Генерация CRUD handlers
npm run vira make crud product

# Создание event handler
npm run vira make event product.created
```

---

## 🆘 Проблемы?

### База данных не подключается
```bash
# Проверьте, что Docker контейнеры запущены
cd deploy
docker compose -f docker-compose.dev.yml ps
```

### Типы не синхронизируются
```bash
# Убедитесь, что Go структуры имеют json теги
# Затем запустите
npm run vira sync --types
```

### VRP не работает
```bash
# Проверьте, что WebSocket endpoint доступен
# Проверьте конфигурацию в backend/config/app.yaml
```

---

## ✨ Что мы изучили

В этом Quickstart мы:

1. ✅ Создали **fullstack проект** с готовой инфраструктурой
2. ✅ Настроили **backend** с Go моделями и CRUD handlers
3. ✅ Реализовали **VRP интеграцию** для real-time синхронизации
4. ✅ Синхронизировали **типы** между Go и TypeScript
5. ✅ Создали **React компоненты** с использованием Vira UI
6. ✅ Применили **лучшие практики** архитектуры Vira

---

## 🚀 Улучшения встроены в CLI

**Все продвинутые техники автоматически генерируются CLI!** Вам не нужно писать их вручную:

### 1️⃣ Авто-генерация UUID на фронте ✅
- **CLI генерирует** метод `create()` с автоматической генерацией UUID в каждом VRP сервисе
- Встроено в `vira generate service --vrp`
- Зависимость `uuid` добавляется автоматически в package.json

### 2️⃣ Сервис для bulk actions с VRP ✅
- **CLI создаёт** `${name}Bulk` сервис автоматически для каждого ресурса
- Методы `bulkUpdate` и `bulkDelete` готовы к использованию
- Достаточно вызвать `useService('clientBulk')` в компоненте

### 3️⃣ Универсальный VRP hook для списков ✅
- **CLI генерирует** `useVrpList<T>` в каждом VRP сервисе
- Используется автоматически в `useClient()` и других hooks
- Работает для любых сущностей из коробки (клиенты, продукты, заказы)

### 4️⃣ Inline-редактирование с авто-save ✅
- **CLI использует** встроенный `watch()` с `debounce` из `@vira-ui/core`
- Не нужна зависимость `lodash` — всё встроено в Vira Core!
- `watch()` лучше подходит для реактивных значений, чем `debounceServiceMethod`
- Используйте `signal()` для редактируемых значений и `watch()` для авто-сохранения

### 5️⃣ VRP notifications: очередь с максимумом ✅
- **CLI создаёт** `MAX_NOTIFICATIONS = 5` в шаблонах страниц
- Лимит очереди применяется автоматически
- Пример обработки уже в сгенерированном коде `vira generate page`

### 6️⃣ DevOps: quickstart через один npm скрипт ✅
- **CLI создаёт** `start:dev` в корневом package.json для fullstack проектов
- Одна команда `npm run start:dev` запускает весь проект
- Всё настроено автоматически при `vira create --template fullstack`

**Итог:** Просто используйте `vira generate` — все улучшения уже там! 🎉  
**Никакого ручного кода** — CLI делает всё за вас.

### 💡 Дополнительные возможности Vira Core

**Vira Core** предоставляет дополнительные оптимизации, которые можно использовать:

- **`watch()`** с `debounce`/`throttle` — используется в шаблонах для авто-save (лучше чем `debounceServiceMethod` для реактивных значений!)
- **`debounceServiceMethod()`** / **`throttleServiceMethod()`** — для методов сервисов
- **`createServiceCache`** — кэширование результатов методов сервисов
- **`createLazyService`** — ленивая загрузка сервисов
- **`createReactiveService`** — автоматически применяется ко всем сервисам (встроено!)

Все сервисы, созданные через `createService`, автоматически становятся реактивными и обновляют компоненты при изменениях. 🚀

---

## 🚀 Production-Ready улучшения

Хотите подготовить CRM к production с реальной нагрузкой?

👉 **[Перейти к Production-Ready чеклисту →](PRODUCTION.md)**

Там вы найдёте:
- ✅ Пагинация, кеширование, валидация на backend
- ✅ Оптимизация frontend для больших списков
- ✅ Мониторинг, логирование, CI/CD
- ✅ Docker, Health checks, Metrics

---

## 🎓 Ключевые концепции

### Vira Reactive Protocol (VRP)
- **WebSocket-based** протокол для синхронизации состояния
- **Server-authoritative** — сервер является источником истины
- **Real-time** — изменения синхронизируются мгновенно

### Архитектура Vira
- **Services** — бизнес-логика (DI container)
- **Hooks** — React интеграция (useViraState)
- **Components** — UI компоненты (@vira-ui/ui)
- **VRP Channels** — каналы для синхронизации состояния

### Type Safety
- **Go → TypeScript** автоматическая синхронизация типов
- **Единый источник истины** — типы определяются в Go
- **Компиляционная проверка** типов на всех уровнях

---

<div align="center">

**Готово! 🎉** Вы создали полноценную CRM страницу с VRP интеграцией!

**Следующий шаг:** Добавьте формы, валидацию и больше функциональности!

[⬅️ Назад к README](README.md)

</div>

