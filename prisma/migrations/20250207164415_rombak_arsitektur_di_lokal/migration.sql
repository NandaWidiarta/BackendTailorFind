/*
  Warnings:

  - The primary key for the `Chat` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `RatingReview` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `RoomChat` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the `Customer` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Tailor` table. If the table is not empty, all the data it contains will be lost.
  - Changed the type of `senderType` on the `Chat` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('CUSTOMER', 'TAILOR');

-- DropForeignKey
ALTER TABLE "Chat" DROP CONSTRAINT "Chat_roomId_fkey";

-- DropForeignKey
ALTER TABLE "RatingReview" DROP CONSTRAINT "RatingReview_customerId_fkey";

-- DropForeignKey
ALTER TABLE "RatingReview" DROP CONSTRAINT "RatingReview_tailorId_fkey";

-- DropForeignKey
ALTER TABLE "RoomChat" DROP CONSTRAINT "RoomChat_customerId_fkey";

-- DropForeignKey
ALTER TABLE "RoomChat" DROP CONSTRAINT "RoomChat_tailorId_fkey";

-- DropForeignKey
ALTER TABLE "Tailor" DROP CONSTRAINT "Tailor_districtId_fkey";

-- DropForeignKey
ALTER TABLE "Tailor" DROP CONSTRAINT "Tailor_provinceId_fkey";

-- DropForeignKey
ALTER TABLE "Tailor" DROP CONSTRAINT "Tailor_regencyId_fkey";

-- DropForeignKey
ALTER TABLE "Tailor" DROP CONSTRAINT "Tailor_villageId_fkey";

-- AlterTable
ALTER TABLE "Chat" DROP CONSTRAINT "Chat_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "roomId" SET DATA TYPE TEXT,
ALTER COLUMN "senderId" SET DATA TYPE TEXT,
DROP COLUMN "senderType",
ADD COLUMN     "senderType" "Role" NOT NULL,
ADD CONSTRAINT "Chat_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Chat_id_seq";

-- AlterTable
ALTER TABLE "RatingReview" DROP CONSTRAINT "RatingReview_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "review" SET DATA TYPE VARCHAR(100),
ALTER COLUMN "tailorId" SET DATA TYPE TEXT,
ALTER COLUMN "customerId" SET DATA TYPE TEXT,
ADD CONSTRAINT "RatingReview_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "RatingReview_id_seq";

-- AlterTable
ALTER TABLE "RoomChat" DROP CONSTRAINT "RoomChat_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "customerId" SET DATA TYPE TEXT,
ALTER COLUMN "tailorId" SET DATA TYPE TEXT,
ADD CONSTRAINT "RoomChat_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "RoomChat_id_seq";

-- DropTable
DROP TABLE "Customer";

-- DropTable
DROP TABLE "Tailor";

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "firstname" VARCHAR(100) NOT NULL,
    "lastname" VARCHAR(100),
    "email" VARCHAR(100) NOT NULL,
    "phoneNumber" VARCHAR(20) NOT NULL,
    "password" VARCHAR(100) NOT NULL,
    "token" VARCHAR(100),
    "role" "Role" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tailorProfileId" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TailorProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "provinceId" TEXT NOT NULL,
    "regencyId" TEXT NOT NULL,
    "districtId" TEXT NOT NULL,
    "villageId" TEXT NOT NULL,
    "addressDetail" TEXT NOT NULL,
    "workEstimation" TEXT NOT NULL,
    "priceRange" TEXT NOT NULL,
    "specialization" TEXT[],
    "businessDescription" TEXT NOT NULL,
    "profilePicture" TEXT,
    "certificate" TEXT[],
    "averageRating" DOUBLE PRECISION NOT NULL DEFAULT 0.0,

    CONSTRAINT "TailorProfile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_phoneNumber_key" ON "User"("phoneNumber");

-- CreateIndex
CREATE UNIQUE INDEX "User_tailorProfileId_key" ON "User"("tailorProfileId");

-- CreateIndex
CREATE UNIQUE INDEX "TailorProfile_userId_key" ON "TailorProfile"("userId");

-- AddForeignKey
ALTER TABLE "TailorProfile" ADD CONSTRAINT "TailorProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TailorProfile" ADD CONSTRAINT "TailorProfile_provinceId_fkey" FOREIGN KEY ("provinceId") REFERENCES "Province"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TailorProfile" ADD CONSTRAINT "TailorProfile_regencyId_fkey" FOREIGN KEY ("regencyId") REFERENCES "Regency"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TailorProfile" ADD CONSTRAINT "TailorProfile_districtId_fkey" FOREIGN KEY ("districtId") REFERENCES "District"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TailorProfile" ADD CONSTRAINT "TailorProfile_villageId_fkey" FOREIGN KEY ("villageId") REFERENCES "Village"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoomChat" ADD CONSTRAINT "RoomChat_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoomChat" ADD CONSTRAINT "RoomChat_tailorId_fkey" FOREIGN KEY ("tailorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chat" ADD CONSTRAINT "Chat_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "RoomChat"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RatingReview" ADD CONSTRAINT "RatingReview_tailorId_fkey" FOREIGN KEY ("tailorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RatingReview" ADD CONSTRAINT "RatingReview_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
