# Production Setup Guide

Этот документ описывает настройку production-ready монорепо для Vira UI.

## ✅ Что уже настроено

### 1. **pnpm Workspaces**
- ✅ `pnpm-workspace.yaml` настроен
- ✅ `.npmrc` с правильными настройками
- ✅ Все пакеты используют `workspace:*` для внутренних зависимостей

### 2. **Changesets**
- ✅ Конфигурация в `.changeset/config.json`
- ✅ Independent versioning (каждый пакет версионируется отдельно)
- ✅ README с инструкциями в `.changeset/README.md`

### 3. **CI/CD**
- ✅ GitHub Actions workflow для CI (`.github/workflows/ci.yml`)
- ✅ GitHub Actions workflow для Release (`.github/workflows/release.yml`)
- ✅ Автоматическая проверка changesets в PR
- ✅ Автоматический релиз при мерже в `main`

### 4. **Пакеты**
- ✅ Все пакеты имеют `publishConfig: { access: "public" }`
- ✅ Правильные зависимости между пакетами
- ✅ Все скрипты используют `pnpm` вместо `npm`

## 🚀 Следующие шаги

### 1. Установка зависимостей

```bash
# Установите pnpm, если еще не установлен
npm install -g pnpm@8.15.0

# Установите зависимости
pnpm install
```

### 2. Настройка NPM для публикации

#### 2.1. Создание scope в npm

Scope `@vira-ui` должен существовать в npm. Есть два варианта:

**Вариант A: Создать организацию в npm (рекомендуется)**
1. Перейдите на https://www.npmjs.com/org/create
2. Создайте организацию с именем `vira-ui`
3. Добавьте себя как владельца

**Вариант B: Использовать личный scope**
Если вы не хотите создавать организацию, измените scope в `package.json` всех пакетов на ваш username:
- Замените `@vira-ui/` на `@your-username/` во всех `package.json`

#### 2.2. Настройка NPM Token для CI

**КРИТИЧЕСКИ ВАЖНО:** Для CI/CD нужен **Automation Token**, а не обычный токен!

В GitHub репозитории:
1. Перейдите в Settings → Secrets and variables → Actions
2. Добавьте `NPM_TOKEN` с вашим npm токеном
3. **Создайте Automation Token:**
   - Перейдите на https://www.npmjs.com/settings/YOUR_USERNAME/tokens
   - Нажмите "Generate New Token"
   - Выберите тип **"Automation"** (НЕ "Publish"!)
   - Automation токены не требуют 2FA и работают в CI/CD
4. **Важно:** 
   - Automation токен не требует одноразового пароля (OTP)
   - Если используете организацию, убедитесь, что токен имеет доступ к организации
   - Обычные токены (Publish) требуют 2FA и не работают в CI/CD

### 3. Первый релиз

```bash
# 1. Создайте changeset для первого релиза
pnpm changeset

# 2. Закоммитьте изменения
git add .
git commit -m "chore: update"

# 3. Запушьте в main
git push origin main
```

CI автоматически:
- Создаст PR с обновлением версий (если есть changesets)
- После мержа PR опубликует пакеты в npm

**Важно:** Changesets публикует только те пакеты, версии которых еще не опубликованы в npm. Если пакет уже опубликован с той же версией, он не будет опубликован повторно.

### 4. Работа с изменениями

При каждом изменении, которое нужно опубликовать:

```bash
# Создайте changeset
pnpm changeset

# Выберите пакеты и тип изменения (major/minor/patch)
# Добавьте описание изменений

# Закоммитьте
git add .changeset/
git commit -m "feat: add new feature"
git push
```

## 📦 Структура зависимостей

```
@vira-ui/core (базовый, без зависимостей)
  ↓
@vira-ui/ui (независимый, только React)
  ↓
@vira-ui/react (зависит от core)
  ↓
@vira-ui/bindings-react (зависит от core + ui)
```

## 🔧 Полезные команды

```bash
# Сборка всех пакетов
pnpm build

# Разработка с watch
pnpm dev

# Type checking
pnpm typecheck

# Тесты
pnpm test

# Сборка конкретного пакета
pnpm --filter @vira-ui/core build

# Создание changeset
pnpm changeset

# Ручной релиз (обычно не нужно, CI делает это)
pnpm version  # Обновить версии
pnpm release  # Опубликовать
```

## 🎯 Versioning Strategy

Используется **independent versioning**:
- Каждый пакет версионируется независимо
- `@vira-ui/core` может быть `1.2.0`, а `@vira-ui/ui` может быть `1.0.5`
- Changesets автоматически обновляют версии на основе изменений

## 🔐 Публикация

Все пакеты публикуются как **public** пакеты в npm:
- `@vira-ui/core`
- `@vira-ui/ui`
- `@vira-ui/react`
- `@vira-ui/bindings-react`
- `@vira-ui/cli`
- `@vira-ui/babel-plugin`

## 📝 Workflow

1. **Разработка**: Создайте ветку, внесите изменения
2. **Changeset**: Добавьте changeset с `pnpm changeset`
3. **PR**: Создайте PR, CI проверит changeset
4. **Мерж**: После мержа в `main`, CI создаст version PR
5. **Релиз**: После мержа version PR, пакеты опубликуются

## ⚠️ Важные замечания

1. **Не коммитьте `pnpm-lock.yaml` в `.gitignore** - он должен быть в репозитории
2. **Всегда используйте `pnpm`**, не `npm` или `yarn`
3. **Changesets обязательны** для любых изменений, которые нужно опубликовать
4. **Не публикуйте вручную** - используйте CI workflow

## 🐛 Troubleshooting

### Проблемы с workspace зависимостями

Если пакеты не находят друг друга:
```bash
pnpm install --force
```

### Проблемы с версионированием

Если changesets не работают:
```bash
# Убедитесь, что changesets установлены
pnpm install

# Проверьте конфигурацию
cat .changeset/config.json
```

### Проблемы с публикацией

Убедитесь, что:
- `NPM_TOKEN` настроен в GitHub Secrets
- Вы авторизованы в npm: `npm whoami`
- Пакеты имеют правильный `publishConfig`
