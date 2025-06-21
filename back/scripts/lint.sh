#!/bin/bash
set -e

echo "🔍 Запуск линтера (Ruff)..."
poetry run ruff check .

echo "✅ Линтер завершен!"
