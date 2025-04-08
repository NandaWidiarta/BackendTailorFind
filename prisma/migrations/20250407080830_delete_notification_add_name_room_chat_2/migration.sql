/*
  Warnings:

  - You are about to drop the `Notification` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_userId_fkey";

-- AlterTable
ALTER TABLE "RoomChat" ADD COLUMN     "customerName" TEXT,
ADD COLUMN     "tailorName" TEXT;

-- DropTable
DROP TABLE "Notification";

-- DropEnum
DROP TYPE "NotificationType";
