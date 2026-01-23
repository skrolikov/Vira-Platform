# Showcase Backend

Backend API для Vira-UI Showcase на Go с Kafka, Redis и PostgreSQL.

## 🏗️ Архитектура

- **Go 1.21+** - основной язык
- **Gin** - HTTP фреймворк
- **PostgreSQL** - основная БД
- **Redis** - кеширование
- **Kafka** - event streaming
- **Docker Compose** - оркестрация

## 🚀 Быстрый старт

### 1. Запуск через Docker Compose

```bash
cd packages/showcase-back
docker-compose up -d
```

Это запустит:
- PostgreSQL на порту 5432
- Redis на порту 6379
- Kafka на порту 9092
- API сервер на порту 8080

### 2. Локальный запуск (без Docker)

```bash
# Установка зависимостей
go mod download

# Создание .env файла
cp .env.example .env

# Запуск сервера
go run cmd/api/main.go
```

Убедитесь, что PostgreSQL, Redis и Kafka запущены локально.

## 📁 Структура проекта

```
showcase-back/
├── cmd/
│   └── api/
│       └── main.go          # Точка входа
├── internal/
│   ├── handlers/            # HTTP handlers
│   ├── models/              # Модели данных
│   └── services/            # Бизнес-логика
├── pkg/
│   ├── config/              # Конфигурация
│   ├── database/            # PostgreSQL клиент
│   ├── kafka/               # Kafka клиент
│   └── redis/               # Redis клиент
├── docker-compose.yml
├── Dockerfile
├── go.mod
└── README.md
```

## 🔌 API Endpoints

### Orders

- `GET /api/orders` - Список заказов
  - Query: `?include_deleted=true` - включить удаленные
- `GET /api/orders/:id` - Получить заказ по ID
- `POST /api/orders` - Создать заказ
- `PUT /api/orders/:id` - Обновить заказ
- `PATCH /api/orders/:id/status` - Обновить статус
- `DELETE /api/orders/:id` - Удалить заказ (soft delete)
- `POST /api/orders/:id/restore` - Восстановить заказ

### Примеры запросов

```bash
# Создать заказ
curl -X POST http://45.90.35.155/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "client_name": "Иван Иванов",
    "product": "Продукт A",
    "amount": 15000
  }'

# Получить все заказы
curl http://45.90.35.155/api/orders

# Обновить статус
curl -X PATCH http://45.90.35.155/api/orders/{id}/status \
  -H "Content-Type: application/json" \
  -d '{"status": "success"}'
```

## 🔄 Kafka Events

Backend публикует события в топик `orders`:

- `order.created` - заказ создан
- `order.updated` - заказ обновлен
- `order.status_changed` - статус изменен
- `order.deleted` - заказ удален
- `order.restored` - заказ восстановлен

## 🔗 Интеграция с Vira-Core

Backend готов к интеграции с `@vira-ui/core`:

1. **REST API** - стандартные HTTP endpoints
2. **Event-driven** - события через Kafka
3. **Reactive** - можно подписаться на события через WebSocket (TODO)

## 🛠️ Разработка

```bash
# Запуск с hot reload (требует air или аналогичный инструмент)
air

# Тестирование
go test ./...

# Линтинг
golangci-lint run
```

## 📝 TODO

- [ ] WebSocket для real-time обновлений
- [ ] JWT аутентификация
- [ ] GraphQL endpoint
- [ ] Metrics и monitoring
- [ ] Rate limiting
- [ ] Unit и интеграционные тесты

