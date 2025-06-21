.PHONY: help install lint format type-check test all-checks

help: ## Показать помощь
	@echo "Доступные команды:"
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)

install: ## Установить зависимости
	poetry install

lint: ## Запустить линтер (ruff)
	poetry run ruff check .

lint-fix: ## Исправить ошибки линтера автоматически
	poetry run ruff check . --fix

format: ## Отформатировать код (black)
	poetry run black .

format-check: ## Проверить форматирование без изменений
	poetry run black . --check

type-check: ## Проверить типы (mypy)
	poetry run mypy .

test: ## Запустить тесты
	poetry run pytest

all-checks: lint format-check type-check ## Запустить все проверки
	@echo "✅ Все проверки пройдены!"

fix-all: lint-fix format ## Исправить все автоматически исправимые проблемы
	@echo "✅ Код отформатирован и исправлен!"

dev: ## Запустить сервер разработки
	poetry run python main.py

prod: ## Запустить продакшн сервер
	poetry run uvicorn main:app --host 0.0.0.0 --port 8000
