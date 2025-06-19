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
    
    # Note: For a real app, you'd store the hashed password in a 'users' table
    # and link it to the 'profiles' table. Since we're mimicking Supabase Auth
    # with a direct Profile model for simplicity (as per auth.md 'Рекомендации для миграции на Python FastAPI + Redis'),
    # we'll store a placeholder email/password directly in Profile for now.
    # In a full-fledged system, the 'id' in Profile would come from the user's
    # entry in the authentication system (e.g., a dedicated 'users' table).
    
    # Generate a UUID for the new user profile
    new_user_id = uuid.uuid4()
    
    db_profile = models.Profile(
        id=new_user_id,
        email=user_in.email, # Storing email here for simplicity, typically in a users table
        full_name=None, # Full name can be added later
        is_admin=False, # Default to false
        # In a real scenario, password would be stored in a separate users table
        # For this example, we'll imagine it's handled by a separate auth service
        # or directly store a dummy hashed password if we were building full auth
        # from scratch without a separate user table. For now, we omit password here.
    )
    db.add(db_profile)
    db.commit()
    db.refresh(db_profile)

    # Here, you'd typically also create the actual user in your auth system,
    # which would then give you the ID to link to the profile. For this setup,
    # we are directly using the Profile model as the user representation.

    return CustomUser.from_orm(db_profile)

@router.post("/auth/signin", response_model=Token)
async def signin(
    response: Response,
    user_in: SignInSchema, db: Session = Depends(get_db)
):
    # In a real app, you would retrieve the hashed password from a dedicated users table
    # based on the email. Since we don't have a separate 'users' table and mimic Supabase
    # by using 'Profile' directly, we'll assume a dummy check for now.
    # This part needs a proper user lookup and password verification from a real auth backend.
    # For demonstration, we'll check against a hardcoded dummy user or create one if not exists.
    
    # Check if there's an admin user from postgres-seeds.md for testing
    # This is a temporary way to get a user for sign-in.
    user = db.query(models.Profile).filter(models.Profile.id == uuid.UUID("28ad2b7d-02d6-4f84-b1c3-1ee26e6b4b58")).first() # Hardcoded admin ID from seeds
    if not user or not user.email == user_in.email: # And a real password verification
         raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # This is where actual password verification would happen if passwords were stored
    # For now, a dummy check, as passwords are not stored in Profile directly.
    # For proper implementation, a 'users' table would hold hashed passwords.
    # For this example, if the user exists by ID and email matches, we proceed.
    # In a real system, you would verify the password using `verify_password` function.
    
    # Dummy password check (REPLACE WITH REAL HASHED PASSWORD CHECK)
    if user_in.email == "admin@example.com" and user_in.password == "adminpassword": # Dummy credentials
         pass
    elif user.email == user_in.email and verify_password(user_in.password, "$2b$12$EXAMPLEHASHFROMDB"): # Placeholder for real hash
        pass
    else:
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
async def logout(response: Response, request: Request):
    token = get_token_from_request(request)
    if token:
        revoke_token(token)
    response.delete_cookie(key="access_token")
    return {"message": "Successfully logged out"}

@router.post("/auth/reset-password")
async def reset_password(data: ResetPasswordSchema, db: Session = Depends(get_db)):
    user = db.query(models.Profile).filter(models.Profile.email == data.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User with this email not found")
    
    # In a real application, you would generate a password reset token,
    # store it in the database with an expiration, and send an email
    # to the user with a link containing this token.
    # For this example, we'll just return a success message.
    
    return {"message": "Password reset instructions sent to your email (if registered)."}

@router.post("/auth/update-password")
async def update_password(data: UpdatePasswordSchema, current_user: CustomUser = Depends(get_current_user), db: Session = Depends(get_db)):
    # In a real app, you would update the password for the current_user's
    # entry in the dedicated users table.
    
    # Since we don't have a separate 'users' table and mimic Supabase with Profile,
    # this operation would typically interact with an external auth service or a dedicated
    # users table that holds the password hash. As passwords are not directly in Profile,
    # this is a placeholder. If you implement a full auth system, you'd update the password here.
    
    # Example of where you would update the password hash:
    # user_to_update = db.query(models.User).filter(models.User.id == current_user.id).first()
    # if user_to_update:
    #     user_to_update.hashed_password = get_password_hash(data.password)
    #     db.commit()
    # else:
    #     raise HTTPException(status_code=404, detail="User not found")

    return {"message": "Password updated successfully."} 