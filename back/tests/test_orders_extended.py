import pytest
import pytest_asyncio
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from main import app
from app.db.database import get_db, Base
from app.db.models import Profile, Category, Product, Order, OrderItem
from app.auth import get_password_hash
import os
import uuid
from sqlalchemy import select

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
async def authenticated_client(client: AsyncClient, async_session_maker):
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
    yield client, test_user
    client.headers.pop("Authorization", None)

@pytest_asyncio.fixture()
async def admin_client(client: AsyncClient, async_session_maker):
    async with async_session_maker() as session:
        admin_user = Profile(
            id=uuid.uuid4(),
            email=f"admin_{uuid.uuid4()}@example.com",
            hashed_password=get_password_hash("adminpassword"),
            full_name="Admin User",
            is_admin=True
        )
        session.add(admin_user)
        await session.commit()
        await session.refresh(admin_user)

    # Авторизация админа
    response = await client.post(
        "/api/auth/signin",
        json={"email": admin_user.email, "password": "adminpassword"}
    )
    assert response.status_code == 200
    token = response.json()["access_token"]
    client.headers["Authorization"] = f"Bearer {token}"
    yield client, admin_user
    client.headers.pop("Authorization", None)

@pytest_asyncio.fixture()
async def test_product(async_session_maker):
    async with async_session_maker() as session:
        # Создаем тестовую категорию
        test_category = Category(
            name="Test Category",
            slug=f"test-category-{uuid.uuid4()}",
            image_url="http://example.com/category.jpg",
            id=uuid.uuid4()
        )
        session.add(test_category)
        await session.commit()
        await session.refresh(test_category)

        # Создаем тестовый продукт
        test_product = Product(
            name="Test Product",
            slug=f"test-product-{uuid.uuid4()}",
            description="Test product description",
            price=100.00,
            category_id=test_category.id,
            image_url="http://example.com/product.jpg",
            id=uuid.uuid4()
        )
        session.add(test_product)
        await session.commit()
        await session.refresh(test_product)
        yield test_product

@pytest_asyncio.fixture()
async def test_order(async_session_maker, test_product):
    # Создаем заказ напрямую в базе данных, а не через API
    async with async_session_maker() as session:
        # Создаем пользователя для заказа
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

        # Создаем заказ
        from app.db.models import Order, OrderItem
        test_order = Order(
            id=uuid.uuid4(),
            user_id=test_user.id,
            total_amount=test_product.price,
            status="pending",
            full_name="Test User",
            email=test_user.email,
            address="123 Test St",
            city="Test City",
            postal_code="12345",
            phone="123-456-7890"
        )
        session.add(test_order)
        await session.commit()
        await session.refresh(test_order)

        # Создаем элемент заказа
        order_item = OrderItem(
            id=uuid.uuid4(),
            order_id=test_order.id,
            product_id=test_product.id,
            quantity=1,
            price_snapshot=test_product.price,
            name=test_product.name,
            image_url=test_product.image_url
        )
        session.add(order_item)
        await session.commit()
        await session.refresh(order_item)

        # Возвращаем данные заказа в том же формате, что и API
        yield {
            "id": str(test_order.id),
            "userId": str(test_order.user_id),
            "totalAmount": float(test_order.total_amount),
            "status": test_order.status,
            "fullName": test_order.full_name,
            "email": test_order.email,
            "address": test_order.address,
            "city": test_order.city,
            "postalCode": test_order.postal_code,
            "phone": test_order.phone,
            "createdAt": test_order.created_at.isoformat() + "Z",
            "orderItems": [{
                "id": str(order_item.id),
                "orderId": str(order_item.order_id),
                "productId": str(order_item.product_id),
                "quantity": order_item.quantity,
                "priceSnapshot": float(order_item.price_snapshot),
                "name": order_item.name,
                "imageUrl": order_item.image_url
            }]
                 }

@pytest_asyncio.fixture()
async def test_order_via_api(authenticated_client, test_product):
    """Фикстура для создания заказа через API - используется в тестах, где нужно проверить API создания заказов"""
    client, user = authenticated_client
    
    order_data = {
        "fullName": "Test User",
        "email": user.email,
        "address": "123 Test St",
        "city": "Test City",
        "postalCode": "12345",
        "phone": "123-456-7890",
        "orderItems": [{
            "productId": str(test_product.id),
            "quantity": 1,
            "priceSnapshot": float(test_product.price),
            "name": test_product.name,
            "imageUrl": test_product.image_url
        }],
        "totalAmount": float(test_product.price)
    }
    
    response = await client.post("/api/orders", json=order_data)
    assert response.status_code == 201
    yield response.json()

