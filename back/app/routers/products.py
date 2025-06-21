import uuid
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload
from sqlalchemy.sql import Select

from app.db import models
from app.db.database import get_db
from app.schemas import ProductInDB

router = APIRouter()


def _apply_price_filters(query: Select, min_price: Optional[float], max_price: Optional[float]) -> Select:
    """Применить фильтры по цене"""
    if max_price is not None:
        query = query.filter(models.Product.price <= max_price)
    if min_price is not None:
        query = query.filter(models.Product.price >= min_price)
    return query


def _apply_stock_and_discount_filters(query: Select, in_stock: Optional[bool], has_discount: Optional[bool]) -> Select:
    """Применить фильтры по наличию и скидке"""
    if in_stock is not None and in_stock:
        query = query.filter(models.Product.stock > 0)
    if has_discount is not None and has_discount:
        query = query.filter(models.Product.discount_percentage > 0)
    return query


def _apply_search_filter(query: Select, search_query: Optional[str]) -> Select:
    """Применить поисковый фильтр"""
    if search_query:
        search_filter = or_(
            models.Product.name.ilike(f"%{search_query}%"), models.Product.description.ilike(f"%{search_query}%")
        )
        query = query.filter(search_filter)
    return query


def _apply_sorting(query: Select, sort_by: Optional[str], sort_order: Optional[str]) -> Select:
    """Применить сортировку"""
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
    return query


def _apply_pagination(query: Select, offset: Optional[int], limit: Optional[int]) -> Select:
    """Применить пагинацию"""
    if offset:
        query = query.offset(offset)
    if limit:
        query = query.limit(limit)
    return query


@router.get("/products/bestsellers", response_model=list[ProductInDB])
async def get_bestsellers(db: AsyncSession = Depends(get_db), limit: int = 10) -> list[ProductInDB]:
    bestsellers = (
        (
            await db.execute(
                select(models.Product)
                .options(joinedload(models.Product.category))
                .order_by(models.Product.times_ordered.desc())
                .limit(limit)
            )
        )
        .scalars()
        .all()
    )
    return list(bestsellers)


@router.get("/products/slug/{product_slug}", response_model=ProductInDB)
async def get_product_by_slug(product_slug: str, db: AsyncSession = Depends(get_db)) -> ProductInDB:
    product = (
        await db.execute(
            select(models.Product)
            .options(joinedload(models.Product.category))
            .filter(models.Product.slug == product_slug)
        )
    ).scalar_one_or_none()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


@router.get("/products/category/{category_slug}", response_model=list[ProductInDB])
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
    category_filter: Optional[str] = Query(None, alias="categoryFilter"),
    in_stock: Optional[bool] = Query(None, alias="inStock"),
    has_discount: Optional[bool] = Query(None, alias="hasDiscount"),
) -> list[ProductInDB]:
    query = select(models.Product).options(joinedload(models.Product.category))

    # Фильтрация по категории
    if category_slug != "all":
        category = (
            await db.execute(select(models.Category).filter(models.Category.slug == category_slug))
        ).scalar_one_or_none()
        if not category:
            return []
        query = query.filter(models.Product.category_id == category.id)

    # Фильтрация по категориям (используется только для categorySlug == "all")
    if category_slug == "all" and category_filter:
        category_ids = category_filter.split(",")
        query = query.filter(models.Product.category_id.in_(category_ids))

    # Применяем фильтры через вспомогательные функции
    query = _apply_price_filters(query, min_price, max_price)
    query = _apply_stock_and_discount_filters(query, in_stock, has_discount)
    query = _apply_search_filter(query, search_query)
    query = _apply_sorting(query, sort_by, sort_order)
    query = _apply_pagination(query, offset, limit)

    products = (await db.execute(query)).scalars().all()
    return list(products)


@router.get("/products/{product_id}", response_model=ProductInDB)
async def get_product_by_id(product_id: uuid.UUID, db: AsyncSession = Depends(get_db)) -> ProductInDB:
    product = (
        await db.execute(
            select(models.Product).options(joinedload(models.Product.category)).filter(models.Product.id == product_id)
        )
    ).scalar_one_or_none()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product
