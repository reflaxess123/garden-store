from typing import Dict, List, Set
import json
import uuid
from datetime import datetime
import asyncio

from fastapi import APIRouter, Depends, HTTPException, WebSocket, WebSocketDisconnect
from sqlalchemy import select, func, desc, or_, update
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.auth import get_current_user, get_current_admin_user
from app.db.database import get_db
from app.db import models
from app.schemas import CustomUser, ChatInDB, ChatMessageInDB, ChatMessageSend, WebSocketMessage
from app.routers.notifications import create_notification, create_notification_for_admins
from app.websocket_manager import manager  # Импортируем готовый менеджер

router = APIRouter()

# WebSocket endpoint для пользователей
@router.websocket("/ws/chat/{user_id}")
async def websocket_chat_user(websocket: WebSocket, user_id: str):
    await manager.connect(websocket, user_id)
    try:
        # Отправляем подтверждение подключения
        await websocket.send_text(json.dumps({
            "type": "connection_established",
            "userId": user_id,
            "timestamp": datetime.now().isoformat()
        }))
        
        while True:
            try:
                # Ждем любые сообщения от клиента
                data = await websocket.receive_text()
                
                try:
                    message_data = json.loads(data)
                    
                    # Обработка различных типов сообщений
                    if message_data.get("type") == "message":
                        # Отправляем всем админам уведомление о новом сообщении
                        await manager.send_to_all_admins(json.dumps({
                            "type": "new_message",
                            "chatId": message_data.get("chatId"),
                            "senderId": user_id,
                            "message": message_data.get("message"),
                            "timestamp": datetime.now().isoformat()
                        }))
                    elif message_data.get("type") == "ping":
                        # Отвечаем на ping
                        await websocket.send_text(json.dumps({"type": "pong"}))
                        
                except json.JSONDecodeError:
                    # Игнорируем некорректные JSON сообщения
                    continue
                    
            except WebSocketDisconnect:
                break
            except Exception as e:
                print(f"Ошибка в WebSocket пользователя {user_id}: {e}")
                break
                
    except WebSocketDisconnect:
        pass
    finally:
        manager.disconnect(user_id)

# WebSocket endpoint для админов
@router.websocket("/ws/admin/{admin_id}")
async def websocket_chat_admin(websocket: WebSocket, admin_id: str):
    await manager.connect(websocket, admin_id, is_admin=True)
    try:
        # Отправляем подтверждение подключения
        await websocket.send_text(json.dumps({
            "type": "connection_established",
            "adminId": admin_id,
            "timestamp": datetime.now().isoformat()
        }))
        
        while True:
            try:
                # Ждем любые сообщения от клиента
                data = await websocket.receive_text()
                
                try:
                    message_data = json.loads(data)
                    
                    # Обработка различных типов сообщений
                    if message_data.get("type") == "message":
                        chat_id = message_data.get("chatId")
                        target_user_id = message_data.get("targetUserId")
                        
                        # Отправляем пользователю сообщение от админа
                        if target_user_id:
                            await manager.send_personal_message(json.dumps({
                                "type": "admin_message",
                                "chatId": chat_id,
                                "senderId": admin_id,
                                "message": message_data.get("message"),
                                "timestamp": datetime.now().isoformat()
                            }), target_user_id)
                    elif message_data.get("type") == "ping":
                        # Отвечаем на ping
                        await websocket.send_text(json.dumps({"type": "pong"}))
                        
                except json.JSONDecodeError:
                    # Игнорируем некорректные JSON сообщения
                    continue
                    
            except WebSocketDisconnect:
                break
            except Exception as e:
                print(f"Ошибка в WebSocket админа {admin_id}: {e}")
                break
                
    except WebSocketDisconnect:
        pass
    finally:
        manager.disconnect(admin_id, is_admin=True)

# REST API endpoints

