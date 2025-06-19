from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload
from app.db.database import get_db
from app.db import models
from app.schemas import ProductInDB
from typing import List, Optional
import uuid
from sqlalchemy import select

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
    category_slug: str, db: AsyncSession = Depends(get_db)
):
    category = (await db.execute(select(models.Category).filter(models.Category.slug == category_slug))).scalar_one_or_none()
    if not category:
        return []
    
    products = (
        (await db.execute(select(models.Product)
        .options(joinedload(models.Product.category))
        .filter(models.Product.category_id == category.id))).scalars().all()
    )
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