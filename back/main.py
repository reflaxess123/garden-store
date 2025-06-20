import json
import os
from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager
from decimal import Decimal

import redis
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

import app.env_setup
from app.db.database import check_database_connection
from app.routers import auth, cart, categories, chat, favorites, notifications, orders, products
from app.routers.admin import router as admin_router


class CustomJsonEncoder(json.JSONEncoder):
    def default(self, obj: object) -> str | float:
        if isinstance(obj, Decimal):
            return float(obj)
        return json.JSONEncoder.default(self, obj)


# Загружаем переменные окружения из .env если файл существует (для разработки)
env_file = os.path.join(os.path.dirname(__file__), ".env")
if os.path.exists(env_file):
    load_dotenv(env_file)
    print("Загружены переменные окружения из .env файла")
else:
    print("Используются переменные окружения из системы")

print("DATABASE_URL:", "***" if os.getenv("DATABASE_URL") else "НЕ ЗАДАН")
print("REDIS_URL:", "***" if os.getenv("REDIS_URL") else "НЕ ЗАДАН")


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    # Проверяем подключение к базе данных при запуске
    print("🔄 Проверка подключения к базе данных...")
    db_connected = await check_database_connection()
    if not db_connected:
        print("⚠️  Предупреждение: Не удалось подключиться к базе данных при запуске")
    yield
    # Cleanup при завершении приложения
    print("🔄 Завершение работы приложения...")


app = FastAPI(lifespan=lifespan)

# CORS configuration
origins = [
    "http://localhost:3000",  # Next.js frontend для разработки
    "http://127.0.0.1:3000",
    "http://frontend:3000",  # Docker контейнер фронтенда
    "http://37.252.23.87",  # Дополнительный сервер
    "https://37.252.23.87",  # Дополнительный сервер (HTTPS)
]

# Добавляем внешние домены из переменных окружения для продакшена
external_origins = os.getenv("EXTERNAL_ORIGINS", "").split(",")
for origin in external_origins:
    if origin.strip():
        origins.append(origin.strip())

print("Разрешенные CORS origins:", origins)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api")
app.include_router(admin_router, prefix="/api")
app.include_router(cart.router, prefix="/api")
app.include_router(categories.router, prefix="/api")
app.include_router(products.router, prefix="/api")
app.include_router(orders.router, prefix="/api")
app.include_router(favorites.router, prefix="/api")
app.include_router(notifications.router)  # Без префикса, так как уже есть в роутах
app.include_router(chat.router)  # Без префикса, так как у него есть и API и WebSocket


@app.get("/health")
async def health_check() -> dict[str, str]:
    db_status = "unknown"
    redis_status = "unknown"

    # Тест подключения к PostgreSQL через новую функцию
    try:
        db_connected = await check_database_connection()
        db_status = "OK" if db_connected else "Connection failed"
    except Exception as e:
        db_status = f"Error: {e}"

    # Тест подключения к Redis
    try:
        # Используем REDIS_URL напрямую
        redis_url = os.getenv("REDIS_URL")
        if redis_url:
            r = redis.from_url(redis_url)
            r.ping()
            print("Redis: подключение успешно!")
            redis_status = "OK"
        else:
            redis_status = "REDIS_URL not set"
    except Exception as e:
        redis_status = f"Error: {e}"

    return {"database": db_status, "redis": redis_status}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="localhost", port=4000, reload=True)

# Удален блок if __name__ == "__main__":
# Пользователь будет запускать сервер FastAPI вручную.
