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
    isAdmin: bool = Field(..., alias="is_admin", serialization_alias="isAdmin")

    model_config = {"from_attributes": True, "populate_by_name": True}

class CustomUser(ProfileBase):
    pass

# Схемы для управления пользователями в админке
class UserCreate(BaseModel):
    email: str
    password: str = Field(min_length=6)
    fullName: Optional[str] = None
    isAdmin: bool = False

class UserUpdate(BaseModel):
    email: Optional[str] = None
    fullName: Optional[str] = None
    isAdmin: Optional[bool] = None

class UserInDB(ProfileBase):
    createdAt: Optional[datetime] = None
    ordersCount: int = 0
    favoritesCount: int = 0
    cartItemsCount: int = 0

    model_config = {"from_attributes": True}
# endregion

# region Category Schemas
class CategoryBase(BaseModel):
    name: str
    slug: str
    description: Optional[str] = None
    imageUrl: Optional[str] = Field(None, alias="image_url", serialization_alias="imageUrl")

    model_config = {"from_attributes": True, "populate_by_name": True}

class CategoryCreate(CategoryBase):
    pass

class CategoryUpdate(CategoryBase):
    name: Optional[str] = None
    slug: Optional[str] = None

class CategoryInDB(CategoryBase):
    id: uuid.UUID

    model_config = {"from_attributes": True, "populate_by_name": True}
# endregion

# region Product Schemas
class ProductBase(BaseModel):
    name: str
    slug: str
    description: Optional[str] = None
    price: Decimal = Field(..., decimal_places=2)
    discount: Optional[Decimal] = Field(None, decimal_places=2)
    characteristics: Optional[Dict[str, Any]] = None
    imageUrl: Optional[str] = Field(None, alias="image_url", serialization_alias="imageUrl")
    categoryId: uuid.UUID = Field(..., alias="category_id", serialization_alias="categoryId")

    model_config = {"from_attributes": True, "populate_by_name": True}

class ProductCreate(ProductBase):
    pass

class ProductUpdate(ProductBase):
    name: Optional[str] = None
    slug: Optional[str] = None
    price: Optional[Decimal] = Field(None, decimal_places=2)
    categoryId: Optional[uuid.UUID] = None

class ProductInDB(ProductBase):
    id: uuid.UUID
    categoryId: uuid.UUID = Field(..., alias="category_id", serialization_alias="categoryId")
    category: Optional[CategoryInDB] = None
    createdAt: datetime = Field(..., alias="created_at", serialization_alias="createdAt")
    updatedAt: Optional[datetime] = Field(None, alias="updated_at", serialization_alias="updatedAt")
    timesOrdered: int = Field(..., alias="times_ordered", serialization_alias="timesOrdered")

    model_config = {"from_attributes": True, "populate_by_name": True}

# endregion

# region Cart Schemas
class CartItemBase(BaseModel):
    productId: uuid.UUID
    quantity: int = Field(..., ge=1)
    priceSnapshot: Decimal = Field(..., decimal_places=2)

class CartItemCreate(CartItemBase):
    pass

class CartItemInDB(BaseModel):
    id: uuid.UUID
    productId: uuid.UUID = Field(..., alias="product_id", serialization_alias="productId")
    userId: uuid.UUID = Field(..., alias="user_id", serialization_alias="userId")
    quantity: int
    priceSnapshot: float = Field(..., alias="price_snapshot", serialization_alias="priceSnapshot")

    model_config = {"from_attributes": True, "populate_by_name": True}

class LocalCartItem(BaseModel):
    productId: uuid.UUID
    quantity: int
    priceSnapshot: Decimal

class CartMergeRequest(BaseModel):
    localCart: List[LocalCartItem]
# endregion

# region Order Schemas
class OrderItemBase(BaseModel):
    productId: uuid.UUID = Field(..., alias="product_id", serialization_alias="productId")
    quantity: int
    priceSnapshot: Decimal = Field(..., alias="price_snapshot", serialization_alias="priceSnapshot", decimal_places=2)
    name: str
    imageUrl: Optional[str] = Field(None, alias="image_url", serialization_alias="imageUrl")

    model_config = {"from_attributes": True, "populate_by_name": True}

class OrderItemCreate(OrderItemBase):
    pass

class OrderItemInDB(OrderItemBase):
    id: uuid.UUID
    orderId: uuid.UUID = Field(..., alias="order_id", serialization_alias="orderId")

    model_config = {"from_attributes": True, "populate_by_name": True}

class OrderBase(BaseModel):
    fullName: str = Field(..., alias="full_name", serialization_alias="fullName")
    email: str
    address: str
    city: str
    postalCode: str = Field(..., alias="postal_code", serialization_alias="postalCode")
    phone: str
    totalAmount: Decimal = Field(..., alias="total_amount", serialization_alias="totalAmount", decimal_places=2)
    orderItems: List[OrderItemCreate] = Field(..., alias="order_items", serialization_alias="orderItems")

    model_config = {"from_attributes": True, "populate_by_name": True}

class OrderCreate(OrderBase):
    pass

class OrderUpdateStatus(BaseModel):
    status: str

class OrderInDB(OrderBase):
    id: uuid.UUID
    userId: uuid.UUID = Field(..., alias="user_id", serialization_alias="userId")
    status: str
    createdAt: datetime = Field(..., alias="created_at", serialization_alias="createdAt")
    orderItems: List[OrderItemInDB] = Field(default_factory=list, alias="order_items", serialization_alias="orderItems")

    model_config = {"from_attributes": True, "populate_by_name": True}

