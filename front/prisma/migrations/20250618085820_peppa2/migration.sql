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