@pytest_asyncio.fixture()
async def authenticated_user_and_client(client: AsyncClient, async_session_maker):
    """Альтернативная фикстура для совместимости с базовыми тестами заказов"""
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
    """Фикстура для создания тестового продукта и категории для базовых тестов"""
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

# Тесты для получения заказов пользователя
@pytest.mark.asyncio
async def test_get_user_orders_empty(authenticated_client):
    client, user = authenticated_client
    response = await client.get("/api/orders")
    assert response.status_code == 200
    assert response.json() == []

@pytest.mark.asyncio
async def test_get_user_orders_with_data(authenticated_client, test_order_via_api):
    client, user = authenticated_client
    
    response = await client.get("/api/orders")
    assert response.status_code == 200
    
    data = response.json()
    assert len(data) == 1
    assert data[0]["id"] == test_order_via_api["id"]
    assert data[0]["userId"] == str(user.id)
    assert len(data[0]["orderItems"]) == 1

@pytest.mark.asyncio
async def test_get_user_order_by_id(authenticated_client, test_order_via_api):
    client, user = authenticated_client
    
    order_id = test_order_via_api["id"]
    response = await client.get(f"/api/orders/{order_id}")
    assert response.status_code == 200
    
    data = response.json()
    assert data["id"] == order_id
    assert data["userId"] == str(user.id)
    assert len(data["orderItems"]) == 1

@pytest.mark.asyncio
async def test_get_user_order_by_id_not_found(authenticated_client):
    client, user = authenticated_client
    
    non_existent_id = uuid.uuid4()
    response = await client.get(f"/api/orders/{non_existent_id}")
    assert response.status_code == 404
    assert response.json()["detail"] == "Order not found"

@pytest.mark.asyncio
async def test_orders_isolation_between_users(authenticated_client, test_order_via_api, async_session_maker):
    client1, user1 = authenticated_client
    
    # Создаем второго пользователя
    async with async_session_maker() as session:
        user2 = Profile(
            id=uuid.uuid4(),
            email=f"user2_{uuid.uuid4()}@example.com",
            hashed_password=get_password_hash("testpassword"),
            full_name="Test User 2",
            is_admin=False
        )
        session.add(user2)
        await session.commit()
        await session.refresh(user2)
    
    # Авторизация второго пользователя
    response = await client1.post(
        "/api/auth/signin",
        json={"email": user2.email, "password": "testpassword"}
    )
    assert response.status_code == 200
    token2 = response.json()["access_token"]
    
    # Второй пользователь проверяет свои заказы (должно быть пусто)
    client1.headers["Authorization"] = f"Bearer {token2}"
    orders_response = await client1.get("/api/orders")
    assert orders_response.json() == []
    
    # Второй пользователь не может получить заказ первого пользователя
    order_id = test_order_via_api["id"]
    order_response = await client1.get(f"/api/orders/{order_id}")
    assert order_response.status_code == 404

# Тесты для админского удаления заказов
@pytest.mark.asyncio
async def test_admin_delete_order(admin_client, test_order):
    client, admin = admin_client
    
    order_id = test_order["id"]
    response = await client.delete(f"/api/admin/orders/{order_id}")
    assert response.status_code == 204
    
    # Проверяем, что заказ действительно удален
    get_response = await client.get("/api/admin/orders")
    orders = get_response.json()
    order_ids = [order["id"] for order in orders]
    assert order_id not in order_ids

@pytest.mark.asyncio
async def test_admin_delete_order_not_found(admin_client):
    client, admin = admin_client
    
    non_existent_id = uuid.uuid4()
    response = await client.delete(f"/api/admin/orders/{non_existent_id}")
    assert response.status_code == 404
    assert response.json()["detail"] == "Order not found"

@pytest.mark.asyncio
async def test_admin_delete_order_unauthorized(authenticated_client, test_order_via_api):
    client, user = authenticated_client
    
    # Обычный пользователь не может удалять заказы через админский эндпоинт
    order_id = test_order_via_api["id"]
    response = await client.delete(f"/api/admin/orders/{order_id}")
    assert response.status_code == 403  # Forbidden или 401 Unauthorized

# Базовые тесты создания и удаления заказов (из test_orders.py)
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
    total_amount = float(test_product.price) * 1

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
    total_amount = float(test_product.price) * 1

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

    delete_response = await client.request("DELETE", "/api/orders", json={"orderId": order_id})
    assert delete_response.status_code == 204 