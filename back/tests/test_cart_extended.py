import pytest
import pytest_asyncio
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from main import app
from app.db.database import get_db, Base
from app.db.models import Profile, Category, Product, CartItem
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

# Тесты для корзины
@pytest.mark.asyncio
async def test_get_empty_cart(authenticated_client):
    client, user = authenticated_client
    response = await client.get("/api/cart")
    assert response.status_code == 200
    assert response.json() == []

@pytest.mark.asyncio
async def test_add_to_cart(authenticated_client, test_product):
    client, user = authenticated_client
    
    cart_item_data = {
        "productId": str(test_product.id),
        "quantity": 2
    }
    
    response = await client.post("/api/cart/add", json=cart_item_data)
    assert response.status_code == 201
    
    data = response.json()
    assert data["productId"] == str(test_product.id)
    assert data["quantity"] == 2
    assert data["userId"] == str(user.id)

@pytest.mark.asyncio
async def test_add_to_cart_product_not_found(authenticated_client):
    client, user = authenticated_client
    
    cart_item_data = {
        "productId": str(uuid.uuid4()),
        "quantity": 1
    }
    
    response = await client.post("/api/cart/add", json=cart_item_data)
    assert response.status_code == 404
    assert response.json()["detail"] == "Product not found"

@pytest.mark.asyncio
async def test_add_existing_product_to_cart(authenticated_client, test_product):
    client, user = authenticated_client
    
    cart_item_data = {
        "productId": str(test_product.id),
        "quantity": 1
    }
    
    # Добавляем товар первый раз
    response1 = await client.post("/api/cart/add", json=cart_item_data)
    assert response1.status_code == 201
    assert response1.json()["quantity"] == 1
    
    # Добавляем тот же товар еще раз
    response2 = await client.post("/api/cart/add", json=cart_item_data)
    assert response2.status_code == 201
    assert response2.json()["quantity"] == 2  # Количество должно увеличиться

@pytest.mark.asyncio
async def test_get_cart_with_items(authenticated_client, test_product):
    client, user = authenticated_client
    
    # Добавляем товар в корзину
    cart_item_data = {
        "productId": str(test_product.id),
        "quantity": 3
    }
    await client.post("/api/cart/add", json=cart_item_data)
    
    # Получаем корзину
    response = await client.get("/api/cart")
    assert response.status_code == 200
    
    data = response.json()
    assert len(data) == 1
    assert data[0]["productId"] == str(test_product.id)
    assert data[0]["quantity"] == 3

@pytest.mark.asyncio
async def test_update_cart_item(authenticated_client, test_product):
    client, user = authenticated_client
    
    # Добавляем товар в корзину
    cart_item_data = {
        "productId": str(test_product.id),
        "quantity": 1
    }
    add_response = await client.post("/api/cart/add", json=cart_item_data)
    cart_item_id = add_response.json()["id"]
    
    # Обновляем количество
    update_data = {"quantity": 5}
    response = await client.patch(f"/api/cart/{cart_item_id}", json=update_data)
    assert response.status_code == 200
    assert response.json()["quantity"] == 5

@pytest.mark.asyncio
async def test_update_cart_item_not_found(authenticated_client):
    client, user = authenticated_client
    
    update_data = {"quantity": 5}
    response = await client.patch(f"/api/cart/{uuid.uuid4()}", json=update_data)
    assert response.status_code == 404
    assert response.json()["detail"] == "Cart item not found"

@pytest.mark.asyncio
async def test_remove_from_cart(authenticated_client, test_product):
    client, user = authenticated_client
    
    # Добавляем товар в корзину
    cart_item_data = {
        "productId": str(test_product.id),
        "quantity": 1
    }
    add_response = await client.post("/api/cart/add", json=cart_item_data)
    cart_item_id = add_response.json()["id"]
    
    # Удаляем товар из корзины
    response = await client.delete(f"/api/cart/{cart_item_id}")
    assert response.status_code == 204
    
    # Проверяем, что корзина пуста
    cart_response = await client.get("/api/cart")
    assert cart_response.json() == []

@pytest.mark.asyncio
async def test_remove_from_cart_not_found(authenticated_client):
    client, user = authenticated_client
    
    response = await client.delete(f"/api/cart/{uuid.uuid4()}")
    assert response.status_code == 404
    assert response.json()["detail"] == "Cart item not found"

@pytest.mark.asyncio
async def test_clear_cart(authenticated_client, test_product):
    client, user = authenticated_client
    
    # Добавляем несколько товаров
    cart_item_data = {
        "productId": str(test_product.id),
        "quantity": 2
    }
    await client.post("/api/cart/add", json=cart_item_data)
    
    # Очищаем корзину
    response = await client.delete("/api/cart")
    assert response.status_code == 204
    
    # Проверяем, что корзина пуста
    cart_response = await client.get("/api/cart")
    assert cart_response.json() == []

@pytest.mark.asyncio
async def test_cart_merge(authenticated_client, async_session_maker):
    client, user = authenticated_client
    
    # --- Создаём администратора ---
    admin_email = f"admin_{uuid.uuid4()}@example.com"
    admin_password = "adminpassword"
    async with async_session_maker() as session:
        admin_user = Profile(
            id=uuid.uuid4(),
            email=admin_email,
            hashed_password=get_password_hash(admin_password),
            full_name="Admin User",
            is_admin=True
        )
        session.add(admin_user)
        await session.commit()
        await session.refresh(admin_user)

    # --- Авторизация как админ ---
    admin_signin = await client.post(
        "/api/auth/signin",
        json={"email": admin_email, "password": admin_password}
    )
    assert admin_signin.status_code == 200
    admin_token = admin_signin.json()["access_token"]
    client.headers["Authorization"] = f"Bearer {admin_token}"

    # --- Создаём категорию ---
    category_data = {
        "name": "Cart Test Category",
        "slug": f"cart-test-category-{uuid.uuid4()}",
        "imageUrl": "http://example.com/cart_category.jpg"
    }
    category_response = await client.post("/api/admin/categories", json=category_data)
    assert category_response.status_code == 201
    category_id = category_response.json()["id"]

    # --- Создаём два продукта ---
    product1_data = {
        "name": "Cart Product 1",
        "slug": f"cart-product-1-{uuid.uuid4()}",
        "description": "Product 1 for cart testing",
        "price": 10.00,
        "discount": 0.0,
        "categoryId": category_id,
        "imageUrl": "http://example.com/cart_product1.jpg"
    }
    product2_data = {
        "name": "Cart Product 2",
        "slug": f"cart-product-2-{uuid.uuid4()}",
        "description": "Product 2 for cart testing",
        "price": 25.50,
        "discount": 0.0,
        "categoryId": category_id,
        "imageUrl": "http://example.com/cart_product2.jpg"
    }
    product1_response = await client.post("/api/admin/products", json=product1_data)
    product2_response = await client.post("/api/admin/products", json=product2_data)
    assert product1_response.status_code == 201
    assert product2_response.status_code == 201
    product1_id = product1_response.json()["id"]
    product2_id = product2_response.json()["id"]

    # --- Снова авторизуемся как обычный пользователь ---
    user_signin = await client.post(
        "/api/auth/signin",
        json={"email": user.email, "password": "testpassword"}
    )
    assert user_signin.status_code == 200
    user_token = user_signin.json()["access_token"]
    client.headers["Authorization"] = f"Bearer {user_token}"

    # --- Тестируем слияние корзин ---
    local_cart = [
        {"productId": product1_id, "quantity": 1, "priceSnapshot": 10.00},
        {"productId": product2_id, "quantity": 2, "priceSnapshot": 25.50},
    ]
    response = await client.post("/api/cart/merge", json={"localCart": local_cart})
    assert response.status_code == 200
    assert isinstance(response.json(), list)
    assert len(response.json()) >= 2 