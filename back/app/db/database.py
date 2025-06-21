import logging
import os
from collections.abc import AsyncGenerator

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.ext.declarative import declarative_base

# Настройка логгирования
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise ValueError("DATABASE_URL is not set in the .env file")

# Создаем движок с расширенными параметрами для устранения timeout ошибок
engine = create_async_engine(
    DATABASE_URL,
    echo=True,
    # Параметры пула соединений
    pool_size=5,
    max_overflow=10,
    pool_timeout=30,
    pool_recycle=3600,
    pool_pre_ping=True,
    # Параметры подключения asyncpg
    connect_args={
        "command_timeout": 60,
        "server_settings": {
            "application_name": "garden_store_backend",
        },
    },
)

AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)

Base = declarative_base()


async def check_database_connection() -> bool:
    """Проверка подключения к базе данных"""
    try:
        async with engine.begin() as conn:
            await conn.execute(text("SELECT 1"))
        logger.info("✅ Подключение к базе данных успешно")
        return True
    except Exception as e:
        logger.error(f"❌ Ошибка подключения к базе данных: {e}")
        return False


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as db:
        try:
            yield db
        except Exception as e:
            # Не перехватываем HTTPException - они должны пройти дальше
            from fastapi import HTTPException

            if isinstance(e, HTTPException):
                raise
            logger.error(f"Ошибка в сессии базы данных: {e}")
            await db.rollback()
            raise
        finally:
            await db.close()
