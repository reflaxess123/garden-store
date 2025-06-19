from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.db import models
from app.schemas import OrderCreate, OrderInDB
from app.auth import get_current_user, CustomUser
from typing import List
import uuid
from sqlalchemy import text

router = APIRouter()

@router.post("/orders", response_model=OrderInDB, status_code=status.HTTP_201_CREATED)
async def create_order(
    order_in: OrderCreate, 
    db: Session = Depends(get_db),
    current_user: CustomUser = Depends(get_current_user)
):
    user_id = current_user.id

    # Convert Pydantic model to dictionary, adjusting field names for PostgreSQL function
    order_items_jsonb = [
        {
            "productId": str(item.productId),
            "quantity": item.quantity,
            "priceSnapshot": float(item.priceSnapshot),
            "name": item.name,
            "imageUrl": item.imageUrl,
        }
        for item in order_in.orderItems
    ]

    try:
        # Call the PostgreSQL function create_order
        # The p_user_id in create_order expects UUID, so cast user_id
        result = db.execute(
            text("SELECT public.create_order(:p_address, :p_city, :p_email, :p_full_name, :p_order_items::jsonb, :p_phone, :p_postal_code, :p_total_amount, :p_user_id::uuid)"),
            {
                "p_address": order_in.address,
                "p_city": order_in.city,
                "p_email": order_in.email,
                "p_full_name": order_in.fullName,
                "p_order_items": order_items_jsonb,
                "p_phone": order_in.phone,
                "p_postal_code": order_in.postalCode,
                "p_total_amount": float(order_in.totalAmount),
                "p_user_id": str(user_id) # Ensure it's passed as string to UUID cast
            }
        ).scalar_one_or_none()

        if not result:
            raise HTTPException(status_code=500, detail="Failed to create order via RPC")
        
        new_order_id = result # The function returns the new order's UUID

        # Fetch the newly created order from the database to return
        db_order = db.query(models.Order).filter(models.Order.id == new_order_id).options(models.Order.order_items).first()
        if not db_order:
            raise HTTPException(status_code=500, detail="Failed to retrieve created order")
        
        return db_order

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error creating order: {e}")

@router.delete("/orders", status_code=status.HTTP_204_NO_CONTENT)
async def delete_order(
    order_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: CustomUser = Depends(get_current_user)
):
    db_order = db.query(models.Order).filter(models.Order.id == order_id).first()
    
    if not db_order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    if db_order.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to delete this order")

    db.delete(db_order)
    db.commit()
    return 