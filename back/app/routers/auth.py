import os
import uuid
from datetime import timedelta

from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth import (
    ACCESS_TOKEN_EXPIRE_MINUTES,  # Import the constant
    create_access_token,
    get_current_user,
    get_password_hash,
    get_token_from_request,
    revoke_token,
    verify_password,
)
from app.db import models
from app.db.database import get_db
from app.schemas import CustomUser, ResetPasswordSchema, SignInSchema, SignUpSchema, Token, UpdatePasswordSchema

router = APIRouter()

# Определяем окружение для настройки cookies
IS_PRODUCTION = os.getenv("DEBUG", "true").lower() == "false"
COOKIE_DOMAIN = ".sadovnick.store" if IS_PRODUCTION else None


@router.post("/auth/signup", response_model=CustomUser, status_code=201, response_model_by_alias=True)
async def signup(user_in: SignUpSchema, db: AsyncSession = Depends(get_db)) -> CustomUser:
    if user_in.password != user_in.confirmPassword:
        raise HTTPException(status_code=400, detail="Passwords do not match")

    result = await db.execute(select(models.Profile).where(models.Profile.email == user_in.email))
    db_user = result.scalars().first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed_password = get_password_hash(user_in.password)

    new_user_id = uuid.uuid4()

    db_profile = models.Profile(
        id=new_user_id,
        email=user_in.email,
        hashed_password=hashed_password,  # Store the hashed password
        full_name=None,
        is_admin=False,
    )
    db.add(db_profile)
    await db.commit()
    await db.refresh(db_profile)

    return CustomUser.model_validate(db_profile)


@router.post("/auth/signin", response_model=Token)
async def signin(response: Response, user_in: SignInSchema, db: AsyncSession = Depends(get_db)) -> Token:
    result = await db.execute(select(models.Profile).where(models.Profile.email == user_in.email))
    user = result.scalars().first()
    if not user or not verify_password(user_in.password, str(user.hashed_password)):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(user.id), "is_admin": user.is_admin},
        expires_delta=access_token_expires,
    )
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=IS_PRODUCTION,  # Secure только для продакшена (HTTPS)
        samesite="lax",  # Защита от CSRF
        domain=COOKIE_DOMAIN,  # Позволяет работать между поддоменами
        max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )
    return Token(access_token=access_token, token_type="bearer")


@router.post("/auth/logout")
async def logout(response: Response, request: Request, db: AsyncSession = Depends(get_db)) -> dict[str, str]:
    token = get_token_from_request(request)
    if token:
        # In a real application, you might invalidate the token in a blacklist/revocation list in DB/Redis
        # For this example, we just delete the cookie.
        revoke_token(token)  # Assuming revoke_token might do something if implemented
    response.delete_cookie(
        key="access_token",
        secure=IS_PRODUCTION,  # Secure только для продакшена (HTTPS)
        samesite="lax",
        domain=COOKIE_DOMAIN,  # Позволяет работать между поддоменами
    )
    return {"message": "Successfully logged out"}


@router.post("/auth/reset-password")
async def reset_password(data: ResetPasswordSchema, db: AsyncSession = Depends(get_db)) -> dict[str, str]:
    result = await db.execute(select(models.Profile).where(models.Profile.email == data.email))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="User with this email not found")

    # As per instructions, email verification is not needed.
    # In a real app, you would generate a password reset token and send it via email.
    # For this example, we simply acknowledge the request without actual email sending.
    # If the user is found, we can proceed to update the password directly if they were logged in,
    # or notify that instructions were "sent" (without actual email).

    return {"message": "Password reset initiated. Please proceed to update your password with the new credentials."}


@router.post("/auth/update-password")
async def update_password(
    data: UpdatePasswordSchema, current_user: CustomUser = Depends(get_current_user), db: AsyncSession = Depends(get_db)
) -> dict[str, str]:
    result = await db.execute(select(models.Profile).where(models.Profile.id == current_user.id))
    user_to_update = result.scalars().first()
    if not user_to_update:
        raise HTTPException(status_code=404, detail="User not found")

    user_to_update.hashed_password = get_password_hash(data.password)  # type: ignore
    await db.commit()
    await db.refresh(user_to_update)

    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(user_to_update.id), "is_admin": user_to_update.is_admin},
        expires_delta=access_token_expires,
    )
    return {"message": "Password updated successfully.", "access_token": access_token, "token_type": "bearer"}


@router.get("/auth/me", response_model=CustomUser)
async def get_current_user_info(current_user: CustomUser = Depends(get_current_user)) -> CustomUser:
    """Получить информацию о текущем пользователе"""
    return current_user
