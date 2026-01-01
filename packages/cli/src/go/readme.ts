export const readme = `# Vira Engine Monorepo (scaffold)

Структура:
- frontend/ — Vite + Vira UI приложение
- backend/ — Go API (стаб)
- ui/ — Vira UI пакет/шоукейсы (vite)
- cli/ — CLI расширения/плагины
- plugins/ — интеграции
- migrations/ — SQL/Go миграции
- deploy/ — docker-compose/devops артефакты

Next steps:
  cd my-vira-app/frontend
  npm install
  npm run dev

UI package:
  cd ../ui
  npm install
  npm run dev

Backend stub:
  cd ../backend
  go mod tidy
  go run ./cmd/api

Dev stack (DB/Redis/Kafka):
  cd ../deploy && docker compose -f docker-compose.dev.yml up`;