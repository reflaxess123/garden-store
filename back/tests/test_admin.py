import pytest
import pytest_asyncio
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from main import app
from app.db.database import get_db, Base
from app.db.models import Profile, Category, Product, Order, OrderItem # Добавлено для создания админа
from app.auth import get_password_hash # Добавлено для хеширования пароля
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
async def admin_client(client: AsyncClient, async_session_maker):
    async with async_session_maker() as session:
        admin_user = Profile(
            id=uuid.uuid4(),
            email=f"admin_{uuid.uuid4()}@example.com",
            hashed_password=get_password_hash("testpassword"), # Хешируем пароль
            full_name="Admin User",
            is_admin=True
        )
        session.add(admin_user)
        await session.commit()
        await session.refresh(admin_user)

        # Авторизация администратора
        response = await client.post(
            "/api/auth/signin",
            json={"email": admin_user.email, "password": "testpassword"}
        )
        assert response.status_code == 200
        token = response.json()["access_token"]
        client.headers["Authorization"] = f"Bearer {token}"
        yield client

@pytest_asyncio.fixture()
async def authenticated_client(client: AsyncClient, async_session_maker):
    async with async_session_maker() as session:
        test_user = Profile(
            id=uuid.uuid4(),
            email=f"user_{uuid.uuid4()}@example.com",
            hashed_password=get_password_hash("testpassword"), # Хешируем пароль
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
        yield client

# Вспомогательная фикстура для создания категории
@pytest_asyncio.fixture()
async def create_test_category_admin(async_session_maker):
    async with async_session_maker() as session:
        unique_slug = f"admin-category-{uuid.uuid4()}"
        test_category = Category(
            name="Admin Test Category",
            slug=unique_slug,
            image_url="http://example.com/admin_category.jpg",
            id=uuid.uuid4()
        )
        session.add(test_category)
        await session.commit()
        await session.refresh(test_category)
        yield test_category

# Вспомогательная фикстура для создания продукта
@pytest_asyncio.fixture()
async def create_test_product_admin(async_session_maker, create_test_category_admin):
    async with async_session_maker() as session:
        test_category = create_test_category_admin
        unique_slug = f"admin-product-{uuid.uuid4()}"
        test_product = Product(
            name="Admin Test Product",
            slug=unique_slug,
            description="A product for admin testing.",
            price=100.00,
            discount=10.00,
            category_id=test_category.id,
            image_url="http://example.com/admin_product.jpg",
            id=uuid.uuid4()
        )
        session.add(test_product)
        await session.commit()
        await session.refresh(test_product)
        yield test_product

# Вспомогательная фикстура для создания заказа
@pytest_asyncio.fixture()
async def create_test_order(async_session_maker, authenticated_client, create_test_product_admin):
    async with async_session_maker() as session:
        # Создаем пользователя, для которого будет создан заказ
        user = Profile(
            id=uuid.uuid4(),
            email=f"order_user_{uuid.uuid4()}@example.com",
            hashed_password=get_password_hash("testpassword"),
            full_name="Order User",
            is_admin=False
        )
        session.add(user)
        await session.commit()
        await session.refresh(user)

        # Создаем продукт для заказа
        product = create_test_product_admin

        # Создаем заказ
        order = Order(
            id=uuid.uuid4(),
            user_id=user.id,
            total_amount=product.price,
            status="pending",
            full_name="Order User",
            email=user.email,
            address="123 Test St",
            city="Test City",
            postal_code="12345",
            phone="123-456-7890"
        )
        session.add(order)
        await session.commit()
        await session.refresh(order)

        # Создаем элемент заказа
        order_item = OrderItem(
            id=uuid.uuid4(),
            order_id=order.id,
            product_id=product.id,
            quantity=1,
            price_snapshot=product.price,
            name=product.name,
            image_url=product.image_url
        )
        session.add(order_item)
        await session.commit()
        await session.refresh(order_item)

        yield order

# Тесты для административных эндпоинтов
@pytest.mark.asyncio
async def test_admin_get_products(admin_client: AsyncClient):
    response = await admin_client.get("/api/admin/products")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

@pytest.mark.asyncio
async def test_admin_create_product(admin_client: AsyncClient):
    # Сначала создаём категорию
    category_data = {
        "name": "Test Product Category",
        "slug": f"test-product-category-{uuid.uuid4()}",
        "imageUrl": "http://example.com/category_for_product.jpg"
    }
    category_response = await admin_client.post("/api/admin/categories", json=category_data)
    assert category_response.status_code == 201
    category_id = category_response.json()["id"]

    new_product_data = {
        "name": "Test Product",
        "slug": f"test-product-{uuid.uuid4()}",
        "description": "This is a test product.",
        "price": 99.99,
        "discount": 0.0,
        "categoryId": category_id,
        "imageUrl": "http://example.com/image.jpg"
    }
    response = await admin_client.post("/api/admin/products", json=new_product_data)
    assert response.status_code == 201
    assert response.json()["name"] == "Test Product"

@pytest.mark.asyncio
async def test_admin_get_product_by_id(admin_client: AsyncClient):
    # Сначала создаём категорию
    category_data = {
        "name": "ID Test Category",
        "slug": f"id-test-category-{uuid.uuid4()}",
        "imageUrl": "http://example.com/category_for_product.jpg"
    }
    category_response = await admin_client.post("/api/admin/categories", json=category_data)
    assert category_response.status_code == 201
    category_id = category_response.json()["id"]

    new_product_data = {
        "name": "Product for ID Test",
        "slug": f"id-test-product-{uuid.uuid4()}",
        "description": "...",
        "price": 10.00,
        "discount": 0.0,
        "categoryId": category_id,
        "imageUrl": "http://example.com/image.jpg"
    }
    create_response = await admin_client.post("/api/admin/products", json=new_product_data)
    product_id = create_response.json()["id"]

    response = await admin_client.get(f"/api/admin/products/{product_id}")
    assert response.status_code == 200
    assert response.json()["id"] == product_id

@pytest.mark.asyncio
async def test_admin_delete_product(admin_client: AsyncClient):
    # Сначала создаём категорию
    category_data = {
        "name": "Delete Product Category",
        "slug": f"delete-product-category-{uuid.uuid4()}",
        "imageUrl": "http://example.com/category_for_product.jpg"
    }
    category_response = await admin_client.post("/api/admin/categories", json=category_data)
    assert category_response.status_code == 201
    category_id = category_response.json()["id"]

    new_product_data = {
        "name": "Product to Delete",
        "slug": f"delete-product-{uuid.uuid4()}",
        "description": "...",
        "price": 1.00,
        "discount": 0.0,
        "categoryId": category_id,
        "imageUrl": "http://example.com/image.jpg"
    }
    create_response = await admin_client.post("/api/admin/products", json=new_product_data)
    product_id = create_response.json()["id"]

    delete_response = await admin_client.delete(f"/api/admin/products/{product_id}")
    assert delete_response.status_code == 204 # No Content for successful deletion

    # Проверяем, что продукт действительно удален
    get_response = await admin_client.get(f"/api/admin/products/{product_id}")
    assert get_response.status_code == 404

@pytest.mark.asyncio
async def test_admin_patch_product(admin_client: AsyncClient):
    # Сначала создаём категорию
    category_data = {
        "name": "Patch Product Category",
        "slug": f"patch-product-category-{uuid.uuid4()}",
        "imageUrl": "http://example.com/category_for_product.jpg"
    }
    category_response = await admin_client.post("/api/admin/categories", json=category_data)
    assert category_response.status_code == 201
    category_id = category_response.json()["id"]

    new_product_data = {
        "name": "Product to Patch",
        "slug": f"patch-product-{uuid.uuid4()}",
        "description": "Original description.",
        "price": 50.00,
        "discount": 0.0,
        "categoryId": category_id,
        "imageUrl": "http://example.com/original.jpg"
    }
    create_response = await admin_client.post("/api/admin/products", json=new_product_data)
    product_id = create_response.json()["id"]

    updated_data = {
        "name": "Patched Product Name",
        "description": "Updated description.",
        "price": 55.55
    }
    patch_response = await admin_client.patch(f"/api/admin/products/{product_id}", json=updated_data)
    assert patch_response.status_code == 200
    assert patch_response.json()["name"] == "Patched Product Name"
    assert patch_response.json()["description"] == "Updated description."
    assert float(patch_response.json()["price"]) == 55.55

    # Проверяем, что изменения применились
    get_response = await admin_client.get(f"/api/admin/products/{product_id}")
    assert get_response.status_code == 200
    assert get_response.json()["name"] == "Patched Product Name"

@pytest.mark.asyncio
async def test_admin_get_orders(admin_client: AsyncClient):
    response = await admin_client.get("/api/admin/orders")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

@pytest.mark.asyncio
async def test_admin_patch_order(admin_client: AsyncClient):
    # TODO: Сначала нужно создать заказ, чтобы его обновить.
    # Для этого нужен обычный пользователь и работающий эндпоинт /api/orders
    # Пока просто проверяем, что эндпоинт существует и принимает запросы
    # с некорректным ID заказа, ожидаем 404 или 422
    dummy_order_id = uuid.uuid4()
    response = await admin_client.patch(
        f"/api/admin/orders/{dummy_order_id}",
        json={"status": "completed"}
    )
    # Ожидаем 404, если заказ не найден, или 422, если неверный формат ID (хотя UUID должен быть правильным)
    assert response.status_code in [404, 422] 

@pytest.mark.asyncio
async def test_admin_get_categories(admin_client: AsyncClient):
    response = await admin_client.get("/api/admin/categories")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

@pytest.mark.asyncio
async def test_admin_create_category(admin_client: AsyncClient):
    unique_category_name = f"Test Category {uuid.uuid4()}"
    new_category_data = {
        "name": unique_category_name,
        "slug": unique_category_name.lower().replace(" ", "-"),
        "imageUrl": "http://example.com/category_image.jpg"
    }
    response = await admin_client.post("/api/admin/categories", json=new_category_data)
    assert response.status_code == 201
    assert response.json()["name"] == unique_category_name

@pytest.mark.asyncio
async def test_admin_patch_category(admin_client: AsyncClient):
    # Сначала создаём категорию для обновления
    unique_category_name = f"Category to Patch {uuid.uuid4()}"
    create_category_data = {
        "name": unique_category_name,
        "slug": unique_category_name.lower().replace(" ", "-"),
        "imageUrl": "http://example.com/category_original.jpg"
    }
    create_response = await admin_client.post("/api/admin/categories", json=create_category_data)
    category_id = create_response.json()["id"]

    updated_data = {
        "name": "Patched Category Name",
        "slug": f"patched-category-slug-{uuid.uuid4()}"
    }
    patch_response = await admin_client.patch(f"/api/admin/categories/{category_id}", json=updated_data)
    assert patch_response.status_code == 200
    assert patch_response.json()["name"] == "Patched Category Name"
    assert patch_response.json()["slug"].startswith("patched-category-slug-")

@pytest.mark.asyncio
async def test_admin_delete_category(admin_client: AsyncClient):
    # Сначала создаём категорию для удаления
    unique_category_name = f"Category to Delete {uuid.uuid4()}"
    create_category_data = {
        "name": unique_category_name,
        "slug": unique_category_name.lower().replace(" ", "-"),
        "imageUrl": "http://example.com/category_delete.jpg"
    }
    create_response = await admin_client.post("/api/admin/categories", json=create_category_data)
    category_id = create_response.json()["id"]

    delete_response = await admin_client.delete(f"/api/admin/categories/{category_id}")
    assert delete_response.status_code == 204

    # Проверяем, что категория действительно удалена
    get_response = await admin_client.get(f"/api/admin/categories/{category_id}")
    assert get_response.status_code == 404 