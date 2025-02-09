-- AlterTable
ALTER TABLE "RoomChat" ADD COLUMN     "latestMessage" TEXT,
ADD COLUMN     "latestMessageTime" TIMESTAMP(3),
ADD COLUMN     "unreadCountCustomer" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "unreadCountTailor" INTEGER NOT NULL DEFAULT 0;
