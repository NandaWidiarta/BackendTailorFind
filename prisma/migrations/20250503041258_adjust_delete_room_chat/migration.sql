/*
  Warnings:

  - You are about to drop the column `deletedByCustomer` on the `RoomChat` table. All the data in the column will be lost.
  - You are about to drop the column `deletedByTailor` on the `RoomChat` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "RoomChat" DROP COLUMN "deletedByCustomer",
DROP COLUMN "deletedByTailor",
ADD COLUMN     "deletedByCustomerAt" TIMESTAMP(3),
ADD COLUMN     "deletedByTailorAt" TIMESTAMP(3);
