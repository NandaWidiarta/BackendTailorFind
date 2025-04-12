-- AlterEnum
ALTER TYPE "OrderStatus" ADD VALUE 'CANCELED';

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "cancellationReason" TEXT,
ADD COLUMN     "cancelledAt" TIMESTAMP(3),
ADD COLUMN     "cancelledBy" "Role";
