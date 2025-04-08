/*
  Warnings:

  - You are about to drop the column `readByCustomer` on the `Chat` table. All the data in the column will be lost.
  - You are about to drop the column `readByTailor` on the `Chat` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Chat" DROP COLUMN "readByCustomer",
DROP COLUMN "readByTailor",
ADD COLUMN     "readAt" TIMESTAMP(3);
