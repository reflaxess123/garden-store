#!/usr/bin/env python3
"""
Главный скрипт для генерации OpenAPI схемы и клиента для фронта
"""
import subprocess
import sys
import os
from pathlib import Path

def run_script(script_name: str) -> bool:
    """Запускает скрипт и возвращает True если успешно"""
    try:
        result = subprocess.run(
            ["python", script_name],
            cwd=Path(__file__).parent,
            capture_output=True,
            text=True
        )
        
        print(result.stdout)
        if result.stderr:
            print(result.stderr)
        
        return result.returncode == 0
    except Exception as e:
        print(f"❌ Ошибка при запуске {script_name}: {e}")
        return False

def main():
    """Главная функция"""
    print("Генерация OpenAPI схемы и клиента для фронта")
    print("=" * 60)
    
    # Шаг 1: Генерируем OpenAPI схему
    print("\nШаг 1: Генерация OpenAPI схемы...")
    if not run_script("generate_openapi.py"):
        print("Не удалось сгенерировать OpenAPI схему")
        return False
    
    # Шаг 2: Генерируем клиент для фронта  
    print("\nШаг 2: Генерация TypeScript клиента...")
    if not run_script("generate_client.py"):
        print("Не удалось сгенерировать клиент")
        return False
    
    print("\nГенерация завершена успешно!")
    print("\nЧто было сделано:")
    print("  - Сгенерирована OpenAPI схема (openapi.json)")
    print("  - Созданы TypeScript типы")
    print("  - Создан API клиент с TanStack Query хуками")
    print("  - Файлы сохранены в front/src/shared/api/generated/")
    
    print("\nДля обновления клиента запустите:")
    print("  cd back && python generate_all.py")
    
    return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1) 