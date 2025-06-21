#!/usr/bin/env python3
"""
Скрипт для генерации OpenAPI схемы из FastAPI приложения
"""

import json
import os
import sys
from pathlib import Path

# Добавляем текущую директорию в PYTHONPATH
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))


def generate_openapi_schema() -> Path | None:
    """Генерирует OpenAPI схему и сохраняет её в файл"""
    try:
        # Импортируем приложение
        from main import app

        # Генерируем OpenAPI схему
        openapi_schema = app.openapi()

        # Обновляем информацию о сервере
        openapi_schema["servers"] = [
            {"url": "https://server.sadovnick.store", "description": "Production server"},
            {"url": "http://localhost:4000", "description": "Development server"},
        ]

        # Путь для сохранения схемы
        schema_file = Path(__file__).parent / "openapi.json"

        # Сохраняем схему в файл
        with open(schema_file, "w", encoding="utf-8") as f:
            json.dump(openapi_schema, f, indent=2, ensure_ascii=False)

        print(f"OpenAPI схема успешно сгенерирована: {schema_file}")
        print(f"Найдено эндпоинтов: {len(openapi_schema.get('paths', {}))}")

        # Выводим список всех эндпоинтов
        paths = openapi_schema.get("paths", {})
        print("\nСписок эндпоинтов:")
        for path, methods in paths.items():
            for method, details in methods.items():
                summary = details.get("summary", "No summary")
                print(f"  {method.upper()} {path} - {summary}")

        return schema_file

    except Exception as e:
        print(f"Ошибка при генерации OpenAPI схемы: {e}")
        return None


if __name__ == "__main__":
    generate_openapi_schema()
