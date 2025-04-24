/*
  Warnings:

  - You are about to drop the column `senderId` on the `Chat` table. All the data in the column will be lost.
  - You are about to alter the column `type` on the `Chat` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(50)`.

*/
-- AlterTable
ALTER TABLE "Chat" DROP COLUMN "senderId",
ALTER COLUMN "type" SET DATA TYPE VARCHAR(50);
