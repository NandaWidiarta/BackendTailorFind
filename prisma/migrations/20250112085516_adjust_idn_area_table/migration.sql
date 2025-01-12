/*
  Warnings:

  - The primary key for the `District` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `cityId` on the `District` table. All the data in the column will be lost.
  - You are about to drop the column `id` on the `District` table. All the data in the column will be lost.
  - The primary key for the `Province` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Province` table. All the data in the column will be lost.
  - The primary key for the `Village` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `districtId` on the `Village` table. All the data in the column will be lost.
  - You are about to drop the column `id` on the `Village` table. All the data in the column will be lost.
  - You are about to drop the column `cityId` on the `tailors` table. All the data in the column will be lost.
  - You are about to drop the `City` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[code]` on the table `District` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[code]` on the table `Province` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[code]` on the table `Village` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `code` to the `District` table without a default value. This is not possible if the table is not empty.
  - Added the required column `regency_code` to the `District` table without a default value. This is not possible if the table is not empty.
  - Added the required column `code` to the `Province` table without a default value. This is not possible if the table is not empty.
  - Added the required column `code` to the `Village` table without a default value. This is not possible if the table is not empty.
  - Added the required column `district_code` to the `Village` table without a default value. This is not possible if the table is not empty.
  - Added the required column `regencyId` to the `tailors` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "City" DROP CONSTRAINT "City_provinceId_fkey";

-- DropForeignKey
ALTER TABLE "District" DROP CONSTRAINT "District_cityId_fkey";

-- DropForeignKey
ALTER TABLE "Village" DROP CONSTRAINT "Village_districtId_fkey";

-- DropForeignKey
ALTER TABLE "tailors" DROP CONSTRAINT "tailors_cityId_fkey";

-- DropForeignKey
ALTER TABLE "tailors" DROP CONSTRAINT "tailors_districtId_fkey";

-- DropForeignKey
ALTER TABLE "tailors" DROP CONSTRAINT "tailors_provinceId_fkey";

-- DropForeignKey
ALTER TABLE "tailors" DROP CONSTRAINT "tailors_villageId_fkey";

-- AlterTable
ALTER TABLE "District" DROP CONSTRAINT "District_pkey",
DROP COLUMN "cityId",
DROP COLUMN "id",
ADD COLUMN     "code" TEXT NOT NULL,
ADD COLUMN     "regency_code" TEXT NOT NULL,
ADD CONSTRAINT "District_pkey" PRIMARY KEY ("code");

-- AlterTable
ALTER TABLE "Province" DROP CONSTRAINT "Province_pkey",
DROP COLUMN "id",
ADD COLUMN     "code" TEXT NOT NULL,
ADD CONSTRAINT "Province_pkey" PRIMARY KEY ("code");

-- AlterTable
ALTER TABLE "Village" DROP CONSTRAINT "Village_pkey",
DROP COLUMN "districtId",
DROP COLUMN "id",
ADD COLUMN     "code" TEXT NOT NULL,
ADD COLUMN     "district_code" TEXT NOT NULL,
ADD CONSTRAINT "Village_pkey" PRIMARY KEY ("code");

-- AlterTable
ALTER TABLE "tailors" DROP COLUMN "cityId",
ADD COLUMN     "regencyId" TEXT NOT NULL,
ALTER COLUMN "provinceId" SET DATA TYPE TEXT,
ALTER COLUMN "districtId" SET DATA TYPE TEXT,
ALTER COLUMN "villageId" SET DATA TYPE TEXT;

-- DropTable
DROP TABLE "City";

-- CreateTable
CREATE TABLE "Regency" (
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "province_code" TEXT NOT NULL,

    CONSTRAINT "Regency_pkey" PRIMARY KEY ("code")
);

-- CreateIndex
CREATE UNIQUE INDEX "Regency_code_key" ON "Regency"("code");

-- CreateIndex
CREATE UNIQUE INDEX "District_code_key" ON "District"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Province_code_key" ON "Province"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Village_code_key" ON "Village"("code");

-- AddForeignKey
ALTER TABLE "Regency" ADD CONSTRAINT "Regency_province_code_fkey" FOREIGN KEY ("province_code") REFERENCES "Province"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "District" ADD CONSTRAINT "District_regency_code_fkey" FOREIGN KEY ("regency_code") REFERENCES "Regency"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Village" ADD CONSTRAINT "Village_district_code_fkey" FOREIGN KEY ("district_code") REFERENCES "District"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tailors" ADD CONSTRAINT "tailors_provinceId_fkey" FOREIGN KEY ("provinceId") REFERENCES "Province"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tailors" ADD CONSTRAINT "tailors_regencyId_fkey" FOREIGN KEY ("regencyId") REFERENCES "Regency"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tailors" ADD CONSTRAINT "tailors_districtId_fkey" FOREIGN KEY ("districtId") REFERENCES "District"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tailors" ADD CONSTRAINT "tailors_villageId_fkey" FOREIGN KEY ("villageId") REFERENCES "Village"("code") ON DELETE RESTRICT ON UPDATE CASCADE;
