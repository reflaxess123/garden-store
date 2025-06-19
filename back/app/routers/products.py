from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from app.db.database import get_db
from app.db import models
from app.schemas import ProductInDB
from typing import List, Optional
import uuid

router = APIRouter()

@router.get("/products/{product_id}", response_model=ProductInDB)
async def get_product_by_id(
    product_id: uuid.UUID, db: Session = Depends(get_db)
):
    product = (
        db.query(models.Product)
        .options(joinedload(models.Product.category))
        .filter(models.Product.id == product_id)
        .first()
    )
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@router.get("/products/bestsellers", response_model=List[ProductInDB])
async def get_bestsellers(db: Session = Depends(get_db), limit: int = 10):
    bestsellers = (
        db.query(models.Product)
        .options(joinedload(models.Product.category))
        .order_by(models.Product.times_ordered.desc())
        .limit(limit)
        .all()
    )
    return bestsellers

@router.get("/products/slug/{product_slug}", response_model=ProductInDB)
async def get_product_by_slug(
    product_slug: str, db: Session = Depends(get_db)
):
    product = (
        db.query(models.Product)
        .options(joinedload(models.Product.category))
        .filter(models.Product.slug == product_slug)
        .first()
    )
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@router.get("/products/category/{category_slug}", response_model=List[ProductInDB])
async def get_products_by_category_slug(
    category_slug: str, db: Session = Depends(get_db)
):
    category = db.query(models.Category).filter(models.Category.slug == category_slug).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    
    products = (
        db.query(models.Product)
        .options(joinedload(models.Product.category))
        .filter(models.Product.category_id == category.id)
        .all()
    )
    return products 