"""Admin order management routes"""

import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload

from app.auth import get_current_admin_user
from app.db import models
from app.db.database import get_db
from app.routers.notifications import create_notification
from app.schemas import CustomUser, OrderEdit, OrderInDB, OrderUpdateStatus

router = APIRouter()


@router.get("/admin/orders", response_model=list[OrderInDB])
async def get_admin_orders(
    db: AsyncSession = Depends(get_db), current_user: CustomUser = Depends(get_current_admin_user)
) -> list[OrderInDB]:
    """Получить все заказы для админа"""
    result = await db.execute(select(models.Order).options(joinedload(models.Order.order_items)))
    orders = result.scalars().unique().all()
    return [OrderInDB.model_validate(order, from_attributes=True) for order in orders]


@router.patch("/admin/orders/{order_id}", response_model=OrderInDB)
async def update_admin_order_status(
    order_id: uuid.UUID,
    order_update: OrderUpdateStatus,
    db: AsyncSession = Depends(get_db),
    current_user: CustomUser = Depends(get_current_admin_user),
) -> OrderInDB:
    """Обновить статус заказа"""
    result = await db.execute(select(models.Order).filter(models.Order.id == order_id))
    db_order = result.scalars().first()
    if not db_order:
        raise HTTPException(status_code=404, detail="Order not found")

    old_status = db_order.status
    new_status = order_update.status

    db_order.status = new_status
    db.add(db_order)
    await db.commit()
    await db.refresh(db_order)

    # Создаем уведомление для пользователя о смене статуса
    if old_status != new_status:
        status_messages = {
            "pending": "Ваш заказ принят в обработку",
            "confirmed": "Ваш заказ подтвержден",
            "shipped": "Ваш заказ отправлен",
            "delivered": "Ваш заказ доставлен",
            "cancelled": "Ваш заказ отменен",
        }

        notification_title = "Обновление статуса заказа"
        notification_message = status_messages.get(new_status, f"Статус заказа изменен на: {new_status}")

        await create_notification(
            db=db,
            user_id=str(db_order.user_id),
            title=notification_title,
            message=notification_message,
            notification_type="order_status",
            notification_data={"order_id": str(order_id), "old_status": old_status, "new_status": new_status},
        )

    # Загружаем заказ заново с order_items для корректной сериализации
    result = await db.execute(
        select(models.Order).options(joinedload(models.Order.order_items)).filter(models.Order.id == order_id)
    )
    db_order_with_items = result.scalars().first()
    return OrderInDB.model_validate(db_order_with_items, from_attributes=True)


@router.delete("/admin/orders/{order_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_admin_order(
    order_id: uuid.UUID, db: AsyncSession = Depends(get_db), current_user: CustomUser = Depends(get_current_admin_user)
) -> None:
    """Удалить заказ (только для админа)"""
    result = await db.execute(select(models.Order).filter(models.Order.id == order_id))
    db_order = result.scalars().first()
    if not db_order:
        raise HTTPException(status_code=404, detail="Order not found")

    # Сначала удаляем все элементы заказа
    order_items_result = await db.execute(select(models.OrderItem).filter(models.OrderItem.order_id == order_id))
    order_items = order_items_result.scalars().all()

    for item in order_items:
        await db.delete(item)

    # Затем удаляем сам заказ
    await db.delete(db_order)
    await db.commit()


@router.patch("/admin/orders/{order_id}/edit", response_model=OrderInDB)
async def edit_admin_order(
    order_id: uuid.UUID,
    order_edit: OrderEdit,
    db: AsyncSession = Depends(get_db),
    current_user: CustomUser = Depends(get_current_admin_user),
) -> OrderInDB:
    """Редактировать состав заказа (только для админа)"""
    # Получаем заказ
    result = await db.execute(select(models.Order).filter(models.Order.id == order_id))
    db_order = result.scalars().first()
    if not db_order:
        raise HTTPException(status_code=404, detail="Order not found")

    # Удаляем старые элементы заказа
    order_items_result = await db.execute(select(models.OrderItem).filter(models.OrderItem.order_id == order_id))
    old_order_items = order_items_result.scalars().all()

    for item in old_order_items:
        await db.delete(item)

    # Создаем новые элементы заказа
    for item_data in order_edit.orderItems:
        db_order_item = models.OrderItem(
            order_id=order_id,
            product_id=item_data.productId,
            quantity=item_data.quantity,
            price_snapshot=item_data.priceSnapshot,
            name=item_data.name,
            image_url=item_data.imageUrl,
        )
        db.add(db_order_item)

    # Обновляем общую сумму заказа
    db_order.total_amount = order_edit.totalAmount
    db.add(db_order)

    await db.commit()

    # Создаем уведомление для пользователя об изменении заказа
    await create_notification(
        db=db,
        user_id=str(db_order.user_id),
        title="Изменение заказа",
        message="Состав вашего заказа был изменен администратором",
        notification_type="order_status",
        notification_data={"order_id": str(order_id), "action": "order_edited"},
    )

    # Загружаем заказ заново с order_items для корректной сериализации
    result = await db.execute(
        select(models.Order).options(joinedload(models.Order.order_items)).filter(models.Order.id == order_id)
    )
    db_order_with_items = result.scalars().first()
    return OrderInDB.model_validate(db_order_with_items, from_attributes=True)
