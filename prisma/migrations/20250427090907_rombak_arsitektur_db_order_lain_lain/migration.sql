/*
  Warnings:

  - You are about to drop the column `authorName` on the `Article` table. All the data in the column will be lost.
  - You are about to alter the column `title` on the `Article` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - You are about to drop the column `authorName` on the `Course` table. All the data in the column will be lost.
  - You are about to alter the column `courseName` on the `Course` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - You are about to alter the column `shortDescription` on the `Course` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(500)`.
  - You are about to alter the column `courseDate` on the `Course` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - You are about to drop the column `cancellationReason` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `cancellationRejectedReason` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `cancellationRequestImage` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `cancellationRequestReason` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `cancelledAt` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `deliveryAddress` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `deliveryImage` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `deliveryServiceName` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `isCancellationApproved` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `previousStatus` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `receiptNumber` on the `Order` table. All the data in the column will be lost.
  - You are about to alter the column `name` on the `OrderItem` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - You are about to alter the column `name` on the `Stuff` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - You are about to alter the column `workEstimation` on the `TailorProfile` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.

*/
-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_roomId_fkey";

-- DropForeignKey
ALTER TABLE "RoomChat" DROP CONSTRAINT "RoomChat_customerId_fkey";

-- DropForeignKey
ALTER TABLE "RoomChat" DROP CONSTRAINT "RoomChat_tailorId_fkey";

-- AlterTable
ALTER TABLE "Article" DROP COLUMN "authorName",
ALTER COLUMN "title" SET DATA TYPE VARCHAR(255);

-- AlterTable
ALTER TABLE "Course" DROP COLUMN "authorName",
ALTER COLUMN "courseName" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "shortDescription" SET DATA TYPE VARCHAR(500),
ALTER COLUMN "courseDate" SET DATA TYPE VARCHAR(255);

-- AlterTable
ALTER TABLE "Order" DROP COLUMN "cancellationReason",
DROP COLUMN "cancellationRejectedReason",
DROP COLUMN "cancellationRequestImage",
DROP COLUMN "cancellationRequestReason",
DROP COLUMN "cancelledAt",
DROP COLUMN "createdAt",
DROP COLUMN "deliveryAddress",
DROP COLUMN "deliveryImage",
DROP COLUMN "deliveryServiceName",
DROP COLUMN "isCancellationApproved",
DROP COLUMN "previousStatus",
DROP COLUMN "receiptNumber",
ALTER COLUMN "roomId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "OrderItem" ALTER COLUMN "name" SET DATA TYPE VARCHAR(255);

-- AlterTable
ALTER TABLE "RatingReview" ALTER COLUMN "review" SET DATA TYPE VARCHAR(255);

-- AlterTable
ALTER TABLE "RoomChat" ALTER COLUMN "customerId" SET DATA TYPE TEXT,
ALTER COLUMN "tailorId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "Stuff" ALTER COLUMN "name" SET DATA TYPE VARCHAR(255);

-- AlterTable
ALTER TABLE "TailorProfile" ALTER COLUMN "workEstimation" SET DATA TYPE VARCHAR(255);

-- CreateTable
CREATE TABLE "OrderShipping" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "deliveryAddress" TEXT,
    "deliveryServiceName" VARCHAR(255),
    "receiptNumber" VARCHAR(255),
    "deliveryImage" TEXT,

    CONSTRAINT "OrderShipping_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderCancellation" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "cancellationReason" VARCHAR(255),
    "cancelledAt" TIMESTAMP(3),
    "cancellationRequestImage" TEXT,
    "cancellationRejectedReason" VARCHAR(255),
    "isCancellationApproved" BOOLEAN,
    "previousStatus" "OrderStatus",

    CONSTRAINT "OrderCancellation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "OrderShipping_orderId_key" ON "OrderShipping"("orderId");

-- CreateIndex
CREATE UNIQUE INDEX "OrderCancellation_orderId_key" ON "OrderCancellation"("orderId");

-- AddForeignKey
ALTER TABLE "RoomChat" ADD CONSTRAINT "RoomChat_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoomChat" ADD CONSTRAINT "RoomChat_tailorId_fkey" FOREIGN KEY ("tailorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "RoomChat"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderShipping" ADD CONSTRAINT "OrderShipping_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderCancellation" ADD CONSTRAINT "OrderCancellation_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
