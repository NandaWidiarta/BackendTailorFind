-- CreateEnum
CREATE TYPE "OrderType" AS ENUM ('DELIVERY', 'PICKUP');

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "deliveryAddress" TEXT,
ADD COLUMN     "orderType" "OrderType" NOT NULL DEFAULT 'PICKUP';
