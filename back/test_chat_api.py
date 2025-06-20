#!/usr/bin/env python3
"""
Тестовый скрипт для проверки API чатов
"""
import asyncio
import httpx
import json

async def test_chat_api():
    """Тестируем API чатов"""
    base_url = "http://localhost:4000"
    
    # Данные для входа (используем админа)
    login_data = {
        "email": "reflaxess@gmail.com",
        "password": "123123"
    }
    
    async with httpx.AsyncClient() as client:
        try:
            # 1. Логинимся
            print("1. Логинимся как админ...")
            login_response = await client.post(
                f"{base_url}/api/auth/signin",
                json=login_data
            )
            print(f"Login status: {login_response.status_code}")
            if login_response.status_code != 200:
                print(f"Login failed: {login_response.text}")
                return
            
            # Получаем cookies
            cookies = login_response.cookies
            print(f"Cookies: {dict(cookies)}")
            
            # 2. Тестируем создание чата
            print("\n2. Создаем чат...")
            create_chat_response = await client.post(
                f"{base_url}/api/chats",
                cookies=cookies
            )
            print(f"Create chat status: {create_chat_response.status_code}")
            if create_chat_response.status_code == 200:
                chat_data = create_chat_response.json()
                print(f"Chat created: {json.dumps(chat_data, indent=2)}")
                chat_id = chat_data.get('id')
            else:
                print(f"Create chat failed: {create_chat_response.text}")
                return
            
            # 3. Тестируем получение чатов админом
            print("\n3. Получаем все чаты (админ)...")
            admin_chats_response = await client.get(
                f"{base_url}/api/admin/chats",
                cookies=cookies
            )
            print(f"Admin chats status: {admin_chats_response.status_code}")
            if admin_chats_response.status_code == 200:
                chats_data = admin_chats_response.json()
                print(f"Admin chats: {json.dumps(chats_data, indent=2)}")
            else:
                print(f"Admin chats failed: {admin_chats_response.text}")
            
            # 4. Тестируем отправку сообщения
            if chat_id:
                print(f"\n4. Отправляем сообщение в чат {chat_id}...")
                message_data = {
                    "chatId": chat_id,
                    "message": "Тестовое сообщение от админа"
                }
                send_message_response = await client.post(
                    f"{base_url}/api/chats/{chat_id}/messages",
                    json=message_data,
                    cookies=cookies
                )
                print(f"Send message status: {send_message_response.status_code}")
                if send_message_response.status_code == 200:
                    message_response = send_message_response.json()
                    print(f"Message sent: {json.dumps(message_response, indent=2)}")
                else:
                    print(f"Send message failed: {send_message_response.text}")
            
        except Exception as e:
            print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(test_chat_api()) 