"""Admin user management routes"""

import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth import get_current_admin_user, pwd_context
from app.db import models
from app.db.database import get_db
from app.schemas import CustomUser, UserCreate, UserInDB, UserUpdate

router = APIRouter()


@router.get("/admin/users", response_model=list[UserInDB])
async def get_admin_users(
    db: AsyncSession = Depends(get_db), current_user: CustomUser = Depends(get_current_admin_user)
) -> list[UserInDB]:
    """Получить список всех пользователей (только для админа)"""
    # Упрощаем запрос - сначала получаем всех пользователей
    try:
        result = await db.execute(select(models.Profile))
        users = result.scalars().all()
        print(f"DEBUG: Found {len(users)} users in database")

        users_list = []
        for user in users:
            # Подсчитываем статистику для каждого пользователя
            orders_result = await db.execute(
                select(func.count(models.Order.id)).filter(models.Order.user_id == user.id)
            )
            orders_count = orders_result.scalar() or 0

            favorites_result = await db.execute(
                select(func.count(models.Favourite.id)).filter(models.Favourite.user_id == user.id)
            )
            favorites_count = favorites_result.scalar() or 0

            cart_items_result = await db.execute(
                select(func.count(models.CartItem.id)).filter(models.CartItem.user_id == user.id)
            )
            cart_items_count = cart_items_result.scalar() or 0

            user_data = UserInDB(
                id=user.id,
                email=user.email,
                fullName=user.full_name,
                isAdmin=user.is_admin,
                createdAt=None,
                ordersCount=orders_count,
                favoritesCount=favorites_count,
                cartItemsCount=cart_items_count,
            )
            users_list.append(user_data)

        print(f"DEBUG: Returning {len(users_list)} users")
        return users_list

    except Exception as e:
        print(f"DEBUG: Error in get_admin_users: {e}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {e}") from e


@router.post("/admin/users", response_model=UserInDB, status_code=status.HTTP_201_CREATED)
async def create_admin_user(
    user_in: UserCreate, db: AsyncSession = Depends(get_db), current_user: CustomUser = Depends(get_current_admin_user)
) -> UserInDB:
    """Создать нового пользователя (только для админа)"""
    # Проверяем, не существует ли пользователь с таким email
    result = await db.execute(select(models.Profile).filter(models.Profile.email == user_in.email))
    existing_user = result.scalars().first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Пользователь с таким email уже существует")

    # Хэшируем пароль
    hashed_password = pwd_context.hash(user_in.password)

    # Создаем нового пользователя
    db_user = models.Profile(
        id=uuid.uuid4(),
        email=user_in.email,
        hashed_password=hashed_password,
        full_name=user_in.fullName,
        is_admin=user_in.isAdmin,
    )

    db.add(db_user)
    await db.commit()
    await db.refresh(db_user)

    return UserInDB(
        id=db_user.id,
        email=db_user.email,
        fullName=db_user.full_name,
        isAdmin=db_user.is_admin,
        createdAt=None,
        ordersCount=0,
        favoritesCount=0,
        cartItemsCount=0,
    )


@router.get("/admin/users/{user_id}", response_model=UserInDB)
async def get_admin_user(
    user_id: uuid.UUID, db: AsyncSession = Depends(get_db), current_user: CustomUser = Depends(get_current_admin_user)
) -> UserInDB:
    """Получить информацию о пользователе (только для админа)"""
    result = await db.execute(select(models.Profile).filter(models.Profile.id == user_id))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")

    # Подсчитываем статистику
    orders_result = await db.execute(select(func.count(models.Order.id)).filter(models.Order.user_id == user_id))
    orders_count = orders_result.scalar() or 0

    favorites_result = await db.execute(
        select(func.count(models.Favourite.id)).filter(models.Favourite.user_id == user_id)
    )
    favorites_count = favorites_result.scalar() or 0

    cart_items_result = await db.execute(
        select(func.count(models.CartItem.id)).filter(models.CartItem.user_id == user_id)
    )
    cart_items_count = cart_items_result.scalar() or 0

    return UserInDB(
        id=user.id,
        email=user.email,
        fullName=user.full_name,
        isAdmin=user.is_admin,
        createdAt=None,
        ordersCount=orders_count,
        favoritesCount=favorites_count,
        cartItemsCount=cart_items_count,
    )


@router.patch("/admin/users/{user_id}", response_model=UserInDB)
async def update_admin_user(
    user_id: uuid.UUID,
    user_in: UserUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: CustomUser = Depends(get_current_admin_user),
) -> UserInDB:
    """Обновить пользователя (только для админа)"""
    result = await db.execute(select(models.Profile).filter(models.Profile.id == user_id))
    db_user = result.scalars().first()
    if not db_user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")

    # Проверяем, не пытается ли админ изменить email на уже существующий
    if user_in.email and user_in.email != db_user.email:
        email_check = await db.execute(select(models.Profile).filter(models.Profile.email == user_in.email))
        if email_check.scalars().first():
            raise HTTPException(status_code=400, detail="Пользователь с таким email уже существует")

    # Обновляем поля
    update_data = user_in.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        if key == "fullName":
            db_user.full_name = value
        elif key == "isAdmin":
            db_user.is_admin = value
        else:
            setattr(db_user, key, value)

    db.add(db_user)
    await db.commit()
    await db.refresh(db_user)

    # Возвращаем обновленного пользователя с статистикой
    return await get_admin_user(user_id, db, current_user)


@router.delete("/admin/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_admin_user(
    user_id: uuid.UUID, db: AsyncSession = Depends(get_db), current_user: CustomUser = Depends(get_current_admin_user)
) -> None:
    """Удалить пользователя (только для админа)"""
    if current_user.id == user_id:
        raise HTTPException(status_code=400, detail="Нельзя удалить самого себя")

    result = await db.execute(select(models.Profile).filter(models.Profile.id == user_id))
    db_user = result.scalars().first()
    if not db_user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")

    # Удаляем связанные данные
    # Избранное
    favorites_result = await db.execute(select(models.Favourite).filter(models.Favourite.user_id == user_id))
    favorites = favorites_result.scalars().all()
    for favorite in favorites:
        await db.delete(favorite)

    # Корзина
    cart_items_result = await db.execute(select(models.CartItem).filter(models.CartItem.user_id == user_id))
    cart_items = cart_items_result.scalars().all()
    for cart_item in cart_items:
        await db.delete(cart_item)

    # Заказы и их элементы
    orders_result = await db.execute(select(models.Order).filter(models.Order.user_id == user_id))
    orders = orders_result.scalars().all()
    for order in orders:
        # Удаляем элементы заказа
        order_items_result = await db.execute(select(models.OrderItem).filter(models.OrderItem.order_id == order.id))
        order_items = order_items_result.scalars().all()
        for order_item in order_items:
            await db.delete(order_item)
        # Удаляем заказ
        await db.delete(order)

    # Удаляем пользователя
    await db.delete(db_user)
    await db.commit()
