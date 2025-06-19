import pytest
import pytest_asyncio
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from main import app
from app.db.database import get_db, Base
from app.db.models import Category, Product # Добавлено для создания категорий и продуктов
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
async def create_test_category_and_products(async_session_maker):
    async with async_session_maker() as session:
        # Создаем категорию
        unique_slug = f"electronics-{uuid.uuid4()}"
        test_category = Category(
            name="Electronics",
            slug=unique_slug,
            image_url="http://example.com/electronics.jpg",
            id=uuid.uuid4()
        )
        session.add(test_category)
        await session.commit()
        await session.refresh(test_category)

        # Создаем несколько продуктов в этой категории
        product1 = Product(
            name="Laptop",
            description="Powerful laptop",
            price=1200.00,
            discount=0.0,
            category_id=test_category.id,
            image_url="http://example.com/laptop.jpg",
            slug=f"laptop-{uuid.uuid4()}",
            id=uuid.uuid4()
        )
        product2 = Product(
            name="Mouse",
            description="Wireless mouse",
            price=25.00,
            discount=0.0,
            category_id=test_category.id,
            image_url="http://example.com/mouse.jpg",
            slug=f"mouse-{uuid.uuid4()}",
            id=uuid.uuid4()
        )
        product3 = Product(
            name="Keyboard",
            description="Mechanical keyboard",
            price=75.00,
            discount=0.0,
            category_id=test_category.id,
            image_url="http://example.com/keyboard.jpg",
            slug=f"keyboard-{uuid.uuid4()}",
            id=uuid.uuid4()
        )
        session.add_all([product1, product2, product3])
        await session.commit()
        await session.refresh(product1)
        await session.refresh(product2)
        await session.refresh(product3)

        yield {"category": test_category, "products": [product1, product2, product3]}

# Тесты для эндпоинтов продуктов
@pytest.mark.asyncio
async def test_get_product_by_id(client: AsyncClient, create_test_category_and_products):
    product_id = create_test_category_and_products["products"][0].id
    response = await client.get(f"/api/products/{product_id}")
    assert response.status_code == 200
    assert response.json()["id"] == str(product_id)
    assert response.json()["name"] == "Laptop"

@pytest.mark.asyncio
async def test_get_product_by_id_not_found(client: AsyncClient):
    non_existent_id = uuid.uuid4()
    response = await client.get(f"/api/products/{non_existent_id}")
    assert response.status_code == 404
    assert response.json()["detail"] == "Product not found"

@pytest.mark.asyncio
async def test_get_products_bestsellers(client: AsyncClient, create_test_category_and_products):
    # TODO: Для реального тестирования бестселлеров нужно будет создать заказы
    # и обновить логику в фикстуре, чтобы отражать продажи.
    # Пока просто проверяем, что эндпоинт отвечает и возвращает список.
    response = await client.get("/api/products/bestsellers")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

@pytest.mark.asyncio
async def test_get_product_by_slug(client: AsyncClient, create_test_category_and_products):
    product_slug = create_test_category_and_products["products"][1].slug
    response = await client.get(f"/api/products/slug/{product_slug}")
    assert response.status_code == 200
    assert response.json()["slug"] == product_slug
    assert response.json()["name"] == "Mouse"

@pytest.mark.asyncio
async def test_get_product_by_slug_not_found(client: AsyncClient):
    response = await client.get("/api/products/slug/non-existent-product")
    assert response.status_code == 404
    assert response.json()["detail"] == "Product not found"

@pytest.mark.asyncio
async def test_get_products_by_category_slug(client: AsyncClient, create_test_category_and_products):
    category_slug = create_test_category_and_products["category"].slug
    response = await client.get(f"/api/products/category/{category_slug}")
    assert response.status_code == 200
    assert isinstance(response.json(), list)
    assert len(response.json()) == 3 # Ожидаем 3 продукта из фикстуры
    assert response.json()[0]["category"]["slug"] == category_slug

@pytest.mark.asyncio
async def test_get_products_by_category_slug_not_found(client: AsyncClient):
    response = await client.get("/api/products/category/non-existent-category")
    assert response.status_code == 200 # Возвращаем пустой список, если категория не найдена
    assert isinstance(response.json(), list)
    assert len(response.json()) == 0 