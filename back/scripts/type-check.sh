#!/bin/bash
set -e

echo "🔍 Проверка типов (MyPy)..."
poetry run mypy .

echo "✅ Проверка типов завершена!"
