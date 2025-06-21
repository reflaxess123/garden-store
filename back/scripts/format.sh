#!/bin/bash
set -e

echo "🎨 Форматирование кода (Black)..."
poetry run black .

echo "🔧 Автоисправление линтера (Ruff)..."
poetry run ruff check . --fix

echo "✅ Форматирование завершено!"
