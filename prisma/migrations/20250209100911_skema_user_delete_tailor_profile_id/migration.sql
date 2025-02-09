/*
  Warnings:

  - You are about to drop the column `tailorProfileId` on the `User` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "User_tailorProfileId_key";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "tailorProfileId";
