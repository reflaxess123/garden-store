import pytest
import pytest_asyncio
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from main import app
from app.db.database import get_db, Base
from app.db.models import Profile, Category, Product, Order, OrderItem # Добавлено для создания пользователя, категорий, продуктов и заказов
from app.auth import get_password_hash
import os
import asyncio
import uuid

os.environ.setdefault("SECRET_KEY", "test_secret")

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise ValueError("DATABASE_URL environment variable is not set.")

@pytest_asyncio.fixture()
async def test_engine():
    engine = create_async_engine(DATABASE_URL, echo=True)
    yield engine
    await engine.dispose()

@pytest_asyncio.fixture()
async def async_session_maker(test_engine):
    return sessionmaker(
        autocommit=False,
        autoflush=False,
        bind=test_engine,
        class_=AsyncSession,
        expire_on_commit=False,
    )

@pytest_asyncio.fixture(autouse=True)
async def setup_database(test_engine):
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)

@pytest_asyncio.fixture()
async def client(test_engine, async_session_maker):
    async def override_get_db():
        async with async_session_maker() as session:
            yield session

    app.dependency_overrides[get_db] = override_get_db
    async with AsyncClient(app=app, base_url="http://test") as c:
        yield c
    app.dependency_overrides.clear()

@pytest_asyncio.fixture()
async def authenticated_user_and_client(client: AsyncClient, async_session_maker):
    async with async_session_maker() as session:
        test_user = Profile(
            id=uuid.uuid4(),
            email=f"user_{uuid.uuid4()}@example.com",
            hashed_password=get_password_hash("testpassword"),
            full_name="Test User",
            is_admin=False
        )
        session.add(test_user)
        await session.commit()
        await session.refresh(test_user)

    # Авторизация пользователя
    response = await client.post(
        "/api/auth/signin",
        json={"email": test_user.email, "password": "testpassword"}
    )
    assert response.status_code == 200
    token = response.json()["access_token"]
    client.headers["Authorization"] = f"Bearer {token}"
    yield {"client": client, "user": test_user}
    client.headers.pop("Authorization", None)

@pytest_asyncio.fixture()
async def create_test_product_and_category(async_session_maker):
    async with async_session_maker() as session:
        test_category = Category(
            name="Test Category for Product",
            slug=f"test-category-product-{uuid.uuid4()}",
            image_url="http://example.com/test_category.jpg",
            id=uuid.uuid4()
        )
        session.add(test_category)
        await session.commit()
        await session.refresh(test_category)

        test_product = Product(
            name="Test Product for Order",
            description="Description",
            price=10.00,
            discount=0.0,
            category_id=test_category.id,
            image_url="http://example.com/test_product.jpg",
            slug=f"test-product-order-{uuid.uuid4()}",
            id=uuid.uuid4()
        )
        session.add(test_product)
        await session.commit()
        await session.refresh(test_product)
        yield test_product

# Тесты для эндпоинтов заказов
@pytest.mark.asyncio
async def test_create_order(authenticated_user_and_client, create_test_product_and_category):
    test_product = create_test_product_and_category
    user = authenticated_user_and_client["user"]
    client = authenticated_user_and_client["client"]
    order_items_data = [
        {
            "productId": str(test_product.id),
            "quantity": 1,
            "priceSnapshot": float(test_product.price),
            "name": test_product.name,
            "imageUrl": test_product.image_url
        }
    ]
    total_amount = test_product.price * 1

    order_data = {
        "fullName": user.full_name or "Test User",
        "email": user.email,
        "address": "123 Test St",
        "city": "Test City",
        "postalCode": "12345",
        "phone": "123-456-7890",
        "orderItems": order_items_data,
        "totalAmount": total_amount
    }

    response = await client.post("/api/orders", json=order_data)
    assert response.status_code == 201
    assert "id" in response.json()
    assert response.json()["fullName"] == (user.full_name or "Test User")
    assert len(response.json()["orderItems"]) == 1

@pytest.mark.asyncio
async def test_delete_order(authenticated_user_and_client, create_test_product_and_category):
    test_product = create_test_product_and_category
    user = authenticated_user_and_client["user"]
    client = authenticated_user_and_client["client"]
    order_items_data = [
        {
            "productId": str(test_product.id),
            "quantity": 1,
            "priceSnapshot": float(test_product.price),
            "name": test_product.name,
            "imageUrl": test_product.image_url
        }
    ]
    total_amount = test_product.price * 1

    order_data = {
        "fullName": user.full_name or "Test User",
        "email": user.email,
        "address": "456 Delete Ave",
        "city": "Delete City",
        "postalCode": "67890",
        "phone": "098-765-4321",
        "orderItems": order_items_data,
        "totalAmount": total_amount
    }

    create_response = await client.post("/api/orders", json=order_data)
    assert create_response.status_code == 201
    order_id = create_response.json()["id"]

    delete_response = await client.delete("/api/orders", json={"orderId": order_id})
    assert delete_response.status_code == 204

    # TODO: Проверить, что заказ действительно удален. Нужен эндпоинт для получения заказов пользователя.
    # Сейчас просто убеждаемся, что запрос на удаление прошел успешно. 