-- CreateTable
CREATE TABLE "RatingReview" (
    "id" SERIAL NOT NULL,
    "rating" SMALLINT NOT NULL,
    "review" VARCHAR(50) NOT NULL,
    "tailorId" INTEGER NOT NULL,
    "customerId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RatingReview_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "RatingReview" ADD CONSTRAINT "RatingReview_tailorId_fkey" FOREIGN KEY ("tailorId") REFERENCES "Tailor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RatingReview" ADD CONSTRAINT "RatingReview_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
