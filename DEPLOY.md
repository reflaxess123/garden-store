# Инструкции по деплою Garden Store

## Проблемы и решения

### 1. Docker Hub Rate Limit

**Проблема**: `429 Too Many Requests - You have reached your unauthenticated pull rate limit`

**Решения**:

1. **Подождать час** - лимит сбрасывается автоматически
2. **Использовать Docker Hub аккаунт** - войти в Docker Hub в Dokploy
3. **Повторить деплой** - образ Ubuntu:22.04 более популярен и может быть кэширован

### 2. Отсутствующие переменные окружения

**Проблема**: `The "SECRET_KEY" variable is not set`

**Решение**: В настройках Dokploy добавить переменные окружения:

```
DATABASE_URL=postgresql+asyncpg://postgres:uanqn9afuuhpu6xl@103.74.93.55:5432/postgres
REDIS_URL=redis://default:lbfq1i9miuhxr3jf@103.74.93.55:6379
SECRET_KEY=your-super-secret-jwt-key-change-this-in-production-12345
DEBUG=false
NEXT_PUBLIC_API_URL=http://185.21.13.91:4001
BACKEND_URL=http://backend:4000
```

**ВАЖНО**: Замените `SECRET_KEY` на случайную строку длиной минимум 32 символа!

## Генерация SECRET_KEY

Используйте один из способов:

```bash
# Python
python -c "import secrets; print(secrets.token_urlsafe(32))"

# OpenSSL
openssl rand -base64 32

# Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

## Порты

- **Backend**: 4001 (внешний) → 4000 (внутренний)
- **Frontend**: 3003 (внешний) → 3000 (внутренний)

## URLs

- **Frontend**: http://185.21.13.91:3003
- **Backend API**: http://185.21.13.91:4001
- **API Docs**: http://185.21.13.91:4001/docs

## Healthcheck

Приложение включает healthcheck endpoints:

- Backend: `GET /health`
- Frontend: `GET /` (Next.js проверка)

## Volumes

- `../files/backend-logs` - логи бэкенда
- `../files/backend-uploads` - загруженные файлы

## Сеть

Все сервисы работают в изолированной сети `garden-store-network`.

## Пошаговый деплой

1. **Добавить переменные окружения** в Dokploy
2. **Сгенерировать SECRET_KEY** и добавить его
3. **Запустить деплой** (может потребоваться несколько попыток из-за rate limit)
4. **Проверить логи** на наличие ошибок
5. **Протестировать endpoints**
