import logging
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import models
from app.db.database import get_db
from app.schemas import CategoryInDB

# Настройка логгирования
logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/categories", response_model=list[CategoryInDB])
async def get_categories(slug: Optional[str] = None, db: AsyncSession = Depends(get_db)) -> list[CategoryInDB]:
    try:
        logger.info(f"Запрос категорий, slug: {slug}")

        if slug and slug != "all":
            logger.info(f"Поиск категории по slug: {slug}")
            result = await db.execute(select(models.Category).filter(models.Category.slug == slug))
            category = result.scalar_one_or_none()
            if not category:
                logger.warning(f"Категория с slug '{slug}' не найдена")
                raise HTTPException(status_code=404, detail="Category not found")
            logger.info(f"Найдена категория: {category.name}")
            return [category]

        logger.info("Получение всех категорий")
        result = await db.execute(select(models.Category))
        categories = result.scalars().all()
        logger.info(f"Получено {len(categories)} категорий")
        return list(categories)

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Ошибка при получении категорий: {e}")
        logger.error(f"Тип ошибки: {type(e).__name__}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ошибка сервера при получении категорий: {str(e)}",
        ) from e
