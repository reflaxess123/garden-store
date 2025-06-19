from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.db import models
from app.schemas import CartMergeRequest, CartItemInDB, CustomUser
from app.auth import get_current_user
from typing import List
import uuid
from sqlalchemy import select

router = APIRouter()

@router.post("/cart/merge", response_model=List[CartItemInDB])
async def merge_cart(
    cart_merge_request: CartMergeRequest, 
    db: Session = Depends(get_db),
    current_user: CustomUser = Depends(get_current_user)
):
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
            db_cart_item.price_snapshot = item_data.priceSnapshot # Update price snapshot in case it changed
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