import pytest
import pytest_asyncio
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from main import app
from app.db.database import get_db, Base
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

# Тесты для эндпоинтов аутентификации
@pytest.mark.asyncio
async def test_signup(client: AsyncClient):
    unique_email = f"testuser_{uuid.uuid4()}@example.com"
    response = await client.post(
        "/api/auth/signup",
        json={
            "email": unique_email,
            "password": "testpassword",
            "confirmPassword": "testpassword",
        },
    )
    print("signup response:", response.status_code, response.json())
    assert response.status_code == 201
    assert response.json()["email"] == unique_email
    assert "id" in response.json()
    assert response.json()["isAdmin"] == False

@pytest.mark.asyncio
async def test_signup_existing_email(client: AsyncClient):
    # Сначала регистрируем пользователя
    await client.post(
        "/api/auth/signup",
        json={
            "email": "existing@example.com",
            "password": "password123",
            "confirmPassword": "password123",
        },
    )
    # Попытка зарегистрировать с тем же email
    response = await client.post(
        "/api/auth/signup",
        json={
            "email": "existing@example.com",
            "password": "newpassword",
            "confirmPassword": "newpassword",
        },
    )
    assert response.status_code == 400
    assert response.json()["detail"] == "Email already registered"

@pytest.mark.asyncio
async def test_signup_password_mismatch(client: AsyncClient):
    response = await client.post(
        "/api/auth/signup",
        json={
            "email": "mismatch@example.com",
            "password": "password123",
            "confirmPassword": "differentpassword",
        },
    )
    assert response.status_code == 400
    assert response.json()["detail"] == "Passwords do not match"

@pytest.mark.asyncio
async def test_signin(client: AsyncClient):
    # Сначала регистрируем пользователя для входа
    await client.post(
        "/api/auth/signup",
        json={
            "email": "signinuser@example.com",
            "password": "securepassword",
            "confirmPassword": "securepassword",
        },
    )

    # Затем пытаемся войти
    response = await client.post(
        "/api/auth/signin",
        json={"email": "signinuser@example.com", "password": "securepassword"},
    )
    assert response.status_code == 200
    assert "access_token" in response.json()
    assert response.json()["token_type"] == "bearer"
    assert response.cookies["access_token"] == response.json()["access_token"]

@pytest.mark.asyncio
async def test_signin_invalid_credentials(client: AsyncClient):
    response = await client.post(
        "/api/auth/signin",
        json={"email": "nonexistent@example.com", "password": "wrongpassword"},
    )
    assert response.status_code == 401
    assert response.json()["detail"] == "Incorrect email or password"

@pytest.mark.asyncio
async def test_logout(client: AsyncClient):
    # Сначала логинимся, чтобы получить куки
    signup_response = await client.post(
        "/api/auth/signup",
        json={
            "email": "logoutuser@example.com",
            "password": "logoutpassword",
            "confirmPassword": "logoutpassword",
        },
    )
    login_response = await client.post(
        "/api/auth/signin",
        json={"email": "logoutuser@example.com", "password": "logoutpassword"},
    )
    assert login_response.status_code == 200
    
    # Затем выходим
    response = await client.post("/api/auth/logout")
    assert response.status_code == 200
    assert response.json()["message"] == "Successfully logged out"
    # Проверяем, что кука удалена
    assert "access_token" not in response.cookies

@pytest.mark.asyncio
async def test_reset_password(client: AsyncClient):
    # Сначала регистрируем пользователя
    await client.post(
        "/api/auth/signup",
        json={
            "email": "resetpassword@example.com",
            "password": "oldpassword",
            "confirmPassword": "oldpassword",
        },
    )

    response = await client.post(
        "/api/auth/reset-password",
        json={"email": "resetpassword@example.com"},
    )
    assert response.status_code == 200
    assert "message" in response.json()

@pytest.mark.asyncio
async def test_update_password(client: AsyncClient):
    unique_email = f"updatepassword_{uuid.uuid4()}@example.com"
    signup_response = await client.post(
        "/api/auth/signup",
        json={
            "email": unique_email,
            "password": "oldpassword",
            "confirmPassword": "oldpassword",
        },
    )
    print("signup_response in update_password test:", signup_response.status_code, signup_response.json())
    assert signup_response.status_code == 201

    # Логинимся, чтобы получить токен
    login_response = await client.post(
        "/api/auth/signin",
        json={"email": unique_email, "password": "oldpassword"},
    )
    print("update_password login:", login_response.status_code, login_response.json())
    assert login_response.status_code == 200
    access_token = login_response.json()["access_token"]

    # Меняем пароль
    update_response = await client.post(
        "/api/auth/update-password",
        json={"password": "newpassword", "confirmPassword": "newpassword"},
        headers={"Authorization": f"Bearer {access_token}"},
    )
    print("update_password response:", update_response.status_code, update_response.json())
    assert update_response.status_code == 200
    assert "access_token" in update_response.json()

    # Проверяем вход с новым паролем
    new_login_response = await client.post(
        "/api/auth/signin",
        json={"email": unique_email, "password": "newpassword"},
    )
    print("new_login_response:", new_login_response.status_code, new_login_response.json())
    assert new_login_response.status_code == 200
    assert "access_token" in new_login_response.json() 