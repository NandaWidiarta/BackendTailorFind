/*
  Warnings:

  - The `certificate` column on the `Tailor` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Tailor" DROP COLUMN "certificate",
ADD COLUMN     "certificate" TEXT[];