@router.get("/api/chats", response_model=List[ChatInDB])
async def get_user_chats(
    current_user: CustomUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Получить чаты текущего пользователя"""
    result = await db.execute(
        select(models.Chat)
        .filter(models.Chat.user_id == current_user.id)
        .order_by(desc(models.Chat.last_message_at))
    )
    chats = result.scalars().all()
    
    chat_list = []
    for chat in chats:
        # Получаем последнее сообщение
        last_msg_result = await db.execute(
            select(models.ChatMessage)
            .filter(models.ChatMessage.chat_id == chat.id)
            .order_by(desc(models.ChatMessage.created_at))
            .limit(1)
        )
        last_message = last_msg_result.scalars().first()
        
        # Создаем ChatInDB вручную
        chat_data = ChatInDB(
            id=str(chat.id),
            userId=str(chat.user_id),
            isActive=chat.is_active,
            unreadCount=chat.unread_count,
            lastMessageAt=chat.last_message_at.isoformat() if chat.last_message_at else None,
            createdAt=chat.created_at.isoformat(),
            userName=current_user.fullName or current_user.email,
            userEmail=current_user.email,
            lastMessage=last_message.message if last_message else None,
            messages=[]  # Пустой список для списка чатов
        )
        
        chat_list.append(chat_data)
    
    return chat_list

@router.get("/api/chats/{chat_id}", response_model=ChatInDB)
async def get_chat_detail(
    chat_id: uuid.UUID,
    current_user: CustomUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Получить детали чата с сообщениями"""
    # Проверяем права доступа
    chat_result = await db.execute(
        select(models.Chat)
        .filter(models.Chat.id == chat_id)
        .filter(
            or_(
                models.Chat.user_id == current_user.id,  # Пользователь владелец чата
                current_user.isAdmin == True  # Или пользователь админ
            )
        )
    )
    chat = chat_result.scalars().first()
    
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")
    
    # Получаем сообщения
    messages_result = await db.execute(
        select(models.ChatMessage, models.Profile)
        .join(models.Profile, models.ChatMessage.sender_id == models.Profile.id)
        .filter(models.ChatMessage.chat_id == chat_id)
        .order_by(models.ChatMessage.created_at)
    )
    messages_data = messages_result.all()
    
    messages = []
    for message, sender in messages_data:
        msg_data = ChatMessageInDB(
            id=str(message.id),
            chatId=str(message.chat_id),
            senderId=str(message.sender_id),
            message=message.message,
            isFromAdmin=message.is_from_admin,
            isRead=message.is_read,
            createdAt=message.created_at.isoformat(),
            senderName=sender.full_name or sender.email,
            senderEmail=sender.email
        )
        messages.append(msg_data)
    
    # Получаем информацию о пользователе чата
    user_result = await db.execute(
        select(models.Profile).filter(models.Profile.id == chat.user_id)
    )
    chat_user = user_result.scalars().first()
    
    # Создаем ChatInDB вручную
    chat_data = ChatInDB(
        id=str(chat.id),
        userId=str(chat.user_id),
        isActive=chat.is_active,
        unreadCount=chat.unread_count,
        lastMessageAt=chat.last_message_at.isoformat() if chat.last_message_at else None,
        createdAt=chat.created_at.isoformat(),
        userName=chat_user.full_name if chat_user else "Unknown",
        userEmail=chat_user.email if chat_user else "unknown@example.com",
        messages=messages
    )
    
    # Помечаем сообщения как прочитанные для текущего пользователя
    if not current_user.isAdmin:
        await db.execute(
            models.ChatMessage.__table__.update()
            .where(models.ChatMessage.chat_id == chat_id)
            .where(models.ChatMessage.is_from_admin == True)
            .where(models.ChatMessage.is_read == False)
            .values(is_read=True)
        )
        # Обнуляем счетчик непрочитанных
        await db.execute(
            models.Chat.__table__.update()
            .where(models.Chat.id == chat_id)
            .values(unread_count=0)
        )
        await db.commit()
    
    return chat_data

@router.post("/api/chats/{chat_id}/messages", response_model=ChatMessageInDB)
async def send_message(
    chat_id: uuid.UUID,
    message_data: ChatMessageSend,
    current_user: CustomUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Отправить сообщение в чат"""
    # Проверяем существование чата
    chat_result = await db.execute(
        select(models.Chat)
        .filter(models.Chat.id == chat_id)
        .filter(
            or_(
                models.Chat.user_id == current_user.id,
                current_user.isAdmin == True
            )
        )
    )
    chat = chat_result.scalars().first()
    
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")
    
    # Создаем сообщение
    new_message = models.ChatMessage(
        chat_id=chat_id,
        sender_id=current_user.id,
        message=message_data.message,
        is_from_admin=current_user.isAdmin
    )
    
    db.add(new_message)
    
    # Обновляем время последнего сообщения в чате
    await db.execute(
        models.Chat.__table__.update()
        .where(models.Chat.id == chat_id)
        .values(
            last_message_at=func.now(),
            unread_count=models.Chat.unread_count + (1 if current_user.isAdmin else 0)
        )
    )
    
    await db.commit()
    await db.refresh(new_message)
    
    # Отправляем через WebSocket
    ws_message = {
        "type": "new_message",
        "chatId": str(chat_id),
        "senderId": str(current_user.id),
        "senderName": current_user.fullName or current_user.email,
        "message": message_data.message,
        "isFromAdmin": current_user.isAdmin,
        "timestamp": new_message.created_at.isoformat()
    }
    
    if current_user.isAdmin:
        # Админ отправляет сообщение - создаем уведомление для пользователя
        # WebSocket сообщение отправится автоматически через create_notification
        await create_notification(
            db=db,
            user_id=str(chat.user_id),
            title="Новое сообщение от поддержки",
            message=f"Вам ответили в чате поддержки: {message_data.message[:50]}{'...' if len(message_data.message) > 50 else ''}",
            notification_type="chat_message",
            notification_data={
                "chat_id": str(chat_id),
                "message_id": str(new_message.id),
                "sender_name": current_user.fullName or current_user.email
            }
        )
    else:
        # Пользователь отправляет сообщение - отправляем WebSocket админам
        # Отправляем простое сообщение, а не уведомление
        await manager.send_to_all_admins(json.dumps(ws_message))
        
        # Создаем уведомления для админов (только для toast)
        await create_notification_for_admins(
            db=db,
            title="Новое сообщение от пользователя",
            message=f"Пользователь {current_user.fullName or current_user.email} написал: {message_data.message[:50]}{'...' if len(message_data.message) > 50 else ''}",
            notification_type="chat_message",
            notification_data={
                "chat_id": str(chat_id),
                "message_id": str(new_message.id),
                "sender_name": current_user.fullName or current_user.email,
                "sender_id": str(current_user.id)
            }
        )
    
    # Создаем ChatMessageInDB вручную
    message_response = ChatMessageInDB(
        id=str(new_message.id),
        chatId=str(new_message.chat_id),
        senderId=str(new_message.sender_id),
        message=new_message.message,
        isFromAdmin=new_message.is_from_admin,
        isRead=new_message.is_read,
        createdAt=new_message.created_at.isoformat(),
        senderName=current_user.fullName or current_user.email,
        senderEmail=current_user.email
    )
    
    return message_response

@router.post("/api/chats", response_model=ChatInDB)
async def create_or_get_chat(
    current_user: CustomUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Создать или получить существующий чат для пользователя"""
    # Проверяем, есть ли уже активный чат у пользователя
    result = await db.execute(
        select(models.Chat)
        .filter(models.Chat.user_id == current_user.id)
        .filter(models.Chat.is_active == True)
        .order_by(desc(models.Chat.created_at))
        .limit(1)
    )
    existing_chat = result.scalars().first()
    
    if existing_chat:
        # Создаем ChatInDB вручную, чтобы избежать проблем с lazy loading
        chat_data = ChatInDB(
            id=str(existing_chat.id),
            userId=str(existing_chat.user_id),
            isActive=existing_chat.is_active,
            unreadCount=existing_chat.unread_count,
            lastMessageAt=existing_chat.last_message_at.isoformat() if existing_chat.last_message_at else None,
            createdAt=existing_chat.created_at.isoformat(),
            userName=current_user.fullName or current_user.email,
            userEmail=current_user.email,
            messages=[]  # Пустой список для создания чата
        )
        return chat_data
    
    # Создаем новый чат
    new_chat = models.Chat(
        user_id=current_user.id,
        is_active=True
    )
    
    db.add(new_chat)
    await db.commit()
    await db.refresh(new_chat)
    
    # Создаем ChatInDB вручную
    chat_data = ChatInDB(
        id=str(new_chat.id),
        userId=str(new_chat.user_id),
        isActive=new_chat.is_active,
        unreadCount=new_chat.unread_count,
        lastMessageAt=new_chat.last_message_at.isoformat() if new_chat.last_message_at else None,
        createdAt=new_chat.created_at.isoformat(),
        userName=current_user.fullName or current_user.email,
        userEmail=current_user.email,
        messages=[]  # Пустой список для нового чата
    )
    
    return chat_data

# Админские эндпоинты
@router.get("/api/admin/chats", response_model=List[ChatInDB])
async def get_all_chats(
    current_user: CustomUser = Depends(get_current_admin_user),
    db: AsyncSession = Depends(get_db)
):
    """Получить все чаты (только для админов)"""
    result = await db.execute(
        select(models.Chat, models.Profile)
        .join(models.Profile, models.Chat.user_id == models.Profile.id)
        .filter(models.Chat.is_active == True)
        .order_by(desc(models.Chat.last_message_at))
    )
    chats_data = result.all()
    
    chat_list = []
    for chat, user in chats_data:
        # Получаем последнее сообщение
        last_msg_result = await db.execute(
            select(models.ChatMessage)
            .filter(models.ChatMessage.chat_id == chat.id)
            .order_by(desc(models.ChatMessage.created_at))
            .limit(1)
        )
        last_message = last_msg_result.scalars().first()
        
        # Создаем ChatInDB вручную
        chat_data = ChatInDB(
            id=str(chat.id),
            userId=str(chat.user_id),
            isActive=chat.is_active,
            unreadCount=chat.unread_count,
            lastMessageAt=chat.last_message_at.isoformat() if chat.last_message_at else None,
            createdAt=chat.created_at.isoformat(),
            userName=user.full_name or user.email,
            userEmail=user.email,
            lastMessage=last_message.message if last_message else None,
            messages=[]  # Пустой список для админского списка чатов
        )
        
        chat_list.append(chat_data)
    
    return chat_list 