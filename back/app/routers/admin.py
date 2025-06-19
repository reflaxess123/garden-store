from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from app.db.database import get_db
from app.db import models
from app.schemas import CategoryInDB, CategoryCreate, CategoryUpdate, ProductInDB, ProductCreate, ProductUpdate, OrderInDB, OrderUpdateStatus, CustomUser
from app.auth import get_current_admin_user
from typing import List, Optional
import uuid

router = APIRouter()

# region Admin Categories
@router.get("/admin/categories", response_model=List[CategoryInDB])
async def get_admin_categories(
    db: Session = Depends(get_db),
    current_user: CustomUser = Depends(get_current_admin_user)
):
    categories = db.query(models.Category).all()
    return categories

@router.post("/admin/categories", response_model=CategoryInDB, status_code=status.HTTP_201_CREATED)
async def create_admin_category(
    category_in: CategoryCreate, db: Session = Depends(get_db),
    current_user: CustomUser = Depends(get_current_admin_user)
):
    db_category = db.query(models.Category).filter(models.Category.slug == category_in.slug).first()
    if db_category:
        raise HTTPException(status_code=400, detail="Category with this slug already exists")

    db_category = models.Category(**category_in.dict())
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return db_category

@router.patch("/admin/categories/{category_id}", response_model=CategoryInDB)
async def update_admin_category(
    category_id: uuid.UUID, category_in: CategoryUpdate, db: Session = Depends(get_db),
    current_user: CustomUser = Depends(get_current_admin_user)
):
    db_category = db.query(models.Category).filter(models.Category.id == category_id).first()
    if not db_category:
        raise HTTPException(status_code=404, detail="Category not found")
    
    update_data = category_in.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_category, key, value)
    
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return db_category

@router.delete("/admin/categories/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_admin_category(
    category_id: uuid.UUID, db: Session = Depends(get_db),
    current_user: CustomUser = Depends(get_current_admin_user)
):
    db_category = db.query(models.Category).filter(models.Category.id == category_id).first()
    if not db_category:
        raise HTTPException(status_code=404, detail="Category not found")
    
    db.delete(db_category)
    db.commit()
    return
# endregion

# region Admin Products
@router.get("/admin/products", response_model=List[ProductInDB])
async def get_admin_products(
    db: Session = Depends(get_db),
    current_user: CustomUser = Depends(get_current_admin_user)
):
    products = db.query(models.Product).options(joinedload(models.Product.category)).all()
    return products

@router.post("/admin/products", response_model=ProductInDB, status_code=status.HTTP_201_CREATED)
async def create_admin_product(
    product_in: ProductCreate, db: Session = Depends(get_db),
    current_user: CustomUser = Depends(get_current_admin_user)
):
    db_product = db.query(models.Product).filter(models.Product.slug == product_in.slug).first()
    if db_product:
        raise HTTPException(status_code=400, detail="Product with this slug already exists")

    db_product = models.Product(**product_in.dict())
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product

@router.get("/admin/products/{product_id}", response_model=ProductInDB)
async def get_admin_product(
    product_id: uuid.UUID, db: Session = Depends(get_db),
    current_user: CustomUser = Depends(get_current_admin_user)
):
    product = db.query(models.Product).options(joinedload(models.Product.category)).filter(models.Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@router.delete("/admin/products/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_admin_product(
    product_id: uuid.UUID, db: Session = Depends(get_db),
    current_user: CustomUser = Depends(get_current_admin_user)
):
    db_product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    db.delete(db_product)
    db.commit()
    return

@router.patch("/admin/products/{product_id}", response_model=ProductInDB)
async def update_admin_product(
    product_id: uuid.UUID, product_in: ProductUpdate, db: Session = Depends(get_db),
    current_user: CustomUser = Depends(get_current_admin_user)
):
    db_product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    update_data = product_in.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_product, key, value)
    
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product
# endregion

# region Admin Orders
@router.get("/admin/orders", response_model=List[OrderInDB])
async def get_admin_orders(
    db: Session = Depends(get_db),
    current_user: CustomUser = Depends(get_current_admin_user)
):
    orders = db.query(models.Order).options(joinedload(models.Order.order_items)).all()
    return orders

@router.patch("/admin/orders/{order_id}", response_model=OrderInDB)
async def update_admin_order_status(
    order_id: uuid.UUID, order_update: OrderUpdateStatus, db: Session = Depends(get_db),
    current_user: CustomUser = Depends(get_current_admin_user)
):
    db_order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not db_order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    db_order.status = order_update.status
    db.add(db_order)
    db.commit()
    db.refresh(db_order)
    return db_order
# endregion 