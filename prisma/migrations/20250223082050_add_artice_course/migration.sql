-- CreateTable
CREATE TABLE "Article" (
    "id" TEXT NOT NULL,
    "tailorId" TEXT NOT NULL,
    "authorName" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Article_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Course" (
    "id" TEXT NOT NULL,
    "tailorId" TEXT NOT NULL,
    "authorName" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "courseName" TEXT NOT NULL,
    "shortDescription" TEXT NOT NULL,
    "registrationLink" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Course_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Article" ADD CONSTRAINT "Article_tailorId_fkey" FOREIGN KEY ("tailorId") REFERENCES "TailorProfile"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Course" ADD CONSTRAINT "Course_tailorId_fkey" FOREIGN KEY ("tailorId") REFERENCES "TailorProfile"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;
