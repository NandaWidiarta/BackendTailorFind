/*
  Warnings:

  - The values [WAITING_ADMIN_PAYMENT_VERIFICATION,WAITING_ADMIN_TO_PAY_TAILOR,PAYMENT_REJECTED] on the enum `OrderStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `bankAccountNumber` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `bankAccountOwner` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `bankName` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `cancelledBy` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `customerAccount` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `customerAccountName` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `customerName` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `customerPaymentBankName` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `paymentImage` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `paymentToTailorImage` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `refundImage` on the `Order` table. All the data in the column will be lost.
  - You are about to alter the column `customerId` on the `RoomChat` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - You are about to alter the column `tailorId` on the `RoomChat` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - You are about to alter the column `customerName` on the `RoomChat` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - You are about to alter the column `tailorName` on the `RoomChat` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - You are about to drop the column `profilePicture` on the `TailorProfile` table. All the data in the column will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "OrderStatus_new" AS ENUM ('NOT_YET_PAY', 'ADMIN_REVIEWING_CANCELLATION', 'ON_PROCCESS', 'TAILOR_SENT_PRODUCT', 'WAITING_CUSTOMER_RECEIVE_CONFIRMATION', 'DONE', 'CANCELED');
ALTER TABLE "Order" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Order" ALTER COLUMN "status" TYPE "OrderStatus_new" USING ("status"::text::"OrderStatus_new");
ALTER TABLE "Order" ALTER COLUMN "previousStatus" TYPE "OrderStatus_new" USING ("previousStatus"::text::"OrderStatus_new");
ALTER TYPE "OrderStatus" RENAME TO "OrderStatus_old";
ALTER TYPE "OrderStatus_new" RENAME TO "OrderStatus";
DROP TYPE "OrderStatus_old";
ALTER TABLE "Order" ALTER COLUMN "status" SET DEFAULT 'NOT_YET_PAY';
COMMIT;

-- DropForeignKey
ALTER TABLE "RoomChat" DROP CONSTRAINT "RoomChat_customerId_fkey";

-- DropForeignKey
ALTER TABLE "RoomChat" DROP CONSTRAINT "RoomChat_tailorId_fkey";

-- AlterTable
ALTER TABLE "Article" ALTER COLUMN "authorName" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Course" ALTER COLUMN "authorName" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Order" DROP COLUMN "bankAccountNumber",
DROP COLUMN "bankAccountOwner",
DROP COLUMN "bankName",
DROP COLUMN "cancelledBy",
DROP COLUMN "customerAccount",
DROP COLUMN "customerAccountName",
DROP COLUMN "customerName",
DROP COLUMN "customerPaymentBankName",
DROP COLUMN "paymentImage",
DROP COLUMN "paymentToTailorImage",
DROP COLUMN "refundImage";

-- AlterTable
ALTER TABLE "RoomChat" ALTER COLUMN "customerId" SET DATA TYPE VARCHAR(100),
ALTER COLUMN "tailorId" SET DATA TYPE VARCHAR(100),
ALTER COLUMN "customerName" SET DATA TYPE VARCHAR(100),
ALTER COLUMN "tailorName" SET DATA TYPE VARCHAR(100);

-- AlterTable
ALTER TABLE "TailorProfile" DROP COLUMN "profilePicture";

-- AddForeignKey
ALTER TABLE "RoomChat" ADD CONSTRAINT "RoomChat_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoomChat" ADD CONSTRAINT "RoomChat_tailorId_fkey" FOREIGN KEY ("tailorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
