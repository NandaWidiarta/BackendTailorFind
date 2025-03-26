-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE');

-- AlterTable
ALTER TABLE "TailorProfile" ADD COLUMN     "gender" "Gender" NOT NULL DEFAULT 'FEMALE';
