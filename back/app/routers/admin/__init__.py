"""Admin routers module"""

from fastapi import APIRouter

from . import categories, orders, products, users

# Создаем главный роутер для админки
router = APIRouter()

# Подключаем роутеры различных модулей
router.include_router(categories.router, tags=["Admin Categories"])
router.include_router(products.router, tags=["Admin Products"])
router.include_router(orders.router, tags=["Admin Orders"])
router.include_router(users.router, tags=["Admin Users"])
