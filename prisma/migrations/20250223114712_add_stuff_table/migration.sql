-- CreateEnum
CREATE TYPE "StuffCategory" AS ENUM ('FABRIC', 'ACCECORIES');

-- CreateTable
CREATE TABLE "Stuff" (
    "id" TEXT NOT NULL,
    "tailorId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "stuffCaetgory" "StuffCategory" NOT NULL,
    "price" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Stuff_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Stuff" ADD CONSTRAINT "Stuff_tailorId_fkey" FOREIGN KEY ("tailorId") REFERENCES "TailorProfile"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;
