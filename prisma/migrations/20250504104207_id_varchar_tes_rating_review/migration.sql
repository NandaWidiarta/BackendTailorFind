/*
  Warnings:

  - The primary key for the `RatingReview` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `RatingReview` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.

*/
-- AlterTable
ALTER TABLE "RatingReview" DROP CONSTRAINT "RatingReview_pkey",
ALTER COLUMN "id" SET DATA TYPE VARCHAR(255),
ADD CONSTRAINT "RatingReview_pkey" PRIMARY KEY ("id");
