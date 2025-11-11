-- CreateEnum
CREATE TYPE "CheckType" AS ENUM ('EMAIL', 'PASSWORD', 'BATCH');

-- CreateTable
CREATE TABLE "BreachCheck" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "checkType" "CheckType" NOT NULL,
    "breachesFound" INTEGER NOT NULL DEFAULT 0,
    "checkedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BreachCheck_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BreachRecord" (
    "id" TEXT NOT NULL,
    "breachCheckId" TEXT NOT NULL,
    "breachName" TEXT NOT NULL,
    "breachTitle" TEXT NOT NULL,
    "domain" TEXT,
    "breachDate" TIMESTAMP(3) NOT NULL,
    "addedDate" TIMESTAMP(3) NOT NULL,
    "pwnCount" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "dataClasses" TEXT[],
    "isVerified" BOOLEAN NOT NULL,
    "isSensitive" BOOLEAN NOT NULL,
    "isRetired" BOOLEAN NOT NULL,
    "isFabricated" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BreachRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PasswordCheck" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "isPwned" BOOLEAN NOT NULL,
    "pwnCount" INTEGER NOT NULL DEFAULT 0,
    "checkedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PasswordCheck_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BreachRecord_breachCheckId_idx" ON "BreachRecord"("breachCheckId");

-- CreateIndex
CREATE INDEX "BreachRecord_breachName_idx" ON "BreachRecord"("breachName");

-- AddForeignKey
ALTER TABLE "BreachCheck" ADD CONSTRAINT "BreachCheck_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BreachRecord" ADD CONSTRAINT "BreachRecord_breachCheckId_fkey" FOREIGN KEY ("breachCheckId") REFERENCES "BreachCheck"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PasswordCheck" ADD CONSTRAINT "PasswordCheck_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
