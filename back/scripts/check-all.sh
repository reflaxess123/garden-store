#!/bin/bash
set -e

echo "🚀 Запуск всех проверок..."

echo ""
echo "1️⃣ Проверка форматирования..."
poetry run black . --check

echo ""
echo "2️⃣ Линтинг..."
poetry run ruff check .

echo ""
echo "3️⃣ Проверка типов..."
poetry run mypy .

echo ""
echo "4️⃣ Тесты..."
poetry run pytest

echo ""
echo "✅ Все проверки пройдены успешно!"
