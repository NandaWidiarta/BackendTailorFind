-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "OrderStatus" ADD VALUE 'WAITING_ADMIN_PAYMENT_VERIFICATION';
ALTER TYPE "OrderStatus" ADD VALUE 'ADMIN_REVIEWING_CANCELLATION';
ALTER TYPE "OrderStatus" ADD VALUE 'TAILOR_SENT_PRODUCT';
ALTER TYPE "OrderStatus" ADD VALUE 'WAITING_CUSTOMER_RECEIVE_CONFIRMATION';
ALTER TYPE "OrderStatus" ADD VALUE 'WAITING_ADMIN_TO_PAY_TAILOR';

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "cancellationRejectedReason" TEXT,
ADD COLUMN     "cancellationRequestImage" TEXT,
ADD COLUMN     "cancellationRequestReason" TEXT,
ADD COLUMN     "customerAccount" TEXT,
ADD COLUMN     "customerAccountName" TEXT,
ADD COLUMN     "customerPaymentBankName" TEXT,
ADD COLUMN     "isCancellationApproved" BOOLEAN,
ADD COLUMN     "previousStatus" "OrderStatus",
ADD COLUMN     "refundImage" TEXT;

-- AlterTable
ALTER TABLE "RoomChat" ADD COLUMN     "isAdminRoom" BOOLEAN NOT NULL DEFAULT false;
