.PHONY: help lint lint-front lint-back format format-back type-check install-hooks

help: ## Показать эту справку
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

install-hooks: ## Установить pre-commit хуки
	pre-commit install

lint: ## Запустить все линтеры (фронт + бэк)
	pre-commit run --all-files

lint-front: ## Запустить линтер фронтенда
	cd front && npm run lint

lint-back: ## Запустить линтер бэкенда
	cd back && poetry run ruff check .

format-back: ## Отформатировать код бэкенда
	cd back && poetry run ruff format .

type-check: ## Проверить типы TypeScript
	cd front && npm run type-check

test-hooks: ## Протестировать pre-commit хуки
	pre-commit run --all-files

update-hooks: ## Обновить pre-commit хуки
	pre-commit autoupdate
