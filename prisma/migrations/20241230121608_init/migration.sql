-- CreateTable
CREATE TABLE "customers" (
    "username" VARCHAR(100) NOT NULL,
    "password" VARCHAR(100) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "token" VARCHAR(100),

    CONSTRAINT "customers_pkey" PRIMARY KEY ("username")
);
