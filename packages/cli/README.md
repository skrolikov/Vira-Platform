# @vira-ui/cli

CLI инструмент для генерации проектов и кода на основе Vira Framework.

## 📦 Установка

```bash
npm install -g @vira-ui/cli
```

Или используйте через `npx`:

```bash
npx @vira-ui/cli create my-project
```

## 🚀 Быстрый старт

### Создание нового проекта

```bash
# Интерактивный режим
vira create my-project

# С указанием шаблона
vira create my-project --template frontend
vira create my-project --template fullstack
vira create my-project --template kanban
```

### Инициализация в текущей директории

```bash
vira init
vira init --template frontend
```

## 📚 Команды

### Создание проектов

#### `vira create <name>`

Создает новый проект в указанной директории.

**Опции:**
- `-t, --template <template>` - Шаблон проекта (`frontend`, `fullstack`, `kanban`)

**Примеры:**
```bash
vira create my-app
vira create my-app --template fullstack
```

#### `vira init`

Инициализирует проект в текущей директории.

**Опции:**
- `-t, --template <template>` - Шаблон проекта

**Примеры:**
```bash
vira init
vira init --template frontend
```

### Генерация кода

#### `vira generate <type> <name>`

Генерирует компоненты, сервисы, страницы и другие артефакты.

**Типы:**
- `component` / `comp` - React компонент
- `service` - Сервис с DI
- `page` - Страница
- `model` - Модель данных
- `route` - Роут
- `test` - Тест

**Опции:**
- `-d, --dir <directory>` - Директория для вывода (по умолчанию: `src`)
- `-i, --interactive` - Интерактивный режим
- `--vrp` - Использовать Vira Reactive Protocol
- `--no-vrp` - Не использовать VRP

**Примеры:**
```bash
# Компонент
vira generate component Button
vira generate component UserCard --interactive
vira generate component TaskList --vrp

# Сервис
vira generate service user
vira generate service task --vrp --interactive

# Страница
vira generate page Dashboard
vira generate page Users --dir src/pages

# Модель
vira generate model User
vira generate model Product --dir src/models

# Роут
vira generate route users
vira generate route dashboard --dir src/routes

# Тест
vira generate test Button
vira generate test UserService
```

### Backend scaffolding (Go)

#### `vira make handler <name>`

Создает Go HTTP handler.

**Опции:**
- `-d, --dir <directory>` - Целевая директория

**Пример:**
```bash
vira make handler user
vira make handler product --dir backend/internal/handlers
```

#### `vira make migration <name>`

Создает SQL миграцию (up/down).

**Опции:**
- `-d, --dir <directory>` - Директория миграций (по умолчанию: `migrations`)

**Пример:**
```bash
vira make migration create-users
vira make migration add-email-to-users --dir backend/migrations
```

#### `vira make event <name>`

Создает Go event handler stub.

**Опции:**
- `-d, --dir <directory>` - Целевая директория

**Пример:**
```bash
vira make event user.created
vira make event task.updated --dir backend/internal/events
```

#### `vira make model <name>`

Создает Go model struct.

**Опции:**
- `-d, --dir <directory>` - Целевая директория
- `-f, --fields <fields>` - Поля через запятую (например: `name:string,email:string`)

**Примеры:**
```bash
vira make model User
vira make model Product --fields "name:string,price:number,description:string"
vira make model Client --dir backend/internal/models
```

#### `vira make crud <name>`

Создает CRUD handlers для ресурса.

**Опции:**
- `-d, --dir <directory>` - Целевая директория
- `-m, --model <model>` - Имя модели (по умолчанию: капитализированное имя ресурса)

**Пример:**
```bash
vira make crud user
vira make crud product --model Product
```

### Работа с базой данных

#### `vira db migrate`

Выполняет миграции базы данных.

**Опции:**
- `-d, --dir <directory>` - Директория миграций
- `--db-url <url>` - URL подключения к БД
- `--driver <driver>` - Драйвер БД (`postgres`, `mysql`, `sqlite3`)

**Пример:**
```bash
vira db migrate
vira db migrate --db-url postgres://user:pass@localhost/dbname
vira db migrate --driver mysql
```

#### `vira db rollback`

Откатывает последнюю миграцию.

**Пример:**
```bash
vira db rollback
vira db rollback --db-url postgres://user:pass@localhost/dbname
```

#### `vira db status`

Показывает статус миграций.

**Пример:**
```bash
vira db status
```

### VRP (Vira Reactive Protocol)

#### `vira proto validate`

