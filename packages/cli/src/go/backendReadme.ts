export const backendReadme = `# Vira Engine Backend (stub)

- HTTP сервер на :8080 с chi, middleware (RequestID, RealIP, Recoverer, логирование)
- Контекст: reqID (Request-ID), userID из X-User-ID
- Конфиги: config/app.yaml, db.yaml, redis.yaml, kafka.yaml (PORT/LOG_LEVEL/DB_*/REDIS_*/KAFKA_* env override)
- DB: pgx pool, sqlc.yaml scaffold (queries/, migrations/)
- Redis: go-redis v9 клиент с health/ping
- Kafka: kafka-go клиент, health/ping, writer/reader factory
- Docker: multi-stage Dockerfile для API, docker-compose.prod.yml (API+PG+Redis+Kafka)
- Дальнейшее: расширить хендлеры, миграции, Kafka outbox, Redis cache
- TODO: OTEL exporter (traces/logs/metrics)

## Быстрый старт
go run ./cmd/api
`;