/*
  Warnings:

  - You are about to drop the `customers` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `tailors` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "tailors" DROP CONSTRAINT "tailors_districtId_fkey";

-- DropForeignKey
ALTER TABLE "tailors" DROP CONSTRAINT "tailors_provinceId_fkey";

-- DropForeignKey
ALTER TABLE "tailors" DROP CONSTRAINT "tailors_regencyId_fkey";

-- DropForeignKey
ALTER TABLE "tailors" DROP CONSTRAINT "tailors_villageId_fkey";

-- DropTable
DROP TABLE "customers";

-- DropTable
DROP TABLE "tailors";

-- CreateTable
CREATE TABLE "Customer" (
    "id" SERIAL NOT NULL,
    "firstname" VARCHAR(100) NOT NULL,
    "lastname" VARCHAR(100),
    "email" VARCHAR(100) NOT NULL,
    "phoneNumber" VARCHAR(20) NOT NULL,
    "password" VARCHAR(100) NOT NULL,
    "token" VARCHAR(100),

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tailor" (
    "id" SERIAL NOT NULL,
    "firstname" VARCHAR(100) NOT NULL,
    "lastname" VARCHAR(100),
    "email" VARCHAR(100) NOT NULL,
    "phoneNumber" VARCHAR(20) NOT NULL,
    "password" VARCHAR(100) NOT NULL,
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
    "certificate" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "token" VARCHAR(100),

    CONSTRAINT "Tailor_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Customer_email_key" ON "Customer"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Tailor_email_key" ON "Tailor"("email");

-- AddForeignKey
ALTER TABLE "Tailor" ADD CONSTRAINT "Tailor_provinceId_fkey" FOREIGN KEY ("provinceId") REFERENCES "Province"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tailor" ADD CONSTRAINT "Tailor_regencyId_fkey" FOREIGN KEY ("regencyId") REFERENCES "Regency"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tailor" ADD CONSTRAINT "Tailor_districtId_fkey" FOREIGN KEY ("districtId") REFERENCES "District"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tailor" ADD CONSTRAINT "Tailor_villageId_fkey" FOREIGN KEY ("villageId") REFERENCES "Village"("code") ON DELETE RESTRICT ON UPDATE CASCADE;
