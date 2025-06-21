import uuid

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, Numeric, String
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import declarative_base, relationship
from sqlalchemy.sql import func

Base = declarative_base()


class Category(Base):
    __tablename__ = "categories"
    __table_args__ = {"schema": "public"}

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    slug = Column(String, unique=True, nullable=False)
    name = Column(String, nullable=False)
    description = Column(String)
    image_url = Column(String)

    products = relationship("Product", back_populates="category")


class Product(Base):
    __tablename__ = "products"
    __table_args__ = {"schema": "public"}

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    slug = Column(String, unique=True, nullable=False)
    name = Column(String, nullable=False)
    description = Column(String)
    price = Column(Numeric(10, 2), nullable=False)
    discount = Column(Numeric(10, 2))
    characteristics = Column(JSONB)
    image_url = Column(String)
    category_id = Column(UUID(as_uuid=True), ForeignKey("public.categories.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    times_ordered = Column(Integer, default=0)
    offline_purchases = Column(Integer, default=0)

    category = relationship("Category", back_populates="products")
    favourites = relationship("Favourite", back_populates="product")
    cart_items = relationship("CartItem", back_populates="product")


class Profile(Base):
    __tablename__ = "profiles"
    __table_args__ = {"schema": "public"}

    id = Column(UUID(as_uuid=True), primary_key=True)  # Matches auth.users id
    email = Column(String, unique=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String)
    is_admin = Column(Boolean, default=False)

    favourites = relationship("Favourite", back_populates="profile")
    cart_items = relationship("CartItem", back_populates="profile")
    orders = relationship("Order", back_populates="profile")


class Favourite(Base):
    __tablename__ = "favourites"
    __table_args__ = {"schema": "public"}

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("public.profiles.id"), nullable=False)
    product_id = Column(UUID(as_uuid=True), ForeignKey("public.products.id"), nullable=False)

    profile = relationship("Profile", back_populates="favourites")
    product = relationship("Product", back_populates="favourites")


class CartItem(Base):
    __tablename__ = "cart_items"
    __table_args__ = {"schema": "public"}

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("public.profiles.id"), nullable=False)
    product_id = Column(UUID(as_uuid=True), ForeignKey("public.products.id"), nullable=False)
    quantity = Column(Integer, default=1)
    price_snapshot = Column(Numeric(10, 2), nullable=False)

    profile = relationship("Profile", back_populates="cart_items")
    product = relationship("Product", back_populates="cart_items")


class Order(Base):
    __tablename__ = "orders"
    __table_args__ = {"schema": "public"}

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("public.profiles.id"), nullable=False)
    total_amount = Column(Numeric(10, 2), nullable=False)
    status = Column(String, default="pending")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    full_name = Column(String, nullable=False)
    email = Column(String, nullable=False)
    address = Column(String, nullable=False)
    city = Column(String, nullable=False)
    postal_code = Column(String, nullable=False)
    phone = Column(String, nullable=False)

    profile = relationship("Profile", back_populates="orders")
    order_items = relationship("OrderItem", back_populates="order")


class OrderItem(Base):
    __tablename__ = "order_items"
    __table_args__ = {"schema": "public"}

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    order_id = Column(UUID(as_uuid=True), ForeignKey("public.orders.id"), nullable=False)
    product_id = Column(UUID(as_uuid=True), nullable=False)  # No foreign key, it's a snapshot
    quantity = Column(Integer, nullable=False)
    price_snapshot = Column(Numeric(10, 2), nullable=False)
    name = Column(String, nullable=False)
    image_url = Column(String)

    order = relationship("Order", back_populates="order_items")


class Chat(Base):
    __tablename__ = "chats"
    __table_args__ = {"schema": "public"}

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("public.profiles.id"), nullable=False)
    is_active = Column(Boolean, default=True)
    last_message_at = Column(DateTime(timezone=True), server_default=func.now())
    unread_count = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("Profile", foreign_keys=[user_id])
    messages = relationship("ChatMessage", back_populates="chat", cascade="all, delete-orphan")


class ChatMessage(Base):
    __tablename__ = "chat_messages"
    __table_args__ = {"schema": "public"}

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    chat_id = Column(UUID(as_uuid=True), ForeignKey("public.chats.id"), nullable=False)
    sender_id = Column(UUID(as_uuid=True), ForeignKey("public.profiles.id"), nullable=False)
    message = Column(String, nullable=False)
    is_from_admin = Column(Boolean, default=False)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    chat = relationship("Chat", back_populates="messages")
    sender = relationship("Profile", foreign_keys=[sender_id])


class Notification(Base):
    __tablename__ = "notifications"
    __table_args__ = {"schema": "public"}

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("public.profiles.id"), nullable=False)
    title = Column(String, nullable=False)
    message = Column(String, nullable=False)
    type = Column(String, nullable=False)  # 'order_status', 'chat_message', 'new_order', 'system'
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    # Дополнительные данные для уведомления (order_id, chat_id и т.д.)
    notification_data = Column(JSONB)

    user = relationship("Profile", foreign_keys=[user_id])
