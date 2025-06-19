import pytest
import pytest_asyncio
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from main import app
from app.db.database import get_db, Base
from app.db.models import Category # Добавлено для создания категории
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
async def create_test_category(async_session_maker):
    async with async_session_maker() as session:
        # Создаем категорию для теста
        unique_slug = f"test-category-{uuid.uuid4()}"
        test_category = Category(
            name="Test Category",
            slug=unique_slug,
            description="A category for testing purposes.",
            image_url="http://example.com/test_category.jpg",
            id=uuid.uuid4()
        )
        session.add(test_category)
        await session.commit()
        await session.refresh(test_category)
        yield test_category

# Тесты для эндпоинтов категорий
@pytest.mark.asyncio
async def test_get_categories(client: AsyncClient, create_test_category):
    response = await client.get("/api/categories")
    assert response.status_code == 200
    assert isinstance(response.json(), list)
    assert len(response.json()) > 0
    
    found = False
    for category_data in response.json():
        if category_data["name"] == create_test_category.name:
            found = True
            break
    assert found

@pytest.mark.asyncio
async def test_get_category_by_slug(client: AsyncClient, create_test_category):
    category_slug = create_test_category.slug
    response = await client.get(f"/api/categories?slug={category_slug}")
    assert response.status_code == 200
    assert isinstance(response.json(), list)
    assert len(response.json()) > 0
    assert response.json()[0]["slug"] == category_slug

@pytest.mark.asyncio
async def test_get_category_by_slug_not_found(client: AsyncClient):
    response = await client.get("/api/categories?slug=non-existent-slug")
    assert response.status_code == 404
    assert response.json()["detail"] == "Category not found" 