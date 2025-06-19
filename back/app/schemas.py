from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from decimal import Decimal
import uuid

# region Auth Schemas
class SignInSchema(BaseModel):
    email: str
    password: str

class SignUpSchema(BaseModel):
    email: str
    password: str = Field(min_length=6, max_length=100)
    confirmPassword: str

class ResetPasswordSchema(BaseModel):
    email: str

class UpdatePasswordSchema(BaseModel):
    password: str = Field(min_length=6)

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class ProfileBase(BaseModel):
    id: uuid.UUID
    email: str
    fullName: Optional[str] = None
    isAdmin: bool

    class Config:
        from_attributes = True

class CustomUser(ProfileBase):
    pass
# endregion

# region Category Schemas
class CategoryBase(BaseModel):
    name: str
    slug: str
    description: Optional[str] = None
    imageUrl: Optional[str] = None

class CategoryCreate(CategoryBase):
    pass

class CategoryUpdate(CategoryBase):
    name: Optional[str] = None
    slug: Optional[str] = None

class CategoryInDB(CategoryBase):
    id: uuid.UUID

    class Config:
        from_attributes = True
# endregion

# region Product Schemas
class ProductBase(BaseModel):
    name: str
    slug: str
    description: Optional[str] = None
    price: Decimal = Field(..., decimal_places=2)
    discount: Optional[Decimal] = Field(None, decimal_places=2)
    characteristics: Optional[Dict[str, Any]] = None
    imageUrl: Optional[str] = None
    categoryId: uuid.UUID

class ProductCreate(ProductBase):
    pass

class ProductUpdate(ProductBase):
    name: Optional[str] = None
    slug: Optional[str] = None
    price: Optional[Decimal] = Field(None, decimal_places=2)
    categoryId: Optional[uuid.UUID] = None

class ProductInDB(ProductBase):
    id: uuid.UUID
    createdAt: datetime
    updatedAt: datetime
    timesOrdered: int
    category: Optional[CategoryInDB] = None # For embedding category info

    class Config:
        from_attributes = True

# endregion

# region Cart Schemas
class CartItemBase(BaseModel):
    productId: uuid.UUID
    quantity: int = Field(..., ge=1)
    priceSnapshot: Decimal = Field(..., decimal_places=2)

class CartItemCreate(CartItemBase):
    pass

class CartItemInDB(CartItemBase):
    id: uuid.UUID
    userId: uuid.UUID

    class Config:
        from_attributes = True

class LocalCartItem(BaseModel):
    productId: uuid.UUID
    quantity: int
    priceSnapshot: Decimal

class CartMergeRequest(BaseModel):
    localCart: List[LocalCartItem]
# endregion

# region Order Schemas
class OrderItemBase(BaseModel):
    productId: uuid.UUID
    quantity: int
    priceSnapshot: Decimal = Field(..., decimal_places=2)
    name: str
    imageUrl: Optional[str] = None

class OrderItemCreate(OrderItemBase):
    pass

class OrderItemInDB(OrderItemBase):
    id: uuid.UUID
    orderId: uuid.UUID

    class Config:
        from_attributes = True

class OrderBase(BaseModel):
    fullName: str
    email: str
    address: str
    city: str
    postalCode: str
    phone: str
    totalAmount: Decimal = Field(..., decimal_places=2)
    orderItems: List[OrderItemCreate]

class OrderCreate(OrderBase):
    pass

class OrderUpdateStatus(BaseModel):
    status: str

class OrderInDB(OrderBase):
    id: uuid.UUID
    userId: uuid.UUID
    status: str
    createdAt: datetime
    
    orderItems: List[OrderItemInDB] = [] # Nested order items

    class Config:
        from_attributes = True
# endregion

# region Favourite Schemas
class FavouriteBase(BaseModel):
    productId: uuid.UUID

class FavouriteCreate(FavouriteBase):
    pass

class FavouriteInDB(FavouriteBase):
    id: uuid.UUID
    userId: uuid.UUID

    class Config:
        from_attributes = True
# endregion 