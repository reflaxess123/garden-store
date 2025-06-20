from typing import Dict
from fastapi import WebSocket
import json

class ConnectionManager:
    def __init__(self):
        # Словарь активных подключений: user_id -> websocket
        self.active_connections: Dict[str, WebSocket] = {}
        # Словарь админских подключений: admin_id -> websocket
        self.admin_connections: Dict[str, WebSocket] = {}

    async def connect(self, websocket: WebSocket, user_id: str, is_admin: bool = False):
        await websocket.accept()
        if is_admin:
            self.admin_connections[user_id] = websocket
        else:
            self.active_connections[user_id] = websocket

    def disconnect(self, user_id: str, is_admin: bool = False):
        if is_admin and user_id in self.admin_connections:
            del self.admin_connections[user_id]
        elif user_id in self.active_connections:
            del self.active_connections[user_id]

    async def send_personal_message(self, message: str, user_id: str):
        if user_id in self.active_connections:
            websocket = self.active_connections[user_id]
            try:
                await websocket.send_text(message)
            except:
                # Соединение закрыто, удаляем его
                self.disconnect(user_id)

    async def send_to_admin(self, message: str, admin_id: str):
        if admin_id in self.admin_connections:
            websocket = self.admin_connections[admin_id]
            try:
                await websocket.send_text(message)
            except:
                # Соединение закрыто, удаляем его
                self.disconnect(admin_id, is_admin=True)

    async def send_to_all_admins(self, message: str):
        # Отправляем сообщение всем подключенным админам
        disconnected_admins = []
        for admin_id, websocket in self.admin_connections.items():
            try:
                await websocket.send_text(message)
            except:
                # Соединение закрыто, запомним для удаления
                disconnected_admins.append(admin_id)
        
        # Удаляем отключенных админов
        for admin_id in disconnected_admins:
            self.disconnect(admin_id, is_admin=True)

# Глобальный экземпляр менеджера
manager = ConnectionManager() 