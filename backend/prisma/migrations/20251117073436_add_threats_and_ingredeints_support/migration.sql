/*
  Warnings:

  - Added the required column `updatedAt` to the `Document` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "DetectionSource" AS ENUM ('BREACH', 'WEB_SEARCH', 'SOCIAL_SEARCH', 'AI_PROMPT', 'DARK_WEB');

-- CreateEnum
CREATE TYPE "ExposureSource" AS ENUM ('BREACH', 'WEB', 'SOCIAL', 'AI');

-- AlterTable
ALTER TABLE "Document" ADD COLUMN     "ocrStatus" TEXT DEFAULT 'pending',
ADD COLUMN     "ocrText" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "riskScore" DROP NOT NULL,
ALTER COLUMN "riskScore" SET DEFAULT 0;

-- CreateTable
CREATE TABLE "ThreatCategory" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ThreatCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ThreatIngredient" (
    "id" TEXT NOT NULL,
    "threatCategoryId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "detectionSources" "DetectionSource"[],
    "possibleScam" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ThreatIngredient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserIngredientExposure" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "ingredientId" TEXT NOT NULL,
    "valueMasked" TEXT,
    "source" "ExposureSource" NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "evidenceUrl" TEXT,
    "evidenceSnippet" TEXT,
    "detectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserIngredientExposure_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ThreatAssessment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "threatId" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "matchedIngredients" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ThreatAssessment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ThreatCategory_key_key" ON "ThreatCategory"("key");

-- CreateIndex
CREATE UNIQUE INDEX "ThreatIngredient_key_key" ON "ThreatIngredient"("key");

-- CreateIndex
CREATE INDEX "UserIngredientExposure_userId_idx" ON "UserIngredientExposure"("userId");

-- CreateIndex
CREATE INDEX "UserIngredientExposure_ingredientId_idx" ON "UserIngredientExposure"("ingredientId");

-- CreateIndex
CREATE INDEX "ThreatAssessment_userId_idx" ON "ThreatAssessment"("userId");

-- CreateIndex
CREATE INDEX "ThreatAssessment_threatId_idx" ON "ThreatAssessment"("threatId");

-- AddForeignKey
ALTER TABLE "ThreatIngredient" ADD CONSTRAINT "ThreatIngredient_threatCategoryId_fkey" FOREIGN KEY ("threatCategoryId") REFERENCES "ThreatCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserIngredientExposure" ADD CONSTRAINT "UserIngredientExposure_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserIngredientExposure" ADD CONSTRAINT "UserIngredientExposure_ingredientId_fkey" FOREIGN KEY ("ingredientId") REFERENCES "ThreatIngredient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ThreatAssessment" ADD CONSTRAINT "ThreatAssessment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ThreatAssessment" ADD CONSTRAINT "ThreatAssessment_threatId_fkey" FOREIGN KEY ("threatId") REFERENCES "ThreatCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
