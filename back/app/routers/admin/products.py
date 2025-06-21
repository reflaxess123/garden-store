"""Admin product management routes"""

import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload

from app.auth import get_current_admin_user
from app.db import models
from app.db.database import get_db
from app.schemas import CustomUser, ProductCreate, ProductInDB, ProductOfflineUpdate, ProductUpdate

router = APIRouter()


@router.get("/admin/products", response_model=list[ProductInDB])
async def get_admin_products(
    db: AsyncSession = Depends(get_db), current_user: CustomUser = Depends(get_current_admin_user)
) -> list[ProductInDB]:
    """Получить все продукты для админа"""
    result = await db.execute(select(models.Product).options(joinedload(models.Product.category)))
    products = result.scalars().unique().all()
    return [ProductInDB.model_validate(prod, from_attributes=True) for prod in products]


@router.post("/admin/products", response_model=ProductInDB, status_code=status.HTTP_201_CREATED)
async def create_admin_product(
    product_in: ProductCreate,
    db: AsyncSession = Depends(get_db),
    current_user: CustomUser = Depends(get_current_admin_user),
) -> ProductInDB:
    """Создать новый продукт"""
    result = await db.execute(select(models.Product).filter(models.Product.slug == product_in.slug))
    db_product = result.scalars().first()
    if db_product:
        raise HTTPException(status_code=400, detail="Product with this slug already exists")

    db_product = models.Product(
        name=product_in.name,
        slug=product_in.slug,
        description=product_in.description,
        price=product_in.price,
        discount=product_in.discount,
        characteristics=product_in.characteristics,
        image_url=product_in.imageUrl,
        category_id=product_in.categoryId,
    )
    db.add(db_product)
    await db.commit()
    await db.refresh(db_product)

    # Загружаем продукт заново с категорией для корректной сериализации
    result = await db.execute(
        select(models.Product).options(joinedload(models.Product.category)).filter(models.Product.id == db_product.id)
    )
    db_product_with_category = result.scalars().first()
    return ProductInDB.model_validate(db_product_with_category, from_attributes=True)


@router.get("/admin/products/{product_id}", response_model=ProductInDB)
async def get_admin_product(
    product_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: CustomUser = Depends(get_current_admin_user),
) -> ProductInDB:
    """Получить продукт по ID"""
    result = await db.execute(
        select(models.Product).options(joinedload(models.Product.category)).filter(models.Product.id == product_id)
    )
    product = result.scalars().first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return ProductInDB.model_validate(product, from_attributes=True)


@router.delete("/admin/products/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_admin_product(
    product_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: CustomUser = Depends(get_current_admin_user),
) -> None:
    """Удалить продукт"""
    result = await db.execute(select(models.Product).filter(models.Product.id == product_id))
    db_product = result.scalars().first()
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")

    await db.delete(db_product)
    await db.commit()


@router.patch("/admin/products/{product_id}", response_model=ProductInDB)
async def update_admin_product(
    product_id: uuid.UUID,
    product_in: ProductUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: CustomUser = Depends(get_current_admin_user),
) -> ProductInDB:
    """Обновить продукт"""
    result = await db.execute(select(models.Product).filter(models.Product.id == product_id))
    db_product = result.scalars().first()
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")

    update_data = product_in.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        if key == "imageUrl":
            db_product.image_url = value
        elif key == "categoryId":
            db_product.category_id = value
        else:
            setattr(db_product, key, value)

    db.add(db_product)
    await db.commit()
    await db.refresh(db_product)

    # Загружаем продукт заново с категорией для корректной сериализации
    result = await db.execute(
        select(models.Product).options(joinedload(models.Product.category)).filter(models.Product.id == product_id)
    )
    db_product_with_category = result.scalars().first()
    return ProductInDB.model_validate(db_product_with_category, from_attributes=True)


@router.patch("/admin/products/{product_id}/offline", response_model=ProductInDB)
async def update_product_offline_purchases(
    product_id: uuid.UUID,
    offline_update: ProductOfflineUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: CustomUser = Depends(get_current_admin_user),
) -> ProductInDB:
    """Обновить количество оффлайн покупок и заказов продукта"""
    result = await db.execute(select(models.Product).filter(models.Product.id == product_id))
    db_product = result.scalars().first()
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")

    db_product.offline_purchases = offline_update.offlinePurchases
    if offline_update.timesOrdered is not None:
        db_product.times_ordered = offline_update.timesOrdered

    db.add(db_product)
    await db.commit()
    await db.refresh(db_product)

    # Загружаем продукт с категорией для корректной сериализации
    result = await db.execute(
        select(models.Product).options(joinedload(models.Product.category)).filter(models.Product.id == product_id)
    )
    db_product_with_category = result.scalars().first()
    return ProductInDB.model_validate(db_product_with_category, from_attributes=True)
