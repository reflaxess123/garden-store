#!/usr/bin/env python3
"""
Современная генерация API клиента через Orval
"""

import subprocess
import sys
from pathlib import Path

from generate_openapi import generate_openapi_schema


def generate_modern_client() -> bool:
    """Генерирует современный API клиент через Orval"""
    print("🚀 Генерация современного API клиента через Orval")
    print("=" * 60)

    # Шаг 1: Генерируем OpenAPI схему
    print("\n📋 Шаг 1: Генерация OpenAPI схемы...")
    schema_file = generate_openapi_schema()
    if not schema_file:
        print("❌ Не удалось сгенерировать OpenAPI схему")
        return False

    # Шаг 2: Запускаем Orval в фронтенде
    print("\n🎯 Шаг 2: Генерация TypeScript клиента через Orval...")
    try:
        # Переходим в папку фронтенда и запускаем Orval
        front_dir = Path(__file__).parent.parent / "front"

        result = subprocess.run(["npm", "run", "generate:api"], cwd=front_dir, capture_output=True, text=True)

        print(result.stdout)
        if result.stderr:
            print(result.stderr)

        if result.returncode != 0:
            print("❌ Ошибка при генерации клиента через Orval")
            return False

    except Exception as e:
        print(f"❌ Ошибка при запуске Orval: {e}")
        return False

    print("\n✅ Генерация завершена успешно!")
    print("\n🎉 Что было создано:")
    print("  ✨ Сгенерирована OpenAPI схема (openapi.json)")
    print("  🔥 Создан современный TypeScript клиент через Orval")
    print("  💪 Полная типизация без any")
    print("  🚀 TanStack Query хуки для всех эндпоинтов")
    print("  📁 Файлы сохранены в front/src/shared/api/generated/")

    print("\n📚 Преимущества Orval над кастомным генератором:")
    print("  ❌ НЕТ any типов")
    print("  ✅ Автоматическая типизация")
    print("  ✅ Поддержка TanStack Query")
    print("  ✅ Валидация параметров")
    print("  ✅ Обработка ошибок")
    print("  ✅ Auto-complete в IDE")

    print("\n🔄 Для обновления клиента запустите:")
    print("  cd back && python generate_modern_client.py")

    return True


if __name__ == "__main__":
    success = generate_modern_client()
    sys.exit(0 if success else 1)
