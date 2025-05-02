-- AlterTable
ALTER TABLE "RoomChat" ADD COLUMN     "deletedByCustomer" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "deletedByTailor" BOOLEAN NOT NULL DEFAULT false;
