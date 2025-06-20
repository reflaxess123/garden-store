# Используем Ubuntu вместо python:3.11-slim для обхода rate limit
FROM ubuntu:22.04

# Устанавливаем рабочую директорию
WORKDIR /app

# Устанавливаем системные зависимости и Python
RUN apt-get update && apt-get install -y \
    python3.11 \
    python3.11-dev \
    python3.11-venv \
    python3-pip \
    gcc \
    g++ \
    libpq-dev \
    procps \
    passwd \
    gosu \
    curl \
    && rm -rf /var/lib/apt/lists/* \
    && ln -s /usr/bin/python3.11 /usr/bin/python \
    && ln -s /usr/bin/python3.11 /usr/bin/python3

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

# Команда запуска, которая будет передана в entrypoint
# Она будет выполнена от пользователя app, как указано в entrypoint.sh
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "4000"] 