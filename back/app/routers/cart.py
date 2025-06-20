import uuid

# Removed unused List import
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload

from app.auth import get_current_user
from app.db import models
from app.db.database import get_db
from app.schemas import (
    CartItemAdd,
    CartItemInDB,
    CartItemUpdate,
    CartItemWithProduct,
    CartMergeRequest,
    CustomUser,
)

router = APIRouter()


@router.get("/cart", response_model=list[CartItemWithProduct])
async def get_cart(
    db: AsyncSession = Depends(get_db), current_user: CustomUser = Depends(get_current_user)
) -> list[CartItemWithProduct]:
    """Получить корзину текущего пользователя"""
    result = await db.execute(
        select(models.CartItem)
        .options(joinedload(models.CartItem.product))
        .filter(models.CartItem.user_id == current_user.id)
    )
    cart_items = result.scalars().unique().all()

    # Преобразуем в CartItemWithProduct, объединяя данные корзины и товара
    cart_with_products = []
    for item in cart_items:
        cart_item_data = {
            "id": item.id,
            "product_id": item.product_id,
            "user_id": item.user_id,
            "quantity": item.quantity,
            "price_snapshot": float(item.price_snapshot),
            # Данные товара
            "name": item.product.name,
            "slug": item.product.slug,
            "description": item.product.description,
            "imageUrl": item.product.image_url,
            "categoryId": item.product.category_id,
        }
        cart_with_products.append(CartItemWithProduct.model_validate(cart_item_data, from_attributes=True))

    return cart_with_products


@router.post("/cart/add", response_model=CartItemInDB, status_code=status.HTTP_201_CREATED)
async def add_to_cart(
    cart_item: CartItemAdd, db: AsyncSession = Depends(get_db), current_user: CustomUser = Depends(get_current_user)
) -> CartItemInDB:
    """Добавить товар в корзину"""
    # Проверяем, существует ли продукт
    product_result = await db.execute(select(models.Product).filter(models.Product.id == cart_item.productId))
    product = product_result.scalars().first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    # Проверяем, есть ли уже такой товар в корзине
    existing_result = await db.execute(
        select(models.CartItem).filter(
            models.CartItem.user_id == current_user.id, models.CartItem.product_id == cart_item.productId
        )
    )
    existing_item = existing_result.scalars().first()

    if existing_item:
        # Если товар уже есть, увеличиваем количество
        existing_item.quantity += cart_item.quantity
        existing_item.price_snapshot = product.price  # Обновляем цену
        db.add(existing_item)
        await db.commit()
        await db.refresh(existing_item)
        return CartItemInDB.model_validate(existing_item, from_attributes=True)
    else:
        # Создаем новый элемент корзины
        new_cart_item = models.CartItem(
            user_id=current_user.id,
            product_id=cart_item.productId,
            quantity=cart_item.quantity,
            price_snapshot=product.price,
        )
        db.add(new_cart_item)
        await db.commit()
        await db.refresh(new_cart_item)
        return CartItemInDB.model_validate(new_cart_item, from_attributes=True)


@router.patch("/cart/{item_id}", response_model=CartItemInDB)
async def update_cart_item(
    item_id: uuid.UUID,
    update_data: CartItemUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: CustomUser = Depends(get_current_user),
) -> CartItemInDB:
    """Изменить количество товара в корзине"""
    result = await db.execute(
        select(models.CartItem).filter(models.CartItem.id == item_id, models.CartItem.user_id == current_user.id)
    )
    cart_item = result.scalars().first()
    if not cart_item:
        raise HTTPException(status_code=404, detail="Cart item not found")

    cart_item.quantity = update_data.quantity
    db.add(cart_item)
    await db.commit()
    await db.refresh(cart_item)
    return CartItemInDB.model_validate(cart_item, from_attributes=True)


@router.delete("/cart/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_from_cart(
    item_id: uuid.UUID, db: AsyncSession = Depends(get_db), current_user: CustomUser = Depends(get_current_user)
) -> None:
    """Удалить товар из корзины"""
    result = await db.execute(
        select(models.CartItem).filter(models.CartItem.id == item_id, models.CartItem.user_id == current_user.id)
    )
    cart_item = result.scalars().first()
    if not cart_item:
        raise HTTPException(status_code=404, detail="Cart item not found")

    await db.delete(cart_item)
    await db.commit()
    return


@router.delete("/cart", status_code=status.HTTP_204_NO_CONTENT)
async def clear_cart(db: AsyncSession = Depends(get_db), current_user: CustomUser = Depends(get_current_user)) -> None:
    """Очистить всю корзину"""
    result = await db.execute(select(models.CartItem).filter(models.CartItem.user_id == current_user.id))
    cart_items = result.scalars().all()

    for item in cart_items:
        await db.delete(item)

    await db.commit()
    return


@router.post("/cart/merge", response_model=list[CartItemInDB])
async def merge_cart(
    cart_merge_request: CartMergeRequest,
    db: AsyncSession = Depends(get_db),
    current_user: CustomUser = Depends(get_current_user),
) -> list[CartItemInDB]:
    user_id = current_user.id
    merged_cart_items = []

    for item_data in cart_merge_request.localCart:
        # Check if item already exists in user's cart
        result = await db.execute(
            select(models.CartItem).filter(
                models.CartItem.user_id == user_id,
                models.CartItem.product_id == item_data.productId,
            )
        )
        db_cart_item = result.scalars().first()

        if db_cart_item:
            # Update quantity if item exists
            db_cart_item.quantity += item_data.quantity
            db_cart_item.price_snapshot = item_data.priceSnapshot  # Update price snapshot in case it changed
        else:
            # Create new cart item if it doesn't exist
            db_cart_item = models.CartItem(
                user_id=user_id,
                product_id=item_data.productId,
                quantity=item_data.quantity,
                price_snapshot=item_data.priceSnapshot,
            )
            db.add(db_cart_item)

        await db.commit()
        await db.refresh(db_cart_item)
        merged_cart_items.append(db_cart_item)

    # Fetch all cart items for the user after merge
    result = await db.execute(select(models.CartItem).filter(models.CartItem.user_id == user_id))
    final_cart_in_db = result.scalars().all()
    return [CartItemInDB.model_validate(item, from_attributes=True) for item in final_cart_in_db]
