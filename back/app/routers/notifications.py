from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, and_, or_, func
from sqlalchemy.orm import selectinload
from typing import List, Optional
import uuid
import json

from app.db.database import get_db
from app.db import models
from app.schemas import NotificationInDB, NotificationUpdate, CustomUser
from app.auth import get_current_user, get_current_admin_user
from app.websocket_manager import manager  # Импортируем из отдельного модуля

router = APIRouter()

async def create_notification(
    db: AsyncSession,
    user_id: str,
    title: str,
    message: str,
    notification_type: str,
    notification_data: Optional[dict] = None
) -> models.Notification:
    """Создать уведомление для пользователя"""
    notification = models.Notification(
        user_id=uuid.UUID(user_id),
        title=title,
        message=message,
        type=notification_type,
        notification_data=notification_data or {}
    )
    
    db.add(notification)
    await db.commit()
    await db.refresh(notification)
    
    # Отправляем WebSocket уведомление
    ws_message = {
        "type": "notification",
        "data": {
            "id": str(notification.id),
            "title": title,
            "message": message,
            "type": notification_type,
            "notification_data": notification_data or {}
        }
    }
    await manager.send_personal_message(json.dumps(ws_message), user_id)
    
    return notification

async def create_notification_for_admins(
    db: AsyncSession,
    title: str,
    message: str,
    notification_type: str,
    notification_data: Optional[dict] = None
):
    """Создать уведомление для всех админов"""
    # Получаем всех админов
    admin_result = await db.execute(
        select(models.Profile).filter(models.Profile.is_admin == True)
    )
    admins = admin_result.scalars().all()
    
    # Создаем уведомление для каждого админа
    for admin in admins:
        notification = models.Notification(
            user_id=admin.id,
            title=title,
            message=message,
            type=notification_type,
            notification_data=notification_data or {}
        )
        
        db.add(notification)
        await db.commit()
        await db.refresh(notification)
        
        # Отправляем WebSocket уведомление каждому админу
        ws_message = {
            "type": "notification",
            "data": {
                "id": str(notification.id),
                "title": title,
                "message": message,
                "type": notification_type,
                "notification_data": notification_data or {}
            }
        }
        await manager.send_to_admin(json.dumps(ws_message), str(admin.id))

@router.get("/api/notifications", response_model=List[NotificationInDB])
async def get_user_notifications(
    unread_only: bool = False,
    limit: int = 50,
    current_user: CustomUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Получить уведомления пользователя"""
    query = select(models.Notification).filter(
        models.Notification.user_id == current_user.id
    )
    
    if unread_only:
        query = query.filter(models.Notification.is_read == False)
    
    query = query.order_by(models.Notification.created_at.desc()).limit(limit)
    
    result = await db.execute(query)
    notifications = result.scalars().all()
    
    notification_list = []
    for notification in notifications:
        notification_data = NotificationInDB(
            id=str(notification.id),
            userId=str(notification.user_id),
            title=notification.title,
            message=notification.message,
            type=notification.type,
            isRead=notification.is_read,
            createdAt=notification.created_at.isoformat(),
            notificationData=notification.notification_data
        )
        notification_list.append(notification_data)
    
    return notification_list

@router.patch("/api/notifications/{notification_id}", response_model=NotificationInDB)
async def mark_notification_read(
    notification_id: uuid.UUID,
    update_data: NotificationUpdate,
    current_user: CustomUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Отметить уведомление как прочитанное"""
    # Проверяем, что уведомление принадлежит пользователю
    result = await db.execute(
        select(models.Notification).filter(
            and_(
                models.Notification.id == notification_id,
                models.Notification.user_id == current_user.id
            )
        )
    )
    notification = result.scalars().first()
    
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    
    # Обновляем статус
    await db.execute(
        update(models.Notification)
        .where(models.Notification.id == notification_id)
        .values(is_read=update_data.isRead)
    )
    await db.commit()
    
    # Получаем обновленное уведомление
    updated_result = await db.execute(
        select(models.Notification).filter(models.Notification.id == notification_id)
    )
    updated_notification = updated_result.scalars().first()
    
    return NotificationInDB(
        id=str(updated_notification.id),
        userId=str(updated_notification.user_id),
        title=updated_notification.title,
        message=updated_notification.message,
        type=updated_notification.type,
        isRead=updated_notification.is_read,
        createdAt=updated_notification.created_at.isoformat(),
        notificationData=updated_notification.notification_data
    )

@router.post("/api/notifications/mark-all-read")
async def mark_all_notifications_read(
    current_user: CustomUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Отметить все уведомления пользователя как прочитанные"""
    await db.execute(
        update(models.Notification)
        .where(
            and_(
                models.Notification.user_id == current_user.id,
                models.Notification.is_read == False
            )
        )
        .values(is_read=True)
    )
    await db.commit()
    
    return {"message": "All notifications marked as read"}

@router.get("/api/notifications/unread-count")
async def get_unread_count(
    current_user: CustomUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Получить количество непрочитанных уведомлений"""
    result = await db.execute(
        select(func.count(models.Notification.id)).filter(
            and_(
                models.Notification.user_id == current_user.id,
                models.Notification.is_read == False
            )
        )
    )
    count = result.scalar()
    
    return {"unreadCount": count or 0} 