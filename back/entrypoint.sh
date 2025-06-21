#!/bin/bash
set -e

# Функция для логирования
log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1"
}

log "Запуск entrypoint.sh..."

# Проверяем наличие основных переменных окружения
if [ -z "$DATABASE_URL" ]; then
    log "ВНИМАНИЕ: DATABASE_URL не задан"
fi

if [ -z "$REDIS_URL" ]; then
    log "ВНИМАНИЕ: REDIS_URL не задан"
fi

# Создаем директории для логов и загрузок
mkdir -p /app/logs
mkdir -p /app/uploads

# Меняем владельца на пользователя app
chown -R app:app /app

log "Переключение на пользователя app..."

# Запускаем команду от пользователя app
exec gosu app "$@"
