/*
  Warnings:

  - You are about to alter the column `place` on the `Course` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(500)`.
  - You are about to drop the column `isCancellationApproved` on the `OrderCancellation` table. All the data in the column will be lost.
  - You are about to alter the column `deliveryAddress` on the `OrderShipping` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(500)`.
  - The primary key for the `RatingReview` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `addressDetail` on the `TailorProfile` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(500)`.
  - You are about to alter the column `businessDescription` on the `TailorProfile` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(500)`.

*/
-- AlterTable
ALTER TABLE "Course" ALTER COLUMN "place" SET DATA TYPE VARCHAR(500);

-- AlterTable
ALTER TABLE "OrderCancellation" DROP COLUMN "isCancellationApproved";

-- AlterTable
ALTER TABLE "OrderShipping" ALTER COLUMN "deliveryAddress" SET DATA TYPE VARCHAR(500);

-- AlterTable
ALTER TABLE "RatingReview" DROP CONSTRAINT "RatingReview_pkey",
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "review" SET DATA TYPE TEXT,
ADD CONSTRAINT "RatingReview_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "TailorProfile" ALTER COLUMN "addressDetail" SET DATA TYPE VARCHAR(500),
ALTER COLUMN "businessDescription" SET DATA TYPE VARCHAR(500);
