import pytest
import pytest_asyncio
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from main import app
from app.db.database import get_db, Base
from app.db.models import Profile, Category, Product, Favourite
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

# Тесты для избранного
@pytest.mark.asyncio
async def test_get_empty_favorites(authenticated_client):
    client, user = authenticated_client
    response = await client.get("/api/favorites")
    assert response.status_code == 200
    assert response.json() == []

@pytest.mark.asyncio
async def test_add_to_favorites(authenticated_client, test_product):
    client, user = authenticated_client
    
    response = await client.post(f"/api/favorites/{test_product.id}")
    assert response.status_code == 201
    
    data = response.json()
    assert data["productId"] == str(test_product.id)
    assert data["userId"] == str(user.id)
    assert "product" in data

@pytest.mark.asyncio
async def test_add_to_favorites_product_not_found(authenticated_client):
    client, user = authenticated_client
    
    non_existent_id = uuid.uuid4()
    response = await client.post(f"/api/favorites/{non_existent_id}")
    assert response.status_code == 404
    assert response.json()["detail"] == "Product not found"

@pytest.mark.asyncio
async def test_add_duplicate_to_favorites(authenticated_client, test_product):
    client, user = authenticated_client
    
    # Добавляем в избранное первый раз
    response1 = await client.post(f"/api/favorites/{test_product.id}")
    assert response1.status_code == 201
    
    # Пытаемся добавить тот же товар еще раз
    response2 = await client.post(f"/api/favorites/{test_product.id}")
    assert response2.status_code == 400
    assert response2.json()["detail"] == "Product already in favorites"

@pytest.mark.asyncio
async def test_get_favorites_with_items(authenticated_client, test_product):
    client, user = authenticated_client
    
    # Добавляем товар в избранное
    await client.post(f"/api/favorites/{test_product.id}")
    
    # Получаем избранное
    response = await client.get("/api/favorites")
    assert response.status_code == 200
    
    data = response.json()
    assert len(data) == 1
    assert data[0]["productId"] == str(test_product.id)
    assert data[0]["userId"] == str(user.id)
    assert "product" in data[0]

@pytest.mark.asyncio
async def test_remove_from_favorites(authenticated_client, test_product):
    client, user = authenticated_client
    
    # Добавляем товар в избранное
    await client.post(f"/api/favorites/{test_product.id}")
    
    # Удаляем товар из избранного
    response = await client.delete(f"/api/favorites/{test_product.id}")
    assert response.status_code == 204
    
    # Проверяем, что избранное пусто
    favorites_response = await client.get("/api/favorites")
    assert favorites_response.json() == []

@pytest.mark.asyncio
async def test_remove_from_favorites_not_found(authenticated_client):
    client, user = authenticated_client
    
    non_existent_id = uuid.uuid4()
    response = await client.delete(f"/api/favorites/{non_existent_id}")
    assert response.status_code == 404
    assert response.json()["detail"] == "Product not found in favorites"

@pytest.mark.asyncio
async def test_favorites_isolation_between_users(authenticated_client, test_product, async_session_maker):
    client1, user1 = authenticated_client
    
    # Сохраняем токен первого пользователя ДО создания второго
    token1 = client1.headers["Authorization"]
    
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
    
    # Очищаем cookies, чтобы использовать только заголовки Authorization
    client1.cookies.clear()
    
    # Первый пользователь добавляет товар в избранное
    client1.headers["Authorization"] = token1
    response = await client1.post(f"/api/favorites/{test_product.id}")
    assert response.status_code == 201
    
    # Второй пользователь проверяет свое избранное (должно быть пусто)
    client1.headers["Authorization"] = f"Bearer {token2}"
    favorites_response = await client1.get("/api/favorites")
    assert favorites_response.json() == []
    
    # Первый пользователь проверяет своё избранное (должен быть товар)
    client1.headers["Authorization"] = token1
    user1_favorites = await client1.get("/api/favorites")
    assert len(user1_favorites.json()) == 1
    assert user1_favorites.json()[0]["productId"] == str(test_product.id) 