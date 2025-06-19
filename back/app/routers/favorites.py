from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from app.db.database import get_db
from app.db import models
from app.schemas import FavouriteInDB, FavouriteCreate, FavouriteDelete, CustomUser
from app.auth import get_current_user
from typing import List
import uuid
from sqlalchemy import select

router = APIRouter()

@router.get("/favorites", response_model=List[FavouriteInDB])
async def get_favorites(
    db: Session = Depends(get_db),
    current_user: CustomUser = Depends(get_current_user)
):
    """Получить список избранных товаров пользователя"""
    result = await db.execute(
        select(models.Favourite)
        .options(joinedload(models.Favourite.product).joinedload(models.Product.category))
        .filter(models.Favourite.user_id == current_user.id)
    )
    favorites = result.scalars().unique().all()
    return [FavouriteInDB.model_validate(fav, from_attributes=True) for fav in favorites]

@router.post("/favorites/{product_id}", response_model=FavouriteInDB, status_code=status.HTTP_201_CREATED)
async def add_to_favorites(
    product_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: CustomUser = Depends(get_current_user)
):
    """Добавить товар в избранное"""
    # Проверяем, существует ли продукт
    product_result = await db.execute(select(models.Product).filter(models.Product.id == product_id))
    product = product_result.scalars().first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Проверяем, нет ли уже этого товара в избранном
    existing_result = await db.execute(
        select(models.Favourite).filter(
            models.Favourite.user_id == current_user.id,
            models.Favourite.product_id == product_id
        )
    )
    existing_favorite = existing_result.scalars().first()
    
    if existing_favorite:
        raise HTTPException(status_code=400, detail="Product already in favorites")
    
    # Создаем новое избранное
    new_favorite = models.Favourite(
        user_id=current_user.id,
        product_id=product_id
    )
    db.add(new_favorite)
    await db.commit()
    await db.refresh(new_favorite)
    
    # Загружаем избранное с продуктом для ответа
    result = await db.execute(
        select(models.Favourite)
        .options(joinedload(models.Favourite.product).joinedload(models.Product.category))
        .filter(models.Favourite.id == new_favorite.id)
    )
    favorite_with_product = result.scalars().first()
    return FavouriteInDB.model_validate(favorite_with_product, from_attributes=True)

@router.delete("/favorites/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_from_favorites(
    product_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: CustomUser = Depends(get_current_user)
):
    """Удалить товар из избранного"""
    result = await db.execute(
        select(models.Favourite).filter(
            models.Favourite.user_id == current_user.id,
            models.Favourite.product_id == product_id
        )
    )
    favorite = result.scalars().first()
    if not favorite:
        raise HTTPException(status_code=404, detail="Product not found in favorites")
    
    await db.delete(favorite)
    await db.commit()
    return 