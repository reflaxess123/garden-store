import asyncio
import uuid
from decimal import Decimal
import os
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import text, select

from app.db.models import Base, Category, Product, Profile, Order, OrderItem, CartItem, Favourite
from app.auth import get_password_hash # Assuming get_password_hash is in app.auth

# Load environment variables
from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '..', '.env'))

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise ValueError("DATABASE_URL environment variable is not set.")

engine = create_async_engine(DATABASE_URL, echo=True)
AsyncSessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
)

async def recreate_tables():
    async with engine.begin() as conn:
        # Drop tables in reverse dependency order or use CASCADE
        await conn.execute(text("DROP TABLE IF EXISTS public.order_items CASCADE;"))
        await conn.execute(text("DROP TABLE IF EXISTS public.orders CASCADE;"))
        await conn.execute(text("DROP TABLE IF EXISTS public.cart_items CASCADE;"))
        await conn.execute(text("DROP TABLE IF EXISTS public.favourites CASCADE;"))
        await conn.execute(text("DROP TABLE IF EXISTS public.products CASCADE;"))
        await conn.execute(text("DROP TABLE IF EXISTS public.categories CASCADE;"))
        await conn.execute(text("DROP TABLE IF EXISTS public.profiles CASCADE;"))
        
        await conn.run_sync(Base.metadata.create_all)
    print("Tables recreated successfully.")

