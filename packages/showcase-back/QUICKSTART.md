# 🚀 Быстрый старт

## 1. Запуск инфраструктуры (Docker Compose)

```bash
docker-compose up -d
```

Это запустит:
- ✅ PostgreSQL (порт 5432)
- ✅ Redis (порт 6379)
- ✅ Kafka + Zookeeper (порт 9092)

## 2. Запуск API сервера

### Вариант A: Локально
```bash
go run cmd/api/main.go
```

### Вариант B: Через Makefile
```bash
make run
```

### Вариант C: Docker
```bash
docker-compose up api
```

## 3. Проверка работы

```bash
# Health check
curl http://localhost:8080/health

# Получить все заказы
curl http://localhost:8080/api/orders

# Создать заказ
curl -X POST http://localhost:8080/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "client_name": "Иван Иванов",
    "product": "Продукт A",
    "amount": 15000
  }'
```

## 📝 Переменные окружения

Создайте `.env` файл на основе `.env.example`:

```bash
cp .env.example .env
```

Или создайте вручную - все значения по умолчанию уже настроены для локальной разработки.

## 🔗 Интеграция с фронтендом

Backend готов к работе с `@vira-ui/showcase`:

- API: `http://localhost:8080/api`
- CORS настроен для `http://localhost:5173` (Vite dev server)
- Все endpoints RESTful

## 🎯 Следующие шаги

1. Подключить фронтенд к API
2. Добавить WebSocket для real-time обновлений
3. Интегрировать с vira-core через события Kafka

