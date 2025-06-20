#!/usr/bin/env python3
"""
Скрипт для добавления администратора в систему
Использование: python add_admin.py
"""

import asyncio
import uuid
import sys
import os
from getpass import getpass
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from passlib.context import CryptContext

# Добавляем путь к корневой директории проекта
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.db.database import engine
from app.db.models import Profile

# Контекст для хэширования паролей (такой же как в auth.py)
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    """Хэширование пароля"""
    return pwd_context.hash(password)

async def add_admin():
    """Добавление администратора"""
    print("=== Добавление администратора ===")
    
    email = input("Введите email администратора: ").strip()
    if not email:
        print("❌ Email не может быть пустым!")
        return
    
    password = getpass("Введите пароль: ").strip()
    if len(password) < 6:
        print("❌ Пароль должен быть не менее 6 символов!")
        return
    
    confirm_password = getpass("Подтвердите пароль: ").strip()
    if password != confirm_password:
        print("❌ Пароли не совпадают!")
        return
    
    full_name = input("Введите полное имя (необязательно): ").strip() or None
    
    try:
        async with AsyncSession(engine, expire_on_commit=False) as session:
            # Проверяем, существует ли пользователь с таким email
            result = await session.execute(
                select(Profile).filter(Profile.email == email)
            )
            existing_user = result.scalars().first()
            
            if existing_user:
                if existing_user.is_admin:
                    print(f"❌ Пользователь {email} уже является администратором!")
                else:
                    # Делаем существующего пользователя админом
                    existing_user.is_admin = True
                    await session.commit()
                    print(f"✅ Пользователь {email} теперь администратор!")
                return
            
            # Создаем нового администратора
            admin_user = Profile(
                id=uuid.uuid4(),
                email=email,
                hashed_password=hash_password(password),
                full_name=full_name,
                is_admin=True
            )
            
            session.add(admin_user)
            await session.commit()
            
            print(f"✅ Администратор {email} успешно создан!")
            if full_name:
                print(f"   Имя: {full_name}")
            print(f"   ID: {admin_user.id}")
            
    except Exception as e:
        print(f"❌ Ошибка при создании администратора: {e}")

async def add_user():
    """Добавление обычного пользователя"""
    print("=== Добавление пользователя ===")
    
    email = input("Введите email пользователя: ").strip()
    if not email:
        print("❌ Email не может быть пустым!")
        return
    
    password = getpass("Введите пароль: ").strip()
    if len(password) < 6:
        print("❌ Пароль должен быть не менее 6 символов!")
        return
    
    confirm_password = getpass("Подтвердите пароль: ").strip()
    if password != confirm_password:
        print("❌ Пароли не совпадают!")
        return
    
    full_name = input("Введите полное имя (необязательно): ").strip() or None
    
    try:
        async with AsyncSession(engine, expire_on_commit=False) as session:
            # Проверяем, существует ли пользователь с таким email
            result = await session.execute(
                select(Profile).filter(Profile.email == email)
            )
            existing_user = result.scalars().first()
            
            if existing_user:
                print(f"❌ Пользователь {email} уже существует!")
                return
            
            # Создаем нового пользователя
            new_user = Profile(
                id=uuid.uuid4(),
                email=email,
                hashed_password=hash_password(password),
                full_name=full_name,
                is_admin=False
            )
            
            session.add(new_user)
            await session.commit()
            
            print(f"✅ Пользователь {email} успешно создан!")
            if full_name:
                print(f"   Имя: {full_name}")
            print(f"   ID: {new_user.id}")
            
    except Exception as e:
        print(f"❌ Ошибка при создании пользователя: {e}")

async def create_users_batch():
    """Создание пользователей из скрипта"""
    try:
        async with AsyncSession(engine, expire_on_commit=False) as session:
            # Админ: reflaxess@gmail.com, 123123
            admin_user = Profile(
                id=uuid.uuid4(),
                email="reflaxess@gmail.com",
                hashed_password=hash_password("123123"),
                full_name="Admin User",
                is_admin=True
            )
            
            # Пользователь: asd@asd.ru, 123123
            regular_user = Profile(
                id=uuid.uuid4(),
                email="asd@asd.ru",
                hashed_password=hash_password("123123"),
                full_name="Regular User",
                is_admin=False
            )
            
            session.add(admin_user)
            session.add(regular_user)
            await session.commit()
            
            print(f"✅ Администратор reflaxess@gmail.com создан! ID: {admin_user.id}")
            print(f"✅ Пользователь asd@asd.ru создан! ID: {regular_user.id}")
            
    except Exception as e:
        print(f"❌ Ошибка при создании пользователей: {e}")

async def list_admins():
    """Список всех администраторов"""
    print("\n=== Список администраторов ===")
    
    try:
        async with AsyncSession(engine, expire_on_commit=False) as session:
            result = await session.execute(
                select(Profile).filter(Profile.is_admin == True)
            )
            admins = result.scalars().all()
            
            if not admins:
                print("❌ Администраторы не найдены")
                return
            
            for admin in admins:
                print(f"📧 {admin.email}")
                if admin.full_name:
                    print(f"   Имя: {admin.full_name}")
                print(f"   ID: {admin.id}")
                print("   ---")
                
    except Exception as e:
        print(f"❌ Ошибка при получении списка администраторов: {e}")

async def main():
    """Главная функция"""
    print("🌱 Garden Store - Управление пользователями")
    
    while True:
        print("\nВыберите действие:")
        print("1. Добавить администратора")
        print("2. Добавить пользователя")
        print("3. Показать список администраторов")
        print("4. Создать пользователей для тестирования (reflaxess@gmail.com и asd@asd.ru)")
        print("5. Выйти")
        
        choice = input("\nВаш выбор (1-5): ").strip()
        
        if choice == "1":
            await add_admin()
        elif choice == "2":
            await add_user()
        elif choice == "3":
            await list_admins()
        elif choice == "4":
            await create_users_batch()
        elif choice == "5":
            print("👋 До свидания!")
            break
        else:
            print("❌ Неверный выбор! Попробуйте снова.")

if __name__ == "__main__":
    asyncio.run(main()) 