async def seed_data():
    async with AsyncSessionLocal() as session:
        print("Start seeding ...")

        # Clear existing data
        print("Deleting existing order items...")
        await session.execute(text("DELETE FROM public.order_items;"))
        print("Deleting existing orders...")
        await session.execute(text("DELETE FROM public.orders;"))
        print("Deleting existing carts...")
        await session.execute(text("DELETE FROM public.cart_items;"))
        print("Deleting existing favourites...")
        await session.execute(text("DELETE FROM public.favourites;"))
        print("Deleting existing products...")
        await session.execute(text("DELETE FROM public.products;"))
        print("Deleting existing categories...")
        await session.execute(text("DELETE FROM public.categories;"))
        print("Deleting existing profiles...")
        await session.execute(text("DELETE FROM public.profiles;"))
        await session.commit()
        print("Existing data deleted.")

        # Create test users (profiles)
        admin_user_id = uuid.UUID("28ad2b7d-02d6-4f84-b1c3-1ee26e6b4b58")
        hashed_admin_password = get_password_hash("adminpassword") # Use a strong password in production

        user1 = Profile(
            id=admin_user_id,
            email="admin@example.com",
            hashed_password=hashed_admin_password,
            full_name="John Doe",
            is_admin=True,
        )
        session.add(user1)
        await session.commit()
        await session.refresh(user1)
        print(f"Created user: {user1.full_name}")

        # Create categories
        category_shovels = Category(
            name="Лопаты",
            slug="shovels",
            description="Разнообразные лопаты для любых садовых работ",
            image_url="/images/shovels_category.jpg",
        )
        category_seeds = Category(
            name="Семена",
            slug="seeds",
            description="Высококачественные семена для богатого урожая",
            image_url="/images/seeds_category.jpg",
        )
        category_pots = Category(
            name="Горшки и кашпо",
            slug="pots",
            description="Красивые и функциональные горшки для ваших растений",
            image_url="/images/pots_category.jpg",
        )

        session.add_all([category_shovels, category_seeds, category_pots])
        await session.commit()
        await session.refresh(category_shovels)
        await session.refresh(category_seeds)
        await session.refresh(category_pots)

        print(
            f"Created categories: {category_shovels.name}, {category_seeds.name}, {category_pots.name}"
        )

        # Add real products
        real_products_data = [
            # Лопаты
            {
                "name": "Лопата штыковая Fiskars",
                "slug": "fiskars-shovel",
                "description": "Высокопрочная штыковая лопата для копки земли.",
                "price": Decimal("2500.00"),
                "category_id": category_shovels.id,
                "image_url": "/images/fiskars_shovel.jpg",
                "characteristics": {"material": "Закаленная сталь", "length": "120 см"},
            },
            {
                "name": "Лопата совковая Palisad",
                "slug": "palisad-scoop-shovel",
                "description": "Совковая лопата для сыпучих материалов.",
                "price": Decimal("1200.00"),
                "category_id": category_shovels.id,
                "image_url": "/images/folding_shovel.jpg",
                "characteristics": {"material": "Углеродистая сталь", "width": "25 см"},
            },
            # Семена
            {
                "name": "Семена Томатов 'Черный Принц'",
                "slug": "tomato-black-prince",
                "description": "Раннеспелые, крупные, сладкие плоды.",
                "price": Decimal("150.00"),
                "category_id": category_seeds.id,
                "image_url": "/images/sunflower_seeds.jpg",
                "characteristics": {"variety": "Индетерминантный", "yield": "5 кг/куст"},
            },
            {
                "name": "Семена Огурцов 'Зозуля'",
                "slug": "cucumber-zozulya",
                "description": "Партенокарпический гибрид, без горечи.",
                "price": Decimal("120.00"),
                "category_id": category_seeds.id,
                "image_url": "/images/sunflower_seeds.jpg",
                "characteristics": {"variety": "Самоопыляемый", "ripening": "40-45 дней"},
            },
            # Горшки
            {
                "name": "Горшок керамический для цветов ⌀20см",
                "slug": "ceramic-pot-20cm",
                "description": "Классический керамический горшок для комнатных растений.",
                "price": Decimal("450.00"),
                "category_id": category_pots.id,
                "image_url": "/images/ceramic_pot.jpg",
                "characteristics": {"material": "Керамика", "diameter": "20 см", "color": "Терракотовый"},
            },
            {
                "name": "Кашпо пластиковое подвесное ⌀25см",
                "slug": "hanging-plastic-pot-25cm",
                "description": "Легкое пластиковое кашпо для подвесных композиций.",
                "price": Decimal("300.00"),
                "category_id": category_pots.id,
                "image_url": "/images/hanging_pot.jpg",
                "characteristics": {"material": "Пластик", "diameter": "25 см"},
            },
        ]

        products = []
        for product_data in real_products_data:
            product = Product(**product_data)
            products.append(product)
            session.add(product)
        await session.commit()
        for product in products:
            await session.refresh(product)
        print(f"Created {len(products)} real products.")

        # Create additional random products
        categories = [category_shovels, category_seeds, category_pots]
        image_paths = [
            "/images/ceramic_pot.jpg",
            "/images/fiskars_shovel.jpg",
            "/images/folding_shovel.jpg",
            "/images/hanging_pot.jpg",
            "/images/peat_pots.jpg",
            "/images/sunflower_seeds.jpg",
            "/images/truper_drain.jpg",
        ]

        number_of_additional_products = 150

        for i in range(number_of_additional_products):
            random_category = categories[os.urandom(1)[0] % len(categories)]
            random_image = image_paths[os.urandom(1)[0] % len(image_paths)]
            product_name = f"Случайный продукт {i + 1} ({random_category.name})"
            product_slug = f"random-product-{i + 1}-{random_category.slug}"
            product_description = f"Описание случайного продукта {i + 1}."
            product_price = Decimal(str(round((os.urandom(1)[0] / 255) * 1000 + 100, 2)))

            product = Product(
                name=product_name,
                slug=product_slug,
                description=product_description,
                price=product_price,
                category_id=random_category.id,
                image_url=random_image,
                characteristics={"weight": f"{round((os.urandom(1)[0] / 255) * 5 + 0.1, 1)} кг"},
            )
            session.add(product)
        await session.commit()
        print(f"Created {number_of_additional_products} additional random products.")

        # Get all created products for order generation
        all_products_result = await session.execute(select(Product))
        all_products = all_products_result.scalars().all()
        if not all_products:
            print("No products found to create orders. Please ensure products are seeded first.")
            return

        # Create random orders
        number_of_orders = 50
        statuses = ["pending", "processing", "shipped", "delivered", "cancelled"]
        users = [user1] # Only admin user for now

        for i in range(number_of_orders):
            random_user = users[os.urandom(1)[0] % len(users)]
            order_items_data = []
            total_amount = Decimal("0.00")
            number_of_order_items = (os.urandom(1)[0] % 3) + 1 # From 1 to 3 items per order

            for j in range(number_of_order_items):
                random_product = all_products[os.urandom(1)[0] % len(all_products)]
                quantity = (os.urandom(1)[0] % 5) + 1 # From 1 to 5 units of each item
                price_snapshot = random_product.price
                
                order_items_data.append(
                    OrderItem(
                        product_id=random_product.id,
                        quantity=quantity,
                        price_snapshot=price_snapshot,
                        name=random_product.name,
                        image_url=random_product.image_url,
                    )
                )
                total_amount += price_snapshot * quantity
            
            # Use random data for address, etc.
            full_name = f"Test User {i}"
            email = f"testuser{i}@example.com"
            address = f"123 Test St {i}"
            city = f"Test City {i}"
            postal_code = f"12345-{i}"
            phone = f"+123456789{i}"
            
            order = Order(
                user_id=random_user.id,
                total_amount=total_amount,
                status=statuses[os.urandom(1)[0] % len(statuses)],
                full_name=full_name,
                email=email,
                address=address,
                city=city,
                postal_code=postal_code,
                phone=phone,
                order_items=order_items_data,
            )
            session.add(order)
        await session.commit()
        print(f"Created {number_of_orders} random orders.")

    print("Seeding complete.")
    await engine.dispose()

if __name__ == "__main__":
    async def main_seed():
        await recreate_tables()
        await seed_data()
    asyncio.run(main_seed()) 