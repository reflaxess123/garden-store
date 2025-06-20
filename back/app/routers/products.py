from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload
from app.db.database import get_db
from app.db import models
from app.schemas import ProductInDB
from typing import List, Optional
import uuid
from sqlalchemy import select, or_, and_

router = APIRouter()

@router.get("/products/bestsellers", response_model=List[ProductInDB])
async def get_bestsellers(db: AsyncSession = Depends(get_db), limit: int = 10):
    bestsellers = (
        (await db.execute(select(models.Product)
        .options(joinedload(models.Product.category))
        .order_by(models.Product.times_ordered.desc())
        .limit(limit))).scalars().all()
    )
    return bestsellers

@router.get("/products/slug/{product_slug}", response_model=ProductInDB)
async def get_product_by_slug(
    product_slug: str, db: AsyncSession = Depends(get_db)
):
    product = (
        (await db.execute(select(models.Product)
        .options(joinedload(models.Product.category))
        .filter(models.Product.slug == product_slug))).scalar_one_or_none()
    )
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@router.get("/products/category/{category_slug}", response_model=List[ProductInDB])
async def get_products_by_category_slug(
    category_slug: str, 
    db: AsyncSession = Depends(get_db),
    limit: Optional[int] = Query(None, description="Количество товаров для загрузки"),
    offset: Optional[int] = Query(0, description="Смещение для пагинации"),
    search_query: Optional[str] = Query(None, alias="searchQuery", description="Поисковый запрос"),
    sort_by: Optional[str] = Query(None, alias="sortBy", description="Поле для сортировки"),
    sort_order: Optional[str] = Query("asc", alias="sortOrder", description="Порядок сортировки"),
    min_price: Optional[float] = Query(None, alias="minPrice", description="Минимальная цена"),
    max_price: Optional[float] = Query(None, alias="maxPrice", description="Максимальная цена"),
    categoryFilter: Optional[str] = Query(None),
    inStock: Optional[bool] = Query(None),
    hasDiscount: Optional[bool] = Query(None)
):
    query = select(models.Product).options(joinedload(models.Product.category))
    
    # Если category_slug == "all", получаем все товары
    if category_slug != "all":
        category = (await db.execute(select(models.Category).filter(models.Category.slug == category_slug))).scalar_one_or_none()
        if not category:
            return []
        query = query.filter(models.Product.category_id == category.id)
    
    # Фильтрация по максимальной цене
    if max_price is not None:
        query = query.filter(models.Product.price <= max_price)

    # Фильтрация по наличию
    if inStock is not None and inStock:
        query = query.filter(models.Product.stock > 0)

    # Фильтрация по скидке
    if hasDiscount is not None and hasDiscount:
        query = query.filter(models.Product.discount_percentage > 0)

    # Фильтрация по категориям (используется только для categorySlug == "all")
    if category_slug == "all" and categoryFilter:
        category_ids = categoryFilter.split(',')
        query = query.filter(models.Product.category_id.in_(category_ids))

    # Поиск по названию и описанию
    if search_query:
        search_filter = or_(
            models.Product.name.ilike(f"%{search_query}%"),
            models.Product.description.ilike(f"%{search_query}%")
        )
        query = query.filter(search_filter)
    
    # Фильтрация по цене
    if min_price is not None:
        query = query.filter(models.Product.price >= min_price)
    
    # Сортировка
    if sort_by:
        if sort_by == "name":
            order_field = models.Product.name
        elif sort_by == "price":
            order_field = models.Product.price
        elif sort_by == "createdAt":
            order_field = models.Product.created_at
        else:
            order_field = models.Product.created_at
            
        if sort_order == "desc":
            query = query.order_by(order_field.desc())
        else:
            query = query.order_by(order_field.asc())
    
    # Пагинация
    if offset:
        query = query.offset(offset)
    if limit:
        query = query.limit(limit)
    
    products = (await db.execute(query)).scalars().all()
    return products

@router.get("/products/{product_id}", response_model=ProductInDB)
async def get_product_by_id(
    product_id: uuid.UUID, db: AsyncSession = Depends(get_db)
):
    product = (
        (await db.execute(select(models.Product)
        .options(joinedload(models.Product.category))
        .filter(models.Product.id == product_id))).scalar_one_or_none()
    )
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product 