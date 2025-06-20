from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import select
from app.db.database import get_db
from app.db import models
from app.schemas import CategoryInDB, CategoryCreate, CategoryUpdate, ProductInDB, ProductCreate, ProductUpdate, OrderInDB, OrderUpdateStatus, CustomUser, UserInDB, UserCreate, UserUpdate
from app.auth import get_current_admin_user
from typing import List, Optional
import uuid
from passlib.context import CryptContext

router = APIRouter()

# Контекст для хэширования паролей
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# region Admin Categories
@router.get("/admin/categories", response_model=List[CategoryInDB])
async def get_admin_categories(
    db: Session = Depends(get_db),
    current_user: CustomUser = Depends(get_current_admin_user)
):
    result = await db.execute(select(models.Category))
    categories = result.scalars().all()
    return [CategoryInDB.model_validate(cat, from_attributes=True) for cat in categories]

@router.post("/admin/categories", response_model=CategoryInDB, status_code=status.HTTP_201_CREATED)
async def create_admin_category(
    category_in: CategoryCreate, db: Session = Depends(get_db),
    current_user: CustomUser = Depends(get_current_admin_user)
):
    result = await db.execute(select(models.Category).filter(models.Category.slug == category_in.slug))
    db_category = result.scalars().first()
    if db_category:
        raise HTTPException(status_code=400, detail="Category with this slug already exists")

    db_category = models.Category(
        name=category_in.name,
        slug=category_in.slug,
        description=category_in.description,
        image_url=category_in.imageUrl
    )
    db.add(db_category)
    await db.commit()
    await db.refresh(db_category)
    return CategoryInDB.model_validate(db_category, from_attributes=True)

@router.patch("/admin/categories/{category_id}", response_model=CategoryInDB)
async def update_admin_category(
    category_id: uuid.UUID, category_in: CategoryUpdate, db: Session = Depends(get_db),
    current_user: CustomUser = Depends(get_current_admin_user)
):
    result = await db.execute(select(models.Category).filter(models.Category.id == category_id))
    db_category = result.scalars().first()
    if not db_category:
        raise HTTPException(status_code=404, detail="Category not found")
    
    update_data = category_in.dict(exclude_unset=True)
    for key, value in update_data.items():
        if key == "imageUrl":
            setattr(db_category, "image_url", value)
        else:
            setattr(db_category, key, value)
    
    db.add(db_category)
    await db.commit()
    await db.refresh(db_category)
    return CategoryInDB.model_validate(db_category, from_attributes=True)

@router.delete("/admin/categories/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_admin_category(
    category_id: uuid.UUID, db: Session = Depends(get_db),
    current_user: CustomUser = Depends(get_current_admin_user)
):
    result = await db.execute(select(models.Category).filter(models.Category.id == category_id))
    db_category = result.scalars().first()
    if not db_category:
        raise HTTPException(status_code=404, detail="Category not found")
    
    await db.delete(db_category)
    await db.commit()
    return

@router.get("/admin/categories/{category_id}", response_model=CategoryInDB)
async def get_admin_category(category_id: uuid.UUID, db: Session = Depends(get_db), current_user: CustomUser = Depends(get_current_admin_user)):
    result = await db.execute(select(models.Category).filter(models.Category.id == category_id))
    category = result.scalars().first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    return CategoryInDB.model_validate(category, from_attributes=True)
# endregion

# region Admin Products
@router.get("/admin/products", response_model=List[ProductInDB])
async def get_admin_products(
    db: Session = Depends(get_db),
    current_user: CustomUser = Depends(get_current_admin_user)
):
    result = await db.execute(select(models.Product).options(joinedload(models.Product.category)))
    products = result.scalars().unique().all()
    return [ProductInDB.model_validate(prod, from_attributes=True) for prod in products]

