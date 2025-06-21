"""Admin category management routes"""

import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth import get_current_admin_user
from app.db import models
from app.db.database import get_db
from app.schemas import CategoryCreate, CategoryInDB, CategoryUpdate, CustomUser

router = APIRouter()


@router.get("/admin/categories", response_model=list[CategoryInDB])
async def get_admin_categories(
    db: AsyncSession = Depends(get_db), current_user: CustomUser = Depends(get_current_admin_user)
) -> list[CategoryInDB]:
    """Получить все категории для админа"""
    result = await db.execute(select(models.Category))
    categories = result.scalars().all()
    return [CategoryInDB.model_validate(cat, from_attributes=True) for cat in categories]


@router.post("/admin/categories", response_model=CategoryInDB, status_code=status.HTTP_201_CREATED)
async def create_admin_category(
    category_in: CategoryCreate,
    db: AsyncSession = Depends(get_db),
    current_user: CustomUser = Depends(get_current_admin_user),
) -> CategoryInDB:
    """Создать новую категорию"""
    result = await db.execute(select(models.Category).filter(models.Category.slug == category_in.slug))
    db_category = result.scalars().first()
    if db_category:
        raise HTTPException(status_code=400, detail="Category with this slug already exists")

    db_category = models.Category(
        name=category_in.name,
        slug=category_in.slug,
        description=category_in.description,
        image_url=category_in.imageUrl,
    )
    db.add(db_category)
    await db.commit()
    await db.refresh(db_category)
    return CategoryInDB.model_validate(db_category, from_attributes=True)


@router.patch("/admin/categories/{category_id}", response_model=CategoryInDB)
async def update_admin_category(
    category_id: uuid.UUID,
    category_in: CategoryUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: CustomUser = Depends(get_current_admin_user),
) -> CategoryInDB:
    """Обновить категорию"""
    result = await db.execute(select(models.Category).filter(models.Category.id == category_id))
    db_category = result.scalars().first()
    if not db_category:
        raise HTTPException(status_code=404, detail="Category not found")

    update_data = category_in.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        if key == "imageUrl":
            db_category.image_url = value
        else:
            setattr(db_category, key, value)

    db.add(db_category)
    await db.commit()
    await db.refresh(db_category)
    return CategoryInDB.model_validate(db_category, from_attributes=True)


@router.delete("/admin/categories/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_admin_category(
    category_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: CustomUser = Depends(get_current_admin_user),
) -> None:
    """Удалить категорию"""
    result = await db.execute(select(models.Category).filter(models.Category.id == category_id))
    db_category = result.scalars().first()
    if not db_category:
        raise HTTPException(status_code=404, detail="Category not found")

    await db.delete(db_category)
    await db.commit()


@router.get("/admin/categories/{category_id}", response_model=CategoryInDB)
async def get_admin_category(
    category_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: CustomUser = Depends(get_current_admin_user),
) -> CategoryInDB:
    """Получить категорию по ID"""
    result = await db.execute(select(models.Category).filter(models.Category.id == category_id))
    category = result.scalars().first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    return CategoryInDB.model_validate(category, from_attributes=True)
