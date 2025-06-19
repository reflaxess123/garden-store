### Схема базы данных из `prisma/schema.prisma`

```prisma
// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

// Looking for ways to speed up your queries, or scale easily with your serverless or edge functions?
// Try Prisma Accelerate: https://pris.ly/cli/accelerate-init

generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["multiSchema"]
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  schemas  = ["public", "auth"]
}

model Category {
  id          String   @id @default(uuid())
  slug        String   @unique
  name        String
  description String?
  imageUrl    String?
  products    Product[]

  @@map("categories")
  @@schema("public")
}

model Product {
  id            String    @id @default(uuid())
  slug          String    @unique
  name          String
  description   String?
  price         Decimal   @db.Decimal(10,2)
  discount      Decimal?  @db.Decimal(10,2)
  characteristics Json?
  imageUrl      String?
  categoryId    String
  category      Category  @relation(fields:[categoryId], references:[id])
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  timesOrdered  Int         @default(0)
  favourites    Favourite[]
  cartItems     CartItem[]

  @@map("products")
  @@schema("public")
}

// New Profile model in 'public' schema for custom user data
model Profile {
  id        String     @id @map("id") // The ID is directly the user ID from auth.users
  fullName  String?
  isAdmin   Boolean  @default(false)

  favourites    Favourite[]
  cartItems     CartItem[]
  orders        Order[]

  @@map("profiles")
  @@schema("public")
}

model Favourite {
  id        String   @id @default(uuid())
  userId    String
  productId String
  profile   Profile     @relation(fields:[userId], references:[id]) // Relates to the Profile model
  product   Product  @relation(fields:[productId], references:[id])
  @@unique([userId, productId])
  @@schema("public")
}

model CartItem {
  id            String   @id @default(uuid())
  userId        String
  productId     String
  quantity      Int      @default(1)
  priceSnapshot Decimal  @db.Decimal(10,2)
  profile       Profile     @relation(fields:[userId], references:[id]) // Relates to the Profile model
  product       Product  @relation(fields:[productId], references:[id])
  @@unique([userId, productId])
  @@schema("public")
}

model Order {
  id          String      @id @default(uuid())
  userId      String
  totalAmount Decimal     @db.Decimal(10,2)
  status      String      @default("pending")  // pending, paid, shipped, cancelled
  createdAt   DateTime    @default(now())
  profile     Profile     @relation(fields:[userId], references:[id]) // Relates to the Profile model
  fullName    String // Keep these fields as snapshots at time of order
  email       String // Keep these fields as snapshots at time of order
  address     String
  city        String
  postalCode  String
  phone       String
  orderItems  OrderItem[]

  @@map("orders")
  @@schema("public")
}

model OrderItem {
  id            String    @id @default(uuid())
  orderId       String
  productId     String
  quantity      Int
  priceSnapshot Decimal   @db.Decimal(10,2)
  name          String
  imageUrl      String?
  order         Order     @relation(fields:[orderId], references:[id])

  @@map("order_items")
  @@schema("public")
}


```

### Миграция: `20250618085820_peppa2`

```sql
/*
  Warnings:

  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `priceSnapshot` to the `CartItem` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "CartItem" DROP CONSTRAINT "CartItem_userId_fkey";

-- DropForeignKey
ALTER TABLE "Favourite" DROP CONSTRAINT "Favourite_userId_fkey";

-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_userId_fkey";

-- AlterTable
ALTER TABLE "CartItem" ADD COLUMN     "priceSnapshot" DECIMAL(10,2) NOT NULL;

-- DropTable
DROP TABLE "User";

-- CreateTable
CREATE TABLE "auth.users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "fullName" TEXT,
    "isAdmin" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "auth.users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "auth.users_email_key" ON "auth.users"("email");

-- AddForeignKey
ALTER TABLE "Favourite" ADD CONSTRAINT "Favourite_userId_fkey" FOREIGN KEY ("userId") REFERENCES "auth.users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CartItem" ADD CONSTRAINT "CartItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "auth.users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "auth.users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

```

### Функция PostgreSQL: `create_order` из `fix_create_order.sql`

```sql
CREATE OR REPLACE FUNCTION public.create_order(
  p_address text,
  p_city text,
  p_email text,
  p_full_name text,
  p_order_items jsonb,
  p_phone text,
  p_postal_code text,
  p_total_amount numeric,
  p_user_id uuid
) RETURNS uuid
LANGUAGE plpgsql
AS $$
DECLARE
  new_order_id uuid := gen_random_uuid();
  item jsonb;
BEGIN
  INSERT INTO public.orders (
    id, address, city, email, "fullName", phone, "postalCode", "totalAmount", "userId"
  ) VALUES (
    new_order_id, p_address, p_city, p_email, p_full_name, p_phone, p_postal_code, p_total_amount, p_user_id
  );

  FOR item IN SELECT * FROM jsonb_array_elements(p_order_items)
  LOOP
    INSERT INTO public.order_items (
      "orderId",
      "productId",
      quantity,
      "priceSnapshot",
      name,
      "imageUrl"
    ) VALUES (
      new_order_id,
      (item->>'productId')::uuid,
      (item->>'quantity')::integer,
      (item->>'priceSnapshot')::numeric,
      item->>'name',
      item->>'imageUrl'
    );
  END LOOP;

  RETURN new_order_id;
END;
$$;
```