@router.post("/admin/products", response_model=ProductInDB, status_code=status.HTTP_201_CREATED)
async def create_admin_product(
    product_in: ProductCreate, db: Session = Depends(get_db),
    current_user: CustomUser = Depends(get_current_admin_user)
):
    result = await db.execute(select(models.Product).filter(models.Product.slug == product_in.slug))
    db_product = result.scalars().first()
    if db_product:
        raise HTTPException(status_code=400, detail="Product with this slug already exists")

    db_product = models.Product(
        name=product_in.name,
        slug=product_in.slug,
        description=product_in.description,
        price=product_in.price,
        discount=product_in.discount,
        characteristics=product_in.characteristics,
        image_url=product_in.imageUrl,
        category_id=product_in.categoryId
    )
    db.add(db_product)
    await db.commit()
    await db.refresh(db_product)
    
    # Загружаем продукт заново с категорией для корректной сериализации
    result = await db.execute(
        select(models.Product)
        .options(joinedload(models.Product.category))
        .filter(models.Product.id == db_product.id)
    )
    db_product_with_category = result.scalars().first()
    return ProductInDB.model_validate(db_product_with_category, from_attributes=True)

@router.get("/admin/products/{product_id}", response_model=ProductInDB)
async def get_admin_product(
    product_id: uuid.UUID, db: Session = Depends(get_db),
    current_user: CustomUser = Depends(get_current_admin_user)
):
    result = await db.execute(select(models.Product).options(joinedload(models.Product.category)).filter(models.Product.id == product_id))
    product = result.scalars().first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return ProductInDB.model_validate(product, from_attributes=True)

@router.delete("/admin/products/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_admin_product(
    product_id: uuid.UUID, db: Session = Depends(get_db),
    current_user: CustomUser = Depends(get_current_admin_user)
):
    result = await db.execute(select(models.Product).filter(models.Product.id == product_id))
    db_product = result.scalars().first()
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    await db.delete(db_product)
    await db.commit()
    return

@router.patch("/admin/products/{product_id}", response_model=ProductInDB)
async def update_admin_product(
    product_id: uuid.UUID, product_in: ProductUpdate, db: Session = Depends(get_db),
    current_user: CustomUser = Depends(get_current_admin_user)
):
    result = await db.execute(select(models.Product).filter(models.Product.id == product_id))
    db_product = result.scalars().first()
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    update_data = product_in.dict(exclude_unset=True)
    for key, value in update_data.items():
        if key == "imageUrl":
            setattr(db_product, "image_url", value)
        elif key == "categoryId":
            setattr(db_product, "category_id", value)
        else:
            setattr(db_product, key, value)
    
    db.add(db_product)
    await db.commit()
    await db.refresh(db_product)
    
    # Загружаем продукт заново с категорией для корректной сериализации
    result = await db.execute(
        select(models.Product)
        .options(joinedload(models.Product.category))
        .filter(models.Product.id == product_id)
    )
    db_product_with_category = result.scalars().first()
    return ProductInDB.model_validate(db_product_with_category, from_attributes=True)
# endregion

# region Admin Orders
@router.get("/admin/orders", response_model=List[OrderInDB])
async def get_admin_orders(
    db: Session = Depends(get_db),
    current_user: CustomUser = Depends(get_current_admin_user)
):
    result = await db.execute(select(models.Order).options(joinedload(models.Order.order_items)))
    orders = result.scalars().unique().all()
    return [OrderInDB.model_validate(order, from_attributes=True) for order in orders]

@router.patch("/admin/orders/{order_id}", response_model=OrderInDB)
async def update_admin_order_status(
    order_id: uuid.UUID, order_update: OrderUpdateStatus, db: Session = Depends(get_db),
    current_user: CustomUser = Depends(get_current_admin_user)
):
    result = await db.execute(select(models.Order).filter(models.Order.id == order_id))
    db_order = result.scalars().first()
    if not db_order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    db_order.status = order_update.status
    db.add(db_order)
    await db.commit()
    await db.refresh(db_order)
    
    # Загружаем заказ заново с order_items для корректной сериализации
    result = await db.execute(
        select(models.Order)
        .options(joinedload(models.Order.order_items))
        .filter(models.Order.id == order_id)
    )
    db_order_with_items = result.scalars().first()
    return OrderInDB.model_validate(db_order_with_items, from_attributes=True)

@router.delete("/admin/orders/{order_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_admin_order(
    order_id: uuid.UUID, db: Session = Depends(get_db),
    current_user: CustomUser = Depends(get_current_admin_user)
):
    """Удалить заказ (только для админа)"""
    result = await db.execute(select(models.Order).filter(models.Order.id == order_id))
    db_order = result.scalars().first()
    if not db_order:
        raise HTTPException(status_code=404, detail="Order not found")
    
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
    return
# endregion

# region Admin Users
@router.get("/admin/users", response_model=List[UserInDB])
async def get_admin_users(
    db: Session = Depends(get_db),
    current_user: CustomUser = Depends(get_current_admin_user)
):
    """Получить список всех пользователей (только для админа)"""
    from sqlalchemy import func, text
    
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
                cartItemsCount=cart_items_count
            )
            users_list.append(user_data)
            
        print(f"DEBUG: Returning {len(users_list)} users")
        return users_list
        
    except Exception as e:
        print(f"DEBUG: Error in get_admin_users: {e}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {e}")

@router.post("/admin/users", response_model=UserInDB, status_code=status.HTTP_201_CREATED)
async def create_admin_user(
    user_in: UserCreate, db: Session = Depends(get_db),
    current_user: CustomUser = Depends(get_current_admin_user)
):
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
        is_admin=user_in.isAdmin
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
        cartItemsCount=0
    )

@router.get("/admin/users/{user_id}", response_model=UserInDB)
async def get_admin_user(
    user_id: uuid.UUID, db: Session = Depends(get_db),
    current_user: CustomUser = Depends(get_current_admin_user)
):
    """Получить информацию о пользователе (только для админа)"""
    result = await db.execute(select(models.Profile).filter(models.Profile.id == user_id))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")
    
    # Подсчитываем статистику
    orders_result = await db.execute(
        select(func.count(models.Order.id)).filter(models.Order.user_id == user_id)
    )
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
        cartItemsCount=cart_items_count
    )

@router.patch("/admin/users/{user_id}", response_model=UserInDB)
async def update_admin_user(
    user_id: uuid.UUID, user_in: UserUpdate, db: Session = Depends(get_db),
    current_user: CustomUser = Depends(get_current_admin_user)
):
    """Обновить пользователя (только для админа)"""
    result = await db.execute(select(models.Profile).filter(models.Profile.id == user_id))
    db_user = result.scalars().first()
    if not db_user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")
    
    # Проверяем, не пытается ли админ изменить email на уже существующий
    if user_in.email and user_in.email != db_user.email:
        email_check = await db.execute(
            select(models.Profile).filter(models.Profile.email == user_in.email)
        )
        if email_check.scalars().first():
            raise HTTPException(status_code=400, detail="Пользователь с таким email уже существует")
    
    # Обновляем поля
    update_data = user_in.dict(exclude_unset=True)
    for key, value in update_data.items():
        if key == "fullName":
            setattr(db_user, "full_name", value)
        elif key == "isAdmin":
            setattr(db_user, "is_admin", value)
        else:
            setattr(db_user, key, value)
    
    db.add(db_user)
    await db.commit()
    await db.refresh(db_user)
    
    # Возвращаем обновленного пользователя с статистикой
    return await get_admin_user(user_id, db, current_user)

@router.delete("/admin/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_admin_user(
    user_id: uuid.UUID, db: Session = Depends(get_db),
    current_user: CustomUser = Depends(get_current_admin_user)
):
    """Удалить пользователя (только для админа)"""
    if current_user.id == user_id:
        raise HTTPException(status_code=400, detail="Нельзя удалить самого себя")
    
    result = await db.execute(select(models.Profile).filter(models.Profile.id == user_id))
    db_user = result.scalars().first()
    if not db_user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")
    
    # Удаляем связанные данные
    # Избранное
    favorites_result = await db.execute(
        select(models.Favourite).filter(models.Favourite.user_id == user_id)
    )
    favorites = favorites_result.scalars().all()
    for favorite in favorites:
        await db.delete(favorite)
    
    # Корзина
    cart_items_result = await db.execute(
        select(models.CartItem).filter(models.CartItem.user_id == user_id)
    )
    cart_items = cart_items_result.scalars().all()
    for cart_item in cart_items:
        await db.delete(cart_item)
    
    # Заказы и их элементы
    orders_result = await db.execute(
        select(models.Order).filter(models.Order.user_id == user_id)
    )
    orders = orders_result.scalars().all()
    for order in orders:
        # Удаляем элементы заказа
        order_items_result = await db.execute(
            select(models.OrderItem).filter(models.OrderItem.order_id == order.id)
        )
        order_items = order_items_result.scalars().all()
        for order_item in order_items:
            await db.delete(order_item)
        # Удаляем заказ
        await db.delete(order)
    
    # Удаляем пользователя
    await db.delete(db_user)
    await db.commit()
    return
# endregion 