import pytest
import pytest_asyncio
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from main import app
from app.db.database import get_db, Base
from app.db.models import Profile, Category, Product, CartItem # Добавлено для создания пользователя, категории, продукта и элемента корзины
from app.auth import get_password_hash # Добавлено для хеширования пароля
import os
import asyncio
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
    yield client
    client.headers.pop("Authorization", None)

@pytest_asyncio.fixture()
async def create_test_cart_item(async_session_maker, authenticated_client):
    async with async_session_maker() as session:
        # Создаем тестового пользователя
        test_user = Profile(
            id=uuid.uuid4(),
            email=f"cart_user_{uuid.uuid4()}@example.com",
            hashed_password=get_password_hash("testpassword"),
            full_name="Cart User",
            is_admin=False
        )
        session.add(test_user)
        await session.commit()
        await session.refresh(test_user)

        # Создаем тестовую категорию
        unique_category_slug = f"cart-category-{uuid.uuid4()}"
        test_category = Category(
            name="Cart Category",
            slug=unique_category_slug,
            image_url="http://example.com/cart_category.jpg",
            id=uuid.uuid4()
        )
        session.add(test_category)
        await session.commit()
        await session.refresh(test_category)

        # Создаем тестовый продукт
        unique_product_slug = f"cart-product-{uuid.uuid4()}"
        test_product = Product(
            name="Cart Product",
            slug=unique_product_slug,
            description="Product for cart testing",
            price=50.00,
            category_id=test_category.id,
            image_url="http://example.com/cart_product.jpg",
            id=uuid.uuid4()
        )
        session.add(test_product)
        await session.commit()
        await session.refresh(test_product)

        # Создаем элемент корзины
        cart_item = CartItem(
            user_id=test_user.id,
            product_id=test_product.id,
            quantity=1,
            price_snapshot=test_product.price,
            id=uuid.uuid4()
        )
        session.add(cart_item)
        await session.commit()
        await session.refresh(cart_item)

        # Авторизуем пользователя
        response = await authenticated_client.post(
            "/api/auth/signin",
            json={"email": test_user.email, "password": "testpassword"}
        )
        assert response.status_code == 200
        token = response.json()["access_token"]
        authenticated_client.headers["Authorization"] = f"Bearer {token}"

        yield {"user": test_user, "product": test_product, "cart_item": cart_item}

# Тесты для эндпоинтов корзины
@pytest.mark.asyncio
async def test_cart_merge(authenticated_client: AsyncClient, async_session_maker):
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
    admin_signin = await authenticated_client.post(
        "/api/auth/signin",
        json={"email": admin_email, "password": admin_password}
    )
    assert admin_signin.status_code == 200
    admin_token = admin_signin.json()["access_token"]
    authenticated_client.headers["Authorization"] = f"Bearer {admin_token}"

    # --- Создаём категорию ---
    category_data = {
        "name": "Cart Test Category",
        "slug": f"cart-test-category-{uuid.uuid4()}",
        "imageUrl": "http://example.com/cart_category.jpg"
    }
    category_response = await authenticated_client.post("/api/admin/categories", json=category_data)
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
    product1_response = await authenticated_client.post("/api/admin/products", json=product1_data)
    product2_response = await authenticated_client.post("/api/admin/products", json=product2_data)
    assert product1_response.status_code == 201
    assert product2_response.status_code == 201
    product1_id = product1_response.json()["id"]
    product2_id = product2_response.json()["id"]

    # --- Снова авторизуемся как обычный пользователь ---
    # Получаем email и пароль обычного пользователя из фикстуры
    user_email = None
    user_password = "testpassword"
    async with async_session_maker() as session:
        user = await session.execute(select(Profile).where(Profile.is_admin == False))
        user = user.scalars().first()
        user_email = user.email
    user_signin = await authenticated_client.post(
        "/api/auth/signin",
        json={"email": user_email, "password": user_password}
    )
    assert user_signin.status_code == 200
    user_token = user_signin.json()["access_token"]
    authenticated_client.headers["Authorization"] = f"Bearer {user_token}"

    # --- Тестируем корзину ---
    local_cart = [
        {"productId": product1_id, "quantity": 1, "priceSnapshot": 10.00},
        {"productId": product2_id, "quantity": 2, "priceSnapshot": 25.50},
    ]
    response = await authenticated_client.post("/api/cart/merge", json={"localCart": local_cart})
    assert response.status_code == 200
    assert isinstance(response.json(), list)
    assert len(response.json()) >= 2 