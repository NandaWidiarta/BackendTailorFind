/*
  Warnings:

  - You are about to drop the column `isAdminRoom` on the `RoomChat` table. All the data in the column will be lost.

*/
-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'ADMIN';

-- AlterTable
ALTER TABLE "RoomChat" DROP COLUMN "isAdminRoom";
