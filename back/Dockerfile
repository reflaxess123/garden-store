# Используем официальный Python образ вместо Ubuntu для избежания rate limit
FROM python:3.11-slim

# Устанавливаем рабочую директорию
WORKDIR /app

# Устанавливаем системные зависимости
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    libpq-dev \
    procps \
    passwd \
    gosu \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Устанавливаем Poetry
RUN pip install poetry

# Копируем файлы зависимостей
COPY pyproject.toml poetry.lock ./

# Конфигурируем Poetry
RUN poetry config virtualenvs.create false \
    && poetry install --without dev --no-interaction --no-ansi --no-root

# Копируем исходный код приложения (исключая .env через .dockerignore)
COPY . .

# Копируем и настраиваем entrypoint
COPY entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/entrypoint.sh

# Создаем непривилегированного пользователя
RUN useradd --create-home --shell /bin/bash app \
    && chown -R app:app /app

# Устанавливаем entrypoint. Он будет запущен от root.
ENTRYPOINT ["entrypoint.sh"]

# Открываем порт
EXPOSE 4000

# Команда запуска, которая будет выполнена от пользователя app
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "4000"]
