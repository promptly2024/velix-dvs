-- CreateEnum
CREATE TYPE "PlatformType" AS ENUM ('SOCIAL_MEDIA', 'PROFESSIONAL', 'FORUM', 'BLOG', 'NEWS', 'MARKETPLACE', 'DATING', 'GAMING', 'OTHER');

-- CreateEnum
CREATE TYPE "ExposureLevel" AS ENUM ('HIGH', 'MEDIUM', 'LOW');

-- CreateTable
CREATE TABLE "WebPresence" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "scanDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "totalFindings" INTEGER NOT NULL DEFAULT 0,
    "riskScore" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "WebPresence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WebPresenceFinding" (
    "id" TEXT NOT NULL,
    "webPresenceId" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "platformType" "PlatformType" NOT NULL,
    "url" TEXT NOT NULL,
    "snippet" TEXT,
    "profileName" TEXT,
    "exposureLevel" "ExposureLevel" NOT NULL,
    "detectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WebPresenceFinding_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DigitalFootprint" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "totalExposure" INTEGER NOT NULL DEFAULT 0,
    "socialMediaCount" INTEGER NOT NULL DEFAULT 0,
    "professionalCount" INTEGER NOT NULL DEFAULT 0,
    "dataBreachCount" INTEGER NOT NULL DEFAULT 0,
    "overallRiskScore" INTEGER NOT NULL DEFAULT 0,
    "lastScanned" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "recommendations" JSONB,

    CONSTRAINT "DigitalFootprint_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "WebPresence_userId_idx" ON "WebPresence"("userId");

-- CreateIndex
CREATE INDEX "WebPresence_email_idx" ON "WebPresence"("email");

-- CreateIndex
CREATE INDEX "WebPresenceFinding_webPresenceId_idx" ON "WebPresenceFinding"("webPresenceId");

-- CreateIndex
CREATE INDEX "WebPresenceFinding_platform_idx" ON "WebPresenceFinding"("platform");

-- CreateIndex
CREATE INDEX "DigitalFootprint_userId_idx" ON "DigitalFootprint"("userId");

-- CreateIndex
CREATE INDEX "DigitalFootprint_email_idx" ON "DigitalFootprint"("email");

-- AddForeignKey
ALTER TABLE "WebPresence" ADD CONSTRAINT "WebPresence_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WebPresenceFinding" ADD CONSTRAINT "WebPresenceFinding_webPresenceId_fkey" FOREIGN KEY ("webPresenceId") REFERENCES "WebPresence"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DigitalFootprint" ADD CONSTRAINT "DigitalFootprint_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
