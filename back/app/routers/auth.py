from fastapi import APIRouter, Depends, HTTPException, status, Response, Request
from sqlalchemy.orm import Session
from app.schemas import SignInSchema, SignUpSchema, ResetPasswordSchema, UpdatePasswordSchema, Token, CustomUser
from app.db.database import get_db
from app.db import models
from app.auth import get_password_hash, verify_password, create_access_token, get_current_user, revoke_token, get_token_from_request
from datetime import timedelta
from app.auth import ACCESS_TOKEN_EXPIRE_MINUTES # Import the constant
import uuid

router = APIRouter()

@router.post("/auth/signup", response_model=CustomUser)
async def signup(
    user_in: SignUpSchema, db: Session = Depends(get_db)
):
    if user_in.password != user_in.confirmPassword:
        raise HTTPException(status_code=400, detail="Passwords do not match")

    db_user = db.query(models.Profile).filter(models.Profile.email == user_in.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed_password = get_password_hash(user_in.password)
    
    new_user_id = uuid.uuid4()
    
    db_profile = models.Profile(
        id=new_user_id,
        email=user_in.email,
        hashed_password=hashed_password, # Store the hashed password
        full_name=None,
        is_admin=False,
    )
    db.add(db_profile)
    db.commit()
    db.refresh(db_profile)

    return CustomUser.from_orm(db_profile)

@router.post("/auth/signin", response_model=Token)
async def signin(
    response: Response,
    user_in: SignInSchema, db: Session = Depends(get_db)
):
    user = db.query(models.Profile).filter(models.Profile.email == user_in.email).first()
    if not user or not verify_password(user_in.password, user.hashed_password):
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
    response.set_cookie(key="access_token", value=access_token, httponly=True, max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60)
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/auth/logout")
async def logout(response: Response, request: Request, db: Session = Depends(get_db)):
    token = get_token_from_request(request)
    if token:
        # In a real application, you might invalidate the token in a blacklist/revocation list in DB/Redis
        # For this example, we just delete the cookie.
        revoke_token(token) # Assuming revoke_token might do something if implemented
    response.delete_cookie(key="access_token")
    return {"message": "Successfully logged out"}

@router.post("/auth/reset-password")
async def reset_password(data: ResetPasswordSchema, db: Session = Depends(get_db)):
    user = db.query(models.Profile).filter(models.Profile.email == data.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User with this email not found")
    
    # As per instructions, email verification is not needed.
    # In a real app, you would generate a password reset token and send it via email.
    # For this example, we simply acknowledge the request without actual email sending.
    # If the user is found, we can proceed to update the password directly if they were logged in,
    # or notify that instructions were "sent" (without actual email).
    
    return {"message": "Password reset initiated. Please proceed to update your password with the new credentials."}

@router.post("/auth/update-password")
async def update_password(data: UpdatePasswordSchema, current_user: CustomUser = Depends(get_current_user), db: Session = Depends(get_db)):
    user_to_update = db.query(models.Profile).filter(models.Profile.id == current_user.id).first()
    if not user_to_update:
        raise HTTPException(status_code=404, detail="User not found")

    user_to_update.hashed_password = get_password_hash(data.password)
    db.commit()
    db.refresh(user_to_update)

    return {"message": "Password updated successfully."} 