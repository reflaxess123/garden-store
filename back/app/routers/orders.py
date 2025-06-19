from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload
from app.db.database import get_db
from app.db import models
from app.schemas import OrderCreate, OrderInDB, OrderDelete, OrderItemInDB
from app.auth import get_current_user, CustomUser
from typing import List
import uuid
from sqlalchemy import select
import json

router = APIRouter()

@router.post("/orders", response_model=OrderInDB, status_code=status.HTTP_201_CREATED)
async def create_order(
    order_in: OrderCreate, 
    db: AsyncSession = Depends(get_db),
    current_user: CustomUser = Depends(get_current_user)
):
    user_id = current_user.id
    
    # Отладка: выводим доступные атрибуты
    print(f"DEBUG: order_in attributes: {dir(order_in)}")
    print(f"DEBUG: order_in dict: {order_in.model_dump()}")

    try:
        # Создаем новый заказ
        new_order = models.Order(
            user_id=user_id,
            total_amount=order_in.totalAmount,
            status="pending",
            full_name=order_in.fullName,
            email=order_in.email,
            address=order_in.address,
            city=order_in.city,
            postal_code=order_in.postalCode,
            phone=order_in.phone
        )
        
        db.add(new_order)
        await db.flush()  # Получаем ID заказа
        
        # Создаем элементы заказа
        order_items = []
        for item in order_in.orderItems:
            # Получаем продукт
            product = await db.get(models.Product, item.productId)
            if not product:
                raise HTTPException(status_code=404, detail=f"Product {item.productId} not found")
            
            # Создаем элемент заказа
            order_item = models.OrderItem(
                order_id=new_order.id,
                product_id=item.productId,
                quantity=item.quantity,
                price_snapshot=item.priceSnapshot,
                name=item.name,
                image_url=item.imageUrl
            )
            
            db.add(order_item)
            order_items.append(order_item)
            
            # Обновляем счетчик заказов для продукта
            product.times_ordered += item.quantity
            
        await db.commit()
        
        # Создаем список OrderItemInDB для ответа
        order_items_response = [
            OrderItemInDB(
                id=item.id,
                orderId=item.order_id,
                productId=item.product_id,
                quantity=item.quantity,
                priceSnapshot=item.price_snapshot,
                name=item.name,
                imageUrl=item.image_url
            )
            for item in order_items
        ]
        
        # Создаем и возвращаем OrderInDB
        return OrderInDB(
            id=new_order.id,
            userId=new_order.user_id,
            totalAmount=new_order.total_amount,
            status=new_order.status,
            createdAt=new_order.created_at,
            fullName=new_order.full_name,
            email=new_order.email,
            address=new_order.address,
            city=new_order.city,
            postalCode=new_order.postal_code,
            phone=new_order.phone,
            orderItems=order_items_response
        )

    except Exception as e:
        await db.rollback()
        if isinstance(e, HTTPException):
            raise
        raise HTTPException(status_code=500, detail=f"Error creating order: {str(e)}")

@router.delete("/orders", status_code=status.HTTP_204_NO_CONTENT)
async def delete_order(
    payload: OrderDelete,
    db: AsyncSession = Depends(get_db),
    current_user: CustomUser = Depends(get_current_user)
):
    order_id = payload.orderId
    
    try:
        # Получаем заказ
        order_result = await db.execute(select(models.Order).filter(models.Order.id == order_id))
        db_order = order_result.scalars().first()
        
        if not db_order:
            raise HTTPException(status_code=404, detail="Order not found")
        
        if db_order.user_id != current_user.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to delete this order")

        # Сначала удаляем все элементы заказа
        order_items_result = await db.execute(
            select(models.OrderItem).filter(models.OrderItem.order_id == order_id)
        )
        order_items = order_items_result.scalars().all()
        
        for item in order_items:
            await db.delete(item)
        
        # Затем удаляем сам заказ  
        await db.delete(db_order)
        await db.commit()
        
    except Exception as e:
        await db.rollback()
        if isinstance(e, HTTPException):
            raise
        raise HTTPException(status_code=500, detail=f"Error deleting order: {str(e)}")
    
    return 

@router.get("/orders", response_model=List[OrderInDB])
async def get_user_orders(
    db: AsyncSession = Depends(get_db),
    current_user: CustomUser = Depends(get_current_user)
):
    """Получить заказы текущего пользователя"""
    result = await db.execute(
        select(models.Order)
        .options(joinedload(models.Order.order_items))
        .filter(models.Order.user_id == current_user.id)
        .order_by(models.Order.created_at.desc())
    )
    orders = result.scalars().unique().all()
    return [OrderInDB.model_validate(order, from_attributes=True) for order in orders]

@router.get("/orders/{order_id}", response_model=OrderInDB)
async def get_user_order(
    order_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: CustomUser = Depends(get_current_user)
):
    """Получить конкретный заказ пользователя"""
    result = await db.execute(
        select(models.Order)
        .options(joinedload(models.Order.order_items))
        .filter(
            models.Order.id == order_id,
            models.Order.user_id == current_user.id
        )
    )
    order = result.scalars().first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    return OrderInDB.model_validate(order, from_attributes=True) 