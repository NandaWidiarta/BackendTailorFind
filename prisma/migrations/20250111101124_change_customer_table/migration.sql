/*
  Warnings:

  - The primary key for the `customers` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `name` on the `customers` table. All the data in the column will be lost.
  - You are about to drop the column `username` on the `customers` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[email]` on the table `customers` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `email` to the `customers` table without a default value. This is not possible if the table is not empty.
  - Added the required column `firstname` to the `customers` table without a default value. This is not possible if the table is not empty.
  - Added the required column `phoneNumber` to the `customers` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "customers" DROP CONSTRAINT "customers_pkey",
DROP COLUMN "name",
DROP COLUMN "username",
ADD COLUMN     "email" VARCHAR(100) NOT NULL,
ADD COLUMN     "firstname" VARCHAR(100) NOT NULL,
ADD COLUMN     "id" SERIAL NOT NULL,
ADD COLUMN     "lastname" VARCHAR(100),
ADD COLUMN     "phoneNumber" VARCHAR(20) NOT NULL,
ADD CONSTRAINT "customers_pkey" PRIMARY KEY ("id");

-- CreateIndex
CREATE UNIQUE INDEX "customers_email_key" ON "customers"("email");