Валидирует схему VRP протокола.

**Опции:**
- `--file <path>` - Путь к файлу типов

**Пример:**
```bash
vira proto validate
vira proto validate --file backend/internal/types/types.go
```

#### `vira proto generate`

Генерирует документацию по VRP каналам.

**Опции:**
- `--file <path>` - Путь к файлу типов
- `--output <path>` - Директория для вывода

**Пример:**
```bash
vira proto generate
vira proto generate --output docs
```

### Синхронизация типов

#### `vira sync`

Синхронизирует TypeScript типы из Go structs.

**Опции:**
- `--types` - Синхронизировать типы (по умолчанию: true)
- `--backend <path>` - Путь к Go файлу типов
- `--from-models` - Генерировать из директории моделей
- `--models <path>` - Путь к директории моделей
- `--frontend <path>` - Путь для вывода TS типов (frontend)
- `--ui <path>` - Путь для вывода TS типов (ui)
- `-w, --watch` - Watch режим (автоматическая синхронизация)

**Примеры:**
```bash
# Синхронизация из types.go
vira sync --types

# Синхронизация из директории моделей
vira sync --types --from-models

# Watch режим
vira sync --types --watch
```

### Валидация проекта

#### `vira validate`

Валидирует структуру проекта и конфигурацию.

**Пример:**
```bash
vira validate
```

### Генерация документации

#### `vira doc`

Генерирует документацию CLI команд.

**Пример:**
```bash
vira doc
```

## 📋 Шаблоны проектов

### Frontend

React + Vite + Vira UI проект:

```bash
vira create my-app --template frontend
```

**Структура:**
```
my-app/
├── src/
│   ├── components/
│   ├── services/
│   ├── pages/
│   ├── models/
│   └── main.tsx
├── package.json
├── vite.config.ts
└── tsconfig.json
```

### Fullstack

Frontend + Go Backend + Docker:

```bash
vira create my-app --template fullstack
```

**Структура:**
```
my-app/
├── frontend/        # React приложение
├── backend/         # Go backend
├── ui/              # UI пакет
├── migrations/      # SQL миграции
└── deploy/          # Docker compose файлы
```

### Kanban

Reference приложение с VRP:

```bash
vira create kanban-app --template kanban
```

Демонстрирует использование Vira Reactive Protocol для real-time синхронизации.

## 🎯 Примеры использования

### Создание компонента с VRP

```bash
vira generate component TaskCard --vrp --interactive
```

Интерактивно создаст компонент с интеграцией VRP.

### Создание сервиса

```bash
vira generate service user --vrp
```

Создаст сервис с поддержкой VRP для синхронизации состояния.

### Создание CRUD API

```bash
# Backend: Go handlers
vira make crud user

# Frontend: Service
vira generate service user --vrp

# Frontend: Page
vira generate page Users
```

### Синхронизация типов

```bash
# После изменения Go моделей
vira sync --types --from-models

# TypeScript типы автоматически обновятся в frontend/src/vira-types.ts
```

## 🔧 Конфигурация

CLI автоматически определяет структуру проекта. Для кастомизации можно использовать:

- `.vira.json` - Конфигурационный файл (планируется)
- Переменные окружения для путей
- Опции командной строки

## 📖 Примеры генерации

### Компонент с props

```bash
vira generate component Button --interactive
```

Интерактивно спросит:
- Нужны ли props?
- Какие props?
- Использовать VRP?
- Использовать Vira UI?

### Сервис с VRP

```bash
vira generate service task --vrp
```

Создаст сервис с:
- VRP интеграцией
- CRUD методами
- Bulk операциями
- Автоматической синхронизацией

## 🐛 Troubleshooting

### Проблемы с миграциями

Если миграции не выполняются:

1. Проверьте `DATABASE_URL` в `.env`
2. Убедитесь, что `goose` установлен: `go install github.com/pressly/goose/v3/cmd/goose@latest`
3. Проверьте права доступа к БД

### Проблемы с синхронизацией типов

Если типы не синхронизируются:

1. Проверьте путь к Go файлам: `vira sync --backend backend/internal/types/types.go`
2. Используйте `--from-models` для генерации из директории моделей
3. Проверьте формат Go structs

## 📄 License

MIT

## 🔗 Связанные пакеты

- [`@vira-ui/core`](../core/README.md) - Базовый фреймворк
- [`@vira-ui/ui`](../ui/README.md) - UI компоненты
- [`@vira-ui/react`](../react/README.md) - React хуки для VRP