class OrderDelete(BaseModel):
    orderId: uuid.UUID
# endregion

# region Favourite Schemas
class FavouriteBase(BaseModel):
    productId: uuid.UUID = Field(..., alias="product_id", serialization_alias="productId")

    model_config = {"from_attributes": True, "populate_by_name": True}

class FavouriteCreate(FavouriteBase):
    pass

class FavouriteInDB(FavouriteBase):
    id: uuid.UUID
    userId: uuid.UUID = Field(..., alias="user_id", serialization_alias="userId")
    product: Optional[ProductInDB] = None

    model_config = {"from_attributes": True, "populate_by_name": True}

class FavouriteDelete(BaseModel):
    productId: uuid.UUID
# endregion

# region Extended Cart Schemas
class CartItemUpdate(BaseModel):
    quantity: int = Field(..., ge=1)

class CartItemAdd(BaseModel):
    productId: uuid.UUID
    quantity: int = Field(default=1, ge=1)

class CartItemDelete(BaseModel):
    productId: uuid.UUID

class CartItemWithProduct(BaseModel):
    id: uuid.UUID
    productId: uuid.UUID = Field(..., alias="product_id", serialization_alias="productId")
    userId: uuid.UUID = Field(..., alias="user_id", serialization_alias="userId")
    quantity: int
    priceSnapshot: float = Field(..., alias="price_snapshot", serialization_alias="priceSnapshot")
    # Информация о товаре
    name: str
    slug: str
    description: Optional[str] = None
    imageUrl: Optional[str] = Field(None, serialization_alias="imageUrl")
    categoryId: uuid.UUID = Field(..., serialization_alias="categoryId")

    model_config = {"from_attributes": True, "populate_by_name": True}
# endregion

# region Chat Schemas
class ChatMessageBase(BaseModel):
    message: str
    isFromAdmin: bool = Field(False, alias="is_from_admin", serialization_alias="isFromAdmin")

    model_config = {"from_attributes": True, "populate_by_name": True}

class ChatMessageCreate(ChatMessageBase):
    pass

class ChatMessageInDB(ChatMessageBase):
    id: str  # Используем строку для UUID
    chatId: str = Field(..., alias="chat_id", serialization_alias="chatId")  # Используем строку для UUID
    senderId: str = Field(..., alias="sender_id", serialization_alias="senderId")  # Используем строку для UUID
    isRead: bool = Field(..., alias="is_read", serialization_alias="isRead")
    createdAt: str = Field(..., alias="created_at", serialization_alias="createdAt")  # Используем строку для datetime
    # Информация об отправителе
    senderName: Optional[str] = None
    senderEmail: Optional[str] = None

    model_config = {"from_attributes": True, "populate_by_name": True}

class ChatBase(BaseModel):
    isActive: bool = Field(True, alias="is_active", serialization_alias="isActive")

    model_config = {"from_attributes": True, "populate_by_name": True}

class ChatCreate(ChatBase):
    pass

class ChatInDB(ChatBase):
    id: str  # Используем строку для UUID
    userId: str = Field(..., alias="user_id", serialization_alias="userId")  # Используем строку для UUID
    unreadCount: int = Field(..., alias="unread_count", serialization_alias="unreadCount")
    lastMessageAt: Optional[str] = Field(None, alias="last_message_at", serialization_alias="lastMessageAt")  # Используем строку для datetime
    createdAt: str = Field(..., alias="created_at", serialization_alias="createdAt")  # Используем строку для datetime
    # Информация о пользователе
    userName: Optional[str] = None
    userEmail: Optional[str] = None
    # Последнее сообщение
    lastMessage: Optional[str] = None
    # Сообщения (для детального просмотра)
    messages: List[ChatMessageInDB] = Field(default_factory=list)

    model_config = {"from_attributes": True, "populate_by_name": True}

class ChatMessageSend(BaseModel):
    chatId: uuid.UUID
    message: str

class WebSocketMessage(BaseModel):
    type: str  # "message", "user_typing", "user_joined", "user_left"
    chatId: Optional[uuid.UUID] = None
    message: Optional[str] = None
    senderId: Optional[uuid.UUID] = None
    senderName: Optional[str] = None
    timestamp: Optional[datetime] = None
    data: Optional[Dict[str, Any]] = None
# endregion

# region Notification Schemas
class NotificationBase(BaseModel):
    title: str
    message: str
    type: str  # 'order_status', 'chat_message', 'new_order', 'system'
    notificationData: Optional[Dict[str, Any]] = Field(None, alias="notification_data", serialization_alias="notificationData")

    model_config = {"from_attributes": True, "populate_by_name": True}

class NotificationCreate(NotificationBase):
    userId: str = Field(..., alias="user_id", serialization_alias="userId")

class NotificationInDB(NotificationBase):
    id: str  # Используем строку для UUID
    userId: str = Field(..., alias="user_id", serialization_alias="userId")
    isRead: bool = Field(..., alias="is_read", serialization_alias="isRead")
    createdAt: str = Field(..., alias="created_at", serialization_alias="createdAt")

    model_config = {"from_attributes": True, "populate_by_name": True}

class NotificationUpdate(BaseModel):
    isRead: bool = Field(..., alias="is_read", serialization_alias="isRead")

    model_config = {"from_attributes": True, "populate_by_name": True}
# endregion